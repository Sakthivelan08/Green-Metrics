using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class MetricStandardDto
    {
        public long Id { get; set; }

        public long YearId { get; set; }

        public string YearName { get; set; }

        public Dictionary<string, object>? StandardJson { get; set; }

        public long UploadedFileid { get; set; }
    }
}
