using System.Collections.Generic;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.ExtendedProperties;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Implementations;
using Joy.PIM.BAL.Model;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class CitiesController : BaseApiController
    {
        private readonly ICities _cities;

        public CitiesController(ICities cities)
        {
            this._cities = cities;
        }

        [HttpPost]
        public async Task CreateCities([FromBody] Cities model)
        {
            await _cities.CreateCities(model);
        }

        [HttpGet]
        public async Task<List<NewCities>> GetCities()
        {
            return await _cities.GetCities();
        }

        [HttpGet]
        public async Task<IEnumerable<GeoGraphy>> GetCity()
        {
            return await _cities.GetCity();
        }

        [HttpPut]
        public async Task ActivateCity(long id)
        {
            await _cities.ActivateCity(id);
        }

        [HttpPut]
        public async Task ActivateCityBatch(long[] ids)
        {
            await _cities.ActivateCityBatch(ids);
        }

        [HttpPut]
        public async Task DeactivateCity(long id)
        {
            await _cities.DeactivateCity(id);
        }

        [HttpPut]
        public async Task DeactivateCityBatch(long[] ids)
        {
            await _cities.DeactivateCitiesBatch(ids);
        }
    }
}
