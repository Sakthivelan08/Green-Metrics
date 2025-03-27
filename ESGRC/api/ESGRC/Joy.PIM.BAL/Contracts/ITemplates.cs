using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;

namespace Joy.PIM.BAL.Contracts
{
    public interface ITemplates
    {
        Task AddOrUpdateTemplates(Template model);

        Task<IEnumerable<Template>> GetAllActiveTemplate();

        Task<IEnumerable<Template>> GetAllSFTPTemplate();

        Task<SearchResult<Template>> SearchTemplates(string? key, int pageNumber, int pageCount, bool isActive = true);

        Task<IEnumerable<Template>> GetTemplates();

        Task<MetricGroup> GetMetricGroupNames(long metricGroupId);

        Task<string> GetMonthAndYear(string month, long year);

        Task LinkMetricToTemplate(TemplateMetrics templateAttribute);

        Task<IEnumerable<Template>> GetUserTemplates();

        Task<Template> GetTemplate(long templateId);

        Task<List<TemplayteMetricGroupDto>> GetTemplateGroup(long templateId);

        Task DeleteTemplategroup(long templateid, long metricgroupid);

        Task AddTemplateGroup(long templateId, IEnumerable<long> metricGroupIds, IEnumerable<long?> metricIds, bool? isBRSR);

        Task<UploadedFileDataDto> GetFromUploadeddata(long assessmentId, long auditId);

        Task<byte[]> DownloadTemplate(long templateId, string format);

        Task<byte[]> FormTemplate(long templateId, string format);

        Task UploadFormTemplate(IFormFile file, long templateId, long metricGroupId, long auditId);

        Task<List<MetricAnswerOptions>> GetMetricAnswerOptionsDetails(long metricGroupId);

        Task<byte[]> DownloadSFTPTemplate(long templateId, string format);

        Task<byte[]> DownloadMetricGroupTemplate(long metricGroupId, string format);

        Task<List<MetricGroup>> ListMetricGroupTemplate(long metricGroupId);

        Task UploadSFTPfile(IFormFile file);

        Task UploadMetricGroupTemplatefile(IFormFile file, long metricGroupId, string month, long year);

        Task UploadPdffile(IFormFile file);

        Task AddOrUpdateStandard(MetricStandard metricStandard);

        Task<List<MetricStandardDto>> GetMetricStandards();

        Task<byte[]> DownloadStandardData(string format);

        Task AddorupdateGoalsettings(GoalSetting goal);

        Task<List<GoalSettingDto>> GetGoalSetting();
    }
}
