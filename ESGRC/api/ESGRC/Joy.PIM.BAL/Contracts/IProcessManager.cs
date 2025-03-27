using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Mvc;

namespace Joy.PIM.BAL.Contracts
{
    public interface IProcessManager
    {
        Task AddProcess(Process process);

        Task<List<ProcessDomainModal>> GetProcessList();

        Task<Process> GetProcessById(long id);

        Task AddTemplateStages([FromBody] TemplateStages[] templateStages);

        Task<List<long>> GetRoleIds();

        Task<List<TemplateStagesDto>> GetProcessStages(long processId);

        Task<List<ComplianceStageDto>> GetStageList();

        Task<List<TemplateGroupDto>> TemplateMetrics(long templateId);

        Task<bool> IsApprover();

        Task<List<TemplateStagesDto>> ListProcess();

        Task<List<dynamic>> ListresponseJson();

        Task<List<TemplateStagesDto>> AuditApprove();

        Task AddTableMetadata(string tableNames);

        Task<List<TableMetadata>> GetTableMetaData();

        Task<List<string>> GetTableMetaDataColumns(string tableName);

        Task<List<TemplateStages>> GetAllTemplateStages();

        Task UpdateTemplateStageStatus(IEnumerable<long> processIds, IEnumerable<long> templateIds);

        // Task<Stream> UpdateTemplateStatus(IEnumerable<long> templateStageId, IEnumerable<long> auditId); 
        Task UpdateTemplateStatus(IEnumerable<long> templateStageId, IEnumerable<long> auditId);

        Task<Stream> UpdateXML(IEnumerable<long> templateStageId, IEnumerable<long> auditId);

        Task UpdateApprovalStatus(IEnumerable<long> templateStageId, IEnumerable<long> auditId);

        Task UpdateApproval(IEnumerable<long> processIds, IEnumerable<long> templateIds);

        Task<bool> IsPublisher();

        // Task<List<TemplateStagesDto>> ListPublishresponseJson();
        Task<List<TemplateStagesDto>> ListPublishresponse(long auditId);

        Task<List<TemplateStagesDto>> ListAuditResponse();

        Task<List<TemplateStages>> GetAllApprovalListTemplateStages();

        Task CreateQueries(Queries queries);

        Task RaiseIssue(AuditIssue issue);

        Task IssueWarning();

        Task EditQueries(long id, string response, long processstageid, long auditId);

        Task<List<dynamic>> GetQueriesstatus();

        Task<List<dynamic>> GetViewQueries(int id);

        Task<List<AssessmentStageDto>> GetAssessmentStage();

        Task UpdateAssesmentGroupStatus();
    }
}
