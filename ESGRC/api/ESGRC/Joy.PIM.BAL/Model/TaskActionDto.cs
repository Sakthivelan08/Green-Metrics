using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class TaskActionDto
    {
        public string? Description { get; set; }

        public DateTimeOffset? PlannedStartDate { get; set; }

        public DateTimeOffset? PlannedEndDate { get; set; }

        public DateTimeOffset? ActualStartDate { get; set; }

        public DateTimeOffset? ActualEndDate { get; set; }

        public long? Status { get; set; }

        public long? ObjectId { get; set; }

        public string? ObjectName { get; set; }

        public string? RegulationName { get; set; }

        public string? MetricName { get; set; }

        public string? Id { get; set; }
    }
}
