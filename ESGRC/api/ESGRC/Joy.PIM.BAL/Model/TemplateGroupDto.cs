using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Hangfire.Dashboard;
using Joy.PIM.Common;
using Joy.PIM.DAL.Enum;

namespace Joy.PIM.BAL.Model
{
    public class TemplateGroupDto
    {
        public long? MetricId { get; set; }

        public string? Name { get; set; }

        public long? Id { get; set; }

        public long? TemplateId { get; set; }

        public long? ProcessId { get; set; }

        public string? TemplateName { get; set; }

        public long? MetricGroupId { get; set; }

        public string? MetricGroupName { get; set; }

        public ValidationListEnum? DataType { get; set; }

        public string? DataTypeName { get; set; }

        public string? Title { get; set; }

        public string? FormValue { get; set; }

        public string? AssessmentId { get; set; }

        public string? AssessmentName { get; set; }
    }
}
