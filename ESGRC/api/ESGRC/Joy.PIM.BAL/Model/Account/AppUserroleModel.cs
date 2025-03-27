using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.Common.MetaAttributes;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Model
{
    public class AppUserRoleModel
    {
        public long AppUserid { get; set; }

        public List<AppUserRoleDomainModel> AppUserRoleDomainModel { get; set; }
    }
}