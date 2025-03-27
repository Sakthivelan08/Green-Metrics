using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.DAL.Master;

namespace Joy.PIM.BAL.Contracts
{
    public interface ICompliance
    {
        Task AddOrUpdateCompliance(Compliance model);

        Task<IEnumerable<Compliance>> GetAllActiveCompliance();
    }
}
