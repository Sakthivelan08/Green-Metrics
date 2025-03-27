using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Security.Claims;
using System.Threading.Tasks;
using AgileObjects.AgileMapper;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Dapper;
using DocumentFormat.OpenXml.Drawing.Diagrams;
using DocumentFormat.OpenXml.EMMA;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.Account;
using Joy.PIM.BAL.Model.App;
using Joy.PIM.BAL.Model.Dashboard;
using Joy.PIM.BAL.Model.Tenant;
using Joy.PIM.BAL.Model.Uid;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using OfficeOpenXml;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Database;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Numeric;
using Renci.SshNet;
using Renci.SshNet.Sftp;

namespace Joy.PIM.BAL.Implementations
{
    public class PgUserManager : PgEntityAction<AppUser>, IUserManager
    {
        private readonly IUserContext _userContext;

        // private readonly IDbConnection _connection;
        private readonly IDbCache _cache;

        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _factory;
        private readonly ICipherService _cipherService;
        private readonly IJsonSerializer _serializer;
        private readonly IAuthenticationProvider _authenticationProvider;
        private readonly IMailEngine _mailEngine;
        private readonly IWorkFlowManager _taskStepInstance;
        private readonly IRbacApiClient rbacApiClient;

        public PgUserManager(IUserContext userContext,
            IDbConnectionFactory connectionFactory,
            IDbCache cache,
            IConfiguration configuration,
            IHttpClientFactory factory,
            ICipherService cipherService,
            IJsonSerializer serializer,
            IAuthenticationProvider authenticationProvider,
            IWorkFlowManager taskStepInstance,
            IMailEngine mailEngine,
            IRbacApiClient rbacApiClient)
            : base(userContext, connectionFactory, configuration)
        {
            _userContext = userContext;
            _cache = cache;
            _configuration = configuration;
            _factory = factory;
            _cipherService = cipherService;
            _serializer = serializer;
            _authenticationProvider = authenticationProvider;
            _mailEngine = mailEngine;
            _taskStepInstance = taskStepInstance;
            this.rbacApiClient = rbacApiClient;

            // _connection = connectionFactory.GetAppDbConnection();
            // _connection.Open();
        }

        public async Task UpdateLastLoginHistory(long userId)
        {
            using var connection = this.GetConnection();
            var sql = @"select AppUserId,
                                       DateCreated as lastlogindate,
                                       case
                                           when GeoJson -> 'results' -> (0) ->> 'components' is null then
                                                   (GeoIpJson ->> 'region_name')::text || ', ' || (GeoIpJson ->> 'country_name')::text
                                           else (GeoJson -> 'results' -> (0) -> 'components' ->> 'state')::text || ', ' ||
                                                (GeoJson -> 'results' -> (0) -> 'components' ->> 'country')::text end as location
                                from LoginHistory where AppUserId = @userId order by DateCreated desc   limit 1";
            var lastLoginHistory = (await connection.QueryAsync<LastLoginHistory>(sql, new
            {
                userId
            })).FirstOrDefault();
            await connection.ExecuteAsync(
                "UPDATE APPUSER set lastLoginDate = @lastLoginDate, lastloginlocation = @lastLoginLocation where id = @userId ",
                new
                {
                    userId,
                    lastLoginDate = lastLoginHistory.LastLoginDate,
                    lastLoginLocation = lastLoginHistory.Location
                });
            await _cache.ClearUserCache(userId);
        }

