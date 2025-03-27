using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Dapper;
using DocumentFormat.OpenXml.EMMA;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Spreadsheet;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Enum;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.JsonPatch.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Joy.PIM.BAL.Implementations
{
    public class TimeDimensionRepo : PgEntityAction<CalculationProcess>, ITimeDimension
    {
        private readonly IDbCache _cache;
        private readonly IUserContext _userContext;

        public TimeDimensionRepo(IUserContext userContext, IDbConnectionFactory connectionFactory, IConfiguration configuration, IDbCache cache)
            : base(userContext, connectionFactory, configuration)
        {
            _cache = cache;
            _userContext = userContext;
        }

        public async Task CreateTimeDimension(CalculationProcess calculationmodel)
        {
            try
            {
                if (calculationmodel == null)
                {
                    throw new ArgumentNullException(nameof(calculationmodel), "The calculation model cannot be null.");
                }

                using var connection = this.GetConnection();
                calculationmodel.ExcelFormulae = $"{calculationmodel.FormulaInput} * {calculationmodel.FormulaOutput} / 1000000";
                var result = await AddOrUpdate(calculationmodel).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task AddOrUpdateTimeDimension(TimeDimension dimensionmodel)
        {
            try
            {
                using var connection = this.GetConnection();
                var result = this.GetAction<TimeDimension>();
                await result.AddOrUpdate(dimensionmodel).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task<IEnumerable<CalculationProcessDto>> GetTimeDimentionalformula()
        {
            try
            {
                using var connection = this.GetConnection();
                var query = await connection.QueryAsync<CalculationProcessDto>($"select cp.id, cp.formulastandardid, fs.name as formulastandardName, " +
                    $"cp.formulainput, cp.formulaoutput, mi.metricsquestion as FormulainputName, mo.metricsquestion as FormulaoutputName, m.metricsquestion as ChildQuestion, cp.metricid as childquestionid " +
                    $"from calculationprocess as cp " +
                    $"join formulastandards as fs on fs.id = cp.formulastandardid " +
                    $"JOIN metric AS mi ON mi.id = cp.formulainput " +
                    $"JOIN metric AS mo ON mo.id = cp.formulaoutput::bigint " +
                    $"JOIN metric AS m ON m.id = cp.metricid ").ConfigureAwait(true);
                return query.ToList();
            }
            catch (Exception ex)
            {
                throw new ArgumentNullException(ex.Message);
            }
        }

        public async Task UpdateFormula(long id, long timeDimensionId, string formula)
        {
            try
            {
                using var connection = this.GetConnection();

                await connection.ExecuteAsync($"UPDATE metric SET FormulaeField = '{formula}', TimeDimension = {timeDimensionId} WHERE id = {id}").ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public Task<string> CalculateNewFormula(long timeDimensionId)
        {
            try
            {
                string baseValue = "formValue"; // Example base value, replace with your actual logic

                switch (timeDimensionId)
                {
                    case (long)TimeDimensionEnum.Minutes:
                        return Task.FromResult($"{baseValue} * 1");
                    case (long)TimeDimensionEnum.Hours:
                        return Task.FromResult($"{baseValue} * 60");
                    case (long)TimeDimensionEnum.Daily:
                        return Task.FromResult($"{baseValue} * 1440"); // 24 * 60
                    case (long)TimeDimensionEnum.Weekly:
                        return Task.FromResult($"{baseValue} * 10080"); // 7 * 24 * 60
                    case (long)TimeDimensionEnum.Quarterly:
                        return Task.FromResult($"{baseValue} * 40320"); // 3 * 4 * 7 * 24 * 60
                    default:
                        throw new ArgumentOutOfRangeException(nameof(timeDimensionId), "Unsupported time dimension");
                }
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task<List<Metric>> GetControlList()
        {
            try
            {
                using var connection = this.GetConnection();

                return (await connection.QueryAsync<Metric>($"select * from metric where regulationtypeid = {(long)RegulationTypeEnum.Control} ").ConfigureAwait(false)).ToList();
            }
            catch (Exception ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        public async Task<List<dynamic>> ExcelDataView(long metricgroupId, long year, long month)
        {
            try
            {
                using var connection = this.GetConnection();
                var query = @"SELECT di.*, mg.name as metricgroupname FROM dataingestion AS di JOIN metricgroup AS mg ON mg.id = di.metricgroupid WHERE di.metricgroupId = @MetricGroupId AND di.year = @Year AND di.month = @Month";
                var data = await connection.QueryAsync<dynamic>(query, new { MetricGroupId = metricgroupId, Year = year, Month = month }).ConfigureAwait(false);
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<Dataingestion>> Getyear()
        {
            try
            {
                using var connection = this.GetConnection();
                var query = await connection.QueryAsync<Dataingestion>("select year from dataingestion").ConfigureAwait(false);
                return query.ToList().DistinctBy(x => x.Year).ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<Dictionary<string, object>>> GetTotalJson(long metricgroupId, long year, long timeDimension, long? quarterId)
        {
            try
            {
                using var connection = this.GetConnection();

                List<Dictionary<string, object>> result = new List<Dictionary<string, object>>();
                double totalSpecificKgNO = 0;
                double totalSpecificKgPM = 0;
                double totalSpecificKgSO = 0;
                int recordCount = 0;

                if (timeDimension == (long)DataviewDimensionsEnum.Monthly)
                {
                    var data = await connection.QueryAsync<(string Total, long Month)>(
                        "SELECT total::text AS Total, month FROM dataingestion WHERE metricgroupid = @MetricGroupId AND year = @Year",
                        new { MetricGroupId = metricgroupId, Year = year }).ConfigureAwait(false);

                    foreach (var row in data)
                    {
                        var monthName = await connection.QueryFirstOrDefaultAsync<string>(
                            "SELECT name FROM months WHERE id = @Month",
                            new { Month = row.Month }).ConfigureAwait(false);

                        var totalData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(row.Total);

                        if (totalData != null)
                        {
                            totalSpecificKgNO += Convert.ToDouble(((JsonElement)totalData["SpecificKgNO"]).GetDouble());
                            totalSpecificKgPM += Convert.ToDouble(((JsonElement)totalData["SpecificKgPM"]).GetDouble());
                            totalSpecificKgSO += Convert.ToDouble(((JsonElement)totalData["SpecificKgSO"]).GetDouble());
                            recordCount++;

                            totalData["MonthName"] = monthName;
                            result.Add(totalData);
                    }
                }
                }
                else if (timeDimension == (long)DataviewDimensionsEnum.Quarterly)
                {
                    var data = await connection.QueryAsync<(string Total, long Month, long QuarterId)>(
                        "SELECT total::text AS Total, month, quarterid FROM dataingestion WHERE metricgroupid = @MetricGroupId AND year = @Year AND quarterId = @QuarterId",
                        new { MetricGroupId = metricgroupId, Year = year, QuarterId = quarterId }).ConfigureAwait(false);

                    foreach (var row in data)
                    {
                        var monthName = await connection.QueryFirstOrDefaultAsync<string>(
                            "SELECT name FROM months WHERE id = @Month",
                            new { Month = row.Month }).ConfigureAwait(false);

                        var quarterName = await connection.QueryFirstOrDefaultAsync<string>(
                            "SELECT name FROM quatter WHERE id = @QuarterId",
                            new { QuarterId = row.QuarterId }).ConfigureAwait(false);

                        var totalData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(row.Total);

                        if (totalData != null)
                        {
                            totalSpecificKgNO += Convert.ToDouble(((JsonElement)totalData["SpecificKgNO"]).GetDouble());
                            totalSpecificKgPM += Convert.ToDouble(((JsonElement)totalData["SpecificKgPM"]).GetDouble());
                            totalSpecificKgSO += Convert.ToDouble(((JsonElement)totalData["SpecificKgSO"]).GetDouble());
                            recordCount++;

                            totalData["MonthName"] = monthName;
                            totalData["QuarterName"] = quarterName;

                            result.Add(totalData);
                    }
                    }
                }

                if (recordCount > 0)
                {
                    double averageSpecificKgNO = totalSpecificKgNO / recordCount;
                    double averageSpecificKgPM = totalSpecificKgPM / recordCount;
                    double averageSpecificKgSO = totalSpecificKgSO / recordCount;

                    var averageData = new Dictionary<string, object>
                    {
                        { "AverageSpecificKgNO", averageSpecificKgNO },
                        { "AverageSpecificKgPM", averageSpecificKgPM },
                        { "AverageSpecificKgSO", averageSpecificKgSO }
                    };
                    result.Add(averageData);
                }

                var valueFromConfig = await _cache.FindAppSettings("MonthOrder").ConfigureAwait(true);
                var monthMappingsJson = valueFromConfig.JsonValue;

                var rootObject = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(monthMappingsJson);

                var monthOrderJson = rootObject["MonthOrder"];
                var monthOrder = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, int>>(monthOrderJson.GetRawText());

                return result.OrderBy(r =>
                {
                    if (r.TryGetValue("MonthName", out var monthName) && monthOrder.TryGetValue(monthName.ToString(), out var order))
                    {
                        return order;
                    }

                    return int.MaxValue;
                }).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
