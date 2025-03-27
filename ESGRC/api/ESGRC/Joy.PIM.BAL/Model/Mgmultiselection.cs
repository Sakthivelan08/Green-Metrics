using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Model
{
    public class Mgmultiselection : Entity
    {
        public long? Id { get; set; }

        public long MetricId { get; set; }

        public long MetricgroupId { get; set; }
    }
}
