using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class DataingestionDto
    {
        public long? TimeDimension { get; set; }

        public long? Uom { get; set; }

        public string? Data { get; set; }

        public string? Conversionformulae { get; set; }

        public long? MetricgroupId { get; set; }

        public Dictionary<string, object>? Calculatedjson { get; set; }

        public Dictionary<string, object>? TimeDimensionData { get; set; }

        public long? Month { get; set; }

        public long? Year { get; set; }

        public string? MetricGroupName { get; set; }

        public Dictionary<string, object>? Total { get; set; }

        public long? MonthId { get; set; }

        public string? MonthName { get; set; }
    }
}
