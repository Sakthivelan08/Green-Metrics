using System.Collections.Generic;
using System.IO;
using System.Reflection.Metadata;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.App;
using Joy.PIM.BAL.Model.Template;
using Joy.PIM.BAL.Model.Uid;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;

namespace Joy.PIM.BAL.Contracts
{
    public interface IDbCache
    {
        Task<IEnumerable<T>> GetMaster<T>()
            where T : Entity;

        Task Clear();

        Task ClearUserCache(long userId);

        Task<AppUser> GetUser(long userId);

        Task<AppUser> GetUserFromEmail(string userEmail);

        Task<AppConfiguration> GetAppConfiguration();

        Task<IEnumerable<LabelModel>> GetAllLabels(long? languageId);

        Task<int> GetMaxFileSize();

        Task<AppSettings> FindAppSettings(string key);

        Task<IEnumerable<AppSettings>> GetAppSettings();

        Task<List<KeyValuePair<string, string>>> GetMaster(string attrLookupTable, string attrLookupTableColumn);

        Task<List<TemplateMapping>> GetTemplateMappings(long id);

        Task<IEnumerable<string>> GetApprovedPlanoOrFamilyNames(long divisionId);

        Task<IEnumerable<long>> GetDeptCode();

        Task<IEnumerable<string>> GetCode();

        Task<IEnumerable<string>> Purchasetype();

        Task<IEnumerable<string>> Pricegrouping();

        Task<IEnumerable<string>> Productpurpose();

        Task<IEnumerable<string>> Productpicture();

        Task<IEnumerable<long>> Planocode();

        Task<List<Template>> GetTemplates();

        Task<List<Template>> GetUserTemplates();
    }
}