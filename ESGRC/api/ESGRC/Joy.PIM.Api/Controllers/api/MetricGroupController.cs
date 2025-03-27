using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.DomainModel;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class MetricGroupController : BaseApiController
    {
        private readonly IMetricGroup _metricGroup;

        public MetricGroupController(IMetricGroup metricGroup)
        {
            _metricGroup = metricGroup;
        }

        [HttpPost]
        public async Task CreateMetricGroup([FromBody] MetricGroup model)
        {
            await _metricGroup.AddOrUpdateMetricGroup(model);
        }

        [HttpGet]

        public async Task<List<MetricGroup>> ListMetricGroupWithParent(long parentid)
        {
            return await _metricGroup.ListMetricGroupWithParent(parentid);
        }

        [HttpGet]
        public async Task ActivateMetricGroup(long id)
        {
            await _metricGroup.ActivateMetricGroup(id);
        }

        [HttpPut]
        public async Task ActivateMetricGroupBatch(long[] ids)
        {
            await _metricGroup.ActivateMetricGroupBatch(ids);
        }

        [HttpPut]
        public async Task DeactivateMetricGroup(long id)
        {
            await _metricGroup.DeactivateMetricGroup(id);
        }

        [HttpDelete]
        public async Task DeleteMetricGroup(long id)
        {
            await _metricGroup.DeleteMetricGroup(id);
        }

        [HttpPut]
        public async Task DeactivateMetricGroupBatch(long[] ids)
        {
            await _metricGroup.DeactivateMetricGroupBatch(ids);
        }

        [HttpGet]
        public async Task<List<GetMetricGroup>> GetActiveMetricGroupsWithCount()
        {
            return await _metricGroup.GetActiveMetricGroupsWithCount();
        }

        [HttpGet]
        public async Task<List<GetMetricGroup>> GetActiveRegulationWithCount(long regulationtypeid)
        {
            return await _metricGroup.GetActiveRegulationWithCount(regulationtypeid);
        }

        [HttpGet]

        public async Task<List<GetMetricDetailsModel>> GetMetricDetails()
        {
            return await _metricGroup.GetMetricDetails();
        }

        [HttpDelete]
        public async Task DeleteMetricGroupId(long id, long groupId)
        {
            await _metricGroup.DeleteMetricGroupId(id, groupId);
        }

        [HttpPut]
        public async Task DeleteParentMetricGroup(List<long> id)
        {
            await _metricGroup.DeleteParentMetricGroup(id);
        }

        [HttpGet]
        public async Task<List<MetricDomainModel>> GetMetricsByGroupId(string groupId)
        {
            return await _metricGroup.GetMetricsByGroupId(groupId);
        }

        [HttpGet]

        public async Task<List<PrefixMetricsModel>> GetPrefixMetricsById(long? templateId)
        {
            return await _metricGroup.GetPrefixMetricsById(templateId);
        }

        [HttpGet]
        public async Task<List<MgmultiselectionDto>> GetMetricshow(string groupId)
        {
            return await _metricGroup.GetMetricshow(groupId);
        }

        [HttpGet]
        public async Task<List<MetricDomainModel>> GetMetricsByTemplateId(long templateId)
        {
            return await _metricGroup.GetMetricsByTemplateId(templateId);
        }

        [HttpGet]
        public async Task<List<Auditresponsedata>> GetApproveData(long auditid, long templatestageid)
        {
           return await _metricGroup.GetApproveData(auditid, templatestageid);
        }

        [HttpGet]
        public async Task<List<MetricGroup>> GetMetricGroupWithId(long id)
        {
            return await _metricGroup.GetMetricGroupWithId(id);
        }

        [HttpGet]
        public async Task<List<MetricGroup>> GetMetricGroupWithRegulationList()
        {
            return await _metricGroup.GetMetricGroupWithRegulationList();
        }

        [HttpPut]

        public async Task UpdateParentId(long parentId, long[] metricgroupId)
        {
            await _metricGroup.UpdateParentId(parentId, metricgroupId);
        }

        [HttpPost]
        public async Task<long> UploadPdfFileAsync(IFormFile file, long metricgroupId)
        {
            return await _metricGroup.UploadPdfFileAsync(file, metricgroupId);
        }

        [HttpGet]
        public async Task<List<UploadedFile>> GetUploadedFileLink(long metricgroupId)
        {
            return await _metricGroup.GetUploadedFileLink(metricgroupId);
        }
    }
}
