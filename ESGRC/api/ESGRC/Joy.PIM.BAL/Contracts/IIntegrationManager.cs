using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.DAL;
using Joy.PIM.DAL.DomainModel;

namespace Joy.PIM.BAL.Contracts
{
    public interface IIntegrationManager
    {
        Task AddOrUpdateApiMetadata(ApiMetadataDto apiMetadata);

        Task<List<ApiMetadataDto>> GetApiMetadata();

        Task AddOrUpdateApiIntegration(ApiIntegration apiIntegration);

        Task<List<ApiIntegration>> GetApiIntegration();

        Task AddOrUpdateApiMapping(ApiMapping apiMapping);

        Task<List<ApiMapping>> GetApiMapping();

        // Task AutoFillAtrributeCall(UploadTemplateOrForm uploadTemplateOrForm);
        // Task<List<string>> GetSourceColumns(long integerationId);
    }
}
