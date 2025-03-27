using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class MgmultiselectionDto
    {
        public long? Id { get; set; }

        public long MetricId { get; set; }

        public long MetricgroupId { get; set; }

        public string Metricsquestion { get; set; }

        public string TypeName { get; set; }
    }
}