        public async Task AddLoginHistory(long userId, decimal? latitude, decimal? longitude, string ipAddress)
        {
            using var connection = this.GetConnection();
            string geojson = null;
            string geoIpJson = null;
            if (latitude != null && longitude != null)
            {
                var cageKey = this._configuration["AppSettingsOpenCageKey"];
                var client = this._factory.CreateClient();
                var response = await client.GetAsync(
                    $"https://api.opencagedata.com/geocode/v1/json?key={cageKey}&q={latitude}+{longitude}&pretty=0&no_annotations=1");
                geojson = await response.Content.ReadAsStringAsync();
            }

            if (ipAddress != null)
            {
                var ipStackKey = this._configuration["AppSettingsIpStackKey"];
                var client = this._factory.CreateClient();
                var response = await client.GetAsync(
                    $"http://api.ipstack.com/{ipAddress}?access_key={ipStackKey}");
                geoIpJson = await response.Content.ReadAsStringAsync();
            }

            const string sql =
                "insert into LoginHistory(AppUserId, Latitude, Longitude, Geojson, IpAddress, GeoIpJson, CreatedBy, UpdatedBy) values(@userId, @latitude, @longitude, @geojson::jsonb, @ipAddress, @geoIpJson::jsonb, @createdBy, @updatedBy)";
            await connection.ExecuteAsync(sql, new
            {
                userId,
                latitude,
                longitude,
                createdBy = userId,
                updatedBy = userId,
                geojson,
                ipAddress = ipAddress,
                geoIpJson
            });

            await UpdateLastLoginHistory(userId);
        }

        public async Task AddOrUpdateUser(HyperlinkEdit modelAdminUserModel, long? overrideUserId = null)
        {
            try
            {
                using var connection = this.GetConnection();
                if (modelAdminUserModel != null)
                {
                    modelAdminUserModel.Email = modelAdminUserModel.Email.Trim();

                    if (modelAdminUserModel.Id != 0)
                    {
                        await connection.ExecuteAsync(
                            "UPDATE AppUser SET FirstName = @firstName, LastName = @lastName, Name = @name, mobile = @mobile, isactive= @IsActive WHERE id = @id",
                            new
                            {
                                firstName = modelAdminUserModel.FirstName,
                                lastName = modelAdminUserModel.LastName,
                                name = $"{modelAdminUserModel.FirstName.ToPascalCase()} {modelAdminUserModel.LastName.ToPascalCase()}",
                                mobile = modelAdminUserModel.Mobile,
                                isactive = modelAdminUserModel.IsActive,
                                id = modelAdminUserModel.Id
                            }).ConfigureAwait(false);

                        await this._cache.ClearUserCache(modelAdminUserModel.Id).ConfigureAwait(false);
                        return;
                    }

                    var existingUserId = await connection.ExecuteScalarAsync<long?>(
                        "SELECT id FROM appuser WHERE email = @Email",
                        new { email = modelAdminUserModel.Email }).ConfigureAwait(false);

                    if (existingUserId != null)
                    {
                        throw new Exception("Email address is already in use, please provide a different email address.");
                    }

                    using var transaction = connection.BeginTransaction();

                    var user = new AppUser
                    {
                        FirstName = modelAdminUserModel.FirstName.ToPascalCase(),
                        LastName = modelAdminUserModel.LastName.ToPascalCase(),
                        Email = modelAdminUserModel.Email,
                        Name = $"{modelAdminUserModel.FirstName.ToPascalCase()} {modelAdminUserModel.LastName.ToPascalCase()}",
                        EncryptionKey = Guid.NewGuid().ToString(),
                        VerificationKey = UtilExtensions.GenerateRandomPassword(new Microsoft.AspNetCore.Identity.PasswordOptions
                        {
                            RequireDigit = true,
                            RequiredLength = 6,
                            RequireNonAlphanumeric = false,
                            RequiredUniqueChars = 6
                        }),
                        VerificationKeyExpiryTime = DateTimeOffset.UtcNow.AddMinutes(20),
                        Mobile = modelAdminUserModel.Mobile,
                        UpdatedBy = 1,
                        CreatedBy = 1,
                        HasAcceptedPrivacyPolicy = true,
                        HasAcceptedTerms = true,
                        IsDeleted = false,
                        IsActive = false,
                        Isemailverified = false,
                        Password = UtilExtensions.GenerateRandomPassword(new Microsoft.AspNetCore.Identity.PasswordOptions
                        {
                            RequireUppercase = true,
                            RequireLowercase = true,
                            RequireDigit = true,
                            RequiredLength = 10,
                            RequireNonAlphanumeric = true,
                            RequiredUniqueChars = 6
                        }),
                        Address = string.Empty
                    };

                    user = await this.AddOrUpdate(user, overrideUserId).ConfigureAwait(false);
                    await _authenticationProvider.RegisterUsers(new[] { user }).ConfigureAwait(false);

                    var valueFromConfig = await _cache.FindAppSettings("EmployeeApproval").ConfigureAwait(false);

                    // await _taskStepInstance.CreateTaskStepInstance(int.Parse(valueFromConfig.Value), user.Id, true, 0, user.Id).ConfigureAwait(false);
                    transaction.Commit();
                    await this._cache.ClearUserCache(user.Id).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"{ex.Message} - {ex.InnerException} - {ex.StackTrace}");
            }
        }

        public new async Task<AppUser> Get(long userId)
        {
            var user = await base.Get(userId);
            user.Password = null;
            return user;
        }

        public async Task<AppUser> GetUserByEmail(string userEmail)
        {
            return (await this.GetAll(" where email = @userEmail", new { userEmail })).FirstOrDefault();
        }

        public async Task<string> Authenticate(LoginViewModel model)
        {
            using var connection = this.GetConnection();
            var authenticatedUser = await _authenticationProvider.GenerateToken(model).ConfigureAwait(false);

            var query = $"SELECT * FROM appuser WHERE LOWER(email) = @email and isactive =@isactive AND isdeleted = @isdeleted ";
            var parameters = new
            {
                @email = authenticatedUser.Email.ToLower(),
                @isActive = true,
                @isDeleted = false
            };
            var users = await connection.QueryAsync<AppUser>(query, parameters);
            var user = users.FirstOrDefault();

            if (user == null)
            {
                throw new HandledException("Deactivated User Login", 401, HttpStatusCode.OK);
            }

            await _cache.ClearUserCache(user.Id);
            return await GenerateToken(user.Id);
        }

        public async Task<string> GenerateToken(InstallationViewModel model)
        {
            return await this.GenerateToken(1, 2, new MeModel
            {
                Email = model.AdminUserModel.Email,
                Name = $"{model.AdminUserModel.FirstName} {model.AdminUserModel.LastName}",
                FirstName = model.AdminUserModel.FirstName,
                LastName = model.AdminUserModel.LastName,
                Id = 1
            });
        }

        public async Task<MeModel> GetCurrentUser()
        {
            return await this.Me();
        }

