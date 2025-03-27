using System.Collections.Generic;
using System.Threading.Tasks;
using Aspose.Words.Lists;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class AuditController : BaseApiController
    {
        private readonly IAuditRepo _auditRepo;

        public AuditController(IAuditRepo auditRepo)
        {
            _auditRepo = auditRepo;
        }

        [HttpPost]
        public async Task AddorUpdateAudit([FromBody] Createaudit model)
        {
            await _auditRepo.AddorUpdateAudit(model);
        }

        [HttpGet]
        public async Task<List<CreateauditDto>> GetAllAudit()
        {
          return await _auditRepo.GetAllAudit();
        }

        [HttpGet]
        public async Task<List<Createaudit>> GetByAuditId(int auditId)
        {
          return await _auditRepo.GetByAuditId(auditId);
        }

        [HttpPost]
        public async Task AddOrUpdatePeriod([FromBody] Period model)
        {
            await _auditRepo.AddOrUpdatePeriod(model);
        }

        [HttpGet]
        public async Task<List<Period>> GetAllPeriod()
        {
            return await _auditRepo.GetAllPeriod();
        }

        [HttpGet]
        public async Task<List<Period>> GetPeriodById(long id)
        {
            return await _auditRepo.GetPeriodById(id);
        }

        [HttpPost]
        public async Task AddOrUpdateFiscalYear([FromBody] FiscalYear model)
        {
            await _auditRepo.AddOrUpdateFiscalYear(model);
        }

        [HttpGet]
        public async Task<List<FiscalYear>> GetAllFiscalYear()
        {
            return await _auditRepo.GetAllFiscalYear();
        }
    }
}
