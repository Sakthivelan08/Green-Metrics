using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Dapper;
using ExcelDataReader;
using Hangfire;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Joy.PIM.BAL.Implementations
{
    public class Dataprocess : PgEntityAction<Threshold>, IDataProcess
    {
        private readonly IBlobRepo _blobRepo;
        private readonly IDbConnectionFactory _connectionfactory;
        private readonly IDbCache _dbCache;
        private readonly IUserContext _usercontext;
        private readonly IUserManager _userManager;

        public Dataprocess(
            IUserContext userContext,
            IUserManager userManager,
            IDbConnectionFactory connectionFactory,
            IBlobRepo blobRepo,
            IConfiguration configuration,
            IDbCache dbCache)
            : base(userContext, connectionFactory, configuration)
        {
            _usercontext = userContext;
            _connectionfactory = connectionFactory;
            _dbCache = dbCache;
            _userManager = userManager;
            _blobRepo = blobRepo;
        }

        public Task ApproveOrReject(long id)
        {
            throw new System.NotImplementedException();
        }

        public Task<string> FindAppSettings(string configName)
        {
            throw new System.NotImplementedException();
        }

        public Task MasterDataUpload(string filePath, long masterId)
        {
            throw new System.NotImplementedException();
        }

        public async Task<string> ProcessDataFromTemplate(string messageName, bool? returnDataOnly = false)
        {
            if (string.IsNullOrEmpty(messageName))
            {
                throw new ArgumentNullException(nameof(messageName));
            }

            try
            {
                var allowToExeute = false;
                using var connection = this.GetConnection();

                var configJsonString = await _dbCache.FindAppSettings("CreateRecordFromExcelConfig");

                if (configJsonString == null)
                {
                    throw new Exception("ConfigJsonString is Empty");
                }

                var configJson = JArray.Parse(configJsonString.JsonValue);
                var excelJsonModel = new ExcelJsonModel();
                foreach (var item in configJson.Children<JObject>())
                {
                    if (item.GetValue("MessageName").ToString() == messageName)
                    {
                        excelJsonModel.Container = item.GetValue("Container").ToString();
                        excelJsonModel.FileName = item.GetValue("FileName").ToString();
                        excelJsonModel.FolderName = item.GetValue("FolderName").ToString();
                        excelJsonModel.IntegrationType = item.GetValue("IntegrationType").ToString();
                        excelJsonModel.TemplateID = int.Parse(item.GetValue("TemplateID").ToString());
                        excelJsonModel.StagingTable = item.GetValue("TempTable").ToString();
                        excelJsonModel.MessageName = item.GetValue("MessageName").ToString();
                        allowToExeute = true;
                        break;
                    }
                }

                if (!allowToExeute)
                {
                    throw new Exception("Messagename is not match with ConfigJsonValue");
                }

                // if (excelJsonModel.IntegrationType.ToLower() == "f")
                // {
                //    connection.ExecuteScalar($"TRUNCATE {excelJsonModel.StagingTable}");
                // }
                var blobUrl = _blobRepo.GetLastModifiedFileUrl(excelJsonModel.FolderName, excelJsonModel.FileName, excelJsonModel.Container);
                blobUrl = $"{blobUrl}.xlsx";
                var path = await _blobRepo.DownloadFile(blobUrl);

                if ((bool)returnDataOnly)
                {
                    return path;
                }

                switch (messageName.ToLower())
                {
                    case "thresholdlist":
                        {
                            await this.GetWaterConsumption(path, excelJsonModel);
                            break;
                        }

                    case "bescomfy23-24list":
                        {
                            await this.GetBescomDataForFY2324(path, excelJsonModel);
                            break;
                        }

                    case "bescomfy24-25list":
                        {
                            await this.GetBescomDataForFY2324(path, excelJsonModel);
                            break;
                        }

                    case "bwssbfy23-24list":
                        {
                            await this.GetBwssbDataForFY2324(path, excelJsonModel);
                            break;
                        }

                    case "bwssbfy24-25list":
                        {
                            await this.GetBwssbDataForFY2324(path, excelJsonModel);
                            break;
                        }

                    case "infotechemployeedetailsfy23-24list":
                        {
                            await this.GetEmployeeDetailsForFY2324(path, excelJsonModel);
                            break;
                        }

                    case "itsolutionemployeedetailsfy23-24list":
                        {
                            await this.GetEmployeeDetailsForFY2324(path, excelJsonModel);
                            break;
                        }

                    case "infotechemployeedetailsfy24-25list":
                        {
                            await this.GetEmployeeDetailsForFY2324(path, excelJsonModel);
                            break;
                        }

                    case "itsolutionemployeedetailsfy24-25list":
                        {
                            await this.GetEmployeeDetailsForFY2324(path, excelJsonModel);
                            break;
                        }

                    default:
                        {
                            throw new Exception("The message name was not found");
                        }
                }

                return null;
            }
            catch (Exception e)
            {
                throw new Exception($"Error on ProcessDataFromTemplate : {e.Message}");
            }
        }

        private DataTable ConvertExcelToDataTable(string filePath, bool isXlsx = false)
        {
            try
            {
                System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
                using (var stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
                {
                    using (var reader = ExcelReaderFactory.CreateReader(stream))
                    {
                        DataSet result = reader.AsDataSet(new ExcelDataSetConfiguration()
                        {
                            ConfigureDataTable = (_) => new ExcelDataTableConfiguration()
                            {
                                UseHeaderRow = true
                            }
                        });
                        if (result != null && result.Tables.Count > 0)
                        {
                            return result.Tables[0];
                        }
                    }

                    return null;
                }
            }
            catch (Exception e)
            {
                throw new Exception($"Error on ConvertExcelToDataTable : {e.Message}");
            }
        }

        private DataTable ConvertCsvToDataTable(string filePath)
        {
            try
            {
                DataTable dt = new DataTable();
                using (StreamReader sr = new StreamReader(filePath))
                {
                    string[] headers = sr.ReadLine().Split(',');
                    foreach (string header in headers)
                    {
                        dt.Columns.Add(header);
                    }

                    while (!sr.EndOfStream)
                    {
                        string[] rows = sr.ReadLine().Split(',');
                        DataRow dr = dt.NewRow();
                        for (int i = 0; i < headers.Length; i++)
                        {
                            dr[i] = rows[i];
                        }

                        dt.Rows.Add(dr);
                    }
                }

                return dt;
            }
            catch (Exception e)
            {
                throw new Exception($"Error on ConvertCsvToDataTable : {e.Message}");
            }
        }

        private DataTable ConvertFileToDataTable(string filePath)
        {
            try
            {
                string fileExtension = Path.GetExtension(filePath);
                switch (fileExtension.ToLower())
                {
                    case ".xlsx":
                        return ConvertExcelToDataTable(filePath, true);

                    case ".xls":
                        return ConvertExcelToDataTable(filePath);

                    case ".csv":
                        return ConvertCsvToDataTable(filePath);

                    default:
                        throw new Exception("File format not supports");
                }
            }
            catch (Exception e)
            {
                throw new Exception($"Error on ConvertFileToDataTable : {e.Message}");
            }
        }

        private async Task GetWaterConsumption(string filePath, ExcelJsonModel excelJsonModel)
        {
            try
            {
                var action = this.GetAction<Threshold>();
                var valueFromConfig = await _dbCache.FindAppSettings("RecordCreatedOrUpdatedBy");

                // var userId = int.Parse(valueFromConfig.Value);
                using var connection = this.GetConnection();
                var data = ConvertFileToDataTable(filePath);

                var templateMappingTable = await _dbCache.GetTemplateMappings(excelJsonModel.TemplateID);
                var keyValuePairs = templateMappingTable.Select(x => new KeyValuePair<string, string>(x.SourceColumn, x.DestinationColumn)).ToList();

                foreach (DataRow row in data.Rows)
                {
                    var model = new Threshold();

                    foreach (var keyValuePair in keyValuePairs)
                    {
                        switch (templateMappingTable
                            .Where(x => x.SourceColumn == keyValuePair.Key)
                            .Select(x => x.Datatype)
                            .FirstOrDefault()
                            .ToString()
                            .ToLower())
                        {
                            case "string":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, row[keyValuePair.Key].ToString());
                                    break;
                                }

                            case "integer":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, int.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "long":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, long.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "datetime":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, DateTime.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            default:
                                {
                                    model.SetPropertyValue(keyValuePair.Value, row[keyValuePair.Key]);
                                    break;
                                }
                        }
                    }

                    var duplicate = await connection.QueryAsync<Threshold>($"select 1 from threshold where assetcode = '{model.AssetCode}' and value = {model.Value}");

                    if (duplicate.Count() == 0)
                    {
                        model = await action.AddOrUpdate(model);
                    }
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        private async Task GetBescomDataForFY2324(string filePath, ExcelJsonModel excelJsonModel)
        {
            try
            {
                var action = this.GetAction<Bescom>();

                // var valueFromConfig = await _dbCache.FindAppSettings("RecordCreatedOrUpdatedBy");

                // var userId = int.Parse(valueFromConfig.Value);
                using var connection = this.GetConnection();
                var data = ConvertFileToDataTable(filePath);

                var templateMappingTable = await _dbCache.GetTemplateMappings(excelJsonModel.TemplateID);
                var keyValuePairs = templateMappingTable.Select(x => new KeyValuePair<string, string>(x.SourceColumn, x.DestinationColumn)).ToList();

                foreach (DataRow row in data.Rows)
                {
                    var model = new Bescom();

                    foreach (var keyValuePair in keyValuePairs)
                    {
                        switch (templateMappingTable
                            .Where(x => x.SourceColumn == keyValuePair.Key)
                            .Select(x => x.Datatype)
                            .FirstOrDefault()
                            .ToString()
                            .ToLower())
                        {
                            case "string":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, row[keyValuePair.Key].ToString());
                                    break;
                                }

                            case "integer":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, int.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "long":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, long.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "datetime":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, DateTime.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "numeric":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, decimal.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            default:
                                {
                                    model.SetPropertyValue(keyValuePair.Value, row[keyValuePair.Key]);
                                    break;
                                }
                        }
                    }
                        
                    model = await action.AddOrUpdate(model);
                    await connection.ExecuteAsync(@"UPDATE bescom
                                                    SET quarterid = 
                                                        CASE 
                                                            WHEN month IN ('JAN', 'FEB', 'MAR') THEN 1
                                                            WHEN month IN ('APR', 'MAY', 'JUN') THEN 2
                                                            WHEN month IN ('JUL', 'AUG', 'SEP') THEN 3
                                                            WHEN month IN ('OCT', 'NOV', 'DEC') THEN 4
                                                        END
                                                    WHERE month = @Month;",
                                                    new { Month = model.Month });

                    // var valueFromConfig = await _dbCache.FindAppSettings("MonthMappings");
                    // var monthMappingsJson = valueFromConfig.JsonValue;
                    // var fiscalyear2023 = await connection.QueryFirstOrDefaultAsync<int>($"select value from appsettings where name = 'fiscalyear2023'");
                    // var fiscalyear2024 = await connection.QueryFirstOrDefaultAsync<int>($"select value from appsettings where name = 'fiscalyear2024'");

                    // var monthMapping = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(monthMappingsJson)["MonthMapping"];

                    // string monthAbbr = model.Month.ToUpper();

                    // string fullMonthName = monthMapping.ContainsKey(monthAbbr) ? monthMapping[monthAbbr] : null;

                    // var fiscalid = await connection.QueryFirstOrDefaultAsync<int>($"SELECT id FROM fiscalyear WHERE (year = {fiscalyear2023} OR year = {fiscalyear2024}) " +
                    //    $"AND TO_CHAR(TO_DATE(startmonth, 'Month'), 'MM')::INTEGER <= TO_CHAR(TO_DATE('{fullMonthName}', 'Month'), 'MM')::INTEGER " +
                    //    $"AND TO_CHAR(TO_DATE(endmonth, 'Month'), 'MM')::INTEGER >= TO_CHAR(TO_DATE('{fullMonthName}', 'Month'), 'MM')::INTEGER;");
                    if (excelJsonModel.FolderName == "23-24")
                    {
                        await connection.ExecuteAsync($"update bescom set fiscalyearid = 8 where month = '{model.Month}' and fiscalyearid is null");
                    }
                    else if (excelJsonModel.FolderName == "24-25")
                    {
                        await connection.ExecuteAsync($"update bescom set fiscalyearid = 9 where month = '{model.Month}' and fiscalyearid is null");
                    }
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        private async Task GetBwssbDataForFY2324(string filePath, ExcelJsonModel excelJsonModel)
        {
            try
            {
                var action = this.GetAction<Bwssb>();

                // var valueFromConfig = await _dbCache.FindAppSettings("RecordCreatedOrUpdatedBy");

                // var userId = int.Parse(valueFromConfig.Value);
                using var connection = this.GetConnection();
                var data = ConvertFileToDataTable(filePath);

                var templateMappingTable = await _dbCache.GetTemplateMappings(excelJsonModel.TemplateID);
                var keyValuePairs = templateMappingTable.Select(x => new KeyValuePair<string, string>(x.SourceColumn, x.DestinationColumn)).ToList();

                foreach (DataRow row in data.Rows)
                {
                    var model = new Bwssb();

                    foreach (var keyValuePair in keyValuePairs)
                    {
                        switch (templateMappingTable
                            .Where(x => x.SourceColumn == keyValuePair.Key)
                            .Select(x => x.Datatype)
                            .FirstOrDefault()
                            .ToString()
                            .ToLower())
                        {
                            case "string":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, row[keyValuePair.Key].ToString());
                                    break;
                                }

                            case "integer":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, int.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "long":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, long.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "datetime":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, DateTime.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "numeric":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, decimal.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            default:
                                {
                                    model.SetPropertyValue(keyValuePair.Value, row[keyValuePair.Key]);
                                    break;
                                }
                        }
                    }

                    model = await action.AddOrUpdate(model);
                    await connection.ExecuteAsync(@"UPDATE bwssb
                                                    SET quarterid = 
                                                        CASE 
                                                            WHEN month IN ('JAN', 'FEB', 'MAR') THEN 1
                                                            WHEN month IN ('APR', 'MAY', 'JUN') THEN 2
                                                            WHEN month IN ('JUL', 'AUG', 'SEP') THEN 3
                                                            WHEN month IN ('OCT', 'NOV', 'DEC') THEN 4
                                                        END
                                                    WHERE month = @Month;",
                                                    new { Month = model.Month });

                    // var valueFromConfig = await _dbCache.FindAppSettings("MonthMappings");
                    // var monthMappingsJson = valueFromConfig.JsonValue;
                    // var fiscalyear2023 = await connection.QueryFirstOrDefaultAsync<int>($"select value from appsettings where name = 'fiscalyear2023'");
                    // var fiscalyear2024 = await connection.QueryFirstOrDefaultAsync<int>($"select value from appsettings where name = 'fiscalyear2024'");

                    // var monthMapping = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(monthMappingsJson)["MonthMapping"];

                    // string monthAbbr = model.Month.ToUpper();

                    // string fullMonthName = monthMapping.ContainsKey(monthAbbr) ? monthMapping[monthAbbr] : null;

                    // var fiscalid = await connection.QueryFirstOrDefaultAsync<int>($"SELECT id FROM fiscalyear WHERE (year = {fiscalyear2023} OR year = {fiscalyear2024}) " +
                    //    $"AND TO_CHAR(TO_DATE(startmonth, 'Month'), 'MM')::INTEGER <= TO_CHAR(TO_DATE('{fullMonthName}', 'Month'), 'MM')::INTEGER " +
                    //    $"AND TO_CHAR(TO_DATE(endmonth, 'Month'), 'MM')::INTEGER >= TO_CHAR(TO_DATE('{fullMonthName}', 'Month'), 'MM')::INTEGER;");
                    if (excelJsonModel.FolderName == "23-24")
                    {
                        await connection.ExecuteAsync($"update bwssb set fiscalyearid = 8 where month = '{model.Month}' and fiscalyearid is null");
                    }
                    else if (excelJsonModel.FolderName == "24-25")
                    {
                        await connection.ExecuteAsync($"update bwssb set fiscalyearid = 9 where month = '{model.Month}' and fiscalyearid is null");
                    }
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        private async Task GetEmployeeDetailsForFY2324(string filePath, ExcelJsonModel excelJsonModel)
        {
            try
            {
                var action = this.GetAction<EmployeeDetails>();

                // var valueFromConfig = await _dbCache.FindAppSettings("RecordCreatedOrUpdatedBy");

                // var userId = int.Parse(valueFromConfig.Value);
                using var connection = this.GetConnection();
                var data = ConvertFileToDataTable(filePath);

                var templateMappingTable = await _dbCache.GetTemplateMappings(excelJsonModel.TemplateID);
                var keyValuePairs = templateMappingTable.Select(x => new KeyValuePair<string, string>(x.SourceColumn, x.DestinationColumn)).ToList();

                foreach (DataRow row in data.Rows)
                {
                    var model = new EmployeeDetails();

                    foreach (var keyValuePair in keyValuePairs)
                    {
                        switch (templateMappingTable
                            .Where(x => x.SourceColumn == keyValuePair.Key)
                            .Select(x => x.Datatype)
                            .FirstOrDefault()
                            .ToString()
                            .ToLower())
                        {
                            case "string":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, row[keyValuePair.Key].ToString());
                                    break;
                                }

                            case "integer":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, int.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "long":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, long.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "datetime":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, DateTime.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            case "numeric":
                                {
                                    model.SetPropertyValue(keyValuePair.Value, decimal.Parse(row[keyValuePair.Key].ToString()));
                                    break;
                                }

                            default:
                                {
                                    model.SetPropertyValue(keyValuePair.Value, row[keyValuePair.Key]);
                                    break;
                                }
                        }
                    }

                    var duplicate = await connection.QueryAsync<EmployeeDetails>($"select 1 from employeedetails where employeeid = '{model.EmployeeId}'");

                    if (duplicate.Count() == 0)
                    {
                        model = await action.AddOrUpdate(model);
                    }

                    // var valueFromConfig = await _dbCache.FindAppSettings("MonthMappings");
                    // var monthMappingsJson = valueFromConfig.JsonValue;
                    // var fiscalyear2023 = await connection.QueryFirstOrDefaultAsync<int>($"select value from appsettings where name = 'fiscalyear2023'");
                    // var fiscalyear2024 = await connection.QueryFirstOrDefaultAsync<int>($"select value from appsettings where name = 'fiscalyear2024'");

                    // var monthMapping = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(monthMappingsJson)["MonthMapping"];

                    // string monthAbbr = model.Month.ToUpper();

                    // string fullMonthName = monthMapping.ContainsKey(monthAbbr) ? monthMapping[monthAbbr] : null;

                    // var fiscalid = await connection.QueryFirstOrDefaultAsync<int>($"SELECT id FROM fiscalyear WHERE (year = {fiscalyear2023} OR year = {fiscalyear2024}) " +
                    //    $"AND TO_CHAR(TO_DATE(startmonth, 'Month'), 'MM')::INTEGER <= TO_CHAR(TO_DATE('{fullMonthName}', 'Month'), 'MM')::INTEGER " +
                    //    $"AND TO_CHAR(TO_DATE(endmonth, 'Month'), 'MM')::INTEGER >= TO_CHAR(TO_DATE('{fullMonthName}', 'Month'), 'MM')::INTEGER;");
                    // await connection.ExecuteAsync($"update employeedetails set fiscalyearid = {fiscalid} where month = '{model.Month}'");
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }
    }
}
