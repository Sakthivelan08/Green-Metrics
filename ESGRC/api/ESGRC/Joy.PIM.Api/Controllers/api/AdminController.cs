using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.CommonWeb;
using Microsoft.AspNetCore.Mvc;

namespace Joy.PIM.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    [MultiplePoliciesAuthorize(Constants.Policies.All)]
    public class AdminController : BaseApiController
    {
        private readonly ILabelManager _labelManager;
        private readonly IDbCache _cache;

        public AdminController(
            ILabelManager labelManager,
            IDbCache cache)
        {
            _labelManager = labelManager;
            _cache = cache;
        }

        [HttpPut]
        public async Task AddOrUpdateLabel([FromBody] LabelModel model)
        {
            model.Name = model.Name?.ToUpper();
            await _labelManager.AddOrUpdateLabel(model);
            await _cache.Clear();
        }
    }
}