using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.Extensions.Configuration;

namespace Joy.PIM.BAL.Implementations
{
    public class AssessmentRepository : PgEntityAction<Assessment>, IAssessment
    {
        public AssessmentRepository(IDbConnectionFactory connectionFactory,
            IUserContext userContext, IConfiguration configuration)
            : base(userContext, connectionFactory, configuration)
        {
        }

        public async Task CreateServices(Service model)
        {
            try
            {
                using var connection = this.GetConnection();
                if (string.IsNullOrEmpty(model?.Name))
                {
                    throw new HandledException("Name can not be Empty");
                }

                var assData = this.GetAction<Service>();
                await assData.AddOrUpdate(model).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task CreateAssessment(Assessment model)
        {
            try
            {
                if (string.IsNullOrEmpty(model?.Name))
                {
                    throw new HandledException("Name can not be Empty");
                }

                using var connection = this.GetConnection();
                await AddOrUpdate(model).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<AssessmentDto>> GetAssessments()
        {
            try
            {
                using var connection = this.GetConnection();
                var query = await connection.QueryAsync<AssessmentDto>($"SELECT ass.id,ass.name AS AssessmentName, t.id as templateid, string_agg(mg.name, ', ') AS metricgroupname, t.name AS templatename, s.name AS servicename, r.name AS rolename FROM Assessment ass JOIN service s ON s.id = ass.serviceid " +
                    $"JOIN role r ON r.id = ass.roleid JOIN Template t ON t.id = ass.templateid JOIN LATERAL regexp_split_to_table(ass.metricgroupid, ',') AS mg_id ON TRUE JOIN MetricGroup mg ON mg.id = mg_id::BIGINT WHERE ass.isActive = true GROUP BY ass.id, ass.name, t.name, s.name, r.name, t.id").ConfigureAwait(true);
                return query.ToList();
            }
            catch (Exception)
            {
                throw new HandledException("Error when fetching records");
            }
        }

        public async Task<IEnumerable<Service>> GetServicesAssessment()
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<Service>($"select * from service").ConfigureAwait(true);
                return data.ToList();
            }
            catch (Exception)
            {
                throw new HandledException("Error while fecthing the api");
            }
        }

        public async Task<IEnumerable<Assessment>> GetAssessmentList()
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<Assessment>($"select * from Assessment order by id").ConfigureAwait(true);
                return data.ToList();
            }
            catch (Exception)
            {
                throw new HandledException("Error while fecthing the api");
            }
        }
    }
}
