using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;

namespace Joy.PIM.DAL
{
    public class Auditresponsedata
    {
        [Editable(true)]

        public string Responsejson { get; set; }
    }
}
