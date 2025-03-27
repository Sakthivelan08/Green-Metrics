using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class TemplateGroup : Entity
    {
        public long TemplateId { get; set; }

        public long MetricGroupId { get; set; }
    }
}
