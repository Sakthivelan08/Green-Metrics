using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Contracts
{
    public interface IXmlFileDownload
    {
        Task<byte[]> GenerateXmlFile(long assessmentid, long auditid);
    }
}
