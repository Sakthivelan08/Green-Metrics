using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class TemplateStages : Entity
    {
        public long? TemplateId { get; set; }

        public long StageLevel { get; set; }

        public long RoleId { get; set; }

        public long ActionId { get; set; }

        public long? NextStageID { get; set; }

        public long? ApproverId { get; set; }

        public long ProcessId { get; set; }

        public long? Status { get; set; }

        public long Auditroleid { get; set; }

        public long? AssessmentId { get; set; }
    }
}
