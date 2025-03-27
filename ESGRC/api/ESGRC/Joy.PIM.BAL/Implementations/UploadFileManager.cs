using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Dapper;
using ExcelDataReader;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Enum;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Joy.PIM.BAL.Implementations
{
    public class UploadFileManager : PgEntityAction<UploadedFile>, IuploadFileManager
    {
        private readonly IDbCache _cache;
        private readonly IUserContext _userContext;
        private readonly IBlobRepo _lobRepo;

        public UploadFileManager(IUserContext userContext, IDbConnectionFactory connectionFactory,
      IConfiguration configuration, IDbCache cache, IBlobRepo blobRepo)
      : base(userContext, connectionFactory, configuration)
        {
            _cache = cache;
            _userContext = userContext;
            _lobRepo = blobRepo;
        }

        public async Task<UploadedFile> UploadFile(UploadedFile file, IDbTransaction transaction = null)
        {
            if (file == null)
            {
                throw new ArgumentException("No Data is Found");
            }

            // var result = await this.ValidationForUploadexcel(file);
            var existingFile = await Get(file.Id).ConfigureAwait(true);

            // if published
            if (existingFile?.UploadedFileStatusId == 5)
            {
                throw new HandledException("File is already published");
            }

            if (existingFile != null)
            {
                file.CreatedBy = existingFile.CreatedBy;
                file.UpdatedBy = existingFile.UpdatedBy;
                file.TemplateId = existingFile.TemplateId;
                file.UploadedFileStatusId = existingFile.UploadedFileStatusId;
            }
            else
            {
                file.UploadedFileStatusId = 4; // failed
            }

            return await AddOrUpdate(file, transaction: transaction).ConfigureAwait(false);
        }

        public async Task<List<UploadedFileData>> ProcessFile(UploadedFile file)
        {
            try
            {
                if (file != null)
                {
                    using var connection = this.GetConnection();
                    var userid = await _userContext.GetUserId().ConfigureAwait(true);
                    using var transaction = connection.BeginTransaction();
                    await connection.ExecuteAsync("delete from UploadedFileData where uploadedfileid = @fileId", new
                    {
                        fileId = file.Id
                    }).ConfigureAwait(false);

                    var dataTable = await ValidationForUploadexcel(file).ConfigureAwait(true);
                    var attribute = await connection.QueryAsync<Metric>("select distinct name from metric where typeid = 0").ConfigureAwait(true);

                    var attributeNames = attribute.Select(attr => attr.Name).ToHashSet();

                    var combinedData = dataTable.Rows.Cast<DataRow>()
                        .Where(row => row != null)
                        .Select(row => dataTable.Columns.Cast<DataColumn>()
                            .ToDictionary(c => c.ColumnName, c =>
                                c.DataType == typeof(string) && !attributeNames.Contains(c.ColumnName) ?
                                row[c].ToString().MakeFirstLetterCapital() :
                                row[c]))
                        .ToList();

                    var combinedJson = JsonConvert.SerializeObject(combinedData);

                    var dataLists = new List<UploadedFileData>
                    {
                        new UploadedFileData
                        {
                            ColumnData = combinedJson,
                            UploadedFileId = file.Id,
                            DateCreated = DateTimeOffset.UtcNow,
                            DateModified = DateTimeOffset.UtcNow,
                            CreatedBy = userid,
                            Status = "Pending",
                            Appuserid = userid,
                            UpdatedBy = userid,
                            IsForm = false,
                            IsActive = true
                        }
                    };

                    await DoUpdate(
                        new
                        {
                            Id = file.Id,
                            UploadedFileStatusId = 3 // success
                        }, nameof(UploadedFile)).ConfigureAwait(false);

                    var dtNew = dataLists.ToArray().GetDataTableFromObjects();

                    transaction.BulkInsert(nameof(UploadedFileData), dtNew);
                    transaction.Commit();
                    return dataLists;
                }

                throw new HandledException("Datalist is null;");
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<MetricAnswerOptions>> FromProcessFile(UploadedFile file)
        {
            try
            {
                if (file != null)
                {
                    using var connection = this.GetConnection();
                    var userid = await _userContext.GetUserId().ConfigureAwait(true);
                    using var transaction = connection.BeginTransaction();
                    await connection.ExecuteAsync("delete from MetricAnswerOptions where uploadedfileid = @fileId", new
                    {
                        fileId = file.Id
                    }).ConfigureAwait(false);

                    var (dataTable, validationErrors) = await ValidationForMetricAnswerOption(file).ConfigureAwait(true);

                    if (validationErrors.Count > 0)
                    {
                        var errorMessage = string.Join($"{Environment.NewLine}", validationErrors
                        .Select((error, index) => $"{index + 1}. {error}"));

                        throw new InvalidOperationException($"Validation Errors:{Environment.NewLine}{errorMessage}");
                    }

                    var attribute = await connection.QueryAsync<Metric>("select distinct name from metric where typeid = 0").ConfigureAwait(true);
                    var attributeNames = attribute.Select(attr => attr.Name).ToHashSet();

                    var combinedData = dataTable.Rows.Cast<DataRow>()
                                    .Where(row => row != null)
                                    .GroupBy(row => row["Question List"].ToString())
                                    .ToDictionary(
                                        group => group.Key,
                                        group => (object)group.Last()["Answer"].ToString().MakeFirstLetterCapital());

                    var cleanedJson = new Dictionary<string, object>();

                    foreach (var kvp in combinedData)
                    {
                        if (kvp.Value is JsonElement jsonElement)
                        {
                            cleanedJson.Add(kvp.Key, jsonElement.GetString()?.Trim());
                        }
                        else if (kvp.Value is string strValue)
                        {
                            cleanedJson.Add(kvp.Key, strValue.Trim());
                        }
                        else
                        {
                            cleanedJson.Add(kvp.Key, kvp.Value);
                        }
                    }

                    var processid = await connection.QueryFirstOrDefaultAsync<long>($"select processid from templatestages where id = {file.TemplateStageId} and templateid = {file.TemplateId} ").ConfigureAwait(true);

                    var dataLists = new List<MetricAnswerOptions>
                    {
                        new MetricAnswerOptions
                        {
                            ResponseJson = cleanedJson,
                            UploadedFileId = file.Id,
                            DateCreated = DateTimeOffset.UtcNow,
                            DateModified = DateTimeOffset.UtcNow,
                            CreatedBy = userid,
                            Status = (long)TemplateStageApprovalENum.Pending,
                            UpdatedBy = userid,
                            IsActive = true,
                            TemplateId = file.TemplateId,
                            AuditId = file.AuditId,
                            ProcessId = processid
                        }
                    };

                    await DoUpdate(
                        new
                        {
                            Id = file.Id,
                            UploadedFileStatusId = 3 // success
                        }, nameof(UploadedFile)).ConfigureAwait(false);

                    // var dtNew = dataLists.ToArray().GetDataTableFromObjects();

                    // transaction.BulkInsert(nameof(MetricAnswerOptions), dtNew);
                    var queryList = @"
                    INSERT INTO metricAnswerOptions (templateId, processId, auditId, responseJson, uploadedFileId, datecreated, datemodified, createdby, updatedby, isactive)
                    VALUES (@TemplateId, @processId, @auditId, @responseJson::json, @UploadedFileId, @DateCreated, @DateModified, @CreatedBy, @UpdatedBy, @IsActive)";

                    await connection.ExecuteAsync(queryList, dataLists).ConfigureAwait(true);
                    transaction.Commit();

                    // var getdata = await connection.QueryFirstOrDefaultAsync<int?>($"SELECT * FROM MetricAnswerOptions WHERE Uploadedfileid = {file.Id}");

                    // await connection.ExecuteAsync("UPDATE MetricAnswerOptions SET assessmentId = @AssessmentId, auditid = @AuditId WHERE id = @Id",
                    //    new { AssessmentId = file.AssessmentId, AuditId = file.AuditId, Id = getdata });
                    await connection.ExecuteAsync($"Update processstages set status = {(long)TemplateStageApprovalENum.Completed} where auditid = {file.AuditId} and templatestageid = {file.TemplateStageId}").ConfigureAwait(false);

                    return dataLists;
                }

                throw new HandledException("Datalist is null;");
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<(DataTable DataTable, List<string> Errors)> ValidationForMetricAnswerOption(UploadedFile file)
        {
            var errors = new List<string>();
            try
            {
                using var connection = this.GetConnection();
                var assessmentId = file?.AssessmentId;

                var query = @"SELECT m.metricsquestion as name, m.typeid, mt.name as datatypes
                      FROM metric m 
                      JOIN metrictype as mt ON mt.id = m.typeid 
                      JOIN mgmultiselection as mms ON mms.metricid = m.id
                      JOIN assessment as ass ON ass.metricgroupid = mms.metricgroupid::text
                      WHERE ass.id = @assessmentId";

                var dataTypes = await connection.QueryAsync(query, new { assessmentId }).ConfigureAwait(true);

                // Download the file
                var tempFile = await _lobRepo.DownloadFile(file.BlobUrl).ConfigureAwait(true);
                using var wb = new XLWorkbook(tempFile, XLEventTracking.Disabled);
                var ws = wb.Worksheet(1);
                ws.Tables.Select(x => x.ShowAutoFilter = false);
                var dataTable = ws.Tables.Any() ? ws.Tables.First().AsNativeDataTable() : ws.RangeUsed().AsTable().AsNativeDataTable();

                // Remove the "error data" column if it exists
                if (dataTable.Columns.Contains("error data"))
                {
                    dataTable.Columns.Remove("error data");
                }

                // Remove empty rows
                for (int i = dataTable.Rows.Count - 1; i >= 0; i--)
                {
                    DataRow row = dataTable.Rows[i];
                    bool isEmptyRow = true;

                    foreach (var item in row.ItemArray)
                    {
                        if (item != null && !string.IsNullOrEmpty(item.ToString()))
                        {
                            isEmptyRow = false;
                            break;
                        }
                    }

                    if (isEmptyRow)
                    {
                        dataTable.Rows.RemoveAt(i);
                    }
                }

                foreach (DataRow row in dataTable.Rows)
                {
                    string question = row["Question List"]?.ToString();
                    var answer = row["Answer"];  

                    // Find the expected data type for this question
                    var expectedDataType = dataTypes.FirstOrDefault(dt => dt.name == question)?.datatypes;

                    if (!string.IsNullOrEmpty(expectedDataType))
                    {
                        if (answer == null || string.IsNullOrWhiteSpace(answer.ToString()))
                        {
                            errors.Add($"Value is missing for question: {question}. Expected {expectedDataType}.");
                            continue;
                        }

                        bool isValid = ValidateDataType(expectedDataType, answer);

                        if (!isValid)
                        {
                            errors.Add($"Data type Error for Question: {question}. Expected: {expectedDataType}, but got The Answer: {answer.GetType().Name}.");
                        }
                    }
                }

                var dataRows = dataTable.Rows.Cast<DataRow>().Where(row => !row.ItemArray.All(field => field is DBNull || string.IsNullOrWhiteSpace(field?.ToString())));

                if (!dataRows.Any())
                {
                    throw new HandledException("Uploaded Excel file has no data.");
                }

                return (dataTable, errors);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<DataTable> ValidationForUploadexcel(UploadedFile file)
        {
            try
            {
                using var connection = this.GetConnection();
                var templateId = file?.AssessmentId;
                var tempFile = await _lobRepo.DownloadFile(file.BlobUrl).ConfigureAwait(true);
                using var wb = new XLWorkbook(tempFile, XLEventTracking.Disabled);
                var ws = wb.Worksheet(1);
                ws.Tables.Select(x => x.ShowAutoFilter = false);
                var dataTable = ws.Tables.Any() ? ws.Tables.First().AsNativeDataTable() : ws.RangeUsed().AsTable().AsNativeDataTable();
                if (dataTable.Columns.Contains("error data"))
                {
                    dataTable.Columns.Remove("error data");
                }

                for (int i = dataTable.Rows.Count - 1; i >= 0; i--)
                {
                    DataRow row = dataTable.Rows[i];
                    bool isEmptyRow = true;

                    foreach (var item in row.ItemArray)
                    {
                        if (item != null && !string.IsNullOrEmpty(item.ToString()))
                        {
                            isEmptyRow = false;
                            break;
                        }
                    }

                    if (isEmptyRow)
                    {
                        dataTable.Rows.RemoveAt(i);
                    }
                }

                var dataRows = dataTable.Rows.Cast<DataRow>().Where(row => !row.ItemArray.All(field => field is DBNull || string.IsNullOrWhiteSpace(field?.ToString())));

                if (!dataRows.Any())
                {
                    throw new HandledException("Uploaded Excel file has no data.");
                }

                return dataTable;
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<MetricStandard>> ProcessFile1(UploadedFile file)
        {
            try
            {
                if (file != null)
                {
                    using var connection = this.GetConnection();
                    var userid = await _userContext.GetUserId().ConfigureAwait(true);
                    using var transaction = connection.BeginTransaction();
                    await connection.ExecuteAsync("delete from metricstandard where uploadedfileid = @fileId", new
                    {
                        fileId = file.Id
                    }).ConfigureAwait(false);

                    var dataTable = await ValidationForUploadexcel(file).ConfigureAwait(true);
                    var attribute = await connection.QueryAsync<Metric>("select distinct name from metric where typeid = 0").ConfigureAwait(true);

                    var attributeNames = attribute.Select(attr => attr.Name).ToHashSet();

                    var questionListColumn = dataTable.Columns["Question List"];
                    var answerColumn = dataTable.Columns["Answer"];

                    var cleanedJson = new Dictionary<string, object>();

                    foreach (DataRow row in dataTable.Rows)
                    {
                        var question = row[questionListColumn]?.ToString().Trim();
                        var answer = row[answerColumn]?.ToString().Trim();

                        if (!string.IsNullOrEmpty(question) && !cleanedJson.ContainsKey(question))
                        {
                            cleanedJson[question] = answer;
                        }
                    }

                    var combinedJson = JsonConvert.SerializeObject(cleanedJson);
                    var dataLists = new List<MetricStandard>
                    {
                        new MetricStandard
                        {
                            StandardJson = combinedJson,
                            UploadedFileid = file.Id,
                            DateCreated = DateTimeOffset.UtcNow,
                            DateModified = DateTimeOffset.UtcNow,
                            CreatedBy = userid,
                            UpdatedBy = userid,
                            IsActive = true
                        }
                    };

                    if (cleanedJson.Values.All(value => string.IsNullOrEmpty(value.ToString())))
                    {
                        throw new HandledException("Answer is empty;");
                    }
                    else
                    {
                        await connection.ExecuteAsync(
                            "UPDATE metricstandard SET standardJson = @combinedJson::jsonb, UploadedFileid = @fileId, DateModified = @dateModified, UpdatedBy = @updatedBy WHERE id = @metricStandardId",
                            new
                            {
                                combinedJson,
                                fileId = file.Id,
                                dateModified = DateTimeOffset.UtcNow,
                                updatedBy = userid,
                                metricStandardId = file.MetricStandardId
                            }).ConfigureAwait(false);

                        await DoUpdate(
                            new
                            {
                                Id = file.Id,
                                UploadedFileStatusId = 3 // success
                            }, nameof(UploadedFile)).ConfigureAwait(false);

                        transaction.Commit();

                        return new List<MetricStandard>
                    {
                        new MetricStandard
                        {
                            StandardJson = combinedJson,
                            UploadedFileid = file.Id,
                            DateCreated = DateTimeOffset.UtcNow,
                            DateModified = DateTimeOffset.UtcNow,
                            CreatedBy = userid,
                            UpdatedBy = userid,
                            IsActive = true
                        }
                    };
                    }
                }

                throw new HandledException("Datalist is null;");
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<GoalSetting>> ProcessFile2(UploadedFile file)
        {
            try
            {
                if (file != null)
                {
                    using var connection = this.GetConnection();
                    var userid = await _userContext.GetUserId().ConfigureAwait(true);
                    using var transaction = connection.BeginTransaction();
                    await connection.ExecuteAsync("delete from metricstandard where uploadedfileid = @fileId", new
                    {
                        fileId = file.Id
                    }).ConfigureAwait(false);

                    var dataTable = await ValidationForUploadexcel(file).ConfigureAwait(true);
                    var attribute = await connection.QueryAsync<Metric>("select distinct name from metric where typeid = 0").ConfigureAwait(true);

                    var attributeNames = attribute.Select(attr => attr.Name).ToHashSet();

                    var questionListColumn = dataTable.Columns["Question List"];
                    var answerColumn = dataTable.Columns["Answer"];

                    var cleanedJson = new Dictionary<string, object>();

                    foreach (DataRow row in dataTable.Rows)
                    {
                        var question = row[questionListColumn]?.ToString().Trim();
                        var answer = row[answerColumn]?.ToString().Trim();

                        if (!string.IsNullOrEmpty(question) && !cleanedJson.ContainsKey(question))
                        {
                            cleanedJson[question] = answer;
                        }
                    }

                    var combinedJson = JsonConvert.SerializeObject(cleanedJson);

                    // await connection.ExecuteAsync($"UPDATE goalsetting SET targetJson = '{combinedJson}' and UploadedFileid = {file.Id} and DateModified = {DateTimeOffset.UtcNow} and UpdatedBy = {userid} WHERE id = {file.GoalSettingId}");
                    await connection.ExecuteAsync(
                "UPDATE goalsetting SET targetJson = @combinedJson::jsonb, UploadedFileid = @fileId, DateModified = @dateModified, UpdatedBy = @updatedBy WHERE id = @goalSettingId",
                new
                {
                    combinedJson,
                    fileId = file.Id,
                    dateModified = DateTimeOffset.UtcNow,
                    updatedBy = userid,
                    goalSettingId = file.GoalSettingId
                }).ConfigureAwait(false);

                    await DoUpdate(
                        new
                        {
                            Id = file.Id,
                            UploadedFileStatusId = 3 // success
                        }, nameof(UploadedFile)).ConfigureAwait(false);

                    transaction.Commit();

                    return new List<GoalSetting>
                    {
                        new GoalSetting
                        {
                            TargetJson = combinedJson,
                            UploadedFileid = file.Id,
                            DateCreated = DateTimeOffset.UtcNow,
                            DateModified = DateTimeOffset.UtcNow,
                            CreatedBy = userid,
                            UpdatedBy = userid,
                            IsActive = true
                        }
                    };
                }

                throw new HandledException("Datalist is null;");
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        private async Task<DataTable> GetDataTable(UploadedFile file)
        {
            var tempFilePath = await _lobRepo.DownloadFile(file.BlobUrl).ConfigureAwait(true);

            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
            using var stream = File.Open(tempFilePath, FileMode.Open, FileAccess.Read);
            using var reader = ExcelReaderFactory.CreateReader(stream);
            var result = reader.AsDataSet(new ExcelDataSetConfiguration()
            {
                ConfigureDataTable = (_) => new ExcelDataTableConfiguration()
                {
                    UseHeaderRow = true
                }
            });

            return result.Tables[0]; // Assuming the data is in the first table
        }

        // Method to validate data types
        private bool ValidateDataType(string expectedDataType, object value)
        {
            if (value == null || string.IsNullOrEmpty(value.ToString()))
            {
                return true;  // No value to validate
            }

            try
            {
                switch (expectedDataType?.ToLower())
                {
                    case "boolean":
                        return bool.TryParse(value.ToString(), out _);
                    case "percentage":
                    case "price":
                        return decimal.TryParse(value.ToString(), out _);  
                    case "paragraph":
                    case "textarea":
                    case "text":
                    case "quill":
                        return value is string && !decimal.TryParse(value.ToString(), out _);
                    case "number":
                        return double.TryParse(value.ToString(), out _);  
                    case "file":
                    case "image":
                        return value is string && !string.IsNullOrEmpty(value.ToString()); 
                    case "checkbox":
                        return bool.TryParse(value.ToString(), out _); 
                    case "lookup":
                        return true; 
                    case "measurements":
                        return decimal.TryParse(value.ToString(), out _);  
                    case "multiselect":
                        return true; 
                    case "identity":
                        return true; 
                    case "datetime":
                        return DateTime.TryParse(value.ToString(), out _); 
                    case "radiobutton":
                        return bool.TryParse(value.ToString(), out _); 
                    case "simpleselect":
                        return true; 
                    default:
                        return false; 
                }
            }
            catch
            {
                return false;  
            }
        }
    }
}
