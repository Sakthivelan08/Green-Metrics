using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class ApiMetadata : Entity
    {
        public string BaseUrl { get; set; } = null!;

        public string SecretKey { get; set; } = null!;

        public string Name { get; set; } = null!;
    }
}
