using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class ApiMapping : Entity
    {
        public int IntegrationId { get; set; }

        public string Source { get; set; } = null!;

        public string Destination { get; set; } = null!;
    }
}
