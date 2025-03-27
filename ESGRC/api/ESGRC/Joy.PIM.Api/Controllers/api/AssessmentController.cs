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
    public class AssessmentController : BaseApiController
    {
        private readonly IAssessment _assessment;

        public AssessmentController(IAssessment assessment)
        {
            _assessment = assessment;
        }

        [HttpPost]
        public async Task CreateServices([FromBody] Service model)
        {
            await _assessment.CreateServices(model);
        }

        [HttpPost]
        public async Task CreateAssessment([FromBody] Assessment model)
        {
            await _assessment.CreateAssessment(model);
        }

        [HttpGet]
        public async Task<IEnumerable<AssessmentDto>> GetAssessments()
        {
            return await _assessment.GetAssessments();
        }

        [HttpGet]
        public async Task<IEnumerable<Service>> GetServicesAssessment()
        {
            return await _assessment.GetServicesAssessment();
        }

        [HttpGet]
        public async Task<IEnumerable<Assessment>> GetAssessmentList()
        {
            return await _assessment.GetAssessmentList();
        }
    }
}
