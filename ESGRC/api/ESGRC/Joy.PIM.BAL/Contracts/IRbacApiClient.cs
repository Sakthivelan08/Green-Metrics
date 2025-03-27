using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;

namespace Joy.PIM.BAL.Contracts
{
    public interface IRbacApiClient
    {
        Task<List<RbacRoles>> GetRbacRoles();

        Task<string> GetRbacAccessTokenByRoleId(List<string> roleIds);
    }
}
