using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Model
{
    public class UploadedFileDataDto : Entity
    {
        public long UploadedFileId { get; set; }

        public Dictionary<string, object>? ColumnData { get; set; }

        public string? Status { get; set; }

        public long? Appuserid { get; set; }

        public bool? IsForm { get; set; }

        public string? RejectedComments { get; set; }

        public long? AssessmentId { get; set; }

        public long? AuditId { get; set; }

        public long? TemplateStageId { get; set; }
    }
}
