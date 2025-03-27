using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.DomainModel;
using Joy.PIM.DAL.Enum;
using Joy.PIM.DAL.Master;
using Microsoft.Extensions.Configuration;
using NCalc;
using Newtonsoft.Json;

namespace Joy.PIM.BAL.Implementations;

public class PgStubApiManager : PgEntityAction<StubApiModel>, IStubApi
{
    private readonly IDbCache _dbCache;

    public PgStubApiManager(IUserContext userContext, IDbCache dbCache, IDbConnectionFactory connectionFactory, IConfiguration configuration)
            : base(userContext, connectionFactory, configuration)
    {
        _dbCache = dbCache;
    }

    public async Task DataIngestion()
    {
        try
        {
            using var connection = this.GetConnection();
            var metricGroupJson = await _dbCache.FindAppSettings("MetricGroup");
            var metricMapping = JsonConvert.DeserializeObject<List<MetricGroupModel>>(metricGroupJson.JsonValue);
            foreach (var metricGroup in metricMapping)
            {
                long? metricGroupId = metricGroup.Id;
                string metricGroupKey = metricGroup.Key;
                var metrics = await connection.QueryAsync<string?>("select metricsquestion from metric join mgmultiselection on metric.id = mgmultiselection.metricid where mgmultiselection.metricgroupid = @GroupId and metric.regulationtypeid = 4", new { GroupId = metricGroupId });

                var random = new Random();
                var data = metrics
                    .Where(metric => !string.IsNullOrEmpty(metric))
                    .Select(metric =>
                    {
                        var value = metric.Equals("shut down hours", StringComparison.OrdinalIgnoreCase)
                            ? 60
                            : random.Next(100, 10001);
                        return new { Key = metric, Value = value };
                    })
                    .ToDictionary(x => x.Key, x => x.Value);

                var jsonData = Newtonsoft.Json.JsonConvert.SerializeObject(data, Newtonsoft.Json.Formatting.None);
                var timeDimenstion = (long)TimeDimensionEnum.Hours;

                await connection.ExecuteAsync("INSERT INTO dataingestion (data, metricgroupid, timedimension) VALUES (@Data::jsonb, @MetricGroupId , @TimeDimension)", new { Data = jsonData, MetricGroupId = metricGroupId, TimeDimension = timeDimenstion });
                await this.ConversionFormula();
                await this.TimeDimensionCalculation();
            }
        }
        catch (Exception e)
        {
            throw e;
        }
    }

    public async Task ConversionFormula()
    {
        try
        {
            using var connection = this.GetConnection();
            var metricCell = await _dbCache.FindAppSettings("CellValue");
            var cellMapping = JsonConvert.DeserializeObject<List<CellValueModel>>(metricCell.JsonValue);

            var conversionFormula = await _dbCache.FindAppSettings("ConversionFormulae");
            var formulaMapping = JsonConvert.DeserializeObject<List<ConversionFormulaModel>>(conversionFormula.JsonValue);

            var cellAssign = await _dbCache.FindAppSettings("CellMapping");
            var cellAssigning = JsonConvert.DeserializeObject<List<CellMapping>>(cellAssign.JsonValue);

            var cellValues = new Dictionary<string, double>();
            var calculatedValues = new Dictionary<string, double>();
            var mappedResults = new Dictionary<string, double>();

            var controleValues = new Dictionary<string, double>();
            var controlCalculatedValues = new Dictionary<string, double>();
            var controlResults = new Dictionary<string, double>();

            foreach (var value in cellMapping)
            {
                var metricGroup = await connection.QueryAsync<MetricGroup>("select * from metricgroup order by id asc");
                foreach (var group in metricGroup)
                {
                    var metricGroupId = await connection.QueryFirstOrDefaultAsync<long?>(
                        $"SELECT metricgroupid FROM metric " +
                        $"join mgmultiselection on metric.id = mgmultiselection.metricid " +
                        $"join metricgroup on mgmultiselection.metricgroupid = metricgroup.id " +
                        $"WHERE metricsquestion = @Metric and metricgroup.name = @MetricGroupName", new { Metric = value.Metric, MetricGroupName = group.Name });

                    if (metricGroupId.HasValue)
                    {
                        var metricJson = await connection.QueryFirstOrDefaultAsync<Dictionary<string, object>>(
                            $"SELECT data FROM dataingestion WHERE metricgroupid = @MetricGroupId", new { MetricGroupId = metricGroupId });

                        if (metricJson != null && metricJson.TryGetValue(value.Metric, out var metricValue))
                        {
                            if (double.TryParse(metricValue?.ToString(), out var parsedValue))
                            {
                                cellValues[value.Cell] = parsedValue;
                            }
                        }
                    }
                }
            }

            foreach (var formula in formulaMapping)
            {
                var evaluatedFormula = formula.Formula;

                foreach (var cell in cellValues)
                {
                    evaluatedFormula = evaluatedFormula.Replace(cell.Key, cell.Value.ToString());
                }

                var result = EvaluateFormula(evaluatedFormula);
                if (result.HasValue)
                {
                    calculatedValues[formula.Key.ToString()] = result.Value;
                }
            }

            foreach (var assign in cellAssigning)
            {
                var key = assign.Key.ToString();
                if (calculatedValues.TryGetValue(key, out var calculatedValue))
                {
                    mappedResults[assign.Value] = calculatedValue;
                }
            }

            var jsonToUpdate = JsonConvert.SerializeObject(mappedResults);

            var metricGroupIds = await connection.QueryAsync<MetricGroup>("select * from metricgroup");
            var currentMonthDays = DateTime.DaysInMonth(DateTime.UtcNow.Year, DateTime.UtcNow.Month);
            var totalHours = currentMonthDays * 24;
            foreach (var metricGroupId in metricGroupIds)
            {
                var data = await connection.QuerySingleOrDefaultAsync<string>("SELECT data FROM dataingestion WHERE metricgroupid = @MetricGroupId", new { MetricGroupId = metricGroupId.Id });

                var shutdownHours = 0;
                if (!string.IsNullOrEmpty(data))
                {
                    var jsonData = JsonConvert.DeserializeObject<Dictionary<string, object>>(data);

                    if (jsonData != null && jsonData.ContainsKey("shut down hours"))
                    {
                        shutdownHours = Convert.ToInt32(jsonData["shut down hours"]);
                    }
                }

                var workingHours = totalHours - shutdownHours;

                var updatedJson = JsonConvert.DeserializeObject<Dictionary<string, object>>(jsonToUpdate);
                updatedJson["Total no. of hours"] = totalHours;
                updatedJson["Working hrs"] = workingHours;

                var newJsonToUpdate = JsonConvert.SerializeObject(updatedJson);

                var updateQuery = @"UPDATE dataingestion 
                        SET calculatedjson = CAST(@CalculatedJson AS jsonb)  
                        WHERE metricgroupid = @MetricGroupId";

                await connection.ExecuteAsync(updateQuery, new
                {
                    CalculatedJson = newJsonToUpdate,
                    MetricGroupId = metricGroupId.Id
                });
            }

            await this.ControlsCalculation();

            double? EvaluateFormula(string formula)
            {
                try
                {
                    var expression = new Expression(formula);
                    var result = expression.Evaluate();

                    return result is double ? (double)result : Convert.ToDouble(result);
                }
                catch
                {
                    return null;
                }
            }
        }
        catch (Exception e)
        {
            throw e;
        }
    }

    public async Task ControlsCalculation()
    {
        try
        {
            using var connection = this.GetConnection();
            var metricGroupIds = await connection.QueryAsync<MetricGroup>("select * from metricgroup");
            var metricCell = await _dbCache.FindAppSettings("CellValue");
            var cellMapping = JsonConvert.DeserializeObject<List<CellValueModel>>(metricCell.JsonValue);

            var conversionFormula = await _dbCache.FindAppSettings("ConversionFormulae");
            var formulaMapping = JsonConvert.DeserializeObject<List<ConversionFormulaModel>>(conversionFormula.JsonValue);

            var cellAssign = await _dbCache.FindAppSettings("CellMapping");
            var cellAssigning = JsonConvert.DeserializeObject<List<CellMapping>>(cellAssign.JsonValue);

            var controleValues = new Dictionary<string, double>();
            var controlCalculatedValues = new Dictionary<string, double>();
            var controlResults = new Dictionary<string, double>();

            foreach (var value in cellMapping)
            {
                var metricGroup = await connection.QueryAsync<MetricGroup>("select * from metricgroup order by id asc");
                foreach (var group in metricGroup)
                {
                    var metricGroupId = await connection.QueryFirstOrDefaultAsync<long?>(
                        $"SELECT metricgroupid FROM metric " +
                        $"join mgmultiselection on metric.id = mgmultiselection.metricid " +
                        $"join metricgroup on mgmultiselection.metricgroupid = metricgroup.id " +
                        $"WHERE metricsquestion = @Metric and metricgroup.name = @MetricGroupName", new { Metric = value.Metric, MetricGroupName = group.Name });

                    if (metricGroupId.HasValue)
                    {
                        var metricJson = await connection.QueryFirstOrDefaultAsync<Dictionary<string, object>>(
                            $"SELECT calculatedjson FROM dataingestion WHERE metricgroupid = @MetricGroupId", new { MetricGroupId = metricGroupId });

                        if (metricJson != null && metricJson.TryGetValue(value.Metric, out var metricValue))
                        {
                            if (double.TryParse(metricValue?.ToString(), out var parsedValue))
                            {
                                controleValues[value.Cell] = parsedValue;
                            }
                        }
                    }
                }
            }

            foreach (var formula in formulaMapping.Where(f => int.TryParse(f.Key, out var key) && key > 3))
            {
                var evaluatedFormula = formula.Formula;

                foreach (var cell in controleValues)
                {
                    evaluatedFormula = evaluatedFormula.Replace(cell.Key, cell.Value.ToString());
                }

                var result = EvaluateFormula(evaluatedFormula);
                if (result.HasValue)
                {
                    controlCalculatedValues[formula.Key.ToString()] = result.Value;
                }
            }

            foreach (var assign in cellAssigning)
            {
                var key = assign.Key.ToString();
                if (controlCalculatedValues.TryGetValue(key, out var calculatedValue))
                {
                    controlResults[assign.Value] = calculatedValue;
                }
            }

            var controlsjsonToUpdate = JsonConvert.SerializeObject(controlResults);

            foreach (var metricGroup in metricGroupIds)
            {
                var fetchQuery = @"SELECT calculatedjson FROM dataingestion 
                       WHERE metricgroupid = @MetricGroupId";

                var existingJson = await connection.QuerySingleOrDefaultAsync<string>(fetchQuery, new
                {
                    MetricGroupId = metricGroup.Id
                });

                Dictionary<string, object> existingData;

                if (existingJson is not null)
                {
                    existingData = string.IsNullOrEmpty(existingJson.ToString())
                   ? new Dictionary<string, object>()
                   : JsonConvert.DeserializeObject<Dictionary<string, object>>(existingJson.ToString());

                    var newData = JsonConvert.DeserializeObject<Dictionary<string, object>>(controlsjsonToUpdate);

                    foreach (var kvp in newData)
                    {
                        existingData[kvp.Key] = kvp.Value;
                    }

                    var updatedJson = JsonConvert.SerializeObject(existingData);

                    var updateQuery = @"UPDATE dataingestion 
                        SET calculatedjson = CAST(@CalculatedJson AS jsonb)  
                        WHERE metricgroupid = @MetricGroupId";

                    await connection.ExecuteAsync(updateQuery, new
                    {
                        CalculatedJson = updatedJson,
                        MetricGroupId = metricGroup.Id
                    });
                }
            }

            double? EvaluateFormula(string formula)
            {
                try
                {
                    var expression = new Expression(formula);
                    var result = expression.Evaluate();

                    return result is double ? (double)result : Convert.ToDouble(result);
                }
                catch
                {
                    return null;
                }
            }
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }

    public async Task<List<Dictionary<string, object>>> GetMetricJsonList(long? metricgroupid)
    {
        try
        {
            using var connection = this.GetConnection();
            var jsonList = await connection.QueryAsync<(string Data, string CalculatedJson)>(
            "select data, calculatedjson from dataingestion where metricgroupid = @MetricGroupId", new { MetricGroupId = metricgroupid });

            var mergedJsonList = new List<Dictionary<string, object>>();

            foreach (var item in jsonList)
            {
                var dataDict = JsonConvert.DeserializeObject<Dictionary<string, object>>(item.Data);
                var calculatedJsonDict = JsonConvert.DeserializeObject<Dictionary<string, object>>(item.CalculatedJson);

                var mergedDict = dataDict.Concat(calculatedJsonDict)
                                         .GroupBy(kvp => kvp.Key)
                                         .ToDictionary(group => group.Key, group => group.First().Value);

                mergedJsonList.Add(mergedDict);
            }

            return mergedJsonList;
        }
        catch (Exception e)
        {
            throw e;
        }
    }

    public async Task TimeDimensionCalculation()
    {
        try
        {
            using var connection = this.GetConnection();
            var metrics = await connection.QueryAsync<TimeDimensionCalculationModel>("select metricsquestion,formulaefield,metricgroupid from metric m " +
                                                                                     "JOIN mgmultiselection mg on m.id = mg.metricid " +
                                                                                     "where formulaefield is not null");

            var metricResults = new Dictionary<string, decimal>();

            foreach (var metric in metrics)
            {
                var sql = @"SELECT calculatedjson ->> @MetricsQuestion AS MetricValue 
                        FROM dataingestion 
                        WHERE calculatedjson ->> @MetricsQuestion IS NOT NULL 
                        AND metricgroupid = @MetricGroupId";

                var data = await connection.QueryFirstOrDefaultAsync<string>(sql, new { MetricsQuestion = metric.MetricsQuestion, MetricGroupId = metric.MetricGroupId });

                if (decimal.TryParse(data, out var metricValue))
                {
                    var formula = metric.Formulaefield;
                    var calculatedValue = EvaluateFormula(formula, metricValue);

                    metricResults[metric.MetricsQuestion] = calculatedValue;
                }
            }

            var jsonData = System.Text.Json.JsonSerializer.Serialize(metricResults);

            var updateSql = @"UPDATE dataingestion SET timedimensiondata = @JsonData::jsonb WHERE metricgroupid = @MetricGroupId";

            await connection.ExecuteAsync(updateSql, new { JsonData = jsonData, MetricGroupId = metrics.First().MetricGroupId });

            decimal EvaluateFormula(string formula, decimal formValue)
            {
                var expression = formula.Replace("formValue", formValue.ToString());

                var evaluator = new NCalc.Expression(expression);
                return Convert.ToDecimal(evaluator.Evaluate());
            }
        }
        catch (Exception e)
        {
            throw e;
        }
    }

    public async Task<List<Dictionary<string, object>>> GetTimeDimensionCalculationList(long metricGroupId)
    {
        try
        {
            using var connection = this.GetConnection();
            var data = await connection.QueryAsync<Dictionary<string, object>>("select timedimensiondata from dataingestion where metricgroupid = @MetricGroupId", new { MetricGroupId = metricGroupId });
            return data.ToList();
        }
        catch (Exception e)
        {
            throw e;
        }
    }
}
