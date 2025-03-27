using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class Queries : Entity
    {
        public long? Processname { get; set; }

        public long? Assignedto { get; set; }

        public string? Querydescription { get; set; }

        public string? Response { get; set; }

        public long? Status { get; set; }

        public bool? IsChangeNeeded { get; set; }

        public long? AuditId { get; set; }

        public long? TemplatestageId { get; set; }

        public long? ProcessstageId { get; set; }
    }
}
