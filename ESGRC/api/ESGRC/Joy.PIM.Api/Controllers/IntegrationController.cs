using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.DomainModel;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class IntegrationController : BaseApiController
    {
        private readonly IIntegrationManager _integManager;

        public IntegrationController(IIntegrationManager integManager)
        {
            _integManager = integManager;
        }

        [HttpPost]
        public async Task AddOrUpdateApiMetadata([FromBody] ApiMetadataDto apiMetadata)
        {
            await _integManager.AddOrUpdateApiMetadata(apiMetadata);
        }

        [HttpGet]
        public async Task<List<ApiMetadataDto>> GetApiMetadata()
        {
            return await _integManager.GetApiMetadata();
        }

        [HttpPost]
        public async Task AddOrUpdateApiIntegration([FromBody] ApiIntegration apiIntegration)
        {
            await _integManager.AddOrUpdateApiIntegration(apiIntegration);
        }

        [HttpGet]
        public async Task<List<ApiIntegration>> GetApiIntegration()
        {
            return await _integManager.GetApiIntegration();
        }

        [HttpPost]
        public async Task AddOrUpdateApiMapping([FromBody] ApiMapping apiMapping)
        {
            await _integManager.AddOrUpdateApiMapping(apiMapping);
        }

        [HttpGet]
        public async Task<List<ApiMapping>> GetApiMapping()
        {
            return await _integManager.GetApiMapping();
        }

        // [HttpGet]
        // public async Task<List<string>> GetSourceColumns(long integerationId)
        // {
        //    return await _integManager.GetSourceColumns(integerationId);
        // }
    }
}