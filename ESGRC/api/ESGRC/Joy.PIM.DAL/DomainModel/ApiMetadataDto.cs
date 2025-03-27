using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL.DomainModel
{
    public class ApiMetadataDto : Entity
    {
        public string BaseUrl { get; set; } = null!;

        public string Name { get; set; } = null!;

        public string? SecretKeyName { get; set; } = null!;

        public Dictionary<string, string>? SecretValue { get; set; } = null!;
    }
}
