using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class AuditResponse : Entity
    {
        public long AuditId { get; set; }

        public long PeriodId { get; set; }

        public Dictionary<string, object>? AuditData { get; set; }

        public Dictionary<string, object>? StandardData { get; set; }

        public Dictionary<string, object>? TargetData { get; set; } 
    }
}
