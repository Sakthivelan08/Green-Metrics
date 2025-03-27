using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Enum;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Joy.PIM.BAL.Contracts
{
    public interface IMetricRepo
    {
        Task AddOrUpdateMetric(Metric model);

        // Task UpdateMtrics(long id, string displayLabel);
        Task UpdateMetric(IEnumerable<long> ids, long groupId);

        Task<List<MetricDomainModel>> GetMetric();

        Task<List<MetricDomainModel>> GetMetricsWithId(long id);

        Task<List<Metric>> GetMetricList();

        Task<List<MetricDomainModel>> GetRegulationsWithId(long groupId, long regulationtypeid);

        Task ActivateMetric(long id);

        Task ActivateMetricBatch(long[] ids);

        Task DeactivateMetric(long id);

        Task DeactivateMetricBatch(long[] ids);

        Task<IEnumerable<Metric>> GetAllActiveMetric();

        Task<List<long>> GetActiveAnswerOptions();

        Task<IEnumerable<Metric>> SearchActiveMetrics(bool isActive);

        Task<IEnumerable<MetricType>> GetAllMetricType();

        Task<IEnumerable<MetricType>> GetAllMetricTypeId(long id);

        Task AddOrUpdateMetricAnswer(MetricAnswerOptionDto model);

        Task<IEnumerable<MetricQuestionAnswersDto>> GetMetricAnswer(long templateId, long auditId);

        Task<string> ValidateInput(ValidationListEnum type, object input);

        Task<byte[]> GetQuestionAnswerPDF(long templateId, long processId);

        Task CreateTaskAction(TaskAction model);

        Task<IEnumerable<TaskActionDto>> GetTaskActions();

        Task DeleteMetric(long[] ids);

        Task<byte[]> DownloadMetricTemplate();

        Task UploadMetricTemplate(IFormFile file);

        Task<List<Metric>> GetPrefixMetrics();
    }
}
