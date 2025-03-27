using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class GetMetricGroup
    {
        public string? Label { get; set; }

        public string Name { get; set; }

        public long? MetricCount { get; set; }

        public long GroupId { get; set; }

        public long? ComplianceId { get; set; }

        public long? Industry { get; set; }

        public string? IndustryName { get; set; }

        public long Regulationtypeid { get; set; }

        public long? RegulationCount { get; set; }

        public long? ParentId { get; set; }

        public bool? IsHierarchy { get; set; }
    }
}