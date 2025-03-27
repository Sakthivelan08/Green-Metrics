using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;

namespace Joy.PIM.Common.Interfaces
{
    public interface IDataProcess
    {
        Task ApproveOrReject(long id);

        Task<string> FindAppSettings(string configName);

        Task MasterDataUpload(string filePath, long masterId);

        Task<string> ProcessDataFromTemplate(string messageName, bool? returnDataOnly = true);
    }
}
