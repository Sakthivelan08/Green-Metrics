using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Implementations;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Joy.PIM.BAL
{
    [ExcludeFromCodeCoverage]

    public class RbacApiClient : IRbacApiClient
    {
        private readonly IConfiguration configuration;
        private readonly ICacheHandler cacheHandler;
        private readonly IUserContext userContext;

        public RbacApiClient(IConfiguration configuration, ICacheHandler cacheHandler, IUserContext userContext)
        {
            this.configuration = configuration;
            this.cacheHandler = cacheHandler;
            this.userContext = userContext;
        }

        public RbacApiHttpClient GetClient(IUserContext context = null)
        {
            return new RbacApiHttpClient(configuration, cacheHandler, context);
        }

        public async Task<List<RbacRoles>> GetRbacRoles()
        {
            using var client = GetClient(userContext);
            return await client.GetResponse<List<RbacRoles>>("GET", $"/Master/GetOptions?applicationId={configuration["Rbac:ApplicationId"]}&optionName=role");
        }

        public async Task<string> GetRbacAccessTokenByRoleId(List<string> roleIds)
        {
            using var client = GetClient(userContext);
            return await client.GetResponse<string, string>("POST", $"/AccessToken/GetByRoleId", roleIds);
        }
    }
}
