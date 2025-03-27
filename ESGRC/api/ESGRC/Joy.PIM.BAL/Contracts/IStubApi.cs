using System.Collections.Generic;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Contracts;

public interface IStubApi
{
    Task DataIngestion();

    Task<List<Dictionary<string, object>>> GetMetricJsonList(long? metricgroupid);

    Task ConversionFormula();

    Task TimeDimensionCalculation();

    Task<List<Dictionary<string, object>>> GetTimeDimensionCalculationList(long metricGroupId);
}
