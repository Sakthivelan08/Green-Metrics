using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Contracts
{
    public interface IAuditRepo
    {
        Task AddorUpdateAudit(Createaudit model);

        Task<List<CreateauditDto>> GetAllAudit();

        Task<List<Createaudit>> GetByAuditId(int auditId);

        Task AddOrUpdatePeriod(Period model);

        Task<List<Period>> GetAllPeriod();

        Task<List<Period>> GetPeriodById(long id);

        Task AddOrUpdateFiscalYear(FiscalYear model);

        Task<List<FiscalYear>> GetAllFiscalYear();
    }
}
