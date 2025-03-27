using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;

namespace Joy.PIM.DAL
{
    public class Template : Entity
    {
        public string? Name { get; set; }

        [Editable(false)]
        [IgnoreInsert]
        [IgnoreSelect]
        [IgnoreUpdate]
        public long[]? RoleIds { get; set; }

        public string? Description { get; set; }

        public long? MetricGroupId { get; set; }

        [Editable(false)]
        [IgnoreInsert]
        [IgnoreSelect]
        [IgnoreUpdate]
        public long? AppUserId { get; set; }

        public bool? IsSFTP { get; set; }
    }
}
