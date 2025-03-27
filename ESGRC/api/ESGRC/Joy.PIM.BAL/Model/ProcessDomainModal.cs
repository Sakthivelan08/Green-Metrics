using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class ProcessDomainModal
    {
        public long Id { get; set; }

        public string ComplianceName { get; set; }

        public long ComplianceId { get; set; }

        public string Description { get; set; }

        public string Name { get; set; }

        public long Code { get; set; }
    }
}
