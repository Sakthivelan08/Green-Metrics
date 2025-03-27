using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class AssessmentDto
    {
        public long Id { get; set; }

        public string AssessmentName { get; set; }

        public string RoleName { get; set; }

        public string MetricgroupName { get; set; }

        public string ServiceName { get; set; }

        public long? TemplateId { get; set; }

        public string TemplateName { get; set; }
    }
}
