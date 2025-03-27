using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class MetricAnswerOptionDto
    {
        public long Id { get; set; }

        public Dictionary<string, object>? ResponseJson { get; set; }

        // public string? Title { get; set; }
        public long? TemplateId { get; set; }

        public long? MetricGroupId { get; set; }

        public long ProcessId { get; set; }

        public long? Status { get; set; }

        public long AuditId { get; set; }

        public long? AssessmentId { get; set; }

        public long? UploadedFileId { get; set; }
    }
}
