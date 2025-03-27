using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Implementations;
using Joy.PIM.BAL.Model;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class TemplateController : BaseApiController
    {
        private readonly ITemplates _templates;
        private readonly IDbCache _cache;
        private readonly IMetricGroup _metricGroup;

        public TemplateController(ITemplates templates, IDbCache cache, IMetricGroup metricGroup)
        {
            _templates = templates;
            _cache = cache;
            _metricGroup = metricGroup;
        }

        [HttpPost]
        public async Task CreateTemplates([FromBody] Template model)
        {
            await _templates.AddOrUpdateTemplates(model);
        }

        [HttpGet]
        public async Task<IEnumerable<Template>> GetAllActiveTemplate()
        {
            return await _templates.GetAllActiveTemplate();
        }

        [HttpGet]
        public async Task DeleteTemplategroup(long templateid, long metricgroupid)
        {
            await _templates.DeleteTemplategroup(templateid, metricgroupid);
        }

        [HttpGet]
        public async Task<IEnumerable<Template>> GetAllSFTPTemplate()
        {
            return await _templates.GetAllSFTPTemplate();
        }

        [HttpGet]
        public async Task<SearchResult<Template>> SearchTemplates(string? key, int pageNumber, int pageCount, bool isActive = true)
        {
            return await _templates.SearchTemplates(key, pageNumber, pageCount, isActive);
        }

        [HttpPost]
        public async Task LinkMetricsToTemplate([FromBody] TemplateMetrics template)
        {
            await _templates.LinkMetricToTemplate(template);
        }

        [HttpGet]
        public async Task<IAsyncEnumerable<Template>> GetTemplates()
        {
            return (await _cache.GetUserTemplates()).ToAsyncEnumerable();
        }

        [HttpGet]
        public async Task<List<TemplayteMetricGroupDto>> GetTemplateGroup(long templateId)
        {
            return await _templates.GetTemplateGroup(templateId);
        }

        [HttpPost]
        public async Task AddTemplateGroup(long templateId, IEnumerable<long> metricGroupIds, IEnumerable<long?> metricIds, bool? isBRSR)
        {
            await _templates.AddTemplateGroup(templateId, metricGroupIds, metricIds, isBRSR);
        }

        [HttpGet]
        public async Task<IActionResult> DownloadTemplate(long templateId, string? format = "xlsx")
        {
            format ??= "xlsx";
            var template = await _templates.GetTemplate(templateId);
            var file = await _templates.DownloadTemplate(templateId, format);
            return File(file,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{template.Name}.{format}");
        }

        [HttpGet]
        public async Task<UploadedFileDataDto> GetFromUploadeddata(long assessmentId, long auditId)
        {
            return await _templates.GetFromUploadeddata(assessmentId, auditId);
        }

        [HttpGet]
        public async Task<IActionResult> FormTemplate(long templateId, string? format = "xlsx")
        {
            format ??= "xlsx";
            var file = await _templates.FormTemplate(templateId, format);
            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"DownloadTemplate.{format}");
        }

        [HttpPost]

        public async Task UploadFormTemplate(IFormFile file, long templateId, long metricGroupId, long auditId)
        {
            await _templates.UploadFormTemplate(file, templateId, metricGroupId, auditId);
        }

        [HttpGet]

        public async Task<List<MetricAnswerOptions>> GetMetricAnswerOptionsDetails(long metricGroupId)
        {
            return await _templates.GetMetricAnswerOptionsDetails(metricGroupId);
        }

        [HttpGet]
        public async Task<IActionResult> DownloadSFTPTemplate(long templateId, string? format = "xlsx")
        {
            format ??= "xlsx";
            var template = await _templates.GetTemplate(templateId);
            var file = await _templates.DownloadSFTPTemplate(templateId, format);
            return File(file,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{template.Name}.{format}");
        }

        [HttpGet]
        public async Task<IActionResult> DownloadMetricGroupTemplate(long metricGroupId, string month, long year, string? format = "xlsx")
        {
            format ??= "xlsx";
            var template = await _templates.GetMetricGroupNames(metricGroupId);
            var monthYear = await _templates.GetMonthAndYear(month, year);
            var file = await _templates.DownloadMetricGroupTemplate(metricGroupId, format);
            return File(file,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{template.Name} - {monthYear}-{year}.{format}");
        }

        [HttpPost]

        public async Task UploadMetricGroupTemplatefile(IFormFile file, long metricGroupId, string month, long year)
        {
            await _templates.UploadMetricGroupTemplatefile(file, metricGroupId, month, year);
        }

        [HttpGet]

        public async Task<List<MetricGroup>> ListMetricGroupTemplate(long metricGroupId)
        {
            return await _templates.ListMetricGroupTemplate(metricGroupId);
        }

        [HttpPost]

        public async Task UploadSFTPfile(IFormFile file)
        {
            await _templates.UploadSFTPfile(file);
        }

        [HttpPost]
        public async Task UploadPdffile(IFormFile file)
        {
            await _templates.UploadPdffile(file);
        }

        [HttpPost]
        public async Task AddOrUpdateStandard([FromBody] MetricStandard metricStandard)
        {
            await _templates.AddOrUpdateStandard(metricStandard);
        }

        [HttpGet]
        public async Task<List<MetricStandardDto>> GetMetricStandards()
        {
            return await _templates.GetMetricStandards();
        }

        [HttpGet]
        public async Task<IActionResult> DownloadStandardData(string? format = "xlsx")
        {
            format ??= "xlsx";
            var file = await _templates.DownloadStandardData(format);
            return File(file,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{"templateMetrics"}.{format}");
        }

        [HttpPost]
        public async Task CreateGoalSettings([FromBody] GoalSetting goal)
        {
            await _templates.AddorupdateGoalsettings(goal);
        }

        [HttpGet]
        public async Task<List<GoalSettingDto>> GetGoalSetting()
        {
            return await _templates.GetGoalSetting();
        }
    }
}
