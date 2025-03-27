using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Enum;
using Microsoft.Extensions.Configuration;

namespace Joy.PIM.BAL.Implementations
{
    public class AuditRepo : PgEntityAction<Createaudit>, IAuditRepo
    {
        public AuditRepo(IDbConnectionFactory connectionFactory,
            IUserContext userContext, IConfiguration configuration)
            : base(userContext, connectionFactory, configuration)
        {
        }

        public async Task AddorUpdateAudit(Createaudit model)
        {
            try
            {
                using var connection = this.GetConnection();

                var res = await AddOrUpdate(model).ConfigureAwait(true);

                var stageList = (await connection.QueryAsync<TemplateStages>($"SELECT * FROM templatestages WHERE isActive = true AND ProcessId = @ProcessId", new { ProcessId = model?.AuditingProcess }).ConfigureAwait(true)).ToList();

                foreach (var stage in stageList)
                {
                    await AddProcessStage(new ProcessStages()
                    {
                        TemplateStageId = stage.Id,
                        AuditId = res.Id,
                        ResponseJson = string.Empty,
                        Status = (long)TemplateStageApprovalENum.Pending,
                        QueryStatus = (long)TemplateStageApprovalENum.Yettostart
                    }).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task AddProcessStage(ProcessStages model)
        {
            try
            {
                using var connection = this.GetConnection();
                var stage = this.GetAction<ProcessStages>();
                await stage.AddOrUpdate(model).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        public async Task<List<CreateauditDto>> GetAllAudit()
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<CreateauditDto>($"SELECT * FROM Createaudit ").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        public async Task<List<Createaudit>> GetByAuditId(int auditId)
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<Createaudit>($"select * from Createaudit where id ={auditId}").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        public async Task AddOrUpdatePeriod(Period model)
        {
            try
            {
                using var connection = this.GetConnection();
                var period = this.GetAction<Period>();
                await period.AddOrUpdate(model).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        public async Task<List<Period>> GetAllPeriod()
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<Period>("select * from period order by id desc").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        public async Task<List<Period>> GetPeriodById(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<Period>($"select * from period where id = {id} order by id desc").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        public async Task AddOrUpdateFiscalYear(FiscalYear model)
        {
            try
            {
                using var connection = this.GetConnection();
                var year = this.GetAction<FiscalYear>();
                await year.AddOrUpdate(model).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }

        public async Task<List<FiscalYear>> GetAllFiscalYear()
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<FiscalYear>("select * from fiscalYear order by id desc").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new DataException(ex.Message);
            }
        }
    }
}
