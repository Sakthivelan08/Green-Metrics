using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Joy.PIM.BAL.Implementations
{
    public class CitiesRepo : PgEntityAction<Cities>, ICities
    {
        public CitiesRepo(IDbConnectionFactory connectionFactory,
            IUserContext userContext, IConfiguration configuration)
            : base(userContext, connectionFactory, configuration)
        {
        }

        public async Task CreateCities([FromBody] Cities model)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<dynamic>($"select 1 from Cities where city = '{model?.City}'").ConfigureAwait(true);
                _ = !data.Any() ? await AddOrUpdate(model).ConfigureAwait(false) : throw new HandledException("City Already Exists");

                // model = await this.AddOrUpdate(model);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }   
        }

        public async Task<List<NewCities>> GetCities()
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<NewCities>($"SELECT * FROM Cities where isActive = true").ConfigureAwait(true);
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<IEnumerable<GeoGraphy>> GetCity()
        {
            try
            {
                using var connection = this.GetConnection();
                var cities = await connection.QueryAsync<GeoGraphy>($"SELECT g.name,g.id FROM geography g LEFT JOIN locationtype lt ON lt.id = g.locationtypeid WHERE lt.id = 5 and g.isactive = true").ConfigureAwait(true);
                return cities;
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task ActivateCity(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<Cities>("select * from cities where id = @id", new { id }).ConfigureAwait(true);

                if (!data.Any())
                {
                    throw new HandledException(code: 400, message: "no data found with this id");
                }

                await connection.ExecuteScalarAsync<Cities>($"update cities set isactive = true where id = @id", new
                {
                    id
                }).ConfigureAwait(false);
                connection.Close();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task ActivateCityBatch(long[] ids)
        {
            try
            {
                if (ids == null || ids.Length == 0)
                {
                    throw new ArgumentException("No IDs provided.");
                }

                foreach (long id in ids)
                {
                    await ActivateCity(id).ConfigureAwait(true);
                }
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task DeactivateCity(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<Cities>("select * from Cities where id = @id", new { id }).ConfigureAwait(true);

                if (!data.Any())
                {
                    throw new HandledException(code: 400, message: "no data found with this id");
                }

                await connection.ExecuteScalarAsync<Cities>($"update Cities set isactive = false where id = @id", new
                {
                    id
                }).ConfigureAwait(false);
                connection.Close();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task DeactivateCitiesBatch(long[] ids)
        {
            try
            {
                if (ids == null || ids.Length == 0)
                {
                    throw new ArgumentException("No IDs provided.");
                }

                foreach (long id in ids)
                {
                    await DeactivateCity(id).ConfigureAwait(true);
                }
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }
    }
}
