using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.DAL.Enum;

namespace Joy.PIM.BAL.Model
{
    public class ValidationDomainModel
    {
        public ValidationListEnum Type { get; set; }

        public object Input { get; set; }
    }
}
