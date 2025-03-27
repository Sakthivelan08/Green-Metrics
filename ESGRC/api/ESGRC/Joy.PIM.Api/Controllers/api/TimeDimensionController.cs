using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Implementations;
using Joy.PIM.BAL.Model;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class TimeDimensionController : BaseApiController
    {
        private readonly ITimeDimension _timeDimension;

        public TimeDimensionController(ITimeDimension timeDimension)
        {
            _timeDimension = timeDimension;
        }

        [HttpPost]
        public async Task CreateTimeDimension([FromBody] CalculationProcess calculationmodel)
        {
            await _timeDimension.CreateTimeDimension(calculationmodel);
        }

        [HttpPost]
        public async Task AddOrUpdateTimeDimension([FromBody] TimeDimension dimensionmodel)
        {
            await _timeDimension.AddOrUpdateTimeDimension(dimensionmodel);
        }

        [HttpPut]
        public async Task UpdateFormula(long id, long timeDimensionId, string formula)
        {
            await _timeDimension.UpdateFormula(id, timeDimensionId, formula);
        }

        [HttpGet]
        public async Task<string> CalculateNewFormula(long timeDimensionId)
        {
            return await _timeDimension.CalculateNewFormula(timeDimensionId);
        }

        [HttpGet]
        public async Task<IEnumerable<CalculationProcessDto>> GetTimeDimentionalformula()
        {
            return await _timeDimension.GetTimeDimentionalformula();
        }

        [HttpGet]
        public async Task<List<Metric>> GetControlList()
        {
            return await _timeDimension.GetControlList();
        }

        [HttpGet]
        public async Task<List<dynamic>> ExcelDataView(long metricgroupId, long year, long month)
        {
            return await _timeDimension.ExcelDataView(metricgroupId, year, month);
        }

        [HttpGet]
        public async Task<List<Dataingestion>> GetYear()
        {
            return await _timeDimension.Getyear();
        }

        [HttpGet]

        public async Task<List<Dictionary<string, object>>> GetTotalJson(long metricgroupId, long year, long timeDimension, long? quarterId)
        {
            return await _timeDimension.GetTotalJson(metricgroupId, year, timeDimension, quarterId);
        }
    }
}
