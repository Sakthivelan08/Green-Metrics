using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;

namespace Joy.PIM.BAL.Contracts
{
    public interface IMasterManager
    {
        Task<IEnumerable<T>> GetAll<T>()
            where T : Entity;

        Task<IEnumerable<AppSettings>> GetAppSettings();

        Task<IEnumerable<T>> Search<T>(bool isActive);

        Task<IEnumerable> GetUserRole(long? appuserId);

        Stream ExportExcelFromJObject(string jsonString);

        Task<List<KeyValuePair<string, string>>> GetMaster(string attrLookupTable, string attrLookupTableColumn);

        Task<IEnumerable<RejectionReason>> GetRejectionReason();

        Task<IEnumerable<GeoGraphy>> GeoGraphyList(long id);
    }
}