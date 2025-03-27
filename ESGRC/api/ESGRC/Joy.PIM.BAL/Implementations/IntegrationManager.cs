using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.DomainModel;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Joy.PIM.BAL.Implementations
{
    public class IntegrationManager : PgEntityAction<ApiMetadata>, IIntegrationManager
    {
        private readonly IDbCache _cache;
        private readonly IUserContext _userContext;
        private readonly IConfiguration _configuration;
        private readonly IProcessManager _processManager;

        public IntegrationManager(IUserContext userContext,
        IDbConnectionFactory connectionFactory,
        IConfiguration configuration,
        IDbCache cache,
        IProcessManager processManager)
            : base(userContext, connectionFactory, configuration)
        {
            _cache = cache;
            _userContext = userContext;
            _configuration = configuration;
            _processManager = processManager;
        }

        public async Task AddOrUpdateApiMetadata(ApiMetadataDto apiMetadataDto)
        {
            try
            {
                if (apiMetadataDto != null)
                {
                    using var connection = this.GetConnection();
                    var userId = await _userContext.GetUserId().ConfigureAwait(true);
                    var secreteValue = JsonConvert.SerializeObject(apiMetadataDto.SecretValue);
                    await this.AddSecretIntoAzureKeyVault(apiMetadataDto.SecretKeyName, secreteValue).ConfigureAwait(true);

                    var apiMetadata = new ApiMetadata();
                    apiMetadata.IsActive = true;
                    if (apiMetadataDto.Id != 0)
                    {
                        apiMetadataDto.UpdatedBy = userId;
                        apiMetadataDto.DateModified = DateTimeOffset.Now;
                        apiMetadata.IsActive = apiMetadataDto.IsActive;
                    }

                    apiMetadata.Id = apiMetadataDto.Id;
                    apiMetadata.DateCreated = apiMetadataDto.DateCreated;
                    apiMetadata.DateModified = apiMetadataDto.DateModified;
                    apiMetadata.CreatedBy = userId;
                    apiMetadata.UpdatedBy = userId;
                    apiMetadata.BaseUrl = apiMetadataDto.BaseUrl;
                    apiMetadata.SecretKey = apiMetadataDto.SecretKeyName;
                    apiMetadata.Name = apiMetadataDto.Name;
                    string insertSql = @"
                    INSERT INTO public.apimetadata (createdby, updatedby, datecreated, datemodified, isactive, baseurl, secretkey)
                    VALUES (@CreatedBy, @UpdatedBy, @DateCreated, @DateModified, @IsActive, @BaseUrl, @SecretKey)";
                    await connection.ExecuteAsync(insertSql, apiMetadata).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"{ex.Message}");
            }
        }

        public async Task<List<ApiMetadataDto>> GetApiMetadata()
        {
            try
            {
                using var connection = this.GetConnection();
                var apimetadataList = new List<ApiMetadataDto>();
                var secretValue = new Dictionary<string, string>();
                var apiMetadataList = await connection.QueryAsync<ApiMetadata>("select * from apimetadata where isactive = true").ConfigureAwait(true);
                foreach (var apiMetadataDto in apiMetadataList.ToList())
                {
                    var apiMetadata = new ApiMetadataDto();
                    apiMetadata.Id = apiMetadataDto.Id;
                    apiMetadata.DateCreated = apiMetadataDto.DateCreated;
                    apiMetadata.DateModified = apiMetadataDto.DateModified;
                    apiMetadata.CreatedBy = apiMetadataDto.CreatedBy;
                    apiMetadata.UpdatedBy = apiMetadataDto.UpdatedBy;
                    apiMetadata.BaseUrl = apiMetadataDto.BaseUrl;
                    apiMetadata.SecretKeyName = apiMetadataDto.SecretKey;
                    apiMetadata.SecretValue = secretValue;
                    apiMetadata.IsActive = apiMetadataDto.IsActive;
                    apiMetadata.Name = apiMetadataDto.Name;
                    apimetadataList.Add(apiMetadata);
                }

                return apimetadataList;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task AddOrUpdateApiIntegration(ApiIntegration apiIntegration)
        {
            var userId = await this._userContext.GetUserId().ConfigureAwait(true);
            if (apiIntegration?.Id != 0)
            {
                apiIntegration.UpdatedBy = userId;
                apiIntegration.DateModified = DateTimeOffset.Now;
            }

            var action = this.GetAction<ApiIntegration>();
            apiIntegration = await action.AddOrUpdate(apiIntegration).ConfigureAwait(false);
        }

        public async Task<List<ApiIntegration>> GetApiIntegration()
        {
            using var connection = this.GetConnection();
            return (await connection.QueryAsync<ApiIntegration>("select * from apiintegration where isactive = true").ConfigureAwait(false)).ToList();
        }

        public async Task AddOrUpdateApiMapping(ApiMapping apiMapping)
        {
            var userId = await this._userContext.GetUserId().ConfigureAwait(true);
            if (apiMapping?.Id != 0)
            {
                apiMapping.UpdatedBy = userId;
                apiMapping.DateModified = DateTimeOffset.Now;
            }

            var action = this.GetAction<ApiMapping>();
            apiMapping = await action.AddOrUpdate(apiMapping).ConfigureAwait(false);
        }

        public async Task<List<ApiMapping>> GetApiMapping()
        {
            using var connection = this.GetConnection();
            return (await connection.QueryAsync<ApiMapping>("select * from apimapping where isactive = true").ConfigureAwait(true)).ToList();
        }

        // public async Task AutoFillAtrributeCall(UploadTemplateOrForm uploadTemplateOrForm)
        // {
        //    try
        //    {
        //        await _processManager.AutomateUploadBasedOnUser(uploadTemplateOrForm);
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception(ex.Message);
        //    }
        // }

        // public async Task<List<string>> GetSourceColumns(long integerationId)
        // {
        //    return await _processManager.GetAllSourceColumns(integerationId).ConfigureAwait(false);
        // }
        private async Task AddSecretIntoAzureKeyVault(string secretName, string sectretValue)
        {
            try
            {
                string keyVaultUrl = $"https://{_configuration["Azure:KeyVaultName"]}.vault.azure.net/";
                var client = new SecretClient(vaultUri: new Uri(keyVaultUrl), credential: new DefaultAzureCredential());
                KeyVaultSecret secret = new KeyVaultSecret(secretName, sectretValue);
                var res = await client.SetSecretAsync(secret).ConfigureAwait(false);
                if (res.GetRawResponse().Status != 200)
                {
                    throw new Exception($"Key vault secret was not added - {res.GetRawResponse().Content}");
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
