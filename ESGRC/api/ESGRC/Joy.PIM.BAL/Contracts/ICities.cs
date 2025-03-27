using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.DAL;
using Microsoft.AspNetCore.Mvc;

namespace Joy.PIM.BAL.Contracts
{
    public interface ICities
    {
        Task CreateCities([FromBody] Cities model);

        Task<List<NewCities>> GetCities();

        Task<IEnumerable<GeoGraphy>> GetCity();

        Task ActivateCity(long id);

        Task ActivateCityBatch(long[] ids);

        Task DeactivateCity(long id);

        Task DeactivateCitiesBatch(long[] ids);
    }
}
