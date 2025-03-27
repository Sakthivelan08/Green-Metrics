using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.DAL;
using Joy.PIM.DAL.DomainModel;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;

namespace Joy.PIM.BAL.Contracts
{
    public interface IMetricGroup
    {
        Task AddOrUpdateMetricGroup(MetricGroup model);

        Task ActivateMetricGroup(long id);

        Task ActivateMetricGroupBatch(long[] ids);

        Task DeactivateMetricGroup(long id);

        Task DeactivateMetricGroupBatch(long[] ids);

        Task<List<GetMetricGroup>> GetActiveMetricGroupsWithCount();

        Task<List<GetMetricGroup>> GetActiveRegulationWithCount(long regulationtypeid);

        Task<List<GetMetricDetailsModel>> GetMetricDetails();

        Task DeleteMetricGroup(long id);

        Task DeleteMetricGroupId(long id, long groupId);

        Task<List<MetricDomainModel>> GetMetricsByGroupId(string groupId);

        Task<List<PrefixMetricsModel>> GetPrefixMetricsById(long? templateId);

        Task<List<MgmultiselectionDto>> GetMetricshow(string groupId);

        Task<List<MetricDomainModel>> GetMetricsByTemplateId(long templateId);

        Task<List<Auditresponsedata>> GetApproveData(long auditid, long templatestageid);

        Task<List<MetricGroup>> GetMetricGroupWithId(long id);

        Task<List<MetricGroup>> GetMetricGroupWithRegulationList();

        Task<List<MetricGroup>> ListMetricGroupWithParent(long parentid);

        Task UpdateParentId(long parentId, long[] metricgroupId);

        Task DeleteParentMetricGroup(List<long> id);

        Task<long> UploadPdfFileAsync(IFormFile file, long metricgroupId);

        Task<List<UploadedFile>> GetUploadedFileLink(long metricgroupId);
    }
}
