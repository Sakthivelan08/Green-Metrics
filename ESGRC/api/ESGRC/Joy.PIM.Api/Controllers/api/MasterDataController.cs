using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NuGet.Protocol.Core.Types;

namespace ESGRC.Api.Controllers.Api;

[Route("/api/[controller]/[action]")]
public class MasterDataController : BaseApiController
{
    private readonly IDbCache _cache;
    private readonly IMasterData _masterData;

    public MasterDataController(IDbCache cache, IMasterData masterData)
    {
        _cache = cache;
        _masterData = masterData;
    }

    [HttpPost]
    public async Task<IActionResult> AddMasterData([FromBody] JsonElement entity, [FromQuery] string tableName)
    {
        if (string.IsNullOrEmpty(tableName))
        {
            return BadRequest(new ApiResponse<string>
            {
                Code = 400,
                Message = "Invalid request data",
                HasError = true
            });
        }

        try
        {
            var entityDict = JsonSerializer.Deserialize<Dictionary<string, object>>(entity.GetRawText());
            bool isInserted = await _masterData.AddMasterDataAsync(entityDict, tableName);

            var response = new ApiResponse<bool>
            {
                Code = isInserted ? 200 : 500,
                Message = isInserted ? "Data inserted successfully" : "Insertion failed",
                HasError = !isInserted,
                Result = isInserted
            };

            return isInserted ? new OkObjectResult(response) : new ObjectResult(response) { StatusCode = 500 };
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<string>
            {
                Code = 500,
                Message = "An error occurred",
                Detail = ex.Message,
                HasError = true
            });
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddOrUpdateMasterData([FromBody] JsonElement entity, [FromQuery] string tableName)
    {
        if (string.IsNullOrEmpty(tableName))
        {
            return BadRequest(new ApiResponse<string>
            {
                Code = 400,
                Message = "Invalid request data: Table name is required",
                HasError = true
            });
        }

        try
        {
            // Deserialize the JSON entity into a dictionary
            var entityDict = JsonSerializer.Deserialize<Dictionary<string, object>>(entity.GetRawText());

            if (entityDict == null || entityDict.Count == 0)
            {
                return BadRequest(new ApiResponse<string>
                {
                    Code = 400,
                    Message = "Invalid request data: Empty entity",
                    HasError = true
                });
            }

            // Call the repository method to insert or update data
            bool isInserted = await _masterData.AddOrUpdateMasterDataAsync(entityDict, tableName);

            var response = new ApiResponse<bool>
            {
                Code = isInserted ? 200 : 500,
                Message = isInserted ? "Data inserted/updated successfully" : "Operation failed",
                HasError = !isInserted,
                Result = isInserted
            };

            return isInserted ? new OkObjectResult(response) : new ObjectResult(response) { StatusCode = 500 };
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponse<string>
            {
                Code = 500,
                Message = "An error occurred",
                Detail = ex.Message,
                HasError = true
            });
        }
    }

    [HttpGet]
    public async Task<IActionResult> DownloadMasterDataAsExcel(long masterDataID, string name)
    {
        var fileData = await _masterData.DownloadMasterDataAsExcel(masterDataID);
        if (fileData == null || fileData.Length == 0)
        {
            return NotFound();
        }

        return File(fileData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{name}.xlsx");
    }

    [HttpGet]
    public async Task<IActionResult> DownloadMasterDataTemplate(long masterDataID, string name)
    {
        var file = await _masterData.DownloadMasterDataTemplate(masterDataID);
        return File(file,
        $"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{name}.xlsx");
    }

    [HttpPost]

    public async Task UploadMasterDataTemplate(IFormFile file, long masterDataId)
    {
        await _masterData.UploadMasterDataTemplate(file, masterDataId);
    }
}
