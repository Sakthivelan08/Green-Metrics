using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class Assessment : Entity
    {
        public string? MetricGroupId { get; set; }

        public string? Name { get; set; }

        public long RoleId { get; set; }

        public long ServiceId { get; set; }

        public long TemplateId { get; set; }
    }
}
