using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class ComplianceStageDto
    {
        public long TemplateId { get; set; }

        public string TemplateName { get; set; }

        public long ComplianceId { get; set; }

        public string ComplianceName { get; set; }

        public long RoleId { get; set; }

        public long ProcessId { get; set; }

        public long AuditingProcess { get; set; }

        public string AuditName { get; set; }

        public long StageLevel { get; set; }

        public long? AuditId { get; set; }

        public long? TemplatestageId { get; set; }

        public long Status { get; set; }

        public long AuditStatus { get; set; }

        public long PeriodId { get; set; }

        public long? AssessmentId { get; set; }

        public string? Reason { get; set; }

        public string? IssueReason { get; set; }

        public long? MetricGroupId { get; set; }
    }
}
