using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.EMMA;
using DocumentFormat.OpenXml.ExtendedProperties;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Implementations;
using Joy.PIM.BAL.Model;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class MetricController : BaseApiController
    {
        private readonly IMetricRepo _metricRepo;

        public MetricController(IMetricRepo metricRepo)
        {
            _metricRepo = metricRepo;
        }

        [HttpPost]
        public async Task CreateMetric([FromBody] Metric model)
        {
            await _metricRepo.AddOrUpdateMetric(model);
        }

        [HttpPut]
        public async Task UpdateMetric(IEnumerable<long> ids, long groupId)
        {
            await _metricRepo.UpdateMetric(ids, groupId);
        }

        // [HttpGet]
        // public async Task UpdateMetric(long id, string displayLabel)
        // {
        //    await _metricRepo.UpdateMtrics(id, displayLabel);
        // }
        [HttpGet]
        public async Task<List<MetricDomainModel>> GetMetric()
        {
            return await _metricRepo.GetMetric();
        }

        [HttpGet]
        public async Task<List<MetricDomainModel>> GetMetricsWithId(long id)
        {
            return await _metricRepo.GetMetricsWithId(id);
        }

        [HttpGet]
        public async Task<List<MetricDomainModel>> GetRegulationsWithId(long groupId, long regulationtypeid)
        {
            return await _metricRepo.GetRegulationsWithId(groupId, regulationtypeid);
        }

        [HttpGet]
        public async Task<List<Metric>> GetMetricList()
        {
            return await _metricRepo.GetMetricList();
        }

        [HttpPut]
        public async Task ActivateMetric(long id)
        {
            await _metricRepo.ActivateMetric(id);
        }

        [HttpPut]
        public async Task ActivateMetricBatch(long[] ids)
        {
            await _metricRepo.ActivateMetricBatch(ids);
        }

        [HttpPut]
        public async Task DeactivateMetric(long id)
        {
            await _metricRepo.DeactivateMetric(id);
        }

        [HttpPut]
        public async Task DeactivateMetricBatch(long[] ids)
        {
            await _metricRepo.DeactivateMetricBatch(ids);
        }

        [HttpGet]
        public async Task<IEnumerable<Metric>> GetAllActiveMetric()
        {
            return await _metricRepo.GetAllActiveMetric();
        }

        [HttpGet]
        public async Task<List<long>> GetActiveAnswerOptions()
        {
            return await _metricRepo.GetActiveAnswerOptions();
        }

        [HttpGet]
        public async Task<IEnumerable<Metric>> SearchActiveMetrics(bool isActive)
        {
            return await _metricRepo.SearchActiveMetrics(isActive);
        }

        [HttpGet]
        public async Task<IEnumerable<MetricType>> GetAllMetricType()
        {
            return await _metricRepo.GetAllMetricType();
        }

        [HttpGet]
        public async Task<IEnumerable<MetricType>> GetAllMetricTypeId(long id)
        {
            return await _metricRepo.GetAllMetricTypeId(id);
        }

        [HttpPost]
        public async Task AddOrUpdateMetricAnswer([FromBody] MetricAnswerOptionDto model)
        {
            await _metricRepo.AddOrUpdateMetricAnswer(model);
        }

        [HttpGet]
        public async Task<IEnumerable<MetricQuestionAnswersDto>> GetMetricAnswer(long templateId, long auditId)
        {
            return await _metricRepo.GetMetricAnswer(templateId, auditId);
        }

        [HttpPost]
        public async Task<string> ValidateInput([FromBody] ValidationDomainModel request)
        {
            return await _metricRepo.ValidateInput(request.Type, request.Input);
        }

        [HttpPost]
        public async Task<IActionResult> GetQuestionAnswerPdf(long assessmentId, long processId)
        {
            var pdfBytes = await _metricRepo.GetQuestionAnswerPDF(assessmentId, processId);
            return File(pdfBytes, "application/pdf", "QuestionAnswer.pdf");
        }

        [HttpPost]
        public async Task CreateTaskAction([FromBody] TaskAction model)
        {
            await _metricRepo.CreateTaskAction(model);
        }

        [HttpGet]
        public async Task<IEnumerable<TaskActionDto>> GetTaskActions()
        {
            return await _metricRepo.GetTaskActions();
        }

        [HttpDelete]
        public async Task DeleteMetric(long[] ids)
        {
             await _metricRepo.DeleteMetric(ids);
        }

        [HttpGet]
        public async Task<IActionResult> DownloadMetricTemplate()
        {
            var file = await _metricRepo.DownloadMetricTemplate();
            return File(file,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"MetricTemplate.xlsx");
        }

        [HttpPost]

        public async Task UploadMetricTemplate(IFormFile file)
        {
            await _metricRepo.UploadMetricTemplate(file);
        }

        [HttpGet]

        public async Task<List<Metric>> GetPrefixMetrics()
        {
            return await _metricRepo.GetPrefixMetrics();
        }
    }
}