        public async Task<List<TemplateMapping>> GetTemplateMappings(long id)
        {
            try
            {
                using (var connection = this.GetConnection())
                {
                    return (await connection.QueryAsync<TemplateMapping>($"select * from templatemapping where templateid = {id}")).ToList();
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        public async Task<MeModel> Me(long userId)
        {
            var user = await _cache.GetUser(userId);
            using var connection = this.GetConnection();
            var appuserRole = await connection.QueryAsync<AppUserRole>("select roleid from appuserrole where appuserid = @userid GROUP BY roleid", new { userid = userId });
            var roleIds = appuserRole.ToList()
                .Select(x => x.RoleId);
            var meModel = Mapper.Map(user).ToANew<MeModel>();
            meModel.RoleId = roleIds.ToList();
            return meModel;
        }

        public async Task<MeModel> Me()
        {
            var user = await _cache.GetUser(await _userContext.GetUserId());
            var meModel = Mapper.Map(user).ToANew<MeModel>();

            return meModel;
        }

        public async Task<string> GenerateToken(long userId, int expireMinutes = 8440, MeModel model = null)
        {
            var secret = _configuration["Jwt-Secret"];
            var symmetricKey = Convert.FromBase64String(secret);
            var tokenHandler = new JwtSecurityTokenHandler();
            var me = model ?? await this.Me(userId);
            var now = DateTime.UtcNow;
            using var connection = this.GetConnection();
            var roleIds = await connection.QueryAsync<long>("select roleid from appuserrole where appuserid = @userId",
                new
                {
                    userId
                });

            var claims = new List<Claim>()
            {
                new (ClaimTypes.Name, me.Email),
                new ("UserId", me.Id.ToString()),
                new ("RoleId", string.Join(",", me.RoleId)),
                new ("RoleIds", string.Join(",", roleIds)),
                new ("UserData", _serializer.Serialize(me))
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims.ToArray()),
                Expires = now.AddMinutes(Convert.ToInt32(expireMinutes)),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(symmetricKey),
                    SecurityAlgorithms.HmacSha256Signature),
                Audience = _configuration["Jwt-Audience"],
                Issuer = _configuration["Jwt-Issuer"]
            };

            var secureToken = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(secureToken);
        }

        public async Task UpdateUser(UserListItemModel appuser)
        {
            await this.DoUpdate(appuser, "appuser");
            await this._cache.ClearUserCache(appuser.Id);
        }

        public async Task ActivateUser(long id)
        {
            await this.Activate(id);
        }

        public async Task ActivateUserBatch(long[] ids)
        {
            foreach (long id in ids)
            {
                await this.Activate(id);
            }
        }

        public async Task DeactivateUser(long id)
        {
            using var connection = this.GetConnection();
            var appUser = await this.Me(id);
            await this.Deactivate(id);
            await this._cache.ClearUserCache(id);
        }

        public async Task DeactivateUserBatch(long[] ids)
        {
            foreach (long id in ids)
            {
                await this.Deactivate(id);
            }
        }

        public async Task<SearchResult<UserListItemModel>> SearchUsers(bool isActive)
        {
            return await this.Search<UserListItemModel>(string.Empty, 0, 0, "appuser",
                isActive: isActive, orderBy: "name");
        }

        public async Task<SearchResult<UserListItemModel>> SearchAllUsers(IsActiveFilter isActiveFilter)
            {
            bool? isActivee = null;

            switch (isActiveFilter)
            {
                case IsActiveFilter.Yes:
                    isActivee = true;
                    break;
                case IsActiveFilter.No:
                    isActivee = false;
                    break;
                case IsActiveFilter.All:
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(isActiveFilter));
            }

            return await this.Search<UserListItemModel>(string.Empty, 0, 0, "appuser",
                isActive: isActivee, orderBy: "name");
        }

        public async Task<int> GetUserCount()
        {
            using var connection = this.GetConnection();
            return await connection.QueryFirstOrDefaultAsync<int>(
                "select count(id) from appuser");
        }

        public async Task<ProfileViewModel> GetProfile()
        {
            using var connection = this.GetConnection();
            long id = await _userContext.GetUserId();
            return await connection.QueryFirstOrDefaultAsync<ProfileViewModel>(
                "select id, firstname,lastname,email,mobile from appuser where id=@id", new
                {
                    id = id
                });
        }

        public async Task UpdateProfile(ProfileViewModel appUser)
        {
            await this.DoUpdate(new
            {
                appUser.Id,
                appUser.FirstName,
                appUser.LastName,
                appUser.Mobile,
            }, "appuser");
        }

        public async Task<IEnumerable<ReportCountsModel>> GetRecentLoginHistoryCountDateWise()
        {
            using var connection = this.GetConnection();
            return await connection.QueryAsync<ReportCountsModel>(
                "select  date(datecreated) as GroupedItem, count(1) as ReportCount from loginhistory group by  date(datecreated) order by date(datecreated) desc limit 30");
        }

        public async Task<List<AppUser>> GetAllActiveUsers()
        {
            using var connection = this.GetConnection();
            var result = await connection.QueryAsync<AppUser>("select * from appuser where isactive = true");
            return result.ToList();
        }

        public async Task<List<AppUser>> GetAllInactiveUsers()
        {
            using var connection = this.GetConnection();
            var result = await connection.QueryAsync<AppUser>("select * from appuser where isactive = false");
            return result.ToList();
        }

