using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Aspose.Words.Pdf2Word.FixedFormats;
using ClosedXML.Excel;
using Dapper;
using DocumentFormat.OpenXml.Drawing;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL.DomainModel;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using OfficeOpenXml;
using OfficeOpenXml.Table;

namespace Joy.PIM.BAL.Implementations;

public class MasterDataRepo : IMasterData
{
    private readonly IUserContext _userContext;
    private readonly IDbCache _cache;
    private readonly IDbConnectionFactory _connectionFactory;

    public MasterDataRepo(IDbConnectionFactory connectionFactory, IUserContext userContext, IConfiguration configuration, IDbCache cache)
    {
        _userContext = userContext;
        _connectionFactory = connectionFactory;
        _cache = cache;
    }

    public async Task<bool> AddOrUpdateMasterDataAsync(Dictionary<string, object> entityData, string tableName)
    {
        try
        {
            var idKey = "id";
            tableName = tableName.ToLower();

            // Convert JsonElement values to correct data types
            var processedData = entityData.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value is JsonElement jsonElement ? ConvertJsonElement(jsonElement) : kvp.Value);

            using var connection = this.GetConnection();

            if (!processedData.ContainsKey(idKey) || processedData[idKey] == null || processedData[idKey].ToString() == "0")
            {
                // INSERT Logic
                processedData.Remove(idKey); // Ensure no null Id is passed

                var columns = string.Join(", ", processedData.Keys);
                var parameters = string.Join(", ", processedData.Keys.Select(k => "@" + k));

                var insertQuery = $"INSERT INTO \"{tableName}\" ({columns}) VALUES ({parameters}) RETURNING id;";
                var newId = await connection.ExecuteScalarAsync<int>(insertQuery, processedData);
                return newId > 0;
            }
            else
            {
                // UPDATE Logic
                var updateSet = string.Join(", ", processedData.Keys.Select(k => $"{k} = @{k}"));
                var updateQuery = $"UPDATE {tableName} SET {updateSet} WHERE Id = @Id";

                var affectedRows = await connection.ExecuteAsync(updateQuery, processedData);
                return affectedRows > 0;
            }
        }
        catch (Exception ex)
        {
            throw new Exception($"Error in AddOrUpdateMasterDataAsync: {ex.Message}");
        }
    }

    public async Task<bool> AddMasterDataAsync(Dictionary<string, object> entity, string tableName)
    {
        try
        {
            using var connection = this.GetConnection();
            var convertedEntity = entity.ToDictionary(
            kvp => kvp.Key,
            kvp => kvp.Value is JsonElement jsonElement ? ConvertJsonElement(jsonElement) : kvp.Value);

            var columnNames = string.Join(",", convertedEntity.Keys);
            var parameterNames = string.Join(",", convertedEntity.Keys.Select(key => $"@{key}"));

            var query = $"INSERT INTO {tableName} ({columnNames}) VALUES ({parameterNames})";

            int rowsAffected = await connection.ExecuteAsync(query, convertedEntity);

            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            throw new Exception($"Error inserting data into {tableName}: {ex.Message}");
        }
    }

    public async Task<byte[]> DownloadMasterDataAsExcel(long masterDataID)
    {
        try
        {
            using var connection = this.GetConnection();
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Sheet1");

            switch (masterDataID)
            {
                case 1:
                    var currencymaster = await connection.QueryAsync<CurrencyDto>("SELECT name, description FROM currency");
                    LoadDataAndAddTable(worksheet, currencymaster);
                    break;
                case 2:
                    var businessmaster = await connection.QueryAsync<BusinessUnitDto>("SELECT name, description FROM businessunits");
                    LoadDataAndAddTable(worksheet, businessmaster);
                    break;
                case 3:
                    var orgmaster = await connection.QueryAsync<OrganizationDto>("SELECT name, description FROM organizations");
                    LoadDataAndAddTable(worksheet, orgmaster);
                    break;
                case 4:
                    var languagemaster = await connection.QueryAsync<LanguageDto>("SELECT name, description FROM language");
                    LoadDataAndAddTable(worksheet, languagemaster);
                    break;
                case 5:
                    var facilitymaster = await connection.QueryAsync<FacilityDto>("SELECT name, description FROM facility");
                    LoadDataAndAddTable(worksheet, facilitymaster);
                    break;
                case 6:
                    var departmentmaster = await connection.QueryAsync<DepartmentDto>("SELECT name, description FROM department");
                    LoadDataAndAddTable(worksheet, departmentmaster);
                    break;
                default:
                    throw new Exception("MasterData Not Found");
            }

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }
        catch
        {
            throw;
        }
    }

    public async Task<byte[]> DownloadMasterDataTemplate(long masterDataID)
    {
        try
        {
            using var connection = this.GetConnection();
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Sheet1");

            var query = masterDataID switch
            {
                1 => "SELECT name, description FROM currency WHERE 1=0",
                2 => "SELECT name, description FROM businessunits WHERE 1=0",
                3 => "SELECT name, description FROM organizations WHERE 1=0",
                4 => "SELECT name, description FROM language WHERE 1=0",
                5 => "SELECT name, description FROM facility WHERE 1=0",
                6 => "SELECT name, description FROM department WHERE 1=0", // Fixed typo
                _ => throw new Exception("MasterData Not Found")
            };

            var tableName = masterDataID switch
            {
                1 => "currency",
                2 => "businessunits",
                3 => "organizations",
                4 => "language",
                5 => "facility",
                6 => "department",
                _ => throw new Exception("MasterData Not Found")
            };

            var tableColumnMappings = new Dictionary<long, (string TableName, List<string> Columns)>
            {
                { 1, ("currency", new List<string> { "name", "description" }) },
                { 2, ("businessunits", new List<string> { "name", "description" }) },
                { 3, ("organizations", new List<string> { "name", "description" }) },
                { 4, ("language", new List<string> { "name", "description" }) },
                { 5, ("facility", new List<string> { "name", "description" }) },
                { 6, ("department", new List<string> { "name", "description" }) }
            };

            if (!tableColumnMappings.TryGetValue(masterDataID, out var tableInfo))
            {
                throw new Exception("MasterData Not Found");
            }

            var columnNames = await GetColumnNamesFromQuery(connection, tableInfo.TableName, tableInfo.Columns);
            if (columnNames.Any())
            {
                LoadHeaders(worksheet, columnNames);
            }

            using var memoryStream = new MemoryStream();
            workbook.SaveAs(memoryStream);
            return memoryStream.ToArray();
        }
        catch
        {
            throw;
        }
    }

    public async Task UploadMasterDataTemplate(IFormFile file, long masterDataId)
    {
        try
        {
            using var connection = this.GetConnection();
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);
            var rowCount = worksheet.LastRowUsed().RowNumber();
            var columnCount = worksheet.LastColumnUsed().ColumnNumber();

            if (rowCount < 2)
            {
                throw new Exception("The uploaded file is empty or missing data.");
            }

                // ✅ Get column names from the first row
            var columnNames = new List<string>();
            for (int col = 1; col <= columnCount; col++)
            {
                columnNames.Add(worksheet.Cell(1, col).GetString().Trim());
            }

            // ✅ Read data from rows (excluding header row)
            var dataList = new List<Dictionary<string, object>>();
            for (int row = 2; row <= rowCount; row++)
            {
                var rowData = new Dictionary<string, object>();
                for (int col = 1; col <= columnCount; col++)
                {
                    rowData[columnNames[col - 1]] = worksheet.Cell(row, col).GetString().Trim();
                }

                dataList.Add(rowData);
            }

            // ✅ Determine table name based on masterDataId
            string tableName = masterDataId switch
            {
                1 => "currency",
                2 => "businessunits",
                3 => "organizations",
                4 => "language",
                5 => "facility",
                6 => "department",
                _ => throw new Exception("Invalid MasterDataId.")
            };

            // ✅ Insert data into the database dynamically
            foreach (var row in dataList)
            {
                var columnNamesStr = string.Join(", ", row.Keys);
                var parameterNamesStr = string.Join(", ", row.Keys.Select(k => $"@{k}"));
                var insertQuery = $"INSERT INTO {tableName} ({columnNamesStr}) VALUES ({parameterNamesStr})";

                await connection.ExecuteAsync(insertQuery, row);
            }
        }
        catch (Exception ex)
        {
            throw new Exception($"Error processing Excel file: {ex.Message}");
        }
    }

    private async Task<IEnumerable<object>> FetchData(IDbConnection connection, string query, System.Type dtoType)
    {
        // Get the correct QueryAsync<T> method
        var method = typeof(SqlMapper)
            .GetMethods()
            .First(m => m.Name == "QueryAsync" && m.IsGenericMethod && m.GetParameters().Length == 7)
            .MakeGenericMethod(dtoType);

        // Invoke QueryAsync correctly with all required parameters
        var task = (Task)method.Invoke(null, new object[] { connection, query, null, null, null, true, null });
        await task.ConfigureAwait(false);

        // Get the result from the completed task
        var resultProperty = task.GetType().GetProperty("Result");
        return ((IEnumerable<object>)resultProperty.GetValue(task)) ?? Enumerable.Empty<object>();
    }

    private async Task<List<string>> GetColumnNamesFromQuery(IDbConnection connection, string tableName, List<string> requiredColumns)
    {
        var query = @"
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = @TableName 
        AND COLUMN_NAME = ANY(@Columns)";  // ✅ Use ANY() for safety

        var columnNames = (await connection.QueryAsync<string>(query, new { TableName = tableName, Columns = requiredColumns.ToArray() })).ToList();

        // ✅ Preserve the order of requiredColumns
        return requiredColumns.Where(columnNames.Contains).ToList();
    }

    private void LoadHeaders(IXLWorksheet worksheet, List<string> columnNames)
    {
        // Convert column names to CamelCase
        var formattedColumnNames = columnNames.Select(ToCamelCase).ToList();

        for (int i = 0; i < formattedColumnNames.Count; i++)
        {
            worksheet.Cell(1, i + 1).Value = formattedColumnNames[i];
            worksheet.Cell(1, i + 1).Style.Font.Bold = true;
        }

        // Define the table range
        var tableRange = worksheet.Range(1, 1, 1, formattedColumnNames.Count);
        var table = tableRange.CreateTable();

        // Apply table styling
        table.Theme = XLTableTheme.TableStyleLight9;
        table.ShowHeaderRow = true;
        table.ShowAutoFilter = false;

        // Auto-adjust column width
        worksheet.Columns().AdjustToContents();
    }

    // Helper method to convert column names to CamelCase
    private string ToCamelCase(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return input;
        }

        return char.ToUpper(input[0]) + input.Substring(1).ToLower();
    }

    private void LoadDataAndAddTable<T>(IXLWorksheet worksheet, IEnumerable<T> data)
    {
        if (!data.Any())
        {
            return;
        }

        var dataList = data.ToList();

        var properties = typeof(T).GetProperties();
        for (int i = 0; i < properties.Length; i++)
        {
            worksheet.Cell(1, i + 1).Value = properties[i].Name;
            worksheet.Cell(1, i + 1).Style.Font.Bold = true;
        }

        int row = 2;
        foreach (var item in dataList)
        {
            for (int col = 0; col < properties.Length; col++)
            {
                worksheet.Cell(row, col + 1).Value = properties[col].GetValue(item)?.ToString() ?? " ";
            }

            row++;
        }

        var lastColumn = properties.Length;
        var lastRow = row - 1;
        var range = worksheet.Range(1, 1, lastRow, lastColumn);

        var table = range.CreateTable();
        table.Theme = XLTableTheme.TableStyleLight9;
        table.ShowHeaderRow = true;
        table.ShowAutoFilter = false;

        worksheet.Columns().AdjustToContents();
    }

    private string GetWorksheetName(long masterDataID)
    {
        switch (masterDataID)
        {
            case 1:
                return "Currency";
            case 2:
                return "BusinessUnits";
            case 3:
                return "Organizations";
            case 4:
                return "Language";
            case 5:
                return "Facility";
            case 6:
                return "Department";
            default:
                throw new Exception("MasterData not found");
        }
    }

    private object ConvertJsonElement(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.TryGetInt64(out long l) ? l : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null,
            _ => element.ToString() // Fallback for complex objects
        };
    }

    private IDbConnection GetConnection(IDbTransaction transaction = null)
    {
        var connection = _connectionFactory.GetAppDbConnection(transaction);

        if (connection.State != ConnectionState.Open)
        {
            connection.Open();
        }

        return connection;
    }
}
