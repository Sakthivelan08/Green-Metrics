using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class UploadedFileData : Entity
    {
        public long UploadedFileId { get; set; }

        [Editable(true)]
        public string ColumnData { get; set; }

        public string? Status { get; set; }

        public long? Appuserid { get; set; }

        public bool? IsForm { get; set; }

        public string? RejectedComments { get; set; }

        public long? AssessmentId { get; set; }

        public long? AuditId { get; set; }

        public long? TemplateStageId { get; set; }
    }
}
