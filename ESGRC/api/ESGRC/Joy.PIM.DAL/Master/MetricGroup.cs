using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL.Master
{
    public class MetricGroup : MasterEntity
    {
        public string Label { get; set; }

        public string Name { get; set; }

        public long? ComplianceId { get; set; }

        public long? Industry { get; set; }

        public long? ParentId { get; set; }

        public bool? IsHierarchy { get; set; }
    }
}
