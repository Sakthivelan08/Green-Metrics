using System;

namespace Joy.PIM.DAL
{
    public class AuditIssue : Entity
    {
        public long? AuditId { get; set; }

        public string? IssueReason { get; set; }

        public long? AssignedTo { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string? IssueStatus { get; set; }
    }
}
