using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class ProcessStages : Entity
    {
        public long TemplateStageId { get; set; }

        public long? ComplianceId { get; set; }

        public long? GroupId { get; set; }

        public long AuditId { get; set; }

        public string? ResponseJson { get; set; }

        public long Status { get; set; }

        public long? QueryStatus { get; set; }
    }
}