        // public async Task<string> AddLabel(LabelModel model)
        // {
        //    var connection = this.GetConnection();
        //    var data = connection.Query<LabelModel>("select * from label where  name=@name", new { name = model.Name }).ToArray();
        //    var count = 0;
        //    foreach (var item in data)
        //    {
        //        if (item.Name == model.Name)
        //        {
        //            count++;
        //        }
        //    }
        //    if (data.Length == 0)
        //    {
        // LabelModel label = new LabelModel()
        //        {
        //            Name = model.Name.ToUpper(),
        //            Description = model.Description,
        //            LanguageId = model.LanguageId,
        //            IsActive = true,
        //        };
        //        string sqlQuery = "INSERT  INTO LABEL (Name, Description,IsActive,LanguageId)" +
        //                "VALUES(@Name, @Description,@IsActive,@LanguageId)";
        //        var Query = connection.Execute(sqlQuery, label);
        //        return "Label Added Successfully";
        //    }
        //    else
        //    {
        //        return "Name Already Existing";
        //    }
        // }
        public async Task AddRole(Role model)
        {
            try
            {
                if (model != null)
                {
                    using var connection = this.GetConnection();
                    var data = connection.Query<Role>("select * from role where  name=@name", new { name = model.Name }).ToArray();
                    var count = 0;
                    foreach (var item in data)
                    {
                        if (item.Name == model.Name)
                        {
                            count++;
                        }
                    }

                    if (data.Length == 0)
                    {
                        var lastcode = connection.Query<long>("select code from role order by id desc limit 1").FirstOrDefault();
                        Role role = new Role()
                        {
                            Name = model.Name,
                            Description = model.Description,
                            IsActive = true,
                            CreatedBy = 1,
                            UpdatedBy = 1,
                            Code = lastcode + 1,
                        };
                        string sqlQuery = "INSERT  INTO ROLE (Name, Description,IsActive,createdby,updatedby)" +
                                "VALUES(@Name, @Description,@IsActive,@createdby,@updatedby)";
                        var query = connection.Execute(sqlQuery, role);
                    }
                    else
                    {
                        throw new HandledException(code: 400, message: "Name Already Existing");
                    }
                }
            }
            catch (Exception ex) 
            {
                throw new Exception($"{ex.Message} - {ex.InnerException}");
            }
        }

        public async Task AddUserRole(AppUserRoleModel model)
        {
            try
            {
                using var connection = this.GetConnection();
                foreach (var models in model.AppUserRoleDomainModel)
                {
                    string sqlQueryCheck = "SELECT COUNT(*) FROM APPUSERROLE WHERE appuserid = @appuserid AND roleid = @RoleId";
                    var departmentExists = await connection.QueryFirstOrDefaultAsync<int>(sqlQueryCheck, new
                    {
                        appuserid = model.AppUserid,
                        RoleId = models.RoleId
                    });
                    if (departmentExists == 0)
                    {
                        string sqlQuery = "INSERT  INTO APPUSERROLE (Name, RoleId,appuserid)" +
                            "VALUES(@name, @roleid,@appuserid)";
                        var query1 = connection.Execute(sqlQuery, new { name = models.Name, roleId = models.RoleId, appuserid = model.AppUserid });
                    }
                }
            }
            catch (Exception)
            {
                throw new HandledException(code: 400, message: "Something Went Wrong");
            }
        }

        public async Task DeleteDepartment(AppUserRole appUserRole)
        {
            using var connection = this.GetConnection();
            await connection.QueryAsync<AppUserRoleModel>($"Delete from appuserrole where appuserid = @AppuserId AND departmentid =@departmentId ",
                new { AppuserId = appUserRole.AppUserId, departmentId = appUserRole.DepartmentId });
        }

