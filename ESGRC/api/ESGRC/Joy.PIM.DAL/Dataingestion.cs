using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class Dataingestion : Entity
    {
        public long? TimeDimension { get; set; }

        public long? Uom { get; set; }

        public Dictionary<string, object>? Data { get; set; }

        public string? Conversionformulae { get; set; }

        public long? MetricgroupId { get; set; }

        public Dictionary<string, object>? Calculatedjson { get; set; }

        public Dictionary<string, object>? TimeDimensionData { get; set; }

        public long? Month { get; set; }

        public long? Year { get; set; }

        public Dictionary<string, object>? Total { get; set; }
    }
}
