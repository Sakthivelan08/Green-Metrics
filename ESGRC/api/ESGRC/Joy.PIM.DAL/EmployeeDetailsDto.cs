using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class EmployeeDetailsDto
    {
        public long TotalEmployeeCount { get; set; }

        public long Male { get; set; }

        public long Female { get; set; }

        public long Employee { get; set; }

        public long Contract { get; set; }

        public string BusinessUnit { get; set; }
    }
}
