using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Hangfire;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.Uid;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Joy.PIM.WorkFlow.Repository;
using Microsoft.AspNetCore.Mvc;

namespace Joy.PIM.Api.Controllers.Api
{
    [Route("api/[controller]/[Action]")]
    [ApiController]
    public class WorkFlowController : ControllerBase
    {
        private readonly IDataProcess _dataprocess;
        private readonly IWorkFlowManager _taskStepInstance;
        private readonly IWorkFlowManager1 _taskStepInstance1;
        private readonly IUIDManager _uidrepo;
        private readonly IDbCache _dbcache;
        private readonly IUserContext _userContext;

        public WorkFlowController(
            IWorkFlowManager taskStepInstance,
            IWorkFlowManager1 taskStepInstance1,
            IDataProcess dataprocess,
            IUIDManager uIDRepo,
            IUserContext userContext,
            IDbCache dbcache)
        {
            _taskStepInstance = taskStepInstance;
            _taskStepInstance1 = taskStepInstance1;
            _dataprocess = dataprocess;
            _uidrepo = uIDRepo;
            _userContext = userContext;
            _dbcache = dbcache;
        }

        [HttpPost]
        public async Task AddorUpdateTaskStepInstance([FromBody] TaskStepInstance taskStepInstance)
        {
            await _taskStepInstance.AddorUpdateTaskStepInstance(taskStepInstance);
        }

        [HttpGet]
        public async Task<AppUser> GetUserInfoByWorkFlowRunId(int workFlowRunId)
        {
            return await _uidrepo.GetPreviewInfo<AppUser>(workFlowRunId, "appuser");
        }

        [HttpGet]
        public async Task<bool> GetIfAlreadyExistorNot(string planogramOrFamilyName)
        {
            var result = await _uidrepo.IsAlreadyExist(planogramOrFamilyName);
            return result;
        }

        [HttpPut]
        public async Task UpdateWorkflowstatusBatch(int[] ids, string action, string userComments)
        {
            foreach (var id in ids)
            {
                var table = await _taskStepInstance.GetllTaskStepInstance(id);
                var tablename = table.ToString();
                if (tablename.ToLower() == "appuser")
                {
                    if (action.ToLower() == "approved")
                    {
                        await _dataprocess.ApproveOrReject(id);
                    }
                }

                await _taskStepInstance.UpdateAction(action, id, userComments);
            }
        }

        [HttpGet]
        public async Task<List<TaskStepInstance>> GetTask(string action)
        {
            return await _taskStepInstance.GetTaskStepInstance(action);
        }

        [HttpGet]
        public async Task<List<PlanagromRecortList>> GetPlanogramRecordList()
        {
            return await _uidrepo.GetPlanogramListAsync();
        }

        [HttpGet]
        public async Task<List<PlanagromRecortList>> GetApprovedorRejectedList()
        {
            var roleid = await _userContext.GetRoleId();
            var divisionId = await _userContext.GetDepartmentIds();
            string role = string.Join(",", roleid);
            return await _uidrepo.GetPlanogramApprovalListAsync(role, divisionId);
        }

        [HttpPost]
        public async Task<WorkflowRun> AddorUpdateWorkflowRun([FromBody] WorkflowRun workflowRun)
        {
            await _taskStepInstance1.AddOrUpdateWorkflowRun(workflowRun, null);
            return workflowRun;
        }

        [HttpPost]
        public async Task<List<TasklevelSequence>> UpdateUserAction([FromBody] List<TasklevelSequence> tasklevelSeqInputLst)
        {
            await _taskStepInstance1.UpdateUserAction(tasklevelSeqInputLst);
            return tasklevelSeqInputLst;
        }

        [HttpPost]
        public async Task<List<PlanagromRecortList>> UidSearchByCriteria(UidSearchModel uidSearchModel)
        {
            return await _uidrepo.UidSearchByCriteria(uidSearchModel);
        }

        [HttpGet]
        public async Task<FileResult> ExportExcel(bool isGetAll, DateTime? startDate, DateTime? endDate, string fileName)
        {
            var fileStream = await _uidrepo.GetPlanogramApprovalListAsync(isGetAll, startDate, endDate);
            return File(fileStream, new FileExportHelper().GetMimeType("*.xlsx"), $"{fileName}.xlsx");
        }

        [HttpPost]
        public async Task<FileResult> UIDExportExcel(UidSearchModel uidSearchModel)
        {
            var fileStream = await _uidrepo.UIDExcel(uidSearchModel);
            return File(fileStream, new FileExportHelper().GetMimeType("*.xlsx"), $"UidExcel.xlsx");
        }

        [HttpGet]
        public async Task<EmailContentModel> EmailContent()
        {
            var userid = await _userContext.GetUserId();
            return await _uidrepo.EmailContent(userid);
        }

        [HttpGet]
        public async Task<string> Sentemail()
        {
            return await _uidrepo.SendEmail();
        }

        [HttpPut]

        public async Task UpdateRejectedName(string[] name)
        {
            await _uidrepo.UpdateRejectedName(name);
        }
    }
}