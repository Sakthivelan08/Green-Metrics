using System;
using System.Collections.Generic;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Model
{
    public class TemplateStagesDto
    {
        public long? Id { get; set; }

        public string? ProcessName { get; set; }

        public long TemplateId { get; set; }

        public string? TemplateName { get; set; }

        public long? ApproverId { get; set; }

        public long? RoleId { get; set; }

        public long? ActionId { get; set; }

        public long StageLevel { get; set; }

        public long ComplianceId { get; set; }

        public string? ComplianceName { get; set; }

        public long? ProcessId { get; set; }

        public long? TemplateStageId { get; set; }

        public long? Status { get; set; }

        public Dictionary<string, object> ResponseJson { get; set; }

        public long Auditroleid { get; set; }

        public long AuditingProcess { get; set; }

        public long AuditId { get; set; }

        public string AuditName { get; set; }

        public long PeriodId { get; set; }

        public long? Querystatus { get; set; }

        public long? AssessmentGroupId { get; set; }

        public string? AssessmentGroupName { get; set; }

        public DateTime? EndDate { get; set; }

        public string? IssueStatus { get; set; }

        public long MetricGroupId { get; set; }
    }
}