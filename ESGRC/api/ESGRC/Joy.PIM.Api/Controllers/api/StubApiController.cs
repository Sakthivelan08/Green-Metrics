using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.CommonWeb;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api;

[Route("/api/[controller]/[action]")]
public class StubApiController : BaseApiController
{
    private readonly IStubApi _stubApi;

    public StubApiController(IStubApi stubApi)
    {
        _stubApi = stubApi;
    }

    [HttpPost]
    
    public async Task DataIngestion()
    {
        await _stubApi.DataIngestion();
    }

    [HttpGet]

    public async Task<List<Dictionary<string, object>>> GetMetricJsonList(long? metricgroupid)
    {
        return await _stubApi.GetMetricJsonList(metricgroupid);  
    }

    [HttpPost]

    public async Task ConversionFormula()
    {
        await _stubApi.ConversionFormula();
    }

    [HttpPost]

    public async Task TimeDimensionCalculation()
    {
        await _stubApi.TimeDimensionCalculation();
    }

    [HttpGet]

    public async Task<List<Dictionary<string, object>>> GetTimeDimensionCalculationList(long metricGroupId)
    {
        return await _stubApi.GetTimeDimensionCalculationList(metricGroupId);
    }
}
