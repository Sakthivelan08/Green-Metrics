using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Aspose.Words;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.DomainModel;
using Joy.PIM.DAL.Enum;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace Joy.PIM.BAL.Implementations
{
    public class PdfMerger : PgEntityAction<PdfReports>, IPdfMerger
    {
        private readonly IDbCache _cache;
        private readonly IUserContext _userContext;
        private readonly IBlobRepo _lobRepo;

        public PdfMerger(IUserContext userContext, IDbConnectionFactory connectionFactory,
      IConfiguration configuration, IDbCache cache, IBlobRepo blobRepo)
      : base(userContext, connectionFactory, configuration)
        {
            _cache = cache;
            _userContext = userContext;
            _lobRepo = blobRepo;
        }

        public async Task AddPdfReport(PdfReports model)
        {
            try
            {
                using var connection = this.GetConnection();
                var userId = await _userContext.GetUserId().ConfigureAwait(true);
                var guid = Guid.NewGuid().ToString();

                // var uploadFile = await _lobRepo.UploadFile("testTemplate", "test", "C:\\Users\\Neeutrinos\\Documents\\testTemplate.txt");
                var savePdf = new PdfReports
                {
                    Guid = guid,
                    ReportName = model?.ReportName,
                    PageNumber = model.PageNumber,
                    Url = model.Url,
                    Type = model.Type,
                    DatasetName = model.DatasetName,
                    Id = model.Id,
                    IsActive = true,
                    CreatedBy = userId,
                    UpdatedBy = userId,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow,
                };

                var data = this.GetAction<PdfReports>();
                await data.AddOrUpdate(savePdf).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task AddAirEmissionPdfReport(AirEmissionReport model)
        {
            try
            {
                using var connection = this.GetConnection();
                var userId = await _userContext.GetUserId().ConfigureAwait(true);
                var guid = Guid.NewGuid().ToString();

                // var uploadFile = await _lobRepo.UploadFile("testTemplate", "test", "C:\\Users\\Neeutrinos\\Documents\\testTemplate.txt");
                var savePdf = new AirEmissionReport
                {
                    Guid = guid,
                    ReportName = model?.ReportName,
                    PageNumber = model.PageNumber,
                    Url = model.Url,
                    Type = model.Type,
                    Id = model.Id,
                    IsActive = true,
                    CreatedBy = userId,
                    UpdatedBy = userId,
                    DateCreated = DateTime.UtcNow,
                    DateModified = DateTime.UtcNow,
                };

                var data = this.GetAction<AirEmissionReport>();
                await data.AddOrUpdate(savePdf).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task<List<PdfReports>> GetAllPdfReports()
        {
            try
            {
                using var connection = this.GetConnection();

                return (await connection.QueryAsync<PdfReports>($"select * from pdfreports order by id").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        public async Task<List<AirEmissionReport>> GetAllAirEmissionPdfReports()
        {
            try
            {
                using var connection = this.GetConnection();

                return (await connection.QueryAsync<AirEmissionReport>($"select * from airEmissionReport order by id").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        // public async Task<IActionResult> PdfMergerByBlob()
        // {
        //    try
        //    {
        //        using var connection = this.GetConnection();
        //        var wordFileLink = await _cache.FindAppSettings("PdfReportDoc");
        //        var wordFilePath = await _lobRepo.DownloadFile(wordFileLink.Value);
        //        var pdfReports = await connection.QueryAsync<PdfReports>($"SELECT * FROM PdfReports order by id asc");
        //        var data = await connection.QueryAsync<BescomDto>($"select b.amount, fy.year from bwssb as b join fiscalyear as fy on b.fiscalyearid = fy.id");
        //        List<string> files = new List<string>();
        //        var dict = new Dictionary<string, object>();

        // foreach (var item in pdfReports)
        //        {
        //            if (item.Type == "pdf")
        //            {
        //                var cleanedUrl = item.Url.Trim();
        //                var pdfPath = await _lobRepo.DownloadFile(cleanedUrl);
        //                files.Add(pdfPath);

        // dict.Add((string)item.Guid, item.DatasetName);
        //            }
        //        }

        // foreach (var item in files)
        //        {
        //            using var pdfDocument = new Aspose.Pdf.Document(item);
        //            ReplacePdfContentBasedOnKey(pdfDocument, dict, item);
        //        }

        // var outputFilePath = MergeDocument(files);
        //        var downloadStream = new FileStream(outputFilePath, FileMode.Open, FileAccess.ReadWrite);
        //        return new FileStreamResult(downloadStream, "application/pdf")
        //        {
        //            FileDownloadName = "MergedReport.pdf"
        //        };
        //    }
        //    catch (Exception ex) 
        //    { 
        //        throw new Exception(ex.Message); 
        //    }
        // }
        public async Task<IActionResult> PdfMergerByBlob(long year, long fiscalyearid, long quarterid, long reportid)
        {
            var tempFilesList = new List<string>();
            try
            {
                using var connection = this.GetConnection();
                var wordFileLink = await _cache.FindAppSettings("PdfReportDoc").ConfigureAwait(true);
                var wordFilePath = await _lobRepo.DownloadFile(wordFileLink.Value).ConfigureAwait(true);

                // var pdfReports = await connection.QueryAsync<PdfReports>($"SELECT * FROM PdfReports order by pagenumber asc").ConfigureAwait(true);
                var pdfReports = await connection.QueryAsync<MergeReportDto>($"SELECT pr.id, mr.id as reportId, mr. name as reportname, STRING_AGG(pr.url, ', ') AS urlname, pr.pagenumber, pr.type, pr.guid " +
                    $"FROM mergereport mr " +
                    $"JOIN pdfreports pr ON pr.id::text = ANY(STRING_TO_ARRAY(mr.pdfid, ',')) " +
                    $"where mr.isactive = true AND mr.id = {reportid} " +
                    $"GROUP BY mr.id, pr.id order by pagenumber asc").ConfigureAwait(true);

                var data = new List<BescomDto>();
                var wateredetails = new List<BwssbDto>();

                if (year != 0 && fiscalyearid == 0 && quarterid == 0)
                {
                    var refresh = await connection.ExecuteAsync("REFRESH MATERIALIZED VIEW quarterly_average_bescom").ConfigureAwait(true);
                    var query = "SELECT * FROM quarterly_average_bescom WHERE year = @Year ORDER BY quarterid;";
                    data = (await connection.QueryAsync<BescomDto>(query, new { Year = year }).ConfigureAwait(true)).ToList();
                }
                else
                {
                    var refresh = await connection.ExecuteAsync("REFRESH MATERIALIZED VIEW quarterly_average_bescom").ConfigureAwait(true);
                    var query = "SELECT * FROM quarterly_average_bescom WHERE fiscalyearid = @FiscalYearId AND quarterid = @QuarterId;";
                    data = (await connection.QueryAsync<BescomDto>(query, new { FiscalYearId = fiscalyearid, QuarterId = quarterid }).ConfigureAwait(true)).ToList();
                }

                if (year != 0 && fiscalyearid == 0 && quarterid == 0)
                {
                    await connection.ExecuteAsync("REFRESH MATERIALIZED VIEW quarterly_average_bwssb").ConfigureAwait(true);
                    var query = "SELECT * FROM quarterly_average_bwssb WHERE year = @Year ORDER BY quarterid;";
                    wateredetails = (await connection.QueryAsync<BwssbDto>(query, new { Year = year }).ConfigureAwait(true)).ToList();
                }
                else
                {
                    await connection.ExecuteAsync("REFRESH MATERIALIZED VIEW quarterly_average_bwssb").ConfigureAwait(true);
                    var query = "SELECT * FROM quarterly_average_bwssb WHERE fiscalyearid = @FiscalYearId AND quarterid = @QuarterId;";
                    wateredetails = (await connection.QueryAsync<BwssbDto>(query, new { FiscalYearId = fiscalyearid, QuarterId = quarterid }).ConfigureAwait(true)).ToList();
                }

                var employeeDetails = (await connection.QueryAsync<EmployeeDetailsDto>("SELECT businessunit, COUNT(*) AS TotalEmployeeCount,  SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS Male, SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS Female, SUM(CASE WHEN employmenttype = 'Employee' THEN 1 ELSE 0 END) AS Employee, SUM(CASE WHEN employmenttype = 'Contract' THEN 1 ELSE 0 END) AS Contract FROM employeeDetails GROUP BY businessunit").ConfigureAwait(true)).ToList();
                var energyDetails = await connection.QueryAsync<EnergyConsumptionDto>("SELECT metricsquestion AS parameter, CASE WHEN metricsquestion = 'Total electricity consumption for the current year' " +
                                                                                      "THEN COALESCE((SELECT SUM(unit::NUMERIC)::TEXT FROM bescom WHERE fiscalyearid = 8), 'NA') " +
                                                                                      "WHEN metricsquestion = 'Water intensity per rupee of turnover (Water consumed / turnover)' THEN " +
                                                                                      "COALESCE((SELECT SUM(unit::NUMERIC)::TEXT FROM bwssb WHERE fiscalyearid = 8), 'NA') ELSE 'NA' " +
                                                                                      "END AS FY2023, CASE WHEN metricsquestion = 'Total electricity consumption for the current year' " +
                                                                                      "THEN COALESCE((SELECT SUM(unit::NUMERIC)::TEXT FROM bescom WHERE fiscalyearid = 9), 'NA') " +
                                                                                      "WHEN metricsquestion = 'Water intensity per rupee of turnover (Water consumed / turnover)' " +
                                                                                      "THEN COALESCE((SELECT SUM(unit::NUMERIC)::TEXT FROM bwssb WHERE fiscalyearid = 9), 'NA') ELSE 'NA' END AS FY2024 FROM metric " +
                                                                                      "JOIN mgmultiselection AS ms ON metric.id = ms.metricid " +
                                                                                      "WHERE ms.metricgroupid = 47").ConfigureAwait(true);

                var airQuality = await connection.QueryAsync<EnergyConsumptionDto>("select metricsquestion as parameter,'NA' AS FY2023,'NA' AS FY2024 from metric JOIN mgmultiselection AS ms ON metric.id = ms.metricid WHERE ms.metricgroupid = 57").ConfigureAwait(true);
                var greenHouse = await connection.QueryAsync<EnergyConsumptionDto>("select metricsquestion as parameter,'NA' AS FY2023,'NA' AS FY2024 from metric JOIN mgmultiselection AS ms ON metric.id = ms.metricid WHERE ms.metricgroupid = 49").ConfigureAwait(true);

                List<string> files = new List<string>();
                var dict = new Dictionary<string, List<object>>();

                foreach (var item in pdfReports)
                {
                    if (item.Type == "pdf" || item.Type == "word" || item.Type == "template")
                    {   
                        var cleanedUrl = item.UrlName.Trim();
                        var pdfPath = await _lobRepo.DownloadFile(cleanedUrl).ConfigureAwait(true);

                        var templateDetails = await _cache.FindAppSettings("TemplateDetails").ConfigureAwait(true);
                        var templateMapping = templateDetails.JsonValue;

                        var templateConfigs = JsonConvert.DeserializeObject<List<TemplateConfig>>(templateMapping);
                        var matchedTemplate = templateConfigs?.FirstOrDefault(t => cleanedUrl.Contains(t.Text));

                        tempFilesList.Add(pdfPath);
                        if (item.Type == "word" || item.Type == "template")
                        {
                            if (matchedTemplate != null)
                            {
                                switch (matchedTemplate.Key)
                                {
                                    case 1: // Logic for Templatedocument
                                        var inputData = data.Select(d =>
                                                            d.GetType()
                                                             .GetProperties()
                                                             .ToDictionary(
                                                                 prop => prop.Name,
                                                                 prop => prop.GetValue(d) ?? DBNull.Value))
                                                             .ToList();

                                        var dataWordFilePath = await PerformMailMerge("data", inputData, pdfPath).ConfigureAwait(true);
                                        var dataPdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(dataWordFilePath) + "_data.pdf");
                                        var dataWordDoc = new Aspose.Words.Document(dataWordFilePath);
                                        dataWordDoc.Save(dataPdfPath, Aspose.Words.SaveFormat.Pdf);
                                        files.Add(dataPdfPath);
                                        tempFilesList.Add(dataPdfPath);
                                        break;

                                    case 2: // Logic for Employeedocument
                                        var employeeInput = employeeDetails.Select(d =>
                                                                d.GetType()
                                                                 .GetProperties()
                                                                 .ToDictionary(
                                                                     prop => prop.Name,
                                                                     prop => prop.GetValue(d) ?? DBNull.Value))
                                                                     .ToList();

                                        var employeeWordFilePath = await PerformMailMerge("employee", employeeInput, pdfPath).ConfigureAwait(true);
                                        var employeePdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(employeeWordFilePath) + "_employee.pdf");
                                        var employeeWordDoc = new Aspose.Words.Document(employeeWordFilePath);
                                        employeeWordDoc.Save(employeePdfPath, Aspose.Words.SaveFormat.Pdf);
                                        files.Add(employeePdfPath);
                                        tempFilesList.Add(employeePdfPath);
                                        break;

                                    case 3: // Logic for BWSSB document
                                        var inputDataBwssb = wateredetails.Select(d =>
                                               d.GetType()
                                                .GetProperties()
                                                .ToDictionary(
                                                    prop => prop.Name,
                                                    prop => prop.GetValue(d) ?? DBNull.Value))
                                                .ToList();

                                        var bwssbWordFilePath = await PerformMailMerge("bwssb", inputDataBwssb, pdfPath).ConfigureAwait(true);
                                        var bwssbPdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(bwssbWordFilePath) + "_bwssb.pdf");
                                        var bwssbWordDoc = new Aspose.Words.Document(bwssbWordFilePath);
                                        bwssbWordDoc.Save(bwssbPdfPath, Aspose.Words.SaveFormat.Pdf);
                                        files.Add(bwssbPdfPath);
                                        tempFilesList.Add(bwssbPdfPath);
                                        break;

                                    case 4: // Logic for Energy document
                                        var energy = energyDetails.Select(d =>
                                               d.GetType()
                                                .GetProperties()
                                                .ToDictionary(
                                                    prop => prop.Name,
                                                    prop => prop.GetValue(d) ?? DBNull.Value))
                                                .ToList();

                                        var energyWordFilePath = await PerformMailMerge("energy", energy, pdfPath).ConfigureAwait(true);
                                        var energyPdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(energyWordFilePath) + "_bwssb.pdf");
                                        var energyWordDoc = new Aspose.Words.Document(energyWordFilePath);
                                        energyWordDoc.Save(energyPdfPath, Aspose.Words.SaveFormat.Pdf);
                                        files.Add(energyPdfPath);
                                        tempFilesList.Add(energyPdfPath);
                                        break;

                                    case 5: // Logic for Air Quality document
                                        var airquality = airQuality.Select(d =>
                                               d.GetType()
                                                .GetProperties()
                                                .ToDictionary(
                                                    prop => prop.Name,
                                                    prop => prop.GetValue(d) ?? DBNull.Value))
                                                .ToList();

                                        var airQualityWordFilePath = await PerformMailMerge("airquality", airquality, pdfPath).ConfigureAwait(true);
                                        var airPdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(airQualityWordFilePath) + "_bwssb.pdf");
                                        var airWordDoc = new Aspose.Words.Document(airQualityWordFilePath);
                                        airWordDoc.Save(airPdfPath, Aspose.Words.SaveFormat.Pdf);
                                        files.Add(airPdfPath);
                                        tempFilesList.Add(airPdfPath);
                                        break;

                                    case 6: // Logic for GHG document
                                        var ghg = greenHouse.Select(d =>
                                               d.GetType()
                                                .GetProperties()
                                                .ToDictionary(
                                                    prop => prop.Name,
                                                    prop => prop.GetValue(d) ?? DBNull.Value))
                                                .ToList();

                                        var ghgWordFilePath = await PerformMailMerge("ghg", ghg, pdfPath).ConfigureAwait(true);
                                        var ghgPdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(ghgWordFilePath) + "_bwssb.pdf");
                                        var ghgWordDoc = new Aspose.Words.Document(ghgWordFilePath);
                                        ghgWordDoc.Save(ghgPdfPath, Aspose.Words.SaveFormat.Pdf);
                                        files.Add(ghgPdfPath);
                                        tempFilesList.Add(ghgPdfPath);
                                        break;

                                    default:
                                        break;
                                }
                            }
                        }
                        else
                        {
                            files.Add(pdfPath);
                        }

                        // dict.Add(item.Guid.ToString(), item.DatasetName);
                    }
                }

                // foreach (var item in files)
                // {
                //    using var pdfDocument = new Aspose.Pdf.Document(item);
                //    ReplacePlaceholderWithDataTable(pdfDocument, placeholder, item);
                // }
                var outputFilePath = MergeDocument(files);
                var downloadStream = new FileStream(outputFilePath, FileMode.Open, FileAccess.ReadWrite);
                return new FileStreamResult(downloadStream, "application/pdf")
                {
                    FileDownloadName = "BRSRReport.pdf"
                };
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
            finally
            {
                if (tempFilesList.Count > 0)
                {
                    foreach (var path in tempFilesList)
                    {
                        if (File.Exists(path))
                        {
                            File.Delete(path);
                            Console.WriteLine("Temporary PDF file deleted: " + path);
                        }
                    }
                }
            }
        }

        public async Task<IActionResult> PdfGHIReport(long reportid)
        {
            try
            {
                using var connection = this.GetConnection();
                var tempFilesList = new List<string>();
                var pdfReports = await connection.QueryAsync<MergeReportDto>($"SELECT pr.id, mr.id as reportId, mr. name as reportname, STRING_AGG(pr.url, ', ') AS urlname, pr.pagenumber, pr.type, pr.guid " +
                   $"FROM mergereport mr " +
                   $"JOIN pdfreports pr ON pr.id::text = ANY(STRING_TO_ARRAY(mr.pdfid, ',')) " +
                   $"where mr.isactive = true AND mr.id = {reportid} " +
                   $"GROUP BY mr.id, pr.id order by pagenumber asc").ConfigureAwait(true);

                var query = @"WITH emissions_data AS (
                                SELECT 
                                    mg.name AS activitytype,
                                    (SELECT DISTINCT REPLACE(elem->>'Value', ',', '')::NUMERIC 
                                     FROM jsonb_array_elements(a.jsonvalue::jsonb) AS elem
                                     WHERE elem->>'key' = mg.name) AS targetemissions,
                                    REPLACE(ma.responsejson ->> 'Emission in tCO2e', ',', '')::NUMERIC AS actualemissions
                                FROM metricansweroptions ma
                                INNER JOIN metricgroup mg ON ma.metricgroupid = mg.id
                                LEFT JOIN appsettings a ON a.name = 'StaticActualValue'
                                WHERE ma.metricparentid IS NOT NULL
                            )
                            SELECT 
                                activitytype, 
                                SUM(DISTINCT targetemissions) AS targetemissions, 
                                SUM(actualemissions) AS actualemissions, 
                                SUM(actualemissions) - SUM(DISTINCT targetemissions) AS variance 
                            FROM emissions_data
                            GROUP BY activitytype

                            UNION ALL

                            SELECT 
                                'Total' AS activitytype,
                                SUM(DISTINCT targetemissions) AS targetemissions,
                                SUM(actualemissions) AS actualemissions,
                                SUM(actualemissions) - SUM(DISTINCT targetemissions) AS variance
                            FROM emissions_data;
	                            ";

                var data = await connection.QueryAsync<GHIReportDto>(query);

                var socialData = await connection.QueryAsync<SocialModel>("SELECT mg.name AS socialmodules, jt.key AS category, jt.value AS value FROM metricansweroptions ma " +
                                                                        "JOIN metricgroup mg ON ma.metricgroupid = mg.id " +
                                                                        "CROSS JOIN LATERAL jsonb_each_text(ma.responsejson::jsonb) AS jt " +
                                                                        "WHERE mg.id = 150;").ConfigureAwait(true);

                var govData = await connection.QueryAsync<GovernanceModel>("SELECT mg.name AS governancemodules, jt.key AS category, jt.value AS value FROM metricansweroptions ma " +
                                                                        "JOIN metricgroup mg ON ma.metricgroupid = mg.id " +
                                                                        "CROSS JOIN LATERAL jsonb_each_text(ma.responsejson::jsonb) AS jt " +
                                                                        "WHERE mg.id = 151;").ConfigureAwait(true);

                List<string> files = new List<string>();
                var dict = new Dictionary<string, List<object>>();

                foreach (var item in pdfReports)
                {
                    if (item.Type == "pdf" || item.Type == "word" || item.Type == "template")
                    {
                        var cleanedUrl = item.UrlName.Trim();
                        var pdfPath = await _lobRepo.DownloadFile(cleanedUrl).ConfigureAwait(true);

                        var templateDetails = await _cache.FindAppSettings("TemplateDetails").ConfigureAwait(true);
                        var templateMapping = templateDetails.JsonValue;

                        var templateConfigs = JsonConvert.DeserializeObject<List<TemplateConfig>>(templateMapping);
                        var matchedTemplate = templateConfigs?.FirstOrDefault(t => cleanedUrl.Contains(t.Text));

                        tempFilesList.Add(pdfPath);
                        if (item.Type == "word" || item.Type == "template")
                        {
                            if (matchedTemplate != null)
                            {
                                switch (matchedTemplate.Key)
                                {
                                    case 7: // Logic for Templatedocument
                                        var inputData = data.Select(d =>
                                                            d.GetType()
                                                             .GetProperties()
                                                             .ToDictionary(
                                                                 prop => prop.Name,
                                                                 prop => prop.GetValue(d) ?? DBNull.Value))
                                                             .ToList();

                                        var dataWordFilePath = await PerformMailMerge("ghi", inputData, pdfPath).ConfigureAwait(true);
                                        var dataPdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(dataWordFilePath) + "ghi.pdf");
                                        var dataWordDoc = new Aspose.Words.Document(dataWordFilePath);
                                        dataWordDoc.Save(dataPdfPath, Aspose.Words.SaveFormat.Pdf);
                                        files.Add(dataPdfPath);
                                        tempFilesList.Add(dataPdfPath);
                                        break;

                                    case 8: // Logic for Templatedocument
                                        var socialValues = socialData.Select(d =>
                                                            d.GetType()
                                                             .GetProperties()
                                                             .ToDictionary(
                                                                 prop => prop.Name,
                                                                 prop => prop.GetValue(d) ?? DBNull.Value))
                                                             .ToList();

                                        var socialValuesFilePath = await PerformMailMerge("social", socialValues, pdfPath).ConfigureAwait(true);
                                        var socialValuePdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(socialValuesFilePath) + "social.pdf");
                                        var socialValueWordDoc = new Aspose.Words.Document(socialValuesFilePath);
                                        socialValueWordDoc.Save(socialValuePdfPath, Aspose.Words.SaveFormat.Pdf);
                                        files.Add(socialValuePdfPath);
                                        tempFilesList.Add(socialValuePdfPath);
                                        break;

                                    case 9: // Logic for Templatedocument
                                        var govValues = govData.Select(d =>
                                                            d.GetType()
                                                             .GetProperties()
                                                             .ToDictionary(
                                                                 prop => prop.Name,
                                                                 prop => prop.GetValue(d) ?? DBNull.Value))
                                                             .ToList();

                                        var govValuesFilePath = await PerformMailMerge("gov", govValues, pdfPath).ConfigureAwait(true);
                                        var govValuePdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(govValuesFilePath) + "gov.pdf");
                                        var govValueWordDoc = new Aspose.Words.Document(govValuesFilePath);
                                        govValueWordDoc.Save(govValuePdfPath, Aspose.Words.SaveFormat.Pdf);
                                        files.Add(govValuePdfPath);
                                        tempFilesList.Add(govValuePdfPath);
                                        break;

                                    default:
                                        break;
                                }
                            }
                        }
                        else
                        {
                            files.Add(pdfPath);
                        }

                        // dict.Add(item.Guid.ToString(), item.DatasetName);
                    }
                }

                // foreach (var item in files)
                // {
                //    using var pdfDocument = new Aspose.Pdf.Document(item);
                //    ReplacePlaceholderWithDataTable(pdfDocument, placeholder, item);
                // }
                var outputFilePath = MergeDocument(files);
                var downloadStream = new FileStream(outputFilePath, FileMode.Open, FileAccess.ReadWrite);
                return new FileStreamResult(downloadStream, "application/pdf")
                {
                    FileDownloadName = "GHI.pdf"
                };
            }
            catch
            {
                throw;
            }
        }

        public async Task<IActionResult> PdfMergerByAirBlob(long metricgroupId, long year, long timeDimension, long? quarterId)
        {
            var tempFilesList = new List<string>();
            try
            {
                using var connection = this.GetConnection();
                var wordFileLink = await _cache.FindAppSettings("PdfReportDoc").ConfigureAwait(true);
                var wordFilePath = await _lobRepo.DownloadFile(wordFileLink.Value).ConfigureAwait(true);

                var pdfReports = await connection.QueryAsync<AirEmissionReport>($"select * from airEmissionReport").ConfigureAwait(true);

                var data = new List<DataingestionDto>();

                if (year != 0 && quarterId == null && timeDimension == (long)DataviewDimensionsEnum.Monthly)
                {
                    var query = "select di.total, m.name as monthName from dataingestion as di join months as m on m.id = di.month WHERE di.metricgroupid = @MetricGroupId AND di.year = @Year order by di.month";
                    data = (await connection.QueryAsync<DataingestionDto>(query, new { MetricGroupId = metricgroupId, Year = year }).ConfigureAwait(true)).ToList();
                }
                else
                {
                    var query = "select di.total, m.name as monthName from dataingestion as di join months as m on m.id = di.month WHERE di.metricgroupid = @MetricGroupId AND di.year = @Year AND di.quarterid = @QuarterId order by di.month";
                    data = (await connection.QueryAsync<DataingestionDto>(query, new { MetricGroupId = metricgroupId, Year = year, QuarterId = quarterId }).ConfigureAwait(true)).ToList();
                }

                var parsedData = data.Select(d =>
                {
                    string totalJsonString = JsonConvert.SerializeObject(d.Total);

                    if (string.IsNullOrWhiteSpace(totalJsonString))
                    {
                        totalJsonString = "{}";
                    }

                    Dictionary<string, object> totalJson = new Dictionary<string, object>();

                    try
                    {
                        totalJson = JsonConvert.DeserializeObject<Dictionary<string, object>>(totalJsonString);
                    }
                    catch (JsonReaderException ex)
                    {
                        Console.WriteLine($"Failed to parse JSON for Total: {totalJsonString}. Error: {ex.Message}");
                        totalJson = new Dictionary<string, object>(); 
                    }

                    double specificKgNO = 0, specificKgPM = 0, specificKgSO = 0;

                    if (totalJson.ContainsKey("SpecificKgNO"))
                    {
                        specificKgNO = Convert.ToDouble(totalJson["SpecificKgNO"]);
                    }

                    if (totalJson.ContainsKey("SpecificKgPM"))
                    {
                        specificKgPM = Convert.ToDouble(totalJson["SpecificKgPM"]);
                    }

                    if (totalJson.ContainsKey("SpecificKgSO"))
                    {
                        specificKgSO = Convert.ToDouble(totalJson["SpecificKgSO"]);
                    }

                    string formattedSpecificKgNO = specificKgNO.ToString("0.00");
                    string formattedSpecificKgPM = specificKgPM.ToString("0.00");
                    string formattedSpecificKgSO = specificKgSO.ToString("0.00");

                    return new
                    {
                        MonthName = d.MonthName,
                        SpecificKgNO = formattedSpecificKgNO,
                        SpecificKgPM = formattedSpecificKgPM,
                        SpecificKgSO = formattedSpecificKgSO,
                    };
                }).ToList();

                foreach (var item in parsedData)
                {
                    Console.WriteLine($"Month: {item.MonthName}, SpecificKgNO: {item.SpecificKgNO}, SpecificKgPM: {item.SpecificKgPM}, SpecificKgSO: {item.SpecificKgSO}");
                }

                List<string> files = new List<string>();
                var dict = new Dictionary<string, List<object>>();
                Dictionary<string, List<string>> textContents = new Dictionary<string, List<string>>();

                foreach (var item in pdfReports)
                {
                    if (item.Type == "pdf" || item.Type == "word" || item.Type == "template")
                    {
                        var cleanedUrl = item.Url.Trim();
                        var pdfPath = await _lobRepo.DownloadFile(cleanedUrl).ConfigureAwait(true);

                        var templateDetails = await _cache.FindAppSettings("AirEmissionTemplateDetails").ConfigureAwait(true);
                        var templateMapping = templateDetails.JsonValue;

                        var templateConfigs = JsonConvert.DeserializeObject<List<TemplateConfig>>(templateMapping);
                        var matchedTemplate = templateConfigs?.FirstOrDefault(t => cleanedUrl.Contains(t.Text));

                        tempFilesList.Add(pdfPath);
                        if (item.Type == "word" || item.Type == "template")
                        {
                            if (matchedTemplate != null)
                            {
                                switch (matchedTemplate.Key)
                                {
                                    case 1: // Logic for Templatedocument
                                        var dataingestion = parsedData.Select(d =>
                                                            d.GetType()
                                                             .GetProperties()
                                                             .ToDictionary(
                                                                 prop => prop.Name,
                                                                 prop => prop.GetValue(d) ?? DBNull.Value))
                                                             .ToList();

                                        // var dataingestion = parsedData.Select(p => new Dictionary<string, object>
                                        // {
                                        //    { "monthname", p.MonthName },
                                        //    { "SpecificKgNO", p.SpecificKgNO },
                                        //    { "SpecificKgPM", p.SpecificKgPM },
                                        //    { "SpecificKgSO", p.SpecificKgSO }
                                        // }).ToList();
                                        var dataWordFilePath = await PerformMailMerge("dataingestion", dataingestion, pdfPath).ConfigureAwait(true);
                                        var dataPdfPath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(dataWordFilePath) + "_specficdata.pdf");
                                        var dataWordDoc = new Aspose.Words.Document(dataWordFilePath);
                                        dataWordDoc.Save(dataPdfPath, Aspose.Words.SaveFormat.Pdf);
                                        if (!textContents.ContainsKey("(2023-24)"))
                                        {
                                            textContents["(2023-24)"] = new List<string>();  // Initialize the list if the key doesn't exist
                                        }

                                        // Now add the year to the list for the "2023-24" key
                                        textContents["(2023-24)"].Add(year.ToString());
                                        files.Add(dataPdfPath);
                                        tempFilesList.Add(dataPdfPath);
                                        break;

                                    default:
                                        break;
                                }
                            }
                        }
                        else
                        {
                            files.Add(pdfPath);
                        }
                    }
                }

                foreach (var item in files)
                {
                    using var pdfDocument = new Aspose.Pdf.Document(item);

                    AddTextContentToPdf(pdfDocument, textContents, item);
                    ReplacePdfContentBasedOnKey(pdfDocument, dict, item);
                }

                var outputFilePath = MergeDocument(files);
                var downloadStream = new FileStream(outputFilePath, FileMode.Open, FileAccess.ReadWrite);
                return new FileStreamResult(downloadStream, "application/pdf")
                {
                    FileDownloadName = "AirEmissionReport.pdf"
                };
            }
                            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
            finally
            {
                if (tempFilesList.Count > 0)
                {
                    foreach (var path in tempFilesList)
                    {
                        if (File.Exists(path))
                        {
                            File.Delete(path);
                            Console.WriteLine("Temporary PDF file deleted: " + path);
                        }
                    }
                }
            }
        }

        public async Task<string> PerformMailMerge(string tableName, List<Dictionary<string, object>> inputData, string filePath)
        {
            try
            {
                var wordDoc = new Document(filePath);

                var dataTable = new DataTable(tableName);

                if (inputData?.Count > 0)
                {
                    foreach (var key in inputData[0].Keys)
                    {
                        dataTable.Columns.Add(key);
                    }

                    foreach (var dataRow in inputData)
                    {
                        var row = dataTable.NewRow();
                        foreach (var key in dataRow.Keys)
                        {
                            row[key] = dataRow[key];
                        }

                        dataTable.Rows.Add(row);
                    }
                }

                wordDoc.MailMerge.UseNonMergeFields = true;

                wordDoc.MailMerge.ExecuteWithRegions(dataTable);

                var updatedFilePath = Path.Combine(Path.GetTempPath(), Path.GetFileNameWithoutExtension(filePath) + "_updated.docx");
                await Task.Run(() => wordDoc.Save(updatedFilePath)).ConfigureAwait(true);

                return updatedFilePath;
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        private static string ConvertDocxToPdf(string docxFilePath)
        {
            var pdfFilePath = Path.ChangeExtension(docxFilePath, ".pdf");
            var document = new Aspose.Words.Document(docxFilePath);
            document.Save(pdfFilePath, Aspose.Words.SaveFormat.Pdf);
            return pdfFilePath;
        }

        private static string MergeDocument(List<string> files)
        {
            string outputfile = Path.Combine(Path.GetDirectoryName(files[0]), "MergedPdf_" + Path.ChangeExtension(Path.GetRandomFileName(), ".pdf"));
            if (files == null)
            {
                throw new DataException("Object is empty");
            }

            if (files.Count == 0)
            {
                throw new ArgumentException("Object Doesnot have any content");
            }

            // SetAsposeLicense(AsposeLicenseOptions.Pdf);

            // create PdfFileEditor object
            var pdfEditor = new global::Aspose.Pdf.Facades.PdfFileEditor();
            
            try
            {
                pdfEditor.Concatenate(files.ToArray(), outputfile);
            }
            finally
            {
                // DisposeStreams(files);
            }

            return outputfile;

            // Return the PDF file as a download
            // return new FileStreamResult(dstStream, "application/pdf")
            // {
            //    FileDownloadName = Path.GetFileName(outputfile)
            // };
        }

        private void ReplacePdfContentBasedOnKey(Aspose.Pdf.Document pdfDocument, Dictionary<string, List<object>> replacements, string outputFilePath)
        {
            foreach (var kvp in replacements)
            {
                var key = kvp.Key;
                var replacement = kvp.Value?.ToString();
                if (!string.IsNullOrEmpty(replacement))
                {
                    foreach (var page in pdfDocument.Pages)
                    {
                        var textFragmentAbsorber = new Aspose.Pdf.Text.TextFragmentAbsorber(key);
                        page.Accept(textFragmentAbsorber);
                        foreach (Aspose.Pdf.Text.TextFragment textFragment in textFragmentAbsorber.TextFragments)
                        {
                            textFragment.Text = replacement;
                        }
                    }
                }
            }

            pdfDocument.Save(outputFilePath);
        }

        private void AddTextContentToPdf(Aspose.Pdf.Document pdfDocument, Dictionary<string, List<string>> textContents, string outputFilePath)
        {
            foreach (var key in textContents.Keys)
            {
                var textFragmentAbsorber = new Aspose.Pdf.Text.TextFragmentAbsorber(key);
                pdfDocument.Pages.Accept(textFragmentAbsorber);

                foreach (Aspose.Pdf.Text.TextFragment textFragment in textFragmentAbsorber.TextFragments)
                {
                    var combinedText = string.Join("\r\n", textContents[key]);

                    var lines = combinedText.Split(new[] { "\r\n" }, StringSplitOptions.None);

                    float yPosition = (float)textFragment.Position.YIndent; // Initial Y position from the original text fragment
                    float lineHeight = 20; // Define line height for spacing

                    // Create a page reference to add new text fragments
                    var page = textFragment.Page;

                    foreach (var line in lines)
                    {
                        var newTextFragment = new Aspose.Pdf.Text.TextFragment(line)
                        {
                            Position = new Aspose.Pdf.Text.Position(textFragment.Position.XIndent, yPosition),
                            HorizontalAlignment = Aspose.Pdf.HorizontalAlignment.Left
                        };

                        page.Paragraphs.Add(newTextFragment);
                        yPosition -= lineHeight; // Move down for the next line
                    }

                    // Remove the original text fragment after adding new ones
                    textFragment.Text = string.Empty;
                }
            }

            pdfDocument.Save(outputFilePath);
        }
    }
}
