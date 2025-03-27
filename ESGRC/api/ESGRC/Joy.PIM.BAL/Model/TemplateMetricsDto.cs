using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class TemplateMetricsDto
    {
        public long Id { get; set; }

        public string TemplateName { get; set; }

        public string MetricName { get; set; }

        public long MetricgroupId { get; set; }

        public long MetricId { get; set; }
    }
}
