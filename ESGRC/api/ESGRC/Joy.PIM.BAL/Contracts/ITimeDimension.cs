using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;

namespace Joy.PIM.BAL.Contracts
{
    public interface ITimeDimension
    {
        Task CreateTimeDimension(CalculationProcess calculationmodel);

        Task AddOrUpdateTimeDimension(TimeDimension dimensionmodel);

        Task UpdateFormula(long id, long timeDimensionId, string formula);

        Task<IEnumerable<CalculationProcessDto>> GetTimeDimentionalformula();

        Task<string> CalculateNewFormula(long timeDimensionId);

        Task<List<Metric>> GetControlList();

        Task<List<dynamic>> ExcelDataView(long metricgroupId, long year, long month);

        Task<List<Dataingestion>> Getyear();

        Task<List<Dictionary<string, object>>> GetTotalJson(long metricgroupId, long year, long timeDimension, long? quarterId);
    }
}
