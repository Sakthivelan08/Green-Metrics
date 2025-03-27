using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class FiscalYear : Entity
    {
        public long Year { get; set; } 

        public string StartMonth { get; set; }

        public string EndMonth { get; set; }
    }
}
