using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class TemplateMetrics : Entity
    {
        public long TemplateId { get; set; }

        public long MetricId { get; set; }
    }
}
