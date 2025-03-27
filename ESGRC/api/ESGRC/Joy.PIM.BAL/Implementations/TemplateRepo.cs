using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using ClosedXML.Excel;
using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using Hangfire.Storage;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.DomainModel;
using Joy.PIM.DAL.Enum;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using NCalc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace Joy.PIM.BAL.Implementations
{
    public class TemplateRepo : PgEntityAction<Template>, ITemplates
    {
        private readonly IDbCache _cache;
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;
        private readonly IDataProcess _dataProcess;

        public TemplateRepo(IDbConnectionFactory connectionFactory,
            IUserContext userContext, IConfiguration configuration, IDbCache cache, IDataProcess dataProcess)
            : base(userContext, connectionFactory, configuration)
        {
            _connectionFactory = connectionFactory;
            _configuration = configuration;
            _userContext = userContext;
            _cache = cache;
            _dataProcess = dataProcess;
        }

        public async Task AddOrUpdateTemplates(Template model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model?.Name))
                {
                    throw new HandledException("Template name cannot be empty.");
                }

                using var connection = this.GetConnection();
                var templateRole = this.GetAction<TemplateRole>();
                var templates = await _cache.GetTemplates().ConfigureAwait(true);
                var data = await connection.QueryAsync<dynamic>($"select 1 from Template where name = '{model.Name}'").ConfigureAwait(true);
                if (model.Id == 0 && data?.Count() > 0)
                {
                    throw new HandledException($"Template{model.Name} already exists.");
                }

                var roleIds = model.RoleIds;
                await AddOrUpdate(model).ConfigureAwait(false);

                // model.RoleIds = roleIds;
                if (model.IsActive == false)
                {
                    model.IsActive = false;
                }

                // var existingRoles = await templateRole.GetAll("where templateid = @templateId", new
                // {
                //    templateId = model.Id
                // });
                // foreach (var existingRole in existingRoles)
                // {
                //    if (!model.RoleIds.Contains(existingRole.RoleId))
                //    {
                //        await templateRole.Remove(existingRole.Id);
                //    }
                //    else
                //    {
                //        model.RoleIds = model.RoleIds.Except(new[] { existingRole.RoleId }).ToArray();
                //    }
                // }

                // foreach (var templateRoleId in model.RoleIds)
                // {
                //    await templateRole.AddOrUpdate(new TemplateRole
                //    {
                //        TemplateId = model.Id,
                //        RoleId = templateRoleId
                //    });
                // }
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<Template>> GetAllActiveTemplate()
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QueryAsync<Template>($"select * from Template where isactive = true").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<Template>> GetAllSFTPTemplate()
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QueryAsync<Template>($"select * from Template where issftp = true").ConfigureAwait(true);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<SearchResult<Template>> SearchTemplates(string key, int pageNumber, int pageCount, bool isActive)
        {
            try
            {
                return await Search(key, pageNumber, pageCount, isActive: isActive).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<Template>> GetTemplates()
        {
            try
            {
                return await GetAll(" where isactive = true", new
                {
                    userId = await GetUserId().ConfigureAwait(true)
                }).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task LinkMetricToTemplate(TemplateMetrics templateAttribute)
        {
            try
            {
                var action = this.GetAction<TemplateMetrics>();
                await action.AddOrUpdate(templateAttribute).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<Template>> GetUserTemplates()
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QueryAsync<Template>(
                    "select * from template where isactive = true").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<Template> GetTemplate(long templateId)
        {
            try
            {
                return (await _cache.GetTemplates().ConfigureAwait(false)).FirstOrDefault(x => x.Id == templateId);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<TemplayteMetricGroupDto>> GetTemplateGroup(long templateId)
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<TemplayteMetricGroupDto>($"select tg.TemplateId, tg.MetricGroupId, mg.name as MetricGroupName from templateGroup as tg join metricGroup as mg on mg.id = tg.metricgroupId where templateId = {templateId}").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task DeleteTemplategroup(long templateid, long metricgroupid)
        {
            try
            {
                using var connection = this.GetConnection();
                await connection.QueryFirstOrDefaultAsync<TemplateGroup>($"update templategroup set metricgroupid = null where templateid = {templateid} and metricgroupid = {metricgroupid} ").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task AddTemplateGroup(long templateId, IEnumerable<long> metricGroupIds, IEnumerable<long?> metricIds, bool? isBRSR)
        {
            try
            {
                using var connection = this.GetConnection();

                if (isBRSR is true)
                {
                    var metricIdList = string.Join(",", metricIds);

                    var sql = "INSERT INTO templateGroup (templateId, metricId) VALUES (@TemplateId, @MetricId)";

                    var parameters = metricIds.Select(metricId => new
                    {
                        TemplateId = templateId,
                        MetricId = metricId
                    });

                    await connection.ExecuteAsync(sql, parameters).ConfigureAwait(false);
                }
                else
                {
                    var idList = string.Join(",", metricGroupIds);

                    var sql = "INSERT INTO templateGroup (templateId, metricGroupId) VALUES (@TemplateId, @MetricGroupId)";

                    var parameters = metricGroupIds.Select(metricGroupId => new
                    {
                        TemplateId = templateId,
                        MetricGroupId = metricGroupId
                    });

                    await connection.ExecuteAsync(sql, parameters).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task<UploadedFileDataDto> GetFromUploadeddata(long assessmentId, long auditId)
        {
            try
            {
                using var connection = this.GetConnection(); // Assumes GetConnection() returns a valid open connection.

                var query = "SELECT * FROM UploadedFileData WHERE assessmentid = @AssessmentId";

                var data = await connection.QueryFirstOrDefaultAsync<UploadedFileDataDto>(query, new { AssessmentId = assessmentId }).ConfigureAwait(false);

                return data; 
            }
            catch (Exception ex)
            {
                throw new HandledException($"Error fetching data for assessmentId {assessmentId}: {ex.Message}");
            }
        }

        public async Task<byte[]> DownloadTemplate(long templateId, string format)
        {
            try
            {
                using var connection = this.GetConnection();
                var attributes = await connection.QueryAsync<TemplateMetricsDto>(
                    $"SELECT t.id, t.name AS TemplateName, tg.metricgroupId, m.id AS MetricId, m.metricsquestion AS MetricName " +
                    $"FROM template AS t " +
                    $"JOIN templateGroup AS tg ON tg.templateId = t.Id " +
                    $"JOIN metricGroup AS mg ON mg.id = tg.metricGroupId " +
                    $"JOIN mgmultiselection as ms ON ms.metricgroupid = tg.metricgroupid " +
                    $"JOIN metric m ON m.id = ms.metricid " +
                    $"WHERE t.id = {templateId}").ConfigureAwait(true);

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Sheet1");

                // Add headers
                worksheet.Cell(1, 1).Value = "Question List";
                worksheet.Cell(1, 2).Value = "Answer";

                // Style headers
                var headerRange = worksheet.Range(1, 1, 1, 2);
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Font.FontColor = XLColor.White;
                headerRange.Style.Fill.BackgroundColor = XLColor.SteelBlue;

                // Add metric names and placeholder answers
                int rowIndex = 2; // Start from row 2 to keep the header intact
                foreach (var attribute in attributes)
                {
                    worksheet.Cell(rowIndex, 1).Value = attribute.MetricName;
                    worksheet.Cell(rowIndex, 2).Value = " "; // Placeholder for the "Answer" column
                    rowIndex++;
                }

                // Auto-fit columns for better readability
                worksheet.Columns().AdjustToContents();

                // Save the workbook to a memory stream and return as byte array
                using var memoryStream = new MemoryStream();
                workbook.SaveAs(memoryStream);
                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new HandledException($"Error downloading template: {ex.Message}");
            }
        }

        // public async Task<byte[]> FormTemplate(long templateId, string format)
        // {
        //    try
        //    {
        //        using var connection = this.GetConnection();
        //        var attributes = await connection.QueryAsync<TemplateMetricsDto>($"SELECT tg.metricgroupid, mg.name AS MetricGroupName, m.id AS MetricId, m.typeid AS DataType, mt.name AS DataTypeName, " +
        //                          $"m.metricsquestion AS metricname FROM template as t " +
        //                          $"INNER JOIN templateGroup AS tg ON tg.templateId = t.id " +
        //                          $"INNER JOIN metricgroup AS mg ON mg.id = tg.metricgroupid " +
        //                          $"INNER JOIN mgmultiselection as ms ON ms.metricgroupid = tg.metricgroupid " +
        //                          $"INNER JOIN metric m ON m.id = ms.metricid " +
        //                          $"INNER JOIN metrictype AS mt ON mt.id = m.typeid WHERE t.id ={templateId}").ConfigureAwait(true);

        // using var workbook = new XLWorkbook();
        //        var worksheet = workbook.Worksheets.Add("Sheet1");

        // // Add headers
        //        worksheet.Cell(1, 1).Value = "Question List";
        //        worksheet.Cell(1, 2).Value = "Answer";

        // // Style headers
        //        var headerRange = worksheet.Range(1, 1, 1, 2);
        //        headerRange.Style.Font.Bold = true;
        //        headerRange.Style.Font.FontColor = XLColor.White;
        //        headerRange.Style.Fill.BackgroundColor = XLColor.SteelBlue;

        // // Add metric names and placeholder answers
        //        int rowIndex = 2; // Start from row 2 to keep the header intact
        //        foreach (var attribute in attributes)
        //        {
        //            worksheet.Cell(rowIndex, 1).Value = attribute.MetricName;
        //            worksheet.Cell(rowIndex, 2).Value = " "; // Placeholder for the "Answer" column
        //            rowIndex++;
        //        }

        // // Auto-fit columns for better readability
        //        worksheet.Columns().AdjustToContents();

        // // Save the workbook to a memory stream and return as byte array
        //        using var memoryStream = new MemoryStream();
        //        workbook.SaveAs(memoryStream);
        //        return memoryStream.ToArray();
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new HandledException($"Error downloading template: {ex.Message}");
        //    }
        // }
        public async Task<byte[]> FormTemplate(long templateId, string format)
        {
            try
            {
                using var connection = this.GetConnection();

                // Fetch template attributes
                var attributes = await connection.QueryAsync<TemplateMetricsDto>(
                    $"SELECT tg.metricgroupid, mg.name AS MetricGroupName, m.id AS MetricId, m.typeid AS DataType, mt.name AS DataTypeName, " +
                    $"m.metricsquestion AS metricname FROM template as t " +
                    $"INNER JOIN templateGroup AS tg ON tg.templateId = t.id " +
                    $"INNER JOIN metricgroup AS mg ON mg.id = tg.metricgroupid " +
                    $"INNER JOIN mgmultiselection as ms ON ms.metricgroupid = tg.metricgroupid " +
                    $"INNER JOIN metric m ON m.id = ms.metricid " +
                    $"INNER JOIN metrictype AS mt ON mt.id = m.typeid WHERE t.id = {templateId}").ConfigureAwait(true);

                // Fetch Fuel data from ValueMaster table
                var fuelConfigJson = await connection.QueryFirstOrDefaultAsync<string>(
                    $"SELECT configjson FROM ValueMaster WHERE name = 'Fuel'").ConfigureAwait(true);
                var fuelOptions = JsonConvert.DeserializeObject<List<FuelOption>>(fuelConfigJson);
                var fuelValues = fuelOptions?.Select(f => f.Value).ToList() ?? new List<string>();

                // Fetch UOM values from UOM table
                var uomValues = await connection.QueryAsync<string>(
                    $"SELECT name FROM UOM").ConfigureAwait(true);
                var uomList = uomValues?.ToList() ?? new List<string>();

                var emissionvehicleTypeJson = await connection.QueryFirstOrDefaultAsync<string>(
                    $"SELECT configjson FROM ValueMaster WHERE name = 'VehicleType'").ConfigureAwait(true);
                var vehicleOptions = JsonConvert.DeserializeObject<List<FuelOption>>(emissionvehicleTypeJson);
                var vehicleValues = vehicleOptions?.Select(e => e.Value.ToString()).ToList() ?? new List<string>();

                var fuelTypeJson = await connection.QueryFirstOrDefaultAsync<string>(
                    $"SELECT configjson FROM ValueMaster WHERE name = 'FuelType'").ConfigureAwait(true);
                var fuelTypeOptions = JsonConvert.DeserializeObject<List<FuelOption>>(fuelTypeJson);
                var fuelTypeValues = fuelTypeOptions?.Select(e => e.Value.ToString()).ToList() ?? new List<string>();

                var refJson = await connection.QueryFirstOrDefaultAsync<string>(
                    $"SELECT configjson FROM ValueMaster WHERE name = 'Refrigerator'").ConfigureAwait(true);
                var refOptions = JsonConvert.DeserializeObject<List<FuelOption>>(refJson);
                var refValues = refOptions?.Select(e => e.Value.ToString()).ToList() ?? new List<string>();

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Sheet1");

                int colIndex = 1;
                int fuelColumnIndex = 0, emissionColumnIndex = 0, uomColumnIndex = 0, vehicleTypeColumnIndex = 0, fuelTypeColumnIndex = 0, refColumnIndex = 0, gasemittedColumnIndex = 0;

                // Add metric names in the first row
                foreach (var attribute in attributes)
                {
                    worksheet.Cell(1, colIndex).Value = attribute.MetricName;

                    // Identify column indexes dynamically
                    if (attribute.MetricName == "Fuel Name")
                    {
                        fuelColumnIndex = colIndex;
                    }

                    if (attribute.MetricName == "UOM")
                    {
                        uomColumnIndex = colIndex;
                    }

                    if (attribute.MetricName == "Vehicle Type")
                    {
                        vehicleTypeColumnIndex = colIndex;
                    }

                    if (attribute.MetricName == "Fuel Type")
                    {
                        fuelTypeColumnIndex = colIndex;
                    }

                    if (attribute.MetricName == "Gas leaked/ Refrigerant Type")
                    {
                        refColumnIndex = colIndex;
                    }

                    if (attribute.MetricName == "Gas emitted/ Refrigerant type")
                    {
                        gasemittedColumnIndex = colIndex;
                    }

                    colIndex++;
                }

                // Helper function to create dropdown lists
                void CreateDropdownList(string sheetName, List<string> values, int columnIndex)
                {
                    if (columnIndex == 0 || values.Count == 0)
                    {
                        return;
                    }

                    var optionsSheet = workbook.Worksheets.Add(sheetName);
                    for (int i = 0; i < values.Count; i++)
                    {
                        optionsSheet.Cell(i + 1, 1).Value = values[i];
                    }

                    optionsSheet.Visibility = XLWorksheetVisibility.VeryHidden;

                    var dropdownRange = worksheet.Range(2, columnIndex, 201, columnIndex);
                    var validation = dropdownRange.SetDataValidation();
                    validation.List(optionsSheet.Range($"A1:A{values.Count}"), true);
                    validation.IgnoreBlanks = true;
                    validation.InCellDropdown = true;
                }

                // Create dropdowns
                CreateDropdownList("FuelOptions", fuelValues, fuelColumnIndex);
                CreateDropdownList("UOMOptions", uomList, uomColumnIndex);
                CreateDropdownList("VehicleOptions", vehicleValues, vehicleTypeColumnIndex);
                CreateDropdownList("FuelTypeOptions", fuelTypeValues, fuelTypeColumnIndex);
                CreateDropdownList("refOptions", refValues, refColumnIndex);
                CreateDropdownList("gasOptions", refValues, gasemittedColumnIndex);

                // Auto-fit columns for better readability
                worksheet.Columns().AdjustToContents();

                // Save to memory stream and return as byte array
                using var memoryStream = new MemoryStream();
                workbook.SaveAs(memoryStream);
                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new HandledException($"Error downloading template: {ex.Message}");
            }
        }

        public async Task<byte[]> DownloadSFTPTemplate(long templateId, string format)
        {
            try
            {
                using var connection = this.GetConnection();
                var attributes = await connection.QueryAsync<string>($"select m.metricsquestion as metricname from templategroup tg " +
                                                                     $"JOIN mgmultiselection as ms ON ms.metricgroupid = tg.metricgroupid " +
                                                                     $"JOIN metric m ON m.id = ms.metricid " +
                                                                     $"JOIN template t ON t.id = tg.templateid " +
                                                                     $"where t.id = {templateId}").ConfigureAwait(true);

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Sheet1");

                // Add attributes as headers in the first row
                int column = 1;
                foreach (var attribute in attributes)
                {
                    var cell = worksheet.Cell(1, column);
                    cell.Value = attribute; // Set the header name
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.FontColor = XLColor.White;
                    cell.Style.Fill.BackgroundColor = XLColor.SteelBlue;
                    column++;
                }

                // Save the workbook to a memory stream and return as byte array
                using var memoryStream = new MemoryStream();
                workbook.SaveAs(memoryStream);
                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new HandledException($"Error downloading template: {ex.Message}");
            }
        }

        public async Task<byte[]> DownloadMetricGroupTemplate(long metricGroupId, string format)
        {
            try
            {
                using var connection = this.GetConnection();
                var regulationMetrics = await connection.QueryAsync<string>(@"SELECT metricsquestion FROM metric 
                                                                  JOIN mgmultiselection ON metric.id = mgmultiselection.metricid 
                                                                  WHERE mgmultiselection.metricgroupid = @MetricGroupId 
                                                                  AND metric.regulationtypeid = 4 
                                                                  AND metricsquestion != 'Crude Steel Production (ton)' 
                                                                  AND metricsquestion IN ('Flow in  Nm3/hr', 'PM  mg/Nm3', 'SO2 mg/Nm3', 'NOx mg/Nm3', 'shut down hours') 
                                                                  ORDER BY CASE 
                                                                  WHEN metricsquestion = 'Flow in  Nm3/hr' THEN 1 
                                                                  WHEN metricsquestion = 'PM  mg/Nm3' THEN 2 
                                                                  WHEN metricsquestion = 'SO2 mg/Nm3' THEN 3 
                                                                  WHEN metricsquestion = 'NOx mg/Nm3' THEN 4
                                                                  WHEN metricsquestion = 'shut down hours' THEN 5
                                                                  ELSE 6 
                                                                  END",
                                                                          new { MetricGroupId = metricGroupId });

                var metricTemplate = await connection.QueryAsync<string>("select name from metricgroup where parentid = @ParentId order by datecreated asc", new { ParentId = metricGroupId });

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Sheet1");
                worksheet.Columns().Width = 15; // Default column width

                // Add "Stacks" header
                var stacksHeader = worksheet.Cell(1, 1);
                stacksHeader.Value = "Stacks";
                stacksHeader.Style.Font.Bold = true;
                stacksHeader.Style.Font.FontColor = XLColor.Black;
                stacksHeader.Style.Fill.BackgroundColor = XLColor.SteelBlue;

                // Add stack names
                int row = 2;
                foreach (var stack in metricTemplate)
                {
                    var cell = worksheet.Cell(row, 1);
                    cell.Value = stack;
                    cell.Style.Alignment.WrapText = true; // Enable wrap text
                    row++;
                }

                // Add regulation metric headers
                int column = 2;
                foreach (var regulation in regulationMetrics)
                {
                    var cell = worksheet.Cell(1, column);
                    cell.Value = regulation;
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.FontColor = XLColor.Black;
                    cell.Style.Fill.BackgroundColor = XLColor.SteelBlue;
                    column++;
                }

                // Auto-fit columns for better readability
                worksheet.Columns().AdjustToContents();

                // Save the workbook to a memory stream and return as byte array
                using var memoryStream = new MemoryStream();
                workbook.SaveAs(memoryStream);
                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<List<MetricGroup>> ListMetricGroupTemplate(long metricGroupId)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<MetricGroup>("select * from metricgroup where id = @MetricGroupId", new { MetricGroupId = metricGroupId });
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task UploadMetricGroupTemplatefile(IFormFile file, long metricGroupId, string month, long year)
        {
            try
            {
                using var connection = this.GetConnection();

                if (month is null || year <= 0)
                {
                    throw new Exception("Need to select Month and year");
                }

                var regulationMetrics = await connection.QueryAsync<string>(
                    "SELECT metricsquestion FROM metric " +
                    "JOIN mgmultiselection ON metric.id = mgmultiselection.metricid " +
                    "WHERE mgmultiselection.metricgroupid = @MetricGroupId AND metric.regulationtypeid = 4 and metricsquestion != 'Crude Steel Production (ton)'",
                    new { MetricGroupId = metricGroupId });

                var requiredFields = regulationMetrics.ToList();

                using var stream = file.OpenReadStream();
                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheet(1);

                var rowCount = worksheet.LastRowUsed().RowNumber();
                var colCount = worksheet.LastColumnUsed().ColumnNumber();

                var headerColumnMapping = new Dictionary<string, int>();
                for (int col = 1; col <= colCount; col++)
                {
                    var header = worksheet.Cell(1, col).GetString().Trim();
                    if (!string.IsNullOrWhiteSpace(header))
                    {
                        headerColumnMapping[header] = col;
                    }
                }

                var missingFields = requiredFields.Where(field => !headerColumnMapping.ContainsKey(field)).ToList();
                if (missingFields.Any())
                {
                    throw new Exception($"The following required fields are missing from the Excel file: {string.Join(", ", missingFields)}");
                }

                var emptyRequiredFields = new List<string>();
                foreach (var field in requiredFields)
                {
                    var colIndex = headerColumnMapping[field];

                    for (int row = 2; row <= rowCount; row++)
                    {
                        var value = worksheet.Cell(row, colIndex).GetString().Trim();
                        if (string.IsNullOrWhiteSpace(value))
                        {
                            emptyRequiredFields.Add(field);
                            break;
                        }
                    }
                }

                if (emptyRequiredFields.Any())
                {
                    throw new Exception($"The following required fields must be filled: {string.Join(", ", emptyRequiredFields)}");
                }

                var headers = new List<string>();
                for (int col = 1; col <= colCount; col++)
                {
                    var header = worksheet.Cell(1, col).GetString().Trim();
                    if (!string.IsNullOrWhiteSpace(header))
                    {
                        headers.Add(header);
                    }
                }

                var structuredDataList = new List<object>();

                for (int row = 2; row <= rowCount; row++)
                {
                    string? rowKey = null;
                    var rowData = new Dictionary<string, object>();

                    foreach (var header in headers)
                    {
                        var colIndex = headerColumnMapping[header];
                        var value = worksheet.Cell(row, colIndex).GetString().Trim();

                        if (header == "Stacks")
                        {
                            rowKey = value;
                        }
                        else if (!string.IsNullOrWhiteSpace(value))
                        {
                            rowData[header] = value;
                        }
                    }

                    if (rowKey != null)
                    {
                        structuredDataList.Add(rowKey);
                        structuredDataList.Add(rowData);
                    }
                }

                long quarterId = month switch
                {
                    "January" or "February" or "March" => 1,
                    "April" or "May" or "June" => 2,
                    "July" or "August" or "September" => 3,
                    _ => 4
                };

                var months = await connection.QueryFirstOrDefaultAsync<long>("SELECT id FROM months WHERE name = @Name", new { Name = month });

                var jsonData = JsonConvert.SerializeObject(structuredDataList);
                var duplicateId = await connection.QueryAsync<long?>("SELECT 1 FROM dataingestion WHERE metricgroupid = @MetricGroupId AND month = @Month AND year = @Year",
                                                                      new { MetricGroupId = metricGroupId, Month = months, Year = year });

                string query;
                if (duplicateId.Any())
                {
                    query = "UPDATE dataingestion SET data = @Data::jsonb WHERE metricgroupid = @MetricGroupId AND month = @Month AND year = @Year";
                    await connection.ExecuteAsync(query, new { Data = jsonData, MetricGroupId = metricGroupId, Month = months, Year = year });
                }
                else
                {
                    query = "INSERT INTO dataingestion (metricGroupId, data, month, year, quarterid) VALUES (@MetricGroupId, @DataJson::jsonb, @Month, @Year, @QuarterId)";
                    await connection.ExecuteAsync(query, new { MetricGroupId = metricGroupId, DataJson = jsonData, Month = months, Year = year, QuarterId = quarterId });
                }

                await this.ConversionFormula(metricGroupId, month, year);
                await this.GetTotal(metricGroupId, month, year);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error processing the file: {ex.Message}", ex);
            }
        }

        public async Task ConversionFormula(long metricGroupId, string month, long year)
        {
            try
            {
                using var connection = this.GetConnection();

                var months = await connection.QueryFirstOrDefaultAsync<long>("select id from months where name = @Name", new { Name = month });
                var metricCell = await _cache.FindAppSettings("CellValue");
                var cellMapping = JsonConvert.DeserializeObject<List<CellValueModel>>(metricCell.JsonValue);

                var conversionFormula = await _cache.FindAppSettings("ConversionFormulae");
                var formulaMapping = JsonConvert.DeserializeObject<List<ConversionFormulaModel>>(conversionFormula.JsonValue);

                var cellAssign = await _cache.FindAppSettings("CellMapping");
                var cellAssigning = JsonConvert.DeserializeObject<List<CellMapping>>(cellAssign.JsonValue);

                var cellValues = new Dictionary<string, double>();
                var calculatedValues = new Dictionary<string, double>();
                var mappedResults = new Dictionary<string, double>();

                var controleValues = new Dictionary<string, double>();
                var controlCalculatedValues = new Dictionary<string, double>();
                var controlResults = new Dictionary<string, double>();

                var metricJson = await connection.QueryFirstOrDefaultAsync<string>(
                    "SELECT data FROM dataingestion WHERE metricgroupid = @MetricGroupId and month = @Month and year = @Year",
                    new { MetricGroupId = metricGroupId, Month = months, Year = year });

                if (metricJson != null)
                {
                    var jsonData = JsonConvert.DeserializeObject<List<object>>(metricJson);

                    var finalJson = new List<object>();

                    for (int i = 0; i < jsonData.Count; i += 2)
                    {
                        var name = jsonData[i].ToString();
                        var values = JsonConvert.DeserializeObject<Dictionary<string, string>>(jsonData[i + 1].ToString());

                        foreach (var value in cellMapping)
                        {
                            if (values.TryGetValue(value.Metric, out var metricValue))
                            {
                                if (double.TryParse(metricValue, out var parsedValue))
                                {
                                    cellValues[value.Cell] = parsedValue;
                                }
                            }
                        }

                        foreach (var formula in formulaMapping)
                        {
                            var evaluatedFormula = formula.Formula;

                            foreach (var cell in cellValues)
                            {
                                evaluatedFormula = evaluatedFormula.Replace(cell.Key, cell.Value.ToString());
                            }

                            var result = EvaluateFormula(evaluatedFormula);
                            if (result.HasValue)
                            {
                                var formattedResult = Math.Round(result.Value, 3);

                                calculatedValues[formula.Key.ToString()] = formattedResult;
                            }
                        }

                        var mappedValue = new Dictionary<string, object>();
                        foreach (var assign in cellAssigning)
                        {
                            var key = assign.Key.ToString();
                            if (calculatedValues.TryGetValue(key, out var calculatedValue))
                            {
                                mappedValue[assign.Value] = calculatedValue;
                            }
                        }

                        var resultJson = new Dictionary<string, object>
                {
                    { name, mappedValue }
                };

                        finalJson.Add(name);
                        finalJson.Add(resultJson);
                    }

                    var jsonToUpdate = JsonConvert.SerializeObject(finalJson);

                    var resultt = new List<object>();

                    var parsedJson = JsonConvert.DeserializeObject<List<object>>(jsonToUpdate);

                    for (int i = 0; i < parsedJson.Count; i += 2)
                    {
                        var equipmentName = parsedJson[i].ToString();
                        var equipmentData = JsonConvert.DeserializeObject<Dictionary<string, object>>(parsedJson[i + 1].ToString());

                        var innerData = equipmentData[equipmentName] as JObject;

                        resultt.Add(equipmentName);
                        resultt.Add(innerData);
                    }

                    var jsonToUpdatee = JsonConvert.SerializeObject(resultt);

                    var metricGroupIds = await connection.QueryAsync<MetricGroup>("select * from metricgroup");

                    int monthNumber = DateTime.ParseExact(month, "MMMM", System.Globalization.CultureInfo.InvariantCulture).Month;
                    int daysInMonth = DateTime.DaysInMonth((int)year, monthNumber);
                    var totalHours = daysInMonth * 24;
                    var data = await connection.QuerySingleOrDefaultAsync<string>("SELECT data FROM dataingestion WHERE metricgroupid = @MetricGroupId and month = @Month and year = @Year",
     new { MetricGroupId = metricGroupId, Month = months, Year = year });

                    var shutdownHoursPerPlant = new Dictionary<string, decimal>();

                    if (!string.IsNullOrEmpty(data))
                    {
                        var jsonDataa = JsonConvert.DeserializeObject<List<object>>(data);

                        for (int i = 0; i < jsonDataa.Count; i += 2)
                        {
                            var plantName = jsonDataa[i]?.ToString();

                            if (i + 1 < jsonDataa.Count && jsonDataa[i + 1] is JObject plantData)
                            {
                                var values = plantData.ToObject<Dictionary<string, string>>();

                                if (values.ContainsKey("shut down hours") && decimal.TryParse(values["shut down hours"], out decimal shutDownHours))
                                {
                                    shutdownHoursPerPlant[plantName] = shutDownHours;
                                }
                            }
                        }
                    }

                    var updatedJson = JsonConvert.DeserializeObject<List<object>>(jsonToUpdatee);

                    for (int i = 0; i < updatedJson.Count; i += 2)
                    {
                        var plantName = updatedJson[i]?.ToString();

                        if (i + 1 < updatedJson.Count && updatedJson[i + 1] is JObject plantObject)
                        {
                            var plantData = plantObject.ToObject<Dictionary<string, object>>();

                            if (plantName != null && shutdownHoursPerPlant.TryGetValue(plantName, out decimal shutDownHours))
                            {
                                plantData["Total no. of hours"] = totalHours;
                                plantData["Working hrs"] = totalHours - shutDownHours;
                            }

                            foreach (var metric in plantData)
                            {
                                if (metric.Value is JToken valueToken)
                                {
                                    if (valueToken.Type == JTokenType.Float || valueToken.Type == JTokenType.Integer)
                                    {
                                        plantData[metric.Key] = valueToken.ToObject<double>();
                                    }
                                    else if (valueToken.Type == JTokenType.String && double.TryParse(valueToken.ToString(), out double parsedValue))
                                    {
                                        plantData[metric.Key] = parsedValue;
                                    }
                                }
                            }

                            updatedJson[i + 1] = JObject.FromObject(plantData);
                        }
                    }

                    var newJsonToUpdate = JsonConvert.SerializeObject(updatedJson);

                    var updateQuery = @"UPDATE dataingestion 
                SET calculatedjson = CAST(@CalculatedJson AS jsonb)  
                WHERE metricgroupid = @MetricGroupId and month = @Month and year = @Year";

                    await connection.ExecuteAsync(updateQuery, new
                    {
                        CalculatedJson = newJsonToUpdate,
                        MetricGroupId = metricGroupId,
                        Month = months,
                        Year = year
                    });

                    await this.ControlsCalculation(metricGroupId, month, year);
                }

                double? EvaluateFormula(string formula)
                {
                    try
                    {
                        var expression = new Expression(formula);
                        var result = expression.Evaluate();

                        return result is double ? (double)result : Convert.ToDouble(result);
                    }
                    catch
                    {
                        return null;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task ControlsCalculation(long metricGroupId, string month, long year)
        {
            try
            {
                using var connection = this.GetConnection();

                var months = await connection.QueryFirstOrDefaultAsync<long>("select id from months where name = @Name", new { Name = month });

                var metricGroupIds = await connection.QueryAsync<MetricGroup>("select * from metricgroup");
                var metricCell = await _cache.FindAppSettings("CellValue");
                var cellMapping = JsonConvert.DeserializeObject<List<CellValueModel>>(metricCell.JsonValue);

                var conversionFormula = await _cache.FindAppSettings("ConversionFormulae");
                var formulaMapping = JsonConvert.DeserializeObject<List<ConversionFormulaModel>>(conversionFormula.JsonValue);

                var cellAssign = await _cache.FindAppSettings("CellMapping");
                var cellAssigning = JsonConvert.DeserializeObject<List<CellMapping>>(cellAssign.JsonValue);

                var controleValues = new Dictionary<string, string>();
                var controlCalculatedValues = new Dictionary<string, string>();
                var controlResults = new Dictionary<string, string>();

                var metricJson = await connection.QueryFirstOrDefaultAsync<string>(
    @"SELECT calculatedjson 
      FROM dataingestion 
      WHERE metricgroupid = @MetricGroupId 
      AND month = @Month 
      AND year = @Year",
    new { MetricGroupId = metricGroupId, Month = months, Year = year });

                if (!string.IsNullOrEmpty(metricJson))
                {
                    var jsonArray = JsonConvert.DeserializeObject<List<object>>(metricJson);
                    var finalJson = new List<object>();

                    for (int i = 0; i < jsonArray.Count; i += 2)
                    {
                        var name = jsonArray[i].ToString();

                        var values = JsonConvert.DeserializeObject<Dictionary<string, string>>(jsonArray[i + 1].ToString());

                        var controlResultss = new Dictionary<string, string>();

                        foreach (var value in cellMapping)
                        {
                            if (values.TryGetValue(value.Metric, out var metricValue))
                            {
                                controleValues[value.Cell] = metricValue;
                            }
                        }

                        foreach (var formula in formulaMapping.Where(f => int.TryParse(f.Key, out var key) && key > 3))
                        {
                            var evaluatedFormula = formula.Formula;

                            foreach (var cell in controleValues)
                            {
                                evaluatedFormula = evaluatedFormula.Replace(cell.Key, cell.Value);
                            }

                            var result = EvaluateFormula(evaluatedFormula);
                            if (result.HasValue)
                            {
                                var formattedResult = Math.Round(result.Value, 3);
                                controlCalculatedValues[formula.Key.ToString()] = formattedResult.ToString();
                            }
                        }

                        foreach (var assign in cellAssigning)
                        {
                            var key = assign.Key.ToString();
                            if (controlCalculatedValues.TryGetValue(key, out var calculatedValue))
                            {
                                controlResultss[assign.Value] = calculatedValue;
                            }
                        }

                        var resultJson = new Dictionary<string, object>
    {
        { name, controlResultss }
    };

                        finalJson.Add(name);
                        finalJson.Add(resultJson);
                    }

                    var jsonToUpdate = JsonConvert.SerializeObject(finalJson);

                    var resultt = new List<object>();

                    var parsedJson = JsonConvert.DeserializeObject<List<object>>(jsonToUpdate);

                    for (int i = 0; i < parsedJson.Count; i += 2)
                    {
                        var equipmentName = parsedJson[i].ToString();
                        var equipmentData = JsonConvert.DeserializeObject<Dictionary<string, object>>(parsedJson[i + 1].ToString());

                        var innerData = equipmentData[equipmentName] as JObject;

                        resultt.Add(equipmentName);
                        resultt.Add(innerData);
                    }

                    var jsonToUpdatee = JsonConvert.SerializeObject(resultt);

                    var fetchQuery = @"SELECT calculatedjson FROM dataingestion 
                               WHERE metricgroupid = @MetricGroupId 
                               AND month = @Month 
                               AND year = @Year";
                    var existingJson = await connection.QuerySingleOrDefaultAsync<string>(fetchQuery, new
                    {
                        MetricGroupId = metricGroupId,
                        Month = months,
                        Year = year
                    });

                    if (!string.IsNullOrEmpty(existingJson))
                    {
                        var existingData = JsonConvert.DeserializeObject<List<object>>(existingJson) ?? new List<object>();

                        var parsedNewJson = JToken.Parse(jsonToUpdatee);
                        List<object> newData;

                        if (parsedNewJson is JArray)
                        {
                            newData = parsedNewJson.ToObject<List<object>>();
                        }
                        else if (parsedNewJson is JObject)
                        {
                            newData = new List<object> { parsedNewJson.ToObject<Dictionary<string, object>>() };
                        }
                        else
                        {
                            throw new InvalidOperationException("Unexpected JSON format. Only objects and arrays are supported.");
                        }

                        existingData.AddRange(newData);

                        var updatedJson = JsonConvert.SerializeObject(existingData);

                        var updateQuery = @"UPDATE dataingestion 
                        SET calculatedjson = CAST(@CalculatedJson AS jsonb)  
                        WHERE metricgroupid = @MetricGroupId 
                        AND month = @Month 
                        AND year = @Year";

                        await connection.ExecuteAsync(updateQuery, new
                        {
                            CalculatedJson = updatedJson,
                            MetricGroupId = metricGroupId,
                            Month = months,
                            Year = year
                        });
                    }
                    else
                    {
                        throw new InvalidOperationException("Existing JSON cannot be null or empty.");
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            double? EvaluateFormula(string formula)
            {
                try
                {
                    var expression = new Expression(formula);
                    var result = expression.Evaluate();
                    return result is double ? (double)result : Convert.ToDouble(result);
                }
                catch
                {
                    return null;
                }
            }
        }

        public async Task TimeDimensionCalculation(long metricGroupId, string month)
        {
            try
            {
                using var connection = this.GetConnection();
                var months = await connection.QueryFirstOrDefaultAsync<long>("select id from months where name = @Name", new { Name = month });
                var metrics = await connection.QueryAsync<TimeDimensionCalculationModel>("select metricsquestion,formulaefield,metricgroupid from metric m " +
                                                                                         "JOIN mgmultiselection mg on m.id = mg.metricid " +
                                                                                         "where mg.metricgroupid = @MetricGroupId and formulaefield is not null", new { MetricGroupId = metricGroupId });

                var metricResults = new Dictionary<string, decimal>();

                foreach (var metric in metrics)
                {
                    var sql = @"SELECT calculatedjson ->> @MetricsQuestion AS MetricValue 
                        FROM dataingestion 
                        WHERE calculatedjson ->> @MetricsQuestion IS NOT NULL 
                        AND metricgroupid = @MetricGroupId and month = @Month";

                    var data = await connection.QueryFirstOrDefaultAsync<string>(sql, new { MetricsQuestion = metric.MetricsQuestion, MetricGroupId = metric.MetricGroupId, Month = months });

                    if (decimal.TryParse(data, out var metricValue))
                    {
                        var formula = metric.Formulaefield;
                        var calculatedValue = EvaluateFormula(formula, metricValue);

                        metricResults[metric.MetricsQuestion] = calculatedValue;
                    }
                }

                var jsonData = System.Text.Json.JsonSerializer.Serialize(metricResults);

                var updateSql = @"UPDATE dataingestion SET timedimensiondata = @JsonData::jsonb WHERE metricgroupid = @MetricGroupId and month = @Month";

                await connection.ExecuteAsync(updateSql, new { JsonData = jsonData, MetricGroupId = metrics.First().MetricGroupId, Month = months });

                decimal EvaluateFormula(string formula, decimal formValue)
                {
                    var expression = formula.Replace("formValue", formValue.ToString());

                    var evaluator = new NCalc.Expression(expression);
                    return Convert.ToDecimal(evaluator.Evaluate());
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task GetTotal(long metricGroupId, string month, long year)
        {
            try
            {
                using var connection = this.GetConnection();
                var months = await connection.QueryFirstOrDefaultAsync<long>("select id from months where name = @Name", new { Name = month });
                var data = await connection.QueryFirstOrDefaultAsync<string>("select calculatedjson from dataingestion where metricgroupid = @MetricGroupId and month = @Month and year = @Year", new { MetricGroupId = metricGroupId, Month = months, Year = year });

                var parsedData = JsonConvert.DeserializeObject<List<object>>(data);

                decimal totalPm = 0, totalNox = 0, totalSo2 = 0;

                for (int i = 0; i < parsedData.Count; i++)
                {
                    if (parsedData[i] is string name)
                    {
                        if (i + 1 < parsedData.Count && parsedData[i + 1] is JObject dataObject)
                        {
                            decimal pmValue = 0, noxValue = 0, so2Value = 0;

                            if (dataObject.ContainsKey("PM(kg)"))
                            {
                                var pm = dataObject["PM(kg)"].ToString();
                                if (decimal.TryParse(pm, out decimal parsedPm))
                                {
                                    pmValue = parsedPm;
                                }
                            }

                            if (dataObject.ContainsKey("Nox(kg)"))
                            {
                                var nox = dataObject["Nox(kg)"].ToString();
                                if (decimal.TryParse(nox, out decimal parsedNox))
                                {
                                    noxValue = parsedNox;
                                }
                            }

                            if (dataObject.ContainsKey("SO2(kg)"))
                            {
                                var so2 = dataObject["SO2(kg)"].ToString();
                                if (decimal.TryParse(so2, out decimal parsedSo2))
                                {
                                    so2Value = parsedSo2;
                                }
                            }

                            totalPm += pmValue;
                            totalNox += noxValue;
                            totalSo2 += so2Value;
                        }
                    }
                }

                var appsettings = await connection.QueryFirstOrDefaultAsync<string>("select value from appsettings where name = 'Crude Steel Production (ton)'");

                var totals = new
                {
                    TotalPm = totalPm,
                    TotalNox = totalNox,
                    TotalSo2 = totalSo2
                };

                totalPm = Math.Round(totalPm, 3);
                totalNox = Math.Round(totalNox, 3);
                totalSo2 = Math.Round(totalSo2, 3);

                var appsettingsValue = Convert.ToDecimal(appsettings);

                var specifickgPM = totalPm / appsettingsValue;
                var specifickgSO = totalSo2 / appsettingsValue;
                var specifickgNO = totalNox / appsettingsValue;

                specifickgPM = Math.Round(specifickgPM, 3);
                specifickgSO = Math.Round(specifickgSO, 3);
                specifickgNO = Math.Round(specifickgNO, 3);

                string totalJson = JsonConvert.SerializeObject(new
                {
                    TotalPMKg = totalPm,
                    TotalNoxKg = totalNox,
                    TotalSo2Kg = totalSo2,
                    CrudeSteelProductionTon = appsettings,
                    SpecificKgPM = specifickgPM,
                    SpecificKgSO = specifickgSO,
                    SpecificKgNO = specifickgNO
                });

                await connection.ExecuteAsync(
                    "UPDATE dataingestion SET total = @Total::jsonb WHERE metricgroupid = @MetricGroupId AND month = @Month AND year = @Year",
                    new { Total = totalJson, MetricGroupId = metricGroupId, Month = months, Year = year });
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task UploadSFTPfile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty.");
            }

            var azureConnection = _configuration["AzureBlobStorageKey"];
            var containerName = _configuration["SFTPContainerName"];

            var blobServiceClient = new BlobServiceClient(azureConnection);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

            var originalFileName = Path.GetFileNameWithoutExtension(file.FileName);
            var fileExtension = Path.GetExtension(file.FileName);

            var cleanedFileName = System.Text.RegularExpressions.Regex.Replace(originalFileName, @"\s*\(\d+\)$", " ").Trim();

            var folderName = cleanedFileName.Split(' ').Last();
            var targetFileName = $"{cleanedFileName}{fileExtension}";

            var blobClient = containerClient.GetBlobClient($"{folderName}/{targetFileName}");

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, overwrite: true).ConfigureAwait(true);
                if (cleanedFileName == "BESCOM 23-24")
                {
                    await _dataProcess.ProcessDataFromTemplate("BescomFY23-24List", false).ConfigureAwait(false);
                }
                else if (cleanedFileName == "BESCOM 24-25")
                {
                    await _dataProcess.ProcessDataFromTemplate("BescomFY24-25List", false).ConfigureAwait(false);
                }
                else if (cleanedFileName == "BWSSB 23-24")
                {
                    await _dataProcess.ProcessDataFromTemplate("BwssbFY23-24List", false).ConfigureAwait(false);
                }
                else if (cleanedFileName == "BWSSB 24-25")
                {
                    await _dataProcess.ProcessDataFromTemplate("BwssbFY24-25List", false).ConfigureAwait(false);
                }
                else if (cleanedFileName == "JOY InfoTech Employee Details FY-23-24")
                {
                    await _dataProcess.ProcessDataFromTemplate("InfoTechEmployeeDetailsFY23-24List", false).ConfigureAwait(false);
                }
                else if (cleanedFileName == "JOY InfoTech Employee Details FY-24-25")
                {
                    await _dataProcess.ProcessDataFromTemplate("InfoTechEmployeeDetailsFY24-25List", false).ConfigureAwait(false);
                }
                else if (cleanedFileName == "JOY IT Solution Employee Details FY-23-24")
                {
                    await _dataProcess.ProcessDataFromTemplate("ITSolutionEmployeeDetailsFY23-24List", false).ConfigureAwait(false);
                }
                else if (cleanedFileName == "JOY IT Solution Employee Details FY-24-25")
                {
                    await _dataProcess.ProcessDataFromTemplate("ITSolutionEmployeeDetailsFY24-25List", false).ConfigureAwait(false);
                }
            }
        }

        public async Task UploadPdffile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty.");
            }

            var azureConnection = _configuration["AzureBlobStorageKey"];
            var containerName = _configuration["PdfContainerName"];

            var blobServiceClient = new BlobServiceClient(azureConnection);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

            var originalFileName = Path.GetFileNameWithoutExtension(file.FileName);
            var fileExtension = Path.GetExtension(file.FileName);

            var cleanedFileName = System.Text.RegularExpressions.Regex.Replace(originalFileName, @"\s*\(\d+\)$", " ").Trim();
            var targetFileName = $"{cleanedFileName}{fileExtension}";

            var blobClient = containerClient.GetBlobClient(targetFileName);

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, overwrite: true).ConfigureAwait(false);
            }
        }

        public async Task AddOrUpdateStandard(MetricStandard metricStandard)
        {
            var action = this.GetAction<MetricStandard>();
            using var connection = this.GetConnection();
            var json = metricStandard?.StandardJson ?? "null";
            await connection.ExecuteAsync(
                "INSERT INTO MetricStandard (standardjson,yearid) VALUES (CAST(@StandardJson AS jsonb),@YearId)",
                new { StandardJson = json, YearId = metricStandard.YearId }).ConfigureAwait(false);

            // await action.AddOrUpdate(metricStandard);
        }

        public async Task<List<MetricStandardDto>> GetMetricStandards()
        {
            using var connection = this.GetConnection();
            var result = await connection.QueryAsync<MetricStandardDto>($"SELECT ms.yearid,p.yearname,ms.id FROM metricstandard AS ms JOIN period AS p ON ms.yearid = p.id ORDER BY ms.id DESC ").ConfigureAwait(true);
            return result.ToList();
        }

        public async Task<byte[]> DownloadStandardData(string format)
        {
            try
            {
                using var connection = this.GetConnection();
                var attributes = await connection.QueryAsync<Metric>("SELECT * FROM metric ORDER BY id").ConfigureAwait(false);

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Sheet1");

                // Set headers
                worksheet.Cell(1, 1).Value = "Question List";
                worksheet.Cell(1, 2).Value = "Answer";

                // Style the header cells
                var headerRange = worksheet.Range("A1:B1");
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Font.FontColor = XLColor.White;
                headerRange.Style.Fill.BackgroundColor = XLColor.SteelBlue;

                // Add metric names and placeholder answers
                int rowIndex = 2;
                foreach (var attribute in attributes)
                {
                    worksheet.Cell(rowIndex, 1).Value = attribute.MetricsQuestion;
                    worksheet.Cell(rowIndex, 2).Value = " "; // Placeholder for the "Answer" column
                    rowIndex++;
                }

                // Auto-adjust column widths for better readability
                worksheet.Columns().AdjustToContents();

                using var memoryStream = new MemoryStream();
                workbook.SaveAs(memoryStream);
                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new HandledException($"Error downloading template: {ex.Message}");
            }
        }

        public async Task AddorupdateGoalsettings(GoalSetting goal)
        {
            try
            {
                using var connection = this.GetConnection();
                if (string.IsNullOrWhiteSpace(goal?.Name))
                {
                    throw new HandledException("name cannot be empty.");
                }

                var action = this.GetAction<GoalSetting>();

                var json = goal.TargetJson ?? "null";
                await connection.ExecuteAsync(
                    "INSERT INTO GoalSetting (targetjson,yearid, name) VALUES (CAST(@TargetJson AS jsonb),@YearId, @name)",
                    new { TargetJson = json, YearId = goal.YearId, Name = goal.Name }).ConfigureAwait(false);

                // await action.AddOrUpdate(goal);              
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<GoalSettingDto>> GetGoalSetting()
        {
            try
            {
                using var connection = this.GetConnection();
                var query = await connection.QueryAsync<GoalSettingDto>($"select gs.*,p.yearname from goalsetting as gs join period as p on p.id = gs.yearid ").ConfigureAwait(true);
                return query.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<MetricGroup> GetMetricGroupNames(long metricGroupId)
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QuerySingleOrDefaultAsync<MetricGroup>("select * from metricgroup where id = @Id", new { Id = metricGroupId });
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<string> GetMonthAndYear(string month, long year)
        {
            try
            {
                using var connection = this.GetConnection();
                var months = await connection.QueryFirstOrDefaultAsync<long>("select id from months where name = @Name", new { Name = month });
                var monthName = await connection.QueryFirstOrDefaultAsync<string>("select name from months where id = @Id", new { Id = months });
                return monthName;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task UploadFormTemplate(IFormFile file, long templateId, long metricGroupId, long auditId)
        {
            try
            {
                using var connection = this.GetConnection();

                // Read the Excel file
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheet(1);

                // Find column indexes dynamically
                var columnMapping = new Dictionary<string, int>();
                var headerRow = worksheet.Row(1);
                foreach (var cell in headerRow.CellsUsed())
                {
                    columnMapping[cell.Value.ToString()] = cell.Address.ColumnNumber;
                }

                // Store only a single JSON object
                var jsonData = new Dictionary<string, object>();
                int rowIndex = 2; // Start from row 2, assuming row 1 is the header

                // Read only the first non-empty row
                if (!worksheet.Cell(rowIndex, 1).IsEmpty())
                {
                    foreach (var column in columnMapping)
                    {
                        string columnName = column.Key;
                        int columnIndex = column.Value;
                        var cell = worksheet.Cell(rowIndex, columnIndex);
                        object cellValue = cell.Value;

                        // Convert numeric values properly
                        if (cell.DataType == XLDataType.Number)
                        {
                            jsonData[columnName] = cell.GetDouble();  // Extracts numeric value correctly
                        }
                        else
                        {
                            jsonData[columnName] = cellValue.ToString().Trim(); // Handles text values properly
                        }
                    }

                    string uomquery = "SELECT value FROM appsettings WHERE name = @SettingName";
                    string uomKey = connection.QueryFirstOrDefault<string>(uomquery, new { SettingName = "UOM" }) ?? "UOM";

                    if (templateId == 66)
                    {
                        string quantityquery = "SELECT value FROM appsettings WHERE name = @SettingName";
                        string quantityKey = connection.QueryFirstOrDefault<string>(quantityquery, new { SettingName = "Quantity" }) ?? "Quantity";

                        int unit = jsonData.ContainsKey(quantityKey) && double.TryParse(jsonData[quantityKey].ToString(), out double quantityValue)
                        ? (int)quantityValue
                        : 100; // Default fallback

                        string fuelquery = "SELECT value FROM appsettings WHERE name = @SettingName";
                        string fuelKey = connection.QueryFirstOrDefault<string>(fuelquery, new { SettingName = "Fuel Name" }) ?? "Fuel Name";

                        // Fetch Emission Factor in kgCO2e from ghgmaster table
                        if (jsonData.ContainsKey(fuelKey) && jsonData.ContainsKey(uomKey))
                        {
                            string fuelName = jsonData[fuelKey].ToString();
                            string uom = jsonData[uomKey].ToString();

                            string query = "SELECT value FROM ghgmaster WHERE name = @FuelName AND unit = @UOM LIMIT 1";
                            double? kgCO2e = await connection.QueryFirstOrDefaultAsync<double?>(query, new { FuelName = fuelName, UOM = uom });

                            if (kgCO2e.HasValue)
                            {
                                jsonData["Emission Factor in kgCO2e"] = kgCO2e.Value;
                                jsonData["Emission in tCO2e"] = Math.Round(kgCO2e.Value * (unit / 1000.0), 3);
                            }
                            else
                            {
                                jsonData["Emission Factor in kgCO2e"] = 234.78;
                                jsonData["Emission in tCO2e"] = 1000;
                            }
                        }
                    }
                    else if (templateId == 67)
                    {
                        string distancequery = "SELECT value FROM appsettings WHERE name = @SettingName";
                        string distanceKey = connection.QueryFirstOrDefault<string>(distancequery, new { SettingName = "Distance Travelled" }) ?? "Distance Travelled";

                        string fuelTypequery = "SELECT value FROM appsettings WHERE name = @SettingName";
                        string fuelTypeKey = connection.QueryFirstOrDefault<string>(fuelTypequery, new { SettingName = "Fuel Type" }) ?? "Fuel Type";

                        string vehiclequery = "SELECT value FROM appsettings WHERE name = @SettingName";
                        string vehicleKey = connection.QueryFirstOrDefault<string>(vehiclequery, new { SettingName = "Vehicle Type" }) ?? "Vehicle Type";

                        int distance = jsonData.ContainsKey(distanceKey) && double.TryParse(jsonData[distanceKey].ToString(), out double quantityValue)
                        ? (int)quantityValue
                        : 100;

                        if (jsonData.ContainsKey(fuelTypeKey) && jsonData.ContainsKey(uomKey) && jsonData.ContainsKey(vehicleKey))
                        {
                            string fuelName = jsonData[fuelTypeKey].ToString();
                            string uom = jsonData[uomKey].ToString();
                            string vehicleType = jsonData[vehicleKey].ToString();

                            string query = "SELECT value FROM ghgmaster WHERE name = @FuelName AND unit = @UOM and type = @Type LIMIT 1";
                            double? kgCO2e = await connection.QueryFirstOrDefaultAsync<double?>(query, new { FuelName = fuelName, UOM = uom, Type = vehicleType });

                            if (kgCO2e.HasValue)
                            {
                                jsonData["Emission Factor in kgCO2e"] = kgCO2e.Value;
                                jsonData["Emission in tCO2e"] = Math.Round(kgCO2e.Value * (distance / 1000.0), 3);
                            }
                            else
                            {
                                jsonData["Emission Factor in kgCO2e"] = 1000;
                                jsonData["Emission in tCO2e"] = 1500;
                            }
                        }
                    }
                    else if (templateId == 68)
                    {
                        string quantityMaterialquery = "SELECT value FROM appsettings WHERE name = @SettingName";
                        string quantityMaterialKey = connection.QueryFirstOrDefault<string>(quantityMaterialquery, new { SettingName = "Quantity of the Material Processed" }) ?? "Quantity of the Material Processed";

                        string gasEmittedquery = "SELECT value FROM appsettings WHERE name = @SettingName";
                        string gasEmittedKey = connection.QueryFirstOrDefault<string>(gasEmittedquery, new { SettingName = "Gas emitted/ Refrigerant type" }) ?? "Gas emitted/ Refrigerant type";

                        int quantityOfMaterail = jsonData.ContainsKey(quantityMaterialKey) && double.TryParse(jsonData[quantityMaterialKey].ToString(), out double quantityValue)
                        ? (int)quantityValue
                        : 100;

                        if (jsonData.ContainsKey(gasEmittedKey) && jsonData.ContainsKey(uomKey))
                        {
                            string fuelName = jsonData[gasEmittedKey].ToString();
                            string uom = jsonData[uomKey].ToString();

                            string query = "SELECT value FROM ghgmaster WHERE name = @FuelName AND unit = @UOM LIMIT 1";
                            double? kgCO2e = await connection.QueryFirstOrDefaultAsync<double?>(query, new { FuelName = fuelName, UOM = uom });

                            if (kgCO2e.HasValue)
                            {
                                jsonData["Emission Factor in kgCO2e"] = kgCO2e.Value;
                                jsonData["Emission in tCO2e"] = Math.Round(kgCO2e.Value * (quantityOfMaterail / 1000.0), 3);
                            }
                            else
                            {
                                jsonData["Emission Factor in kgCO2e"] = 12.78;
                                jsonData["Emission in tCO2e"] = 2000;
                            }
                        }
                    }
                    else if (templateId == 69)
                    {
                        string quantityGasquery = "SELECT value FROM appsettings WHERE name = @SettingName";
                        string quantityGasKey = connection.QueryFirstOrDefault<string>(quantityGasquery, new { SettingName = "Quantity of Gas Leaked" }) ?? "Quantity of Gas Leaked";

                        string gasLeakedquery = "SELECT value FROM appsettings WHERE name = @SettingName";
                        string gasLeakedKey = connection.QueryFirstOrDefault<string>(gasLeakedquery, new { SettingName = "Gas leaked/ Refrigerant Type" }) ?? "Gas leaked/ Refrigerant Type";

                        int activityData = jsonData.ContainsKey(quantityGasKey) && double.TryParse(jsonData[quantityGasKey].ToString(), out double quantityValue)
                        ? (int)quantityValue
                        : 100;

                        if (jsonData.ContainsKey(gasLeakedKey) && jsonData.ContainsKey(uomKey))
                        {
                            string fuelName = jsonData[gasLeakedKey].ToString();
                            string uom = jsonData[uomKey].ToString();

                            string query = "SELECT value FROM ghgmaster WHERE name = @FuelName AND unit = @UOM LIMIT 1";
                            double? kgCO2e = await connection.QueryFirstOrDefaultAsync<double?>(query, new { FuelName = fuelName, UOM = uom });

                            if (kgCO2e.HasValue)
                            {
                                jsonData["Emission Factor in kgCO2e"] = kgCO2e.Value;
                                jsonData["Emission in tCO2e"] = Math.Round(kgCO2e.Value * (activityData / 1000.0), 3);
                            }
                            else
                            {
                                jsonData["Emission Factor in kgCO2e"] = 150.78;
                                jsonData["Emission in tCO2e"] = 2500;
                            }
                        }
                    }
                }

                // Convert to JSON
                string responseJson = JsonConvert.SerializeObject(jsonData, Formatting.Indented);

                var metricParentId = await connection.QueryFirstOrDefaultAsync<long?>($"select parentid from metricgroup where id = {metricGroupId}");

                var duplicate = await connection.QueryAsync<long>($"select 1 from metricansweroptions where metricgroupid = {metricGroupId} and templateid = {templateId} and auditid = {auditId}");
                if (duplicate.Count() == 0)
                {
                    string insertQuery = "INSERT INTO metricansweroptions (responsejson, templateid, metricgroupid, auditid, metricparentid) VALUES (CAST(@ResponseJson AS jsonb), @Templateid, @MetricGroupId, @AuditId, @MetricParentId)";
                    await connection.ExecuteAsync(insertQuery, new { ResponseJson = responseJson, TemplateId = templateId, MetricGroupId = metricGroupId, AuditId = auditId, MetricParentId = metricParentId });
                }
                else
                {
                    var update = "UPDATE metricansweroptions SET responsejson = CAST(@ResponseJson AS jsonb) WHERE templateid = @TemplateId AND metricgroupid = @MetricGroupId AND auditid = @AuditId";
                    await connection.ExecuteAsync(update, new { ResponseJson = responseJson, TemplateId = templateId, MetricGroupId = metricGroupId, AuditId = auditId });
                }

                await connection.ExecuteAsync($"Update processstages set status = {(long)TemplateStageApprovalENum.Completed} where auditid = {auditId}").ConfigureAwait(false);

                // var totalValue = await connection.QueryFirstOrDefaultAsync<double?>($"SELECT COALESCE(SUM((responsejson->>'Emission in tCO2e')::numeric), 0) AS total_emission FROM metricansweroptions " +
                //                                                      $"WHERE metricparentid = {metricParentId}");
                // await connection.ExecuteAsync($"update metricansweroptions set totalvalue = {totalValue} where metricparentid = {metricParentId}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error processing file: {ex.Message}");
            }
        }

        public async Task<List<MetricAnswerOptions>> GetMetricAnswerOptionsDetails(long metricGroupId)
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<MetricAnswerOptions>($"select * from metricansweroptions where metricgroupid = {metricGroupId}")).ToList();
            }
            catch
            {
                throw;
            }
        }

        private async Task<List<string>> FetchDropdownValues(IDbConnection connection, string typeName)
        {
            var configJson = await connection.QueryFirstOrDefaultAsync<string>(
                $"SELECT configjson FROM ValueMaster WHERE name = @Name", new { Name = typeName }).ConfigureAwait(true);

            var options = JsonConvert.DeserializeObject<List<FuelOption>>(configJson);
            return options?.Select(o => o.Value).ToList() ?? new List<string>();
        }
    }
}
