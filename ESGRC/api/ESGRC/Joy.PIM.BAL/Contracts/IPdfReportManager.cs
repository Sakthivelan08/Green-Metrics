using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Contracts
{
    public interface IPdfReportManager
    {
        Task AddPdfReport(MergeReport model);

        Task<List<MergeReportDto>> GetPdfMerge();
    }
}
