using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class ApiIntegration : Entity
    {
        public int ApiId { get; set; }

        public string Path { get; set; } = null!;

        public string Type { get; set; } = null!;

        public string Parameter { get; set; } = null!;
    }
}