        public async Task<IEnumerable<string>> ListFilesFromSftp()
        {
            try
            {
                var connectionInfo = new ConnectionInfo(
                    _configuration["SFTPConfig:Host"],
                    int.Parse(_configuration["SFTPConfig:Port"]),
                    _configuration["SFTPConfig:Username"],
                    new PasswordAuthenticationMethod(_configuration["SFTPConfig:Username"], _configuration["SFTPConfig:Password"]));

                var sftpPaths = new List<string>
                 {
                    "/home/PIM/PIM_Master_Data/Master_Data",
                    "/home/PIM/PIM_Planogram_Family/RMS_PlanoFamily_Name&Code",
                    "/home/PIM/PIM_ItemCode/RMS_ItemCode"
                 };
                var tempFilePaths = new List<string>();

                using (var client = new SftpClient(connectionInfo))
                {
                    client.Connect();

                    foreach (var sftpPath in sftpPaths)
                    {
                        var files = client.ListDirectory(sftpPath);

                        foreach (var file in files)
                        {
                            if (!file.IsDirectory && IsAllowedFileType(file.Name))
                            {
                                using (var stream = new MemoryStream())
                                {
                                    client.DownloadFile(file.FullName, stream);
                                    stream.Position = 0;

                                    var fileName = Path.GetFileName(file.Name);
                                    var tempFilePath = Path.Combine(Path.GetTempPath(), fileName);

                                    if (file.Name.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                                    {
                                        using (var fileStream = new FileStream(tempFilePath, FileMode.Create, FileAccess.Write))
                                        {
                                            stream.CopyTo(fileStream);
                                        }
                                    }
                                    else if (file.Name.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                                    {
                                        using (var fileStream = new FileStream(tempFilePath, FileMode.Create, FileAccess.Write))
                                        {
                                            stream.CopyTo(fileStream);
                                        }
                                    }

                                    tempFilePaths.Add(tempFilePath);
                                }
                            }
                        }
                    }

                    client.Disconnect();
                }

                await UploadToAzureStorage(tempFilePaths);

                foreach (var tempFilePath in tempFilePaths)
                {
                    File.Delete(tempFilePath);
                }

                return tempFilePaths;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task UploadToAzureStorage(IEnumerable<string> tempFilePaths)
        {
            var azureConnection = _configuration["AzureBlobStorageKey"];
            var containerName = _configuration["SFTPContainerName"];

            var blobServiceClient = new BlobServiceClient(azureConnection);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

            foreach (var filePath in tempFilePaths)
            {
                var fileName = Path.GetFileName(filePath);
                var blobClient = containerClient.GetBlobClient(fileName);

                using (FileStream fs = File.OpenRead(filePath))
                {
                    await blobClient.UploadAsync(fs, true);
                }

                File.Delete(filePath);
            }
        }

        public async Task<string> GetAccessDataByToken()
        {
            try
            {
                var userRoles = await this._userContext.GetRoleId(); // Ensure GetRoleId() returns Task<T>
                if (!string.IsNullOrEmpty(userRoles))
                {
                    using var connection = this.GetConnection();
                    var roleIds = userRoles;

                    var query = $"SELECT '[' || string_agg('\"' || r.guid || '\"', ',') || ']' AS concatenated_guids FROM role r WHERE r.id IN({roleIds})";

                    // Execute the query and retrieve the result
                    var result = await connection.QueryFirstOrDefaultAsync<string>(query);

                    // Convert the result to list of strings (assuming result is a JSON array of strings)
                    var jsonResult = JsonConvert.DeserializeObject<List<Guid>>(result);

                    // var data = await this._rbackApi.GetRbacAccessTokenByRoleId(jsonResult);
                    // var data = await this._rbacAccessTokenRepository.GetByRoleIds(jsonResult);
                    return result;
                }

                return string.Empty;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<dynamic>> GetAccessDetails()
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<dynamic>($"select id, guidid,accessname from rbacaccessobject")).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        private bool IsAllowedFileType(string fileName)
        {
            var allowedFileTypes = new string[] { ".xlsx", ".csv" };

            return allowedFileTypes.Any(extension => fileName.EndsWith(extension, StringComparison.OrdinalIgnoreCase));
        }

        private DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);
            PropertyInfo[] props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in props)
            {
                dataTable.Columns.Add(prop.Name);
            }

            foreach (T item in items)
            {
                var values = new object[props.Length];
                for (int i = 0; i < props.Length; i++)
                {
                    values[i] = props[i].GetValue(item, null);
                }

                dataTable.Rows.Add(values);
            }

            return dataTable;
        }
    }
}