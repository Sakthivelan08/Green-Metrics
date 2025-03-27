using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Schema;
using Azure.Storage.Blobs;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Enum;
using Joy.PIM.DAL.Master;
using Microsoft.Extensions.Configuration;

namespace Joy.PIM.BAL.Implementations
{
    public class ProcessManager : PgEntityAction<TemplateStages>, IProcessManager
    {
        private readonly IDbCache _cache;
        private readonly IUserContext _userContext;
        private readonly IConfiguration _configuration;
        private readonly IBlobRepo _lobRepo;

        public ProcessManager(IUserContext userContext, IDbConnectionFactory connectionFactory,
       IConfiguration configuration, IDbCache cache, IWorkFlowManager workFlowManager, IBlobRepo lobRepo)
       : base(userContext, connectionFactory, configuration)
        {
            _cache = cache;
            _userContext = userContext;
            _configuration = configuration;
            _lobRepo = lobRepo;
        }

        public async Task AddProcess(Process process)
        {
            var userId = await _userContext.GetUserId().ConfigureAwait(true);
            if (process.Id == 0)
            {
                process.IsActive = true;
                process.UpdatedBy = userId;
                process.CreatedBy = userId;
                process.DateCreated = DateTimeOffset.UtcNow;
                process.DateModified = DateTimeOffset.UtcNow;
            }
            else
            {
                process.IsActive = true;
                process.UpdatedBy = userId;
                process.DateModified = DateTimeOffset.UtcNow;
            }

            var staggingAuditAction = this.GetAction<Process>();
            await staggingAuditAction.AddOrUpdate(process).ConfigureAwait(false);
        }

        public async Task<List<ProcessDomainModal>> GetProcessList()
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<ProcessDomainModal>("SELECT p.*, c.id as ComplianceId, c.name as compliancename FROM process AS p " +
                    $"JOIN compliance AS c ON c.id = p.complianceid " +
                    $"WHERE p.isactive = true").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<Process> GetProcessById(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                return await connection.QueryFirstOrDefaultAsync<Process>($"select * from process where id = {id}").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task AddTemplateStages(TemplateStages[] templateStages)
        {
            try
            {
                var nextStage = 0L;
                var i = 0;
                var userId = await GetUserId().ConfigureAwait(true);

                foreach (var stage in templateStages.OrderByDescending(a => a.StageLevel))
                {
                    var status = (long)TemplateStageApprovalENum.Pending;

                    // if (i == templateStages.Length - 1)
                    // {
                    //    status = (long)TemplateStageApprovalENum.Pending;
                    // }
                    var templateStage = new TemplateStages()
                    {
                        TemplateId = stage.TemplateId,
                        AssessmentId = stage.AssessmentId,
                        StageLevel = stage.StageLevel,
                        RoleId = stage.RoleId,
                        ActionId = stage.ActionId,
                        NextStageID = nextStage,
                        ApproverId = stage.ApproverId,
                        ProcessId = stage.ProcessId,
                        CreatedBy = userId,
                        UpdatedBy = userId,
                        DateCreated = DateTimeOffset.UtcNow,
                        DateModified = DateTimeOffset.UtcNow,
                        Status = status,
                        Auditroleid = stage.Auditroleid
                    };

                    var result = await AddOrUpdate(templateStage).ConfigureAwait(true);
                    nextStage = result.Id;
                    i = i + 1;
                }
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<long>> GetRoleIds()
        {
            try
            {
                var roleIds = new List<long>();
                var roleString = await _userContext.GetRoleId().ConfigureAwait(true);
                var splitRole = roleString.Split(',');
                foreach (var role in splitRole)
                {
                    roleIds.Add(long.Parse(role));
                }

                return roleIds;
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<TemplateStagesDto>> GetProcessStages(long processId)
        {
            try
            {
                using var connection = this.GetConnection();
                var query = $"select tempstg.id as id, pr.name as processname, " +
                    $"temp.id as templateid,pr.ComplianceId, temp.name as templatename, " +
                    $"tempstg.roleid as roleid, tempstg.approverid as approverid, tempstg.auditroleid, tempstg.actionid as actionid, pr.Id As ProcessId " +
                    $"from templatestages as tempstg " +
                    $"inner join process as pr on pr.id = tempstg.processid " +
                    $"left join template as temp on temp.id = tempstg.templateid " +
                    $"inner join role as r on r.id = tempstg.roleid " +
                    $"where tempstg.processid = {processId} order by tempstg.stagelevel ";
                return (await connection.QueryAsync<TemplateStagesDto>(query).ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<ComplianceStageDto>> GetStageListAudit()
        {
            try
            {
                using var connection = this.GetConnection();
                var roleIdString = await _userContext.GetRoleId().ConfigureAwait(true);
                var roleIds = roleIdString.Split(',').Select(long.Parse).ToList();

                if (roleIds.Contains((long)RoleEnum.Auditor))
                {
                    var query = await connection.QueryAsync<ComplianceStageDto>($"SELECT t.id as templateId, t.name as templateName, c.id as ComplianceId, c.name as complianceName, p.id As ProcessId, ps.status, ca.id as AuditId, ca.name as AuditName  " +
                    $"FROM ProcessStages ps  " +
                    $"INNER JOIN templatestages AS tsm ON tsm.id = ps.templateStageId " +
                    $"INNER JOIN Template t ON tsm.TemplateId = t.Id " +
                    $"INNER JOIN Process p ON tsm.ProcessId = p.Id " +
                    $"INNER JOIN createaudit ca ON ca.auditingprocess = p.id " +
                    $"INNER JOIN Compliance c ON p.ComplianceId = c.Id " +
                    $"WHERE tsm.RoleId = ({roleIdString}) order by t.id ").ConfigureAwait(true);
                    return query.ToList();
                }

                throw new DataException("No Datas Found");
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<ComplianceStageDto>> GetStageList()
        {
            try
            {
                using var connection = this.GetConnection();
                var roleIdString = await _userContext.GetRoleId().ConfigureAwait(true);
                var roleIds = roleIdString.Split(',').Select(long.Parse).ToList();

                if (roleIds.Contains((long)RoleEnum.Auditor))
                {
                var query = await connection.QueryAsync<ComplianceStageDto>($"SELECT tg.id as templateId,tg.metricgroupid, c.id as ComplianceId, c.name as complianceName, p.id As ProcessId, ps.status, ps.auditid as AuditId, ca.name as AuditName, ps.templatestageId, ca.PeriodId, tsm.roleId, ps.reason,ca.enddate, ai.issuereason  " +
                    $"FROM ProcessStages ps INNER JOIN templatestages AS tsm ON tsm.id = ps.templateStageId left Join templategroup tg on tg.templateid = tsm.templateid INNER JOIN Process p ON tsm.ProcessId = p.Id " +
                    $"INNER JOIN createaudit ca ON ca.id = ps.auditid INNER JOIN Compliance c ON p.ComplianceId = c.Id  " +
                    $"LEFT JOIN Auditissue ai ON ai.auditid = ca.id  " +
                    $"WHERE tsm.isactive = true order by tg.templateid ").ConfigureAwait(true);
                return query.ToList().DistinctBy(a => a.AuditId).ToList();
                }
               else if (!roleIds.Contains((long)RoleEnum.Approver) || !roleIds.Contains((long)RoleEnum.Auditor))
                {
                    var query = (await connection.QueryAsync<ComplianceStageDto>($"select ts.id, ts.templateId,tg.metricgroupid, ts.stageLevel, ts.roleId, ts.nextstageId, ts.actionId, ts.approverId, ts.processId, ts.auditroleId, ps.auditid, ca.name As AuditName,ps.templatestageId, ps.status, ts.status as auditstatus, c.id as complianceid, ca.periodid, ps.reason,ca.enddate,ai.issuereason, " +
                        $"c.name as ComplianceName  from processStages as ps " +
                        $"inner join templatestages as ts on ps.templatestageid = ts.id " +
                        $"left Join templategroup tg on tg.templateid = ts.templateid " +
                        $"inner join process as p on ts.processid = p.id " +
                        $"INNER JOIN createaudit ca ON ca.id = ps.auditid " +
                        $"INNER JOIN Compliance c ON p.ComplianceId = c.Id " +
                        $"LEFT JOIN Auditissue ai ON ai.auditid = ca.id " +
                        $"WHERE ts.isactive = true and tg.metricgroupid is not null order by ts.processid").ConfigureAwait(true)).ToList();

                    var templateName = (await connection.QueryAsync<Template>($"select t.id, t.name from template t").ConfigureAwait(true)).ToList();

                    var auditName = (await connection.QueryAsync<TemplateStagesDto>($"select ca.auditingprocess, ca.name as AuditName, ca.Id as AuditId from processstages as pr inner join createaudit as ca on pr.auditid = ca.id WHERE pr.isactive = true").ConfigureAwait(true)).ToList();

                    var complianceName = (await connection.QueryAsync<TemplateStagesDto>($"select c.id, c.name as ComplianceName from process as pr inner join compliance as c on pr.complianceId = c.id WHERE pr.isactive = true").ConfigureAwait(true)).ToList();

                    var res = query.Where(a => a.Status == (long)TemplateStageApprovalENum.Pending || a.Status == (long)TemplateStageApprovalENum.Completed).Select(a => a.AuditId).ToList();
                    query = query.Where(a => (res.Contains(a.AuditId) || a.Status == (long)TemplateStageApprovalENum.Success) && (a.RoleId == long.Parse(roleIdString))).ToList();
                    foreach (var stage in query)
                    {
                        stage.TemplateName = templateName.FirstOrDefault(a => a.Id == stage.TemplateId)?.Name;
                        stage.AuditName = auditName.FirstOrDefault(a => a.AuditId == stage.AuditId)?.AuditName;
                        stage.ComplianceName = complianceName.FirstOrDefault(a => a.Id == stage.ComplianceId).ComplianceName;
                        stage.AuditId = auditName.FirstOrDefault(a => a.AuditId == stage.AuditId)?.AuditId;
                    }

                    return query.ToList();
                }
                else
                {
                    var query = await connection.QueryAsync<ComplianceStageDto>($"SELECT t.id as templateId, t.name as templateName, c.id as ComplianceId, c.name as complianceName, p.id As ProcessId, ps.status, ps.auditid as AuditId, ca.name as AuditName, ps.templatestageId, ca.PeriodId, tsm.roleId, ps.reason,ca.enddate, ai.issuereason  " +
                   $"FROM ProcessStages ps  " +
                   $"INNER JOIN templatestages AS tsm ON tsm.id = ps.templateStageId " +
                   $"LEFT JOIN Template t ON tsm.TemplateId = t.Id " +
                   $"INNER JOIN Process p ON tsm.ProcessId = p.Id " +
                   $"INNER JOIN createaudit ca ON ca.id = ps.auditid " +
                   $"INNER JOIN Compliance c ON p.ComplianceId = c.Id " +
                   $"LEFT JOIN Auditissue ai ON ai.auditid = ca.id " +
                   $"WHERE tsm.roleid = ({roleIdString}) order by t.id ").ConfigureAwait(true);
                    return query.ToList().DistinctBy(a => a.AuditId).ToList();
                }

                throw new DataException("No Datas Found");
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<TemplateGroupDto>> TemplateMetrics(long templateId)
        {
            try
            {
                using var connection = this.GetConnection();

                // var query = await connection.QueryAsync<TemplateGroupDto>($"select t.id as TemplateId, t.name as templateName, tg.metricgroupid, mg.name as metricgroupname, m.id as metricId,m.typeid as datatype, mt.name as datatypeName, m.metricsquestion as name from template as t " +
                //    $"inner join templateGroup as tg on tg.templateId = t.id " +
                //    $"inner join metricgroup as mg on mg.id = tg.metricgroupid " +
                //    $"inner join metric as m on m.groupid = mg.id " +
                //    $"inner join metrictype as mt on mt.id = m.typeid " +
                //    $"where t.id = {templateId}");
                var query = await connection.QueryAsync<TemplateGroupDto>($"SELECT  tg.metricgroupid, mg.name AS MetricGroupName, m.id AS MetricId, m.typeid AS DataType, " +
                    $"mt.name AS DataTypeName, m.metricsquestion AS Name FROM template AS t " +
                    $"INNER JOIN templateGroup AS tg ON tg.templateId = t.id " +
                    $"INNER JOIN metricgroup AS mg ON mg.id = tg.metricgroupid " +
                    $"INNER JOIN mgmultiselection AS ms ON ms.metricgroupid = mg.id " +
                    $"INNER JOIN metric AS m ON m.id = ms.metricid " +
                    $"INNER JOIN metrictype AS mt ON mt.id = m.typeid WHERE t.id = {templateId}").ConfigureAwait(true);
                return query.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<bool> IsApprover()
        {
            try
            {
                var roleIdString = await _userContext.GetRoleId().ConfigureAwait(true);

                if (roleIdString.Split(',').Select(a => long.Parse(a)).ToList().Contains((long)RoleEnum.Approver))
                {
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<TemplateStagesDto>> ListProcess()
        {
            try
            {
                using var connection = this.GetConnection();
                var roleIdString = await _userContext.GetRoleId().ConfigureAwait(true);
                var processList = (await connection.QueryAsync<TemplateStagesDto>($"select tempstg.id as templateStageId, pr.name as processname, " +
                    $"temp.id as templateid,pr.ComplianceId, temp.name as templatename, c.name As ComplianceName, ca.name as AuditName, ca.id as AuditId, " +
                    $"tempstg.roleid as roleid, tempstg.approverid as approverid, tempstg.auditroleid as auditroleid, tempstg.actionid as actionid, pr.Id As ProcessId, tempstg.Status " +
                    $"from templatestages as tempstg " +
                    $"inner join process as pr on pr.id = tempstg.processid " +
                    $"inner join createaudit as ca on ca.auditingprocess = pr.id " +
                    $"Left join template as temp on temp.id = tempstg.templateid " +
                    $"inner Join Compliance AS c ON c.id = pr.complianceId " +
                    $"where tempstg.isactive = true ").ConfigureAwait(true)).ToList();
                var list = processList.Where(a => roleIdString.Split(',').ToList().Select(a => long.Parse(a)).Contains((long)a.Auditroleid));

                return list.ToList().DistinctBy(a => a.AuditId).ToList();
            }
            catch (Exception)
            {
                throw new HandledException("No Datas Found");
            }
        }

        public async Task<List<dynamic>> ListresponseJson()
        {
            try
            {
                using var connection = this.GetConnection();
                var roleIdString = await _userContext.GetRoleId().ConfigureAwait(true);
                var roleIds = roleIdString.Split(',').Select(long.Parse).ToList();

                var processList = (await connection.QueryAsync<TemplateStagesDto>(
                    @"select tempstg.roleid as roleid, tempstg.approverid as approverid, tempstg.stagelevel from templatestages as tempstg where tempstg.isactive = true").ConfigureAwait(true)).ToList();

                if (processList.Any(a => roleIds.Contains((long)a.ApproverId)))
                {
                    var result = await connection.QueryAsync<dynamic>($"select ts.approverId, ts.processId, ts.templateId, ts.roleid, pr.name as processname, c.name As ComplianceName, ts.Status, ca.id as AuditId, ca.name as AuditName, ca.periodId, mao.responseJson from templatestages ts " +
                        $"JOIN metricAnswerOptions AS mao ON mao.processId = ts.processId " +
                        $"INNER JOIN process as pr on pr.id = ts.processid " +
                        $"INNER JOIN createaudit ca ON ca.auditingprocess = pr.id " +
                        $"INNER JOIN Compliance AS c ON c.id = pr.complianceId " +
                        $"where ts.isActive = true AND ts.approverId IN ({roleIdString}) ").ConfigureAwait(true);

                    return result.ToList();
                }

                throw new DataException("No Datas Found");
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<TemplateStagesDto>> AuditApprove()
        {
            try
            {
                using var connection = this.GetConnection();
                var roleIdString = await _userContext.GetRoleId().ConfigureAwait(true);
                var roleIds = roleIdString.Split(',').Select(long.Parse).ToList();
                if (roleIds.Contains((long)RoleEnum.Approver))
                {
                    var result = await connection.QueryAsync<TemplateStagesDto>($"select ts.id, ts.stagelevel,ts.approverId, ts.processId, ts.templateId, ass.id as assessmentGroupId , ass.name as assessmentGroupName, ts.roleid, pr.name as processname, c.name As ComplianceName, ps.templateStageId, ps.Status, ps.auditid as AuditId, ca.name as AuditName, ca.periodId, mao.responseJson, ai.enddate, ai.issuestatus  " +
                        $"from processStages ps " +
                        $"INNER JOIN templatestages AS ts ON ts.id = ps.templateStageId " +
                        $"Left Join assessment as ass on ass.id = ts.assessmentid " +
                        $"JOIN metricAnswerOptions AS mao ON mao.processId = ts.processId " +
                        $"INNER JOIN process as pr on pr.id = ts.processid " +
                        $"INNER JOIN createaudit ca ON ca.id = ps.auditid " +
                        $"INNER JOIN Compliance AS c ON c.id = pr.complianceId " +
                        $"LEFT JOIN AuditIssue AS ai ON ai.auditid = ca.id " +
                        $"where ts.isActive = true AND ts.approverId IN ({roleIdString})").ConfigureAwait(true);

                    return result.ToList().DistinctBy(a => a.TemplateStageId).ToList();
                }

                throw new DataException("No Datas Found");
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task AddTableMetadata(string tableNames)
        {
            try
            {
                var tableName = tableNames?.Split(',');
                foreach (var item in tableName)
                {
                    var tableMetadata = new TableMetadata()
                    {
                        Name = item,
                        Description = item,
                    };

                    var action = this.GetAction<TableMetadata>();
                    await action.AddOrUpdate(tableMetadata).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<TableMetadata>> GetTableMetaData()
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<TableMetadata>("select * from tablemetadata where isactive = true").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<string>> GetTableMetaDataColumns(string tableName)
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<string>($"select * from get_table_columns('{tableName.ToLower()}')").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<TemplateStages>> GetAllTemplateStages()
        {
            try
            {
                using var connection = this.GetConnection();
                var templateStages = (await connection.QueryAsync<TemplateStages>("select * from templatestages where isactive = true ").ConfigureAwait(true)).ToList();
                return templateStages;
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task UpdateTemplateStageStatus(IEnumerable<long> processIds, IEnumerable<long> templateIds)
        {
            try
            {
                using var connection = this.GetConnection();
                var processIdList = string.Join(",", processIds);
                var templateIdList = string.Join(",", templateIds);
                var query = $@" UPDATE templatestages SET Status = @SuccessStatus  WHERE ProcessId IN ({processIdList}) AND TemplateId IN ({templateIdList}) 
                AND (Status = @CompletedStatus OR Status = @ApprovedStatus)";

                var parameters = new
                {
                    SuccessStatus = (long)TemplateStageApprovalENum.Success,
                    CompletedStatus = (long)TemplateStageApprovalENum.Completed,
                    ApprovedStatus = (long)TemplateStageApprovalENum.Approved
                };

                await connection.ExecuteAsync(query, parameters).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        // public async Task<Stream> UpdateTemplateStatus(IEnumerable<long> templateStageId, IEnumerable<long> auditId)
        // {
        //    try
        //    {
        //        using var connection = this.GetConnection();
        //        var query = @"SELECT DISTINCT ON (mao.assessmentid) mao.assessmentid, mao.responsejson 
        //                    FROM processstages AS ps
        //                    INNER JOIN metricansweroptions mao ON mao.auditid = ps.auditid
        //                    WHERE ps.templatestageid = ANY(@TemplateStageIds) 
        //                    AND ps.auditid = ANY(@AuditIds)";
        //        var parameters = new
        //        {
        //            TemplateStageIds = templateStageId.ToArray(),
        //            AuditIds = auditId.ToArray()
        //        };
        //        var answerList = (await connection.QueryAsync<dynamic>(query, parameters).ConfigureAwait(false)).ToList();
        //        if (!answerList.Any())
        //        {
        //            throw new InvalidOperationException("No data found for the provided TemplateStageId and AuditId.");
        //        }
        //        var firstItem = answerList.FirstOrDefault();
        //        string assessmentId = firstItem != null && ((IDictionary<string, object>)firstItem).ContainsKey("assessmentid")
        //            ? ((IDictionary<string, object>)firstItem)["assessmentid"]?.ToString() ?? "Unknown"
        //            : "Unknown";
        //        string xmlFileName = $"XmlData{assessmentId}";
        //        var responseJsonList = answerList.Select(item => (string)((IDictionary<string, object>)item)["responsejson"]).ToList();
        //        string result = await GenerateAndValidateXml(responseJsonList, xmlFileName).ConfigureAwait(false);
        //        if (result.Contains("Error"))
        //        {
        //            throw new InvalidOperationException($"XML Generation and Validation failed: {result}");
        //        }
        //        var updateQuery = @"UPDATE processStages 
        //                            SET status = @SuccessStatus 
        //                            WHERE templateStageId = ANY(@TemplateStageIds) 
        //                            AND auditId = ANY(@AuditIds)
        //                            AND (Status = @CompletedStatus OR Status = @ApprovedStatus)";
        //        await connection.ExecuteAsync(updateQuery, new
        //        {
        //            TemplateStageIds = templateStageId.ToArray(),
        //            AuditIds = auditId.ToArray(),
        //            SuccessStatus = (long)TemplateStageApprovalENum.Success,
        //            CompletedStatus = (long)TemplateStageApprovalENum.Completed,
        //            ApprovedStatus = (long)TemplateStageApprovalENum.Approved
        //        }).ConfigureAwait(false);
        //        var xmlpath = await _lobRepo.DownloadFile(result).ConfigureAwait(false);
        //        if (string.IsNullOrWhiteSpace(xmlpath) || !File.Exists(xmlpath))
        //        {
        //            throw new FileNotFoundException("Downloaded XML file not found.", xmlpath);
        //        }
        //        // Read the downloaded file into a memory stream
        //        var memoryStream = new MemoryStream();
        //        using (var fileStream = new FileStream(xmlpath, FileMode.Open, FileAccess.Read))
        //        {
        //            await fileStream.CopyToAsync(memoryStream).ConfigureAwait(false);
        //        }
        //        memoryStream.Position = 0; 
        //        return memoryStream;
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new ArgumentException($"An error occurred in UpdateTemplateStatus: {ex.Message}", ex);
        //    }
        //
        // }
        public async Task UpdateTemplateStatus(IEnumerable<long> templateStageId, IEnumerable<long> auditId)
        {
            try
            {
                using var connection = this.GetConnection();
                var templateStageIdList = string.Join(",", templateStageId);
                var auditIdList = string.Join(",", auditId);
                var query = $"Update processStages set status = @SuccessStatus WHERE templateStageId IN ({templateStageIdList}) AND auditId IN ({auditIdList}) AND (Status = @CompletedStatus OR Status = @ApprovedStatus)";

                var parameters = new
                {
                    SuccessStatus = (long)TemplateStageApprovalENum.Success,
                    CompletedStatus = (long)TemplateStageApprovalENum.Completed,
                    ApprovedStatus = (long)TemplateStageApprovalENum.Approved
                };

                await connection.ExecuteAsync(query, parameters).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task<Stream> UpdateXML(IEnumerable<long> templateStageId, IEnumerable<long> auditId)
        {
            try
            {
                using var connection = this.GetConnection();

                var query = @"SELECT DISTINCT ON (mao.templateid) mao.templateid, mao.responsejson 
                    FROM processstages AS ps
                    INNER JOIN metricansweroptions mao ON mao.auditid = ps.auditid
                    WHERE ps.templatestageid = ANY(@TemplateStageIds) 
                    AND ps.auditid = ANY(@AuditIds)";

                var parameters = new
                {
                    TemplateStageIds = templateStageId.ToArray(),
                    AuditIds = auditId.ToArray()
                };

                var answerList = (await connection.QueryAsync<dynamic>(query, parameters).ConfigureAwait(false)).ToList();

                if (!answerList.Any())
                {
                    throw new InvalidOperationException("No data found for the provided TemplateStageId and AuditId.");
                }

                var firstItem = answerList.FirstOrDefault();
                string assessmentId = firstItem != null && ((IDictionary<string, object>)firstItem).ContainsKey("templateid")
                    ? ((IDictionary<string, object>)firstItem)["templateid"]?.ToString() ?? "Unknown"
                    : "Unknown";

                string xmlFileName = $"XmlData{assessmentId}";
                var responseJsonList = answerList.Select(item => (string)((IDictionary<string, object>)item)["responsejson"]).ToList();

                string result = await GenerateAndValidateXml(responseJsonList, xmlFileName).ConfigureAwait(false);

                if (result.Contains("Error"))
                {
                    throw new InvalidOperationException($"XML Generation and Validation failed: {result}");
                }

                var xmlpath = await _lobRepo.DownloadFile(result).ConfigureAwait(false);

                if (string.IsNullOrWhiteSpace(xmlpath) || !File.Exists(xmlpath))
                {
                    throw new FileNotFoundException("Downloaded XML file not found.", xmlpath);
                }

                // Read the downloaded file into a memory stream
                var memoryStream = new MemoryStream();
                using (var fileStream = new FileStream(xmlpath, FileMode.Open, FileAccess.Read))
                {
                    await fileStream.CopyToAsync(memoryStream).ConfigureAwait(false);
                }

                memoryStream.Position = 0;
                return memoryStream;
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"An error occurred in UpdateTemplateStatus: {ex.Message}", ex);
            }
        }

        public async Task<string> GenerateAndValidateXml(IEnumerable<string> responseJsonList, string fileName)
        {
            try
            {
                var xmlContent = GenerateXmlContent(responseJsonList);

                if (!await ValidateXml(xmlContent))
                {
                    throw new InvalidOperationException("XML is not valid according to the XSD schema.");
                }

                string blobFileName = fileName + ".xml";

                using (var stream = new MemoryStream(Encoding.UTF8.GetBytes(xmlContent)))
                {
                    var azureConnection = _configuration["AzureBlobStorageKey"];
                    var containerName = _configuration["UploadFiles"];

                    var blobServiceClient = new BlobServiceClient(azureConnection);
                    var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                    var blobClient = containerClient.GetBlobClient(blobFileName);

                    await blobClient.UploadAsync(stream, overwrite: true).ConfigureAwait(false);

                    return $"{blobClient.Uri}";
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error during XML generation and validation: {ex.Message}", ex);
            }
        }

        public async Task UpdateApprovalStatus(IEnumerable<long> templateStageId, IEnumerable<long> auditId)
        {
            try
            {
                using var connection = this.GetConnection();
                var templateStageIdList = string.Join(",", templateStageId);
                var auditIdList = string.Join(",", auditId);
                var query = $"Update processStages set status = @SuccessStatus WHERE templateStageId IN ({templateStageIdList}) AND auditId IN ({auditIdList}) AND Status = @CompletedStatus";

                var parameters = new
                {
                    SuccessStatus = (long)TemplateStageApprovalENum.Approved,
                    CompletedStatus = (long)TemplateStageApprovalENum.Completed
                };

                await connection.ExecuteAsync(query, parameters).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task UpdateApproval(IEnumerable<long> processIds, IEnumerable<long> templateIds)
        {
            try
            {
                using var connection = this.GetConnection();
                var processIdList = string.Join(",", processIds);
                var templateIdList = string.Join(",", templateIds);
                var query = $@" UPDATE templatestages SET Status = @SuccessStatus  WHERE ProcessId IN ({processIdList}) AND TemplateId IN ({templateIdList}) AND Status = @CompletedStatus";

                var parameters = new
                {
                    SuccessStatus = (long)TemplateStageApprovalENum.Approved,
                    CompletedStatus = (long)TemplateStageApprovalENum.Completed
                };

                await connection.ExecuteAsync(query, parameters).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task<bool> IsPublisher()
        {
            try
            {
                var roleIdString = await _userContext.GetRoleId().ConfigureAwait(true);

                if (roleIdString.Split(',').Select(a => long.Parse(a)).ToList().Contains((long)RoleEnum.Auditor))
                {
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        // public async Task<List<TemplateStagesDto>> ListPublishresponseJson()
        // {
        //    using var connection = this.GetConnection();
        //    var roleIdString = await _userContext.GetRoleId();
        //    var roleIds = roleIdString.Split(',').Select(long.Parse).ToList();

        // if (roleIds.Contains((long)RoleEnum.QAManager))
        //    {
        //        var result = await connection.QueryAsync<TemplateStagesDto>($"select ts.id, ts.stagelevel,ts.approverId, ts.processId, ts.templateId, ts.roleid, pr.name as processname, c.name As ComplianceName, ps.templateStageId, ps.Status, ps.auditid as AuditId, ca.name as AuditName, mao.responseJson  " +
        //            $"from processStages ps " +
        //            $"INNER JOIN templatestages AS ts ON ts.id = ps.templateStageId " +
        //            $"JOIN metricAnswerOptions AS mao ON mao.processId = ts.processId " +
        //            $"INNER JOIN process as pr on pr.id = ts.processid " +
        //            $"INNER JOIN createaudit ca ON ca.id = ps.auditid " +
        //            $"INNER JOIN Compliance AS c ON c.id = pr.complianceId " +
        //            $"where ts.isActive = true AND ts.auditroleId IN ({roleIdString})");

        // return result.ToList().DistinctBy(a => a.Id).ToList();
        //    }

        // throw new Exception("No Datas Found");
        // }
        public async Task<List<TemplateStagesDto>> ListPublishresponse(long auditId)
        {
            try
            {
                using var connection = this.GetConnection();

                var query = @"
                            SELECT DISTINCT ON (ps.Id) 
                ps.Id, 
                    tg.id AS templateid, 
                ps.status, 
                ps.templatestageid, 
                ps.auditid,  
                ts.roleid, 
                p.name AS processName, 
                p.id AS processId, 
                ts.templateId, 
                ca.periodId, 
                ts.approverid, 
                ts.auditroleid, 
                ca.name AS AuditName, 
                ps.querystatus, 
                    tg.metricgroupid,
                mao.responseJson 
            FROM processstages AS ps
            LEFT JOIN templatestages ts ON ps.templatestageId = ts.id
            INNER JOIN process p ON ts.processId = p.id
                LEFT JOIN templategroup tg ON tg.templateid = ts.templateid 
            INNER JOIN createaudit ca ON ps.auditid = ca.id
            INNER JOIN metricansweroptions mao ON ts.templateid = mao.templateid
                WHERE ps.auditid = @auditId
                ORDER BY ps.Id, ts.templateId; 
                ";

                var result = await connection.QueryAsync<TemplateStagesDto>(query, new { auditId }).ConfigureAwait(false);

                return result.DistinctBy(a => a.TemplateStageId).ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<TemplateStagesDto>> ListAuditResponse()
        {
            try
            {
                using var connection = this.GetConnection();

                var result = await connection.QueryAsync<TemplateStagesDto>($"select ps.Id, ps.status, ps.templatestageid, ps.auditid, ts.roleid, r.name as rolename, p.name as processName, p.id as processId, ts.templateId, ca.periodId, " +
                    $"ts.approverid, ts.auditroleid, p.name as processName, ca.name as AuditName, mao.responseJson from processstages as ps  " +
                    $"INNER JOIN templatestages ts ON ps.templatestageId = ts.id " +
                    $"INNER JOIN process p ON ts.processId = p.id " +
                    $"INNER JOIN createaudit ca ON ps.auditid = ca.id " +
                    $"INNERR JOIN role as r ON r.id = ts.roleid " +
                    $"INNER JOIN metricansweroptions mao ON ps.auditId = mao.auditId " +
                    $"where  ps.isActive = true AND ps.status = {(long)TemplateStageApprovalENum.Success}").ConfigureAwait(true);

                return result.ToList().DistinctBy(a => a.TemplateStageId).ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<TemplateStages>> GetAllApprovalListTemplateStages()
        {
            try
            {
                using var connection = this.GetConnection();
                var roleID = await _userContext.GetRoleId().ConfigureAwait(true);

                if (int.TryParse(roleID, out var parsedRoleID) && parsedRoleID == (int)RoleEnum.QAManager)
                {
                    var query = (await connection.QueryAsync<TemplateStages>($"SELECT * FROM templatestages WHERE status = {TemplateStageApprovalENum.Completed}").ConfigureAwait(true)).ToList();
                    var parsedRoleIds = roleID.Split(',').Select(long.Parse).ToList();
                    var filteredList = query.Where(a => parsedRoleIds.Contains((long)a.Status)).ToList();

                    return filteredList;
                }
                else
                {
                    throw new DataException("Please give the Correct roled");
                }
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task CreateQueries(Queries queries)
        {
            try
            {
                using var connection = this.GetConnection();
                var action = this.GetAction<Queries>();
                var status = (long)TemplateStageApprovalENum.QueryRaised;
                if (queries.Status is null)
                {
                    await action.AddOrUpdate(queries).ConfigureAwait(false);
                }

                await connection.ExecuteAsync($"UPDATE processstages SET Querystatus = {status} WHERE auditId = {queries.AuditId} AND id = {queries.ProcessstageId}").ConfigureAwait(false);
                await connection.ExecuteAsync($"UPDATE processstages SET status = {(long)TemplateStageApprovalENum.Pending} WHERE auditId = {queries.AuditId} AND id = {queries.ProcessstageId}").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task EditQueries(long id, string response, long processstageid, long auditId)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryFirstOrDefaultAsync<int?>($"Select id from queries where processstageid = {processstageid} and auditId = {auditId}").ConfigureAwait(true);
                await connection.ExecuteAsync($"UPDATE processstages SET Querystatus = {(long)TemplateStageApprovalENum.Responded} WHERE id = {processstageid} and auditId = {auditId}").ConfigureAwait(true);
                await connection.ExecuteAsync($"Update queries set response = '{response}' where id = {data}").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<dynamic>> GetQueriesstatus()
        {
            try
            {
                using var connection = this.GetConnection();
                var roleIdString = await _userContext.GetRoleId().ConfigureAwait(true);
                var roleIds = roleIdString.Split(',').Select(long.Parse).ToList();
                var query = $"select ca.name as auditname,qr.assignedto as roleid, qr.auditid, qr.templatestageid, qr.processstageid, qr.response,qr.querydescription,qr.id, ps.querystatus from Queries as qr " +
                    $"join createaudit as ca on qr.auditid = ca.id " +
                    $"join processstages as ps on qr.processstageid = ps.id " +
                    $" where qr.assignedto = {roleIdString}";
                var data = await connection.QueryAsync<dynamic>(query).ConfigureAwait(true);
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException("An error occurred while fetching query status: " + ex.Message);
            }
        }

        public async Task<List<dynamic>> GetViewQueries(int id)
        {
            try
            {
                using var connection = this.GetConnection();
                var query = "select ca.name as auditname,qr.assignedto as roleid ,qr.response,qr.querydescription,qr.auditid, qr.templatestageid, ps.querystatus from Queries as qr " +
                    $"join createaudit as ca on qr.auditid = ca.id " +
                    $"join processstages as ps on qr.processstageid = ps.id " +
                    $"where qr.id = {id} ";
                var data = await connection.QueryAsync<dynamic>(query).ConfigureAwait(true);
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException("An error occurred while fetching query status: " + ex.Message);
            }
        }

        public async Task<List<AssessmentStageDto>> GetAssessmentStage()
        {
            try
            {
                using var connection = this.GetConnection();
                var roleIdString = await _userContext.GetRoleId().ConfigureAwait(true);
                var roleIds = roleIdString.Split(',').Select(long.Parse).ToList();

                var query = await connection.QueryAsync<AssessmentStageDto>($"select ass.id, ass.roleid, ass.templateid, t.name as TemplateName from Assessment as ass " +
                    $"join template as t on ass.templateid = t.id " +
                    $"WHERE ass.roleid = ({roleIdString}) order by ass.id").ConfigureAwait(true);
                return query.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task UpdateAssesmentGroupStatus()
        {
            try
            {
                using var connection = this.GetConnection();
                var audit = await connection.QueryAsync<int?>("SELECT id FROM createaudit WHERE CAST(enddate AS DATE) = @todaysDate", new { todaysDate = DateTime.Now.Date }).ConfigureAwait(true);
                await connection.ExecuteAsync($"UPDATE processstages SET status = {(long)TemplateStageApprovalENum.Expired}, reason = 'End date exceeded for Audit.' WHERE auditid = ANY(@items) and status != {(long)TemplateStageApprovalENum.Success}", new { items = audit }).ConfigureAwait(false);
            }
            catch (Exception e)
            {
                throw new ArgumentException(e.Message);
            }
        }

        public async Task RaiseIssue(AuditIssue issue)
        {
            try
            {
                using var connection = this.GetConnection();
                var action = this.GetAction<AuditIssue>();
                if (issue.StartDate >= DateTime.Now.Date)
                {
                    issue.IssueStatus = IssueStatusEnum.Pending.ToString();
                    await action.AddOrUpdate(issue).ConfigureAwait(false);
                    await connection.ExecuteAsync($"Update processstages Set status = {(long)TemplateStageApprovalENum.Pending} where auditid ={issue.AuditId} ").ConfigureAwait(false);
                }
                else
                {
                    throw new HandledException("The Issue Start Date must be today's date.");
                }
            }
            catch (Exception e)
            {
                throw new ArgumentException(e.Message);
            }
        }

        public async Task IssueWarning()
        {
            try
            {
                using var connection = this.GetConnection();
                var auditId = await connection.QueryAsync<int?>("select auditid from auditissue where CAST(enddate AS DATE) = @endDate", new { endDate = DateTime.Now.Date }).ConfigureAwait(true);

                await connection.ExecuteAsync(@"UPDATE auditissue SET issuestatus = @ExpiredStatus WHERE auditid = ANY(@AuditIds) AND issuestatus != @CompletedStatus", new
                {
                    ExpiredStatus = IssueStatusEnum.Expired.ToString(),
                    CompletedStatus = IssueStatusEnum.Completed.ToString(),
                    AuditIds = auditId.ToArray()
                }).ConfigureAwait(false);
            }
            catch (Exception e)
            {
                throw new ArgumentException(e.Message);
            }
        }

        private string GenerateXmlContent(IEnumerable<string> responseJsonList)
        {
            XNamespace inCapmktNs = "https://www.sebi.gov.in/xbrl/2024-04-30/in-capmkt";

            XElement rootElement = new XElement(inCapmktNs + "MetricAnswerOptionsList",
                new XAttribute(XNamespace.Xmlns + "in-capmkt", inCapmktNs));

            foreach (var jsonString in responseJsonList)
            {
                XElement responseElement = ParseJsonToXml(jsonString, inCapmktNs);
                rootElement.Add(responseElement);
            }

            return rootElement.ToString();
        }

        private XElement ParseJsonToXml(string responseJson, XNamespace inCapmktNs)
        {
            try
            {
                var doc = JsonDocument.Parse(responseJson);
                XElement responseJsonElement = new XElement(inCapmktNs + "ResponseJson");

                foreach (var property in doc.RootElement.EnumerateObject())
                {
                    string sanitizedName = SanitizeXmlName(property.Name);
                    string value = property.Value.ToString();

                    // Ensure empty values have an explicit open and close tag
                    responseJsonElement.Add(new XElement(inCapmktNs + sanitizedName, value == string.Empty ? " " : value));
                }

                return responseJsonElement;
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"JSON parsing error: {ex.Message}");
                return new XElement(inCapmktNs + "InvalidJson");
            }
        }

        private string SanitizeXmlName(string name)
        {
            string sanitized = Regex.Replace(name, @"[^\w\-]", "_");

            if (!char.IsLetter(sanitized[0]) && sanitized[0] != '_')
            {
                sanitized = "_" + sanitized;
            }

            return sanitized;
        }

        private async Task<bool> ValidateXml(string xmlContent)
        {
            try
            {
                var wordFileLink = await _cache.FindAppSettings("GeneratedXsd").ConfigureAwait(false);
                if (wordFileLink == null || string.IsNullOrWhiteSpace(wordFileLink.Value))
                {
                    throw new FileNotFoundException("XSD file link not found in configuration.");
                }

                var wordFilePath = await _lobRepo.DownloadFile(wordFileLink.Value).ConfigureAwait(false);
                if (string.IsNullOrWhiteSpace(wordFilePath) || !File.Exists(wordFilePath))
                {
                    throw new FileNotFoundException("XSD Schema file not found after download.");
                }

                // Load the XSD schema
                var schemaSet = new XmlSchemaSet();
                schemaSet.Add(null, wordFilePath);

                var settings = new XmlReaderSettings
                {
                    ValidationType = ValidationType.Schema,
                    Schemas = schemaSet
                };

                // Validate the XML against the schema
                using (var reader = XmlReader.Create(new StringReader(xmlContent), settings))
                {
                    while (reader.Read())
                    {
                    }
                }

                return true;
            }
            catch (XmlSchemaValidationException ex)
            {
                Console.WriteLine($"Validation error: {ex.Message}");
                return false;
            }
        }
    }
}
