using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class CreateauditDto
    {
        public DateTimeOffset Startdate { get; set; }

        public DateTimeOffset Enddate { get; set; }

        public long Requestedby { get; set; }

        public long AuditingProcess { get; set; }

        public string Name { get; set; }

        public long PeriodId { get; set; }

        public string AssessmentGroup { get; set; }

        public string AssessmentGroupName { get; set; }

        public long? Id { get; set; }
    }
}
