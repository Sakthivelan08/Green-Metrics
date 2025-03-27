using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class ComplianceController : BaseApiController
    {
        private readonly ICompliance _compliance;

        public ComplianceController(ICompliance compliance)
        {
            _compliance = compliance;
        }

        [HttpPost]
        public async Task CreateCompliance([FromBody] Compliance model)
        {
            await _compliance.AddOrUpdateCompliance(model);
        }

        [HttpGet]
        public async Task<IEnumerable<Compliance>> GetAllActiveCompliance()
        {
            return await _compliance.GetAllActiveCompliance();
        }
    }
}
