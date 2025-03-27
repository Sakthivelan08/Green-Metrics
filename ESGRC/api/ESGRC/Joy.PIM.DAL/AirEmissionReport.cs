using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class AirEmissionReport : Entity
    {
        public string? Guid { get; set; }

        public string? ReportName { get; set; }

        public long? PageNumber { get; set; }

        public string? Url { get; set; }

        public string? Type { get; set; }
    }
}
