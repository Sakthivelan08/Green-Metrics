using System.Data;
using Joy.PIM.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Joy.PIM.Common
{
    public class NpgSqlConnectionFactory : IDbConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public NpgSqlConnectionFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection GetAppDbConnection(IDbTransaction transaction)
        {
            return new SafeNpgsqlConnection(_configuration["ConnectionString"], transaction);
        }

        public IDbConnection GetTenantDbHostConnection(IDbTransaction transaction)
        {
            return new SafeNpgsqlConnection(_configuration["TenantDB"], transaction);
        }

        public IDbConnection GetDbConnection(string connectionString)
        {
            return new SafeNpgsqlConnection(connectionString);
        }
    }
}