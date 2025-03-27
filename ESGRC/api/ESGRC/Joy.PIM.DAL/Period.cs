using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class Period : Entity
    {
        public string Month { get; set; }

        public long FiscalYearId { get; set; }

        public long Quatter { get; set; }

        public string YearName { get; set; }
    }
}
