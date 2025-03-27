using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Dapper;
using DocumentFormat.OpenXml.EMMA;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Enum;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OfficeOpenXml;
using PdfSharp.Drawing;
using PdfSharp.Pdf;

namespace Joy.PIM.BAL.Implementations
{
    public class MetricRepository : PgEntityAction<Metric>, IMetricRepo
    {
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;
        private readonly IDbCache _cache;

        public MetricRepository(IDbConnectionFactory connectionFactory,
            IUserContext userContext, IConfiguration configuration, IDbCache cache)
            : base(userContext, connectionFactory, configuration)
        {
            _connectionFactory = connectionFactory;
            _configuration = configuration;
            _userContext = userContext;
            _cache = cache;
        }

        public async Task AddOrUpdateMetric(Metric model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.MetricsQuestion))
                {
                    throw new HandledException("MetricsQuestion cannot be empty.");
                }

                using var connection = this.GetConnection();

                // var data = await connection.QueryAsync<dynamic>($"select 1 from Metric where name = '{model.Name}'");
                // if (model.Id == 0 && data.Count() > 0)
                // {
                //    throw new Exception($"metric{model.Name} already exists.");
                // }
                model.Category = 1;
                model.Standard = 7;
                model.Department = 2;
                model.TypeId = 4;
                model.EsgrcType = 1;
                model.Uom = 1;
                model.Serviceid = 1;
                await this.AddOrUpdate(model).ConfigureAwait(true);
                var parentid = await connection.QueryFirstOrDefaultAsync<int?>($"select id from metric where metricsquestion = '{model.MetricsQuestion}'").ConfigureAwait(true);
                var data = this.GetAction<Mgmultiselection>();

                if (model.Parentid is null)
                {
                    await connection.ExecuteAsync($"UPDATE metric set parentid = {parentid} where metricsquestion = '{model.MetricsQuestion}' ").ConfigureAwait(false);
                    string query = "INSERT INTO mgmultiselection (metricId, metricgroupId) VALUES (@MetricId, @GroupId)";
                    await connection.ExecuteAsync(query, new { MetricId = parentid, GroupId = model.GroupId }).ConfigureAwait(false);
                }
                else
                {
                    await connection.ExecuteAsync($"UPDATE metric set parentid = {model.Parentid} where metricsquestion = '{model.MetricsQuestion}' ").ConfigureAwait(false);
                    string query = "INSERT INTO mgmultiselection (metricId, metricgroupId) VALUES (@MetricId, @GroupId)";
                    await connection.ExecuteAsync(query, new { MetricId = parentid, GroupId = model.GroupId }).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task UpdateMetric(IEnumerable<long> ids, long groupId)
        {
            try
            {
                using var connection = this.GetConnection();

                // Retrieve existing metric IDs for the group
                var existingMetricIds = (await connection.QueryAsync<long>(
                    "SELECT metricid FROM public.mgmultiselection WHERE metricgroupid = @GroupId",
                    new { GroupId = groupId }))
                    .ToHashSet(); // Use HashSet for efficient lookups

                // Determine the new metric IDs
                var newMetricIds = ids.Except(existingMetricIds).ToList();

                if (newMetricIds.Any())
                {
                    // Batch insert new metric IDs
                    const string query = "INSERT INTO mgmultiselection (metricId, metricgroupId) VALUES (@MetricId, @GroupId)";
                    var parameters = newMetricIds.Select(id => new { MetricId = id, GroupId = groupId }).ToList();
                    await connection.ExecuteAsync(query, parameters);
                }
                else
                {
                    throw new ArgumentException("All metrics already exist for the specified group.");
                }
            }
            catch (Exception ex)
            {
                // Preserve the stack trace and provide context without overwriting the original exception
                throw new Exception("Error while updating metrics.", ex);
            }
        }

        public async Task<List<MetricDomainModel>> GetMetric()
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<MetricDomainModel>($"WITH metric_with_validation AS " +
                                            $"(SELECT m.*,STRING_AGG(v.name, ', ') AS validationname, mt.name as typeName, mt.id as metrictypeId,m.lookuptable, m.lookuptablecolumn, et.name as EsgrcName, uom.name as UomName, c.name as CategoryName, s.name as StandardName FROM metric m " +
                    $"JOIN validationlist v ON v.id::text = ANY(STRING_TO_ARRAY(m.validationid, ',')) " +
                    $"JOIN metrictype AS mt ON mt.id = m.typeid " +
                    $"JOIN esgrctype AS et ON et.id = m.esgrctype " +
                    $"JOIN Uom AS uom ON uom.id = m.uom " +
                    $"JOIN category AS c ON c.id = m.category " +
                    $"JOIN standards AS s ON s.id = m.standard " +
                    $"WHERE m.isactive = true " +
                                            $"GROUP BY m.id, mt.name, mt.id, et.id, uom.id, c.id, s.id) " +
                    $"SELECT * FROM metric_with_validation").ConfigureAwait(true);
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<Metric>> GetMetricList()
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<Metric>("SELECT * FROM metric where isActive = true order by Id desc").ConfigureAwait(true);
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<MetricDomainModel>> GetMetricsWithId(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<MetricDomainModel>($"SELECT m.*,s.name as servicename FROM metric m " +
                    $"join service as s on s.id = m.serviceid where m.Id = {id}").ConfigureAwait(true);
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<MetricDomainModel>> GetRegulationsWithId(long groupId, long regulationtypeid)
        {
            try
            {
                using var connection = this.GetConnection();

                var metricQuery = @"SELECT 
                                    m.id, 
                                    m.name, 
                                    m.metricsquestion, 
                                    m.standard, 
                                    m.typeid, 
                                    m.esgrctype, 
                                    m.uom, 
                                    m.category, 
                                    m.department, 
                                    m.validationid, 
                                    m.standardyear, 
                                    m.target, 
                                    m.serviceid, 
                                    m.parentid, 
                                    m.regulationtypeid, 
                                    m.formulaefield, 
                                    m.timedimension, 
                                    s.name AS ServiceName, 
                                    ms.metricgroupid AS groupid, 
                                    MetricType.name AS TypeName,
                                    m.createdby
                                    FROM Metric m
                                    JOIN mgmultiselection AS ms ON ms.metricid = m.id
                                    JOIN MetricType ON m.typeId = MetricType.id
                                    JOIN Service AS s ON m.serviceId = s.id
                                    WHERE ms.metricgroupid = @GroupId AND m.regulationtypeid = @RegulationTypeId";

                var data = await connection.QueryAsync<MetricDomainModel>(
                    metricQuery,
                    new { GroupId = groupId, RegulationTypeId = regulationtypeid }).ConfigureAwait(false);

                // timeDimensionQuery = @"SELECT timedimensiondata 
                //                           FROM dataingestion 
                //                           WHERE metricgroupid = @MetricGroupId";

                // var timeDimensionData = await connection.QueryAsync<Dictionary<string, object>>(timeDimensionQuery, new { MetricGroupId = groupId }).ConfigureAwait(false);

                // foreach (var timeDimensionDict in timeDimensionData)
                // {
                //    foreach (var metric in data)
                //    {
                //        if (timeDimensionDict.ContainsKey(metric.MetricsQuestion))
                //        {
                //            metric.Value = Convert.ToDecimal(timeDimensionDict[metric.MetricsQuestion]);
                //        }
                //    }
                // }
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task ActivateMetric(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<Metric>("select * from Metric where id = @id", new { id }).ConfigureAwait(true);

                if (data.Count() == 0)
                {
                    throw new HandledException(code: 400, message: "no data found with this id");
                }

                await connection.ExecuteScalarAsync<Metric>($"update Metric set isactive = true where id = @id", new
                {
                    id
                }).ConfigureAwait(false);
                connection.Close();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task ActivateMetricBatch(long[] ids)
        {
            foreach (long id in ids)
            {
                await ActivateMetric(id).ConfigureAwait(true);
            }
        }

        public async Task DeactivateMetric(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<Metric>("select * from Metric where id = @id", new { id }).ConfigureAwait(true);

                if (data.Count() == 0)
                {
                    throw new HandledException(code: 400, message: "no data found with this id");
                }

                await connection.ExecuteScalarAsync<Metric>($"update Metric set isactive = false where id = @id", new
                {
                    id
                }).ConfigureAwait(false);
                connection.Close();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task DeactivateMetricBatch(long[] ids)
        {
            foreach (long id in ids)
            {
                await DeactivateMetric(id).ConfigureAwait(true);
            }
        }

        public async Task<IEnumerable<Metric>> GetAllActiveMetric()
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QueryAsync<Metric>($"select * from Metric where isactive = true").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<long>> GetActiveAnswerOptions()
        {
            try
            {
                using var connection = this.GetConnection();

                var activeAnswers = await connection.QueryAsync<long>(
                    "SELECT DISTINCT answeroption FROM Metric WHERE answeroption IS NOT NULL").ConfigureAwait(true);

                return activeAnswers.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<Metric>> SearchActiveMetrics(bool isActive)
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QueryAsync<Metric>($"select * from Metric where isactive = @isActive", new { isActive }).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<MetricType>> GetAllMetricType()
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QueryAsync<MetricType>($"select * from MetricType where isactive = true").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<MetricType>> GetAllMetricTypeId(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QueryAsync<MetricType>($"select * from MetricType where Id = {id}").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task AddOrUpdateMetricAnswer(MetricAnswerOptionDto model)
        {
            try
            {
                using var connection = this.GetConnection();
                var userid = await GetUserId().ConfigureAwait(true);
                var metricAnswer = this.GetAction<MetricAnswerOptions>();

                var cleanedJson = new Dictionary<string, object>();

                foreach (var kvp in model.ResponseJson)
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

                var result = new MetricAnswerOptions()
                {
                    Id = model.Id,
                    TemplateId = model.TemplateId,
                    ProcessId = model.ProcessId,
                    MetricGroupId = model.MetricGroupId,
                    ResponseJson = cleanedJson,
                    AuditId = model.AuditId,
                    DateCreated = DateTimeOffset.UtcNow,
                    DateModified = DateTimeOffset.UtcNow,
                    CreatedBy = userid,
                    UpdatedBy = userid,
                    IsActive = true,
                };

                var checkIdQuery = "SELECT COUNT(1) FROM metricAnswerOptions WHERE id = @Id";

                var idExists = await connection.ExecuteScalarAsync<bool>(checkIdQuery, new { result.Id }).ConfigureAwait(true);

                if (idExists)
                {
                    // Update existing row
                    var updateQuery = @"
                    UPDATE metricAnswerOptions
                    SET
                        templateid = @TemplateId,
                        processId = @ProcessId,
                        auditId = @AuditId,
                        responseJson = @ResponseJson::json,
                        datecreated = @DateCreated,
                        datemodified = @DateModified,
                        createdby = @CreatedBy,
                        updatedby = @UpdatedBy,
                        isactive = @IsActive
                    WHERE id = @Id";

                    await connection.ExecuteAsync(updateQuery, result).ConfigureAwait(false);
                }
                else
                {
                    var queryList = @"
                    INSERT INTO metricAnswerOptions ( templateid, processId, auditId, responseJson, datecreated, datemodified, createdby, updatedby, isactive)
                    VALUES ( @TemplateId, @processId, @auditId, @responseJson::json, @DateCreated, @DateModified, @CreatedBy, @UpdatedBy, @IsActive)";

                    await connection.ExecuteAsync(queryList, result).ConfigureAwait(true);
                }

                // await metricAnswer.AddOrUpdate(result);
                var templatestageId = await GetTemplateStageId(model?.TemplateId, model.ProcessId).ConfigureAwait(true);
                var query = @"UPDATE ProcessStages SET Status = @Status WHERE templatestageId = @TemplateStageId AND auditId = @AuditId";

                await connection.ExecuteAsync(query, new
                {
                    Status = (long)TemplateStageApprovalENum.Completed,
                    TemplateStageId = templatestageId,
                    AuditId = model.AuditId
                }).ConfigureAwait(false);

                // await this.AddAuditData(new AuditResponse()
                // {
                //    AuditId = model.AuditId,
                //    AuditData = model.ResponseJson,
                //  });
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task AddAuditData(AuditResponse model)
        {
            try
            {
                using var connection = this.GetConnection();
                var auditData = this.GetAction<AuditResponse>();
                await auditData.AddOrUpdate(model).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<long> GetTemplateStageId(long? templateId, long processId)
        {
            try
            {
                using var connection = this.GetConnection();
                var query = "SELECT ts.id FROM templatestages ts WHERE ts.templateid = @TemplateId AND ts.processId = @ProcessId";
                var parameters = new { TemplateId = templateId, ProcessId = processId };

                var templatestageId = await connection.QueryFirstOrDefaultAsync<long>(query, parameters).ConfigureAwait(true);
                return templatestageId;
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<MetricQuestionAnswersDto>> GetMetricAnswer(long templateId, long auditId)
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QueryAsync<MetricQuestionAnswersDto>($"select * from metricansweroptions where templateId = {templateId} AND auditId = {auditId}").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<string> ValidateInput(ValidationListEnum type, object input)
        {
            switch (type)
            {
                case ValidationListEnum.Number:
                    string phoneNumber = input.ToString();
                    string phonePattern = @"^\+?(\d[\d-. ]+)?(\([\d-. ]+\))?[\d-. ]+\d$";
                    return Regex.IsMatch(phoneNumber, phonePattern) ? "Valid" : "Invalid";

                case ValidationListEnum.DateTime:
                    string dateStr = input.ToString();
                    DateTime parsedDate;
                    return DateTime.TryParse(dateStr, out parsedDate) && parsedDate < DateTime.Now ? "Valid" : "Invalid";

                case ValidationListEnum.File:
                    const long MaxFileSizeInBytes = 10 * 1024 * 1024; // 10mb
                    Stream fileStream = input as Stream;
                    return fileStream.Length > 0 && fileStream.Length <= MaxFileSizeInBytes ? "Valid" : "Invalid";

                case ValidationListEnum.Boolean:
                    string yesNoValue = input.ToString().Trim().ToLower();
                    return yesNoValue == "yes" || yesNoValue == "no" ? "Valid" : "Invalid";

                case ValidationListEnum.RadioButton:
                case ValidationListEnum.Checkbox:
                    string radioButtonValue = input.ToString().Trim().ToLower();
                    return radioButtonValue == "true" || radioButtonValue == "false" ? "Valid" : "Invalid";

                case ValidationListEnum.Text:
                    string textValue = input.ToString();
                    return !string.IsNullOrWhiteSpace(textValue) ? "Valid" : "Invalid";

                case ValidationListEnum.MultiSelect:
                    var multiSelectValues = input as string[];
                    return multiSelectValues != null && multiSelectValues.Length > 0 ? "Valid" : "Invalid";

                case ValidationListEnum.Percentage:
                    string percentageStr = input.ToString();
                    return double.TryParse(percentageStr, out double percentage) && percentage >= 0 && percentage <= 100 ? "Valid" : "Invalid";

                case ValidationListEnum.Paragraph:
                    string paragraph = input.ToString();
                    return !string.IsNullOrWhiteSpace(paragraph) ? "Valid" : "Invalid";

                case ValidationListEnum.Identity:
                    string identity = input.ToString();
                    return !string.IsNullOrWhiteSpace(identity) ? "Valid" : "Invalid";

                case ValidationListEnum.Price:
                    string priceStr = input.ToString();
                    return decimal.TryParse(priceStr, out decimal price) && price >= 0 ? "Valid" : "Invalid";

                case ValidationListEnum.Image:
                    // Assuming that we have some logic to check if the stream is an image
                    Stream imageStream = input as Stream;
                    return imageStream != null && IsImage(imageStream) ? "Valid" : "Invalid";

                case ValidationListEnum.Measurements:
                    string measurements = input.ToString();

                    // Example measurement format: "12x34x56"
                    string measurementsPattern = @"^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$";
                    return Regex.IsMatch(measurements, measurementsPattern) ? "Valid" : "Invalid";

                case ValidationListEnum.TextArea:
                    string textArea = input.ToString();
                    return !string.IsNullOrWhiteSpace(textArea) ? "Valid" : "Invalid";

                case ValidationListEnum.SimpleSelect:
                    string simpleSelect = input.ToString();
                    return !string.IsNullOrWhiteSpace(simpleSelect) ? "Valid" : "Invalid";

                default:
                    throw new ArgumentException("Invalid validation type");
            }
        }

        // public async Task<byte[]> GetQuestionAnswerPDF(string responseJson)
        // {
        //    var pdf = new PdfDocument();
        //    var font = new XFont("Verdana", 12); // Regular font for both questions and answers
        //    var boldFont = new XFont("Verdana Bold", 12); // Bold font for headings
        //    var headerFont = new XFont("Verdana Bold", 12); // Same font for heading and sub-heading
        //    var blackBrush = new XSolidBrush(XColor.FromArgb(0, 0, 0));  // Dark grey color for questions
        //    var blueBrush = new XSolidBrush(XColor.FromArgb(0, 0, 255)); // Blue color for answers

        // var page = pdf.AddPage();
        //    var graphics = XGraphics.FromPdfPage(page);

        // int yPosition = 40;
        //    const int maxYPosition = 800;
        //    const double margin = 20;

        // double pageWidth = page.Width;
        //    double pageHeight = page.Height;
        //    double totalMargin = 2 * margin;
        //    double contentWidth = pageWidth - totalMargin;

        // Add the report heading
        //    string mainHeading = "BUSINESS RESPONSIBILITY AND SUSTAINABILITY REPORT";
        //    string subHeading = "FINANCIAL YEAR 2023-24";

        // Measure the width of the main heading
        //    double mainHeadingWidth = graphics.MeasureString(mainHeading, headerFont).Width;
        //    double subHeadingWidth = graphics.MeasureString(subHeading, headerFont).Width;

        // Calculate the X position for center alignment
        //    double mainHeadingXPosition = (pageWidth - mainHeadingWidth) / 2;
        //    double subHeadingXPosition = (pageWidth - subHeadingWidth) / 2;

        // Draw the main heading centered
        //    graphics.DrawString(mainHeading, headerFont, XBrushes.Black, new XRect(mainHeadingXPosition, yPosition, contentWidth, 20), XStringFormats.TopLeft);
        //    yPosition += 20; // Adjusted spacing after the main heading

        // Draw the sub-heading centered below the main heading
        //    graphics.DrawString(subHeading, headerFont, XBrushes.Black, new XRect(subHeadingXPosition, yPosition, contentWidth, 20), XStringFormats.TopLeft);
        //    yPosition += 30; // Adjusted spacing after the sub-heading

        // Parse the JSON and extract the metricGroupName
        //    var jsonObjs = JObject.Parse(responseJson);
        //    var firstElement = jsonObjs["elements"]?.FirstOrDefault();
        //    var metricGroupName = firstElement?["metricGroupName"]?.ToString() ?? "Metric Group";
        //    var templateName = firstElement?["templateName"]?.ToString() ?? "Template";

        // Add the metricGroupName as a heading
        //    graphics.DrawString($"IndustryName: {metricGroupName}", boldFont, XBrushes.Black, new XRect(margin, yPosition, contentWidth, 20), XStringFormats.TopLeft);
        //    yPosition += 30;

        // Add the title "Template"
        //    graphics.DrawString($"TemplateName: {templateName}", boldFont, XBrushes.Black, new XRect(margin, yPosition, contentWidth, 20), XStringFormats.TopLeft);
        //    yPosition += 30;

        // Add the title "Specifications"
        //    graphics.DrawString("Specifications", boldFont, XBrushes.Black, new XRect(margin, yPosition, contentWidth, 20), XStringFormats.TopLeft);
        //    yPosition += 30;

        // Parse the JSON and add the specifications
        //    var surveyElements = jsonObjs["elements"];
        //    int serialNumber = 1;

        // foreach (var element in surveyElements)
        //    {
        //        if (yPosition > maxYPosition - 40)
        //        {
        //            page = pdf.AddPage();
        //            graphics = XGraphics.FromPdfPage(page);
        //            yPosition = 40;
        //        }

        // Draw the Question's name in dark grey, wrapped text if needed
        //        var title = element["title"]?.ToString() ?? "Untitled";
        //        string titleWithSerial = $"{serialNumber}. {title}";

        // yPosition = DrawWrappedText(graphics, titleWithSerial, font, blackBrush, margin, yPosition, contentWidth);
        //        yPosition += 10; // Adjust spacing after the question

        // Draw the formValue in blue, wrapped text if needed
        //        var formValue = element["formValue"]?.ToString() ?? "No answer provided";
        //        var textContent = Regex.Replace(formValue, "<.*?>", string.Empty);
        //        string answers = $"Answer: {textContent}";

        // yPosition = DrawWrappedText(graphics, answers, font, blueBrush, margin, yPosition, contentWidth);
        //        yPosition += 25; // Adjusted yPosition to leave proper spacing before the next entry

        // Increment the serial number
        //        serialNumber++;
        //    }

        // Save the PDF to a memory stream
        //    using var memoryStream = new MemoryStream();
        //    pdf.Save(memoryStream, false);

        // Return the PDF as a byte array
        //    return memoryStream.ToArray();
        // }
        public async Task<byte[]> GetQuestionAnswerPDF(long templateId, long processId)
        {
            try
            {
                using var connection = this.GetConnection();
                var responseJsonResult = await connection.QueryAsync<string>(
                    "select df.responseJson from metricansweroptions df where templateId = @templateId AND processId = @processId",
                    new { templateId, processId }).ConfigureAwait(true);

                var responseJson = responseJsonResult.FirstOrDefault() ?? "{}";
                var pdf = new PdfDocument();
                var font = new XFont("Verdana", 12);
                var boldFont = new XFont("Verdana Bold", 12);
                var headerFont = new XFont("Verdana Bold", 12);
                var blackBrush = new XSolidBrush(XColor.FromArgb(0, 0, 0));
                var blueBrush = new XSolidBrush(XColor.FromArgb(0, 0, 255));

                // Add the first page
                var page = pdf.AddPage();
                var graphics = XGraphics.FromPdfPage(page);

                double yPosition = 40;
                const double margin = 20;
                const int maxYPosition = 750;  // Adjusted to leave minimal bottom space
                double pageWidth = page.Width;
                double totalMargin = 2 * margin;
                double contentWidth = pageWidth - totalMargin;

                // Report heading
                string mainHeading = "BUSINESS RESPONSIBILITY AND SUSTAINABILITY REPORT";
                string subHeading = "FINANCIAL YEAR 2023-24";
                double mainHeadingWidth = graphics.MeasureString(mainHeading, headerFont).Width;
                double subHeadingWidth = graphics.MeasureString(subHeading, headerFont).Width;

                double mainHeadingXPosition = (pageWidth - mainHeadingWidth) / 2;
                double subHeadingXPosition = (pageWidth - subHeadingWidth) / 2;

                graphics.DrawString(mainHeading, headerFont, XBrushes.Black, new XRect(mainHeadingXPosition, yPosition, contentWidth, 20), XStringFormats.TopLeft);
                yPosition += 20;

                graphics.DrawString(subHeading, headerFont, XBrushes.Black, new XRect(subHeadingXPosition, yPosition, contentWidth, 20), XStringFormats.TopLeft);
                yPosition += 30;

                // Parse JSON response
                var responseObj = JObject.Parse(responseJson);
                graphics.DrawString("Specifications", boldFont, XBrushes.Black, new XRect(margin, yPosition, contentWidth, 20), XStringFormats.TopLeft);
                yPosition += 30;

                int serialNumber = 1;
                foreach (var property in responseObj.Properties())
                {
                    // Estimate space required for question and answer
                    double estimatedQuestionHeight = graphics.MeasureString(property.Name, font).Height + 10;
                    double estimatedAnswerHeight = graphics.MeasureString(property.Value.ToString(), font).Height + 25;

                    // Start a new page if adding the next question would exceed maxYPosition
                    if (yPosition + estimatedQuestionHeight + estimatedAnswerHeight > maxYPosition)
                    {
                        page = pdf.AddPage();
                        graphics = XGraphics.FromPdfPage(page);
                        yPosition = 40;  // Reset yPosition for the new page
                    }

                    // Draw Question title and Answer text
                    string titleWithSerial = $"{serialNumber}. {property.Name}";
                    yPosition = DrawWrappedText(graphics, titleWithSerial, font, blackBrush, margin, yPosition, contentWidth);
                    yPosition += 10;

                    string answer = $"Answer: {property.Value.ToString()}";
                    yPosition = DrawWrappedText(graphics, answer, font, blueBrush, margin, yPosition, contentWidth);
                    yPosition += 25;

                    serialNumber++;
                }

                using var memoryStream = new MemoryStream();
                pdf.Save(memoryStream, false);

                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task CreateTaskAction(TaskAction model)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = this.GetAction<TaskAction>();
                model.Status = (long?)TemplateStageApprovalENum.Pending;
                var query = data.AddOrUpdate(model);
            }
            catch (Exception)
            {
                throw new HandledException($"Error While adding data");
            }
        }

        public async Task DeleteMetric(long[] ids)
        {
            try
            {
                using var connection = this.GetConnection();
                var sql = "DELETE FROM mgmultiselection WHERE id = ANY(@Ids)";

                // Execute the query with the parameterized array
                int rowsAffected = await connection.ExecuteAsync(sql, new { Ids = ids });
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<TaskActionDto>> GetTaskActions()
        {
            try
            {
                using var connection = this.GetConnection();
                var query = (await connection.QueryAsync<TaskActionDto>($"select * from taskaction").ConfigureAwait(true)).ToList();
                return query;
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<byte[]> DownloadMetricTemplate()
        {
            try
            {
                using var connection = this.GetConnection();
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Metric Template");

                var valueFromConfig = await _cache.FindAppSettings("MetricTemplate");
                var metricMappingJson = valueFromConfig.JsonValue;

                var metricMapping = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(metricMappingJson)["Metrics"];
                var columnNames = metricMapping.Keys.ToArray();

                // Add column headers
                for (int i = 0; i < columnNames.Length; i++)
                {
                    worksheet.Cell(1, i + 1).Value = columnNames[i];
                    worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                    worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.SteelBlue;
                    worksheet.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
                    worksheet.Column(i + 1).Width = 25;
                }

                // Fetching values for dropdowns
                var metricGroups = await connection.QueryAsync<string>("SELECT name FROM MetricGroup");

                // var standards = await connection.QueryAsync<string>("SELECT name FROM Standards");
                // var departments = await connection.QueryAsync<string>("SELECT name FROM Department");
                var uoms = await connection.QueryAsync<string>("SELECT name FROM Uom");

                // var regulationTypes = await connection.QueryAsync<string>("SELECT name FROM type");
                // var services = await connection.QueryAsync<string>("SELECT name FROM service");
                var esgrcTypes = await connection.QueryAsync<string>("SELECT name FROM esgrctype");

                // var categories = await connection.QueryAsync<string>("SELECT name FROM category");
                var datatypes = await connection.QueryAsync<string>("SELECT name FROM metrictype");
                var validationTypes = await connection.QueryAsync<string>("SELECT name FROM validationlist");
                var prefixes = await connection.QueryAsync<string>("SELECT name FROM metricsprefix");

                // Creating hidden sheet for dropdown values
                var hiddenSheet = workbook.Worksheets.Add("Hidden Data");
                hiddenSheet.Visibility = XLWorksheetVisibility.VeryHidden;

                // Helper method to add dropdown values to the hidden sheet
                void AddDropdownValues(IEnumerable<string> values, string column, string rangeName)
                {
                    int row = 1;
                    foreach (var value in values)
                    {
                        hiddenSheet.Cell($"{column}{row}").Value = value;
                        row++;
                    }

                    workbook.NamedRanges.Add(rangeName, hiddenSheet.Range($"{column}1:{column}{row - 1}"));
                }

                // Populate hidden sheet and create named ranges
                AddDropdownValues(metricGroups, "A", "MetricGroups");

                // AddDropdownValues(standards, "B", "Standards");
                // AddDropdownValues(departments, "C", "Departments");
                AddDropdownValues(uoms, "B", "UOMs");

                // AddDropdownValues(regulationTypes, "E", "RegulationTypes");
                // AddDropdownValues(services, "F", "Services");
                AddDropdownValues(esgrcTypes, "C", "ESGRC_Types");

                // AddDropdownValues(categories, "H", "Categories");
                AddDropdownValues(datatypes, "D", "DataTypes");
                AddDropdownValues(validationTypes, "E", "ValidationTypes");

                // AddDropdownValues(prefixes, "K", "Prefixes");

                // Helper method to apply dropdown validation
                void ApplyDropdownValidation(string cellRange, string namedRange)
                {
                    var range = worksheet.Range(cellRange);
                    var validation = range.SetDataValidation();
                    validation.List($"={namedRange}", true);
                    validation.IgnoreBlanks = true;
                    validation.ShowErrorMessage = true;
                    validation.ErrorTitle = "Invalid Entry";
                    validation.ErrorMessage = "Please select a value from the dropdown!";
                }

                // Applying dropdowns to respective columns
                ApplyDropdownValidation("B2:B200", "MetricGroups");   // Metric Groups

                // ApplyDropdownValidation("D2:D200", "Standards");      // Standards
                // ApplyDropdownValidation("F2:F200", "Departments");    // Departments
                ApplyDropdownValidation("D2:D200", "UOMs");          // UOM

                // ApplyDropdownValidation("H2:H200", "RegulationTypes"); // Regulation Type
                // ApplyDropdownValidation("I2:I200", "Services");       // Services
                ApplyDropdownValidation("C2:C200", "ESGRC_Types");    // ESGRC Type

                // ApplyDropdownValidation("B2:B200", "Categories");     // Category
                ApplyDropdownValidation("E2:E200", "DataTypes");      // Data Type
                ApplyDropdownValidation("F2:F200", "ValidationTypes"); // Validation Type

                // ApplyDropdownValidation("L2:L200", "Prefixes");       // Prefix
                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error generating metric template: {ex.Message}", ex);
            }
        }

        public async Task UploadMetricTemplate(IFormFile file)
        {
            try
            {
                using var connection = this.GetConnection();
                using var stream = new MemoryStream();
                var userid = await _userContext.GetUserId();
                await file.CopyToAsync(stream);
                stream.Position = 0;

                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheet(1);
                var rowCount = worksheet.LastRowUsed().RowNumber();

                for (int row = 2; row <= rowCount; row++)
                {
                    var metricQuestion = worksheet.Cell(row, 1).GetString();
                    var metricgroups = worksheet.Cell(row, 2).GetString();
                    var esgrcType = worksheet.Cell(row, 3).GetString();
                    var uom = worksheet.Cell(row, 4).GetString();
                    var datatType = worksheet.Cell(row, 5).GetString();
                    var validationType = worksheet.Cell(row, 6).GetString();

                    // Fetch IDs from database in one go
                    var sqlQuery = @"
                SELECT 
                    (SELECT id FROM metricgroup WHERE name = @MetricGroups) AS GroupId,
                    (SELECT id FROM esgrctype WHERE name = @EsgrcType) AS EsgrcTypeId,
                    (SELECT id FROM uom WHERE name = @Uom) AS UomId,
                    (SELECT id FROM metrictype WHERE name = @DataType) AS DataTypeId,
                    (SELECT id FROM validationlist WHERE name = @ValidationType) AS ValidationTypeId";

                    var ids = await connection.QueryFirstOrDefaultAsync(sqlQuery, new
                    {
                        MetricGroups = metricgroups,
                        EsgrcType = esgrcType,
                        Uom = uom,
                        DataType = datatType,
                        ValidationType = validationType
                    });

                    if (ids == null)
                    {
                        throw new Exception($"Invalid data in row {row}. Some values are not found in the database.");
                    }

                    var metric = new Metric
                    {
                        MetricsQuestion = metricQuestion,
                        Category = ids.categoryid,
                        GroupId = ids.groupid,
                        Standard = ids.standardid,
                        EsgrcType = ids.esgrctypeid,
                        Department = ids.departmentid,
                        Uom = ids.uomid,
                        Regulationtypeid = ids.regulationtypeid ?? 0,
                        Serviceid = ids.serviceid ?? 0,
                        TypeId = ids.datatypeid ?? 0,
                        ValidationId = ids.validationtypeid?.ToString(),
                        Prefix = ids.prefixid,
                        CreatedBy = userid,
                        UpdatedBy = userid
                    };

                    var insertQuery = @"
                INSERT INTO Metric (metricsquestion,  groupid, esgrctype, uom, typeid, validationid,createdby,updatedby)
                VALUES (@MetricsQuestion, @GroupId, @EsgrcType, @Uom, @TypeId, @ValidationId,@CreatedBy,@UpdatedBy)";

                    await connection.ExecuteAsync(insertQuery, metric);

                    var parentId = await connection.QueryFirstOrDefaultAsync<int?>(
                        "SELECT id FROM metric WHERE metricsquestion = @MetricsQuestion",
                        new { MetricsQuestion = metric.MetricsQuestion });

                    if (parentId.HasValue)
                    {
                        await connection.ExecuteAsync(
                            "UPDATE metric SET parentid = @ParentId WHERE metricsquestion = @MetricsQuestion",
                            new { ParentId = parentId.Value, MetricsQuestion = metric.MetricsQuestion });

                        await connection.ExecuteAsync(
                            "INSERT INTO mgmultiselection (metricId, metricgroupId) VALUES (@MetricId, @GroupId)",
                            new { MetricId = parentId.Value, GroupId = metric.GroupId });
                    }
                }
            }
            catch (Exception e)
            {
                throw new Exception($"Error uploading metric template: {e.Message}", e);
            }
        }

        public async Task<List<Metric>> GetPrefixMetrics()
        {
            try
            {
                using var connection = this.GetConnection();
                var metrics = await connection.QueryAsync<Metric>("select * from metric where prefix is not null");
                return metrics.ToList();
            }
            catch (Exception e) 
            {
                throw e; 
            }
        }

        private int DrawWrappedText(XGraphics graphics, string text, XFont font, XBrush brush, double x, double y, double maxWidth)
        {
            var words = text.Split(' ');
            var sb = new System.Text.StringBuilder();
            double lineHeight = graphics.MeasureString("A", font).Height;

            foreach (var word in words)
            {
                var testLine = sb.Length == 0 ? word : sb + " " + word;
                var size = graphics.MeasureString(testLine, font);

                if (size.Width > maxWidth)
                {
                    graphics.DrawString(sb.ToString(), font, brush, new XRect(x, y, maxWidth, lineHeight), XStringFormats.TopLeft);
                    y += lineHeight;
                    sb.Clear();
                    sb.Append(word);
                }
                else
                {
                    if (sb.Length > 0)
                    {
                        sb.Append(" ");
                    }

                    sb.Append(word);
                }
            }

            if (sb.Length > 0)
            {
                graphics.DrawString(sb.ToString(), font, brush, new XRect(x, y, maxWidth, lineHeight), XStringFormats.TopLeft);
                y += lineHeight;
            }

            return (int)y;
        }

        private bool IsImage(Stream stream)
        {
            const long MaxImageSizeInBytes = 10 * 1024 * 1024; // 10 MB
            if (stream == null || stream.Length > MaxImageSizeInBytes)
            {
                return false;
            }

            try
            {
                if (stream.CanSeek)
                {
                    stream.Seek(0, SeekOrigin.Begin);
                }

                using (var image = System.Drawing.Image.FromStream(stream, useEmbeddedColorManagement: false, validateImageData: true))
                {
                    return image != null;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
