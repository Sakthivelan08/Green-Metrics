using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class ProcessController : BaseApiController
    {
        private readonly IProcessManager _processManager;

        public ProcessController(IProcessManager processManager)
        {
            _processManager = processManager;
        }

        [HttpPost]
        public async Task AddorUpdateProcess([FromBody] Process process)
        {
            await _processManager.AddProcess(process);
        }

        [HttpGet]
        public async Task<List<ProcessDomainModal>> GetProcessList()
        {
            return await _processManager.GetProcessList();
        }

        [HttpGet]
        public async Task<Process> GetProcessById(long id)
        {
            return await _processManager.GetProcessById(id);
        }

        [HttpPost]
        public async Task AddTemplateStages([FromBody] TemplateStages[] templateStages)
        {
            await _processManager.AddTemplateStages(templateStages);
        }

        [HttpGet]
        public async Task<List<long>> GetRoleIds()
        {
            return await _processManager.GetRoleIds();
        }

        [HttpGet]
        public async Task<List<TemplateStagesDto>> GetProcessStages(long processId)
        {
            return await _processManager.GetProcessStages(processId);
        }

        [HttpGet]
        public async Task<bool> IsApprover()
        {
            return await _processManager.IsApprover();
        }

        [HttpGet]
        public async Task<List<TemplateStagesDto>> ListProcess()
        {
            return await _processManager.ListProcess();
        }

        [HttpGet]
        public async Task<List<dynamic>> ListresponseJson()
        {
            return await _processManager.ListresponseJson();
        }

        [HttpGet]
        public async Task<List<ComplianceStageDto>> GetStageList()
        {
            return await _processManager.GetStageList();
        }

        [HttpGet]
        public async Task<List<TemplateGroupDto>> TemplateMetrics(long templateId)
        {
            return await _processManager.TemplateMetrics(templateId);
        }

        [HttpPost]
        public async Task AddTableMetadata(string tableName)
        {
            await _processManager.AddTableMetadata(tableName);
        }

        [HttpGet]
        public async Task<List<TableMetadata>> GetTableMetaData()
        {
            return await _processManager.GetTableMetaData();
        }

        [HttpGet]
        public async Task<List<string>> GetTableMetaDataColumn(string tableName)
        {
            return await _processManager.GetTableMetaDataColumns(tableName);
        }

        [HttpGet]
        public async Task<List<TemplateStages>> GetAllTemplateStages()
        {
            return await _processManager.GetAllTemplateStages();
        }

        [HttpPut]
        public async Task UpdateStageStatus(IEnumerable<long> processIds, IEnumerable<long> templateIds)
        {
            await _processManager.UpdateTemplateStageStatus(processIds, templateIds);
        }

        // [HttpPut]
        // public async Task<IActionResult> UpdateTemplateStatus(IEnumerable<long> templateStageId, IEnumerable<long> auditId)
        // {
        //    var resultStream = await _processManager.UpdateTemplateStatus(templateStageId, auditId);
        //    if (resultStream != null)
        //    {
        //        return new FileStreamResult(resultStream, "application/xml")
        //        {
        //            FileDownloadName = "XmlData.xml"
        //        };
        //    }
        //  return NotFound("XML not found");
        // }
        [HttpPut]
        public async Task UpdateTemplateStatus(IEnumerable<long> templateStageId, IEnumerable<long> auditId)
        {
            await _processManager.UpdateTemplateStatus(templateStageId, auditId);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateXML(IEnumerable<long> templateStageId, IEnumerable<long> auditId)
        {
            var resultStream = await _processManager.UpdateXML(templateStageId, auditId);

            if (resultStream != null)
            {
                return new FileStreamResult(resultStream, "application/xml")
                {
                    FileDownloadName = "XmlData.xml"
                };
            }

            return NotFound("XML not found");
        }

        [HttpPut]
        public async Task UpdateApproval(IEnumerable<long> processIds, IEnumerable<long> templateIds)
        {
            await _processManager.UpdateApproval(processIds, templateIds);
        }

        [HttpPut]
        public async Task UpdateApprovalStatus(IEnumerable<long> templateStageId, IEnumerable<long> auditId)
        {
            await _processManager.UpdateApprovalStatus(templateStageId, auditId);
        }

        [HttpGet]
        public async Task<bool> IsPublisher()
        {
            return await _processManager.IsPublisher();
        }

        // [HttpGet]
        // public async Task<List<TemplateStagesDto>> ListPublishresponseJson()
        // {
        //    return await _processManager.ListPublishresponseJson();
        // }
        [HttpGet]
        public async Task<List<TemplateStagesDto>> ListPublishresponse(long auditId)
        {
            return await _processManager.ListPublishresponse(auditId);
        }

        [HttpGet]
        public async Task<List<TemplateStagesDto>> ListAuditResponse()
        {
            return await _processManager.ListAuditResponse();
        }

        [HttpGet]
        public async Task<List<TemplateStagesDto>> AuditApprove()
        {
            return await _processManager.AuditApprove();
        }

        [HttpGet]
        public async Task<List<TemplateStages>> GetAllApprovalListTemplateStages()
        {
            return await _processManager.GetAllApprovalListTemplateStages();
        }

        [HttpPost]

        public async Task RaiseIssue([FromBody] AuditIssue issue)
        {
            await _processManager.RaiseIssue(issue);
        }

        [HttpPost]

        public async Task IssueWarning()
        {
            await _processManager.IssueWarning();
        }

        [HttpPost]
        public async Task CreateQueries([FromBody] Queries queries)
        {
            await _processManager.CreateQueries(queries);
        }

        [HttpPut]
        public async Task EditQueries(long id, string response, long processstageid, long auditId)
        {
            await _processManager.EditQueries(id, response, processstageid, auditId);
        }

        [HttpGet]
        public async Task<List<dynamic>> GetQueriesstatus()
        {
            return await _processManager.GetQueriesstatus();
        }

        [HttpGet]
        public async Task<List<dynamic>> GetViewQueries(int id)
        {
            return await _processManager.GetViewQueries(id);
        }

        [HttpGet]
        public async Task<List<AssessmentStageDto>> GetAssessmentStage()
        {
            return await _processManager.GetAssessmentStage();
        }

        [HttpPut]

        public async Task UpdateAssesmentGroupStatus()
        {
            await _processManager.UpdateAssesmentGroupStatus();
        }
    }
}
