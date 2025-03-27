using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL.Master;
using Microsoft.Extensions.Configuration;

namespace Joy.PIM.BAL.Implementations
{
    public class ComplianceRepo : PgEntityAction<Compliance>, ICompliance
    {
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public ComplianceRepo(IDbConnectionFactory connectionFactory,
            IUserContext userContext, IConfiguration configuration)
            : base(userContext, connectionFactory, configuration)
        {
            _connectionFactory = connectionFactory;
            _configuration = configuration;
            _userContext = userContext;
        }

        public async Task AddOrUpdateCompliance(Compliance model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name))
                {
                    throw new Exception("Compliance name cannot be empty.");
                }

                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<dynamic>($"select 1 from Compliance where name = '{model.Name}'");
                if (model.Id == 0 && data.Count() > 0)
                {
                    throw new Exception($"Compliance {model.Name} already exists.");
                }

                await this.AddOrUpdate(model);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<Compliance>> GetAllActiveCompliance()
        {
            using var connection = this.GetConnection();
            return await connection.QueryAsync<Compliance>($"select * from Compliance where isactive = true");
        }
    }
}
