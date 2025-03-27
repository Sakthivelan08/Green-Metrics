using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class GeoGraphy : Entity
    {
        public string? Name { get; set; }

        public long LocationtypeId { get; set; }

        public long ParentId { get; set; }

        public string? Type_Name { get; set; }
    }
}
