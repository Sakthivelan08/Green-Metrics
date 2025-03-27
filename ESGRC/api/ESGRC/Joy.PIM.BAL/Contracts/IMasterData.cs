using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;

namespace Joy.PIM.BAL.Contracts;

public interface IMasterData
{
    Task<bool> AddMasterDataAsync(Dictionary<string, object> entity, string tableName);

    Task<bool> AddOrUpdateMasterDataAsync(Dictionary<string, object> entityData, string tableName);

    Task<byte[]> DownloadMasterDataAsExcel(long masterDataID);

    Task<byte[]> DownloadMasterDataTemplate(long masterDataID);

    Task UploadMasterDataTemplate(IFormFile file, long masterDataId);
}
