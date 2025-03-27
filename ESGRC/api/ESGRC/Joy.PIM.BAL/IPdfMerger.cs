using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.DAL;
using Microsoft.AspNetCore.Mvc;

namespace Joy.PIM.BAL
{
    public interface IPdfMerger
    {
        Task AddPdfReport(PdfReports model);

        Task AddAirEmissionPdfReport(AirEmissionReport model);

        Task<List<PdfReports>> GetAllPdfReports();

        Task<List<AirEmissionReport>> GetAllAirEmissionPdfReports();

        Task<IActionResult> PdfMergerByBlob(long year, long fiscalyearid, long quarterid, long reportid);

        Task<IActionResult> PdfGHIReport(long reportid);

        Task<IActionResult> PdfMergerByAirBlob(long metricgroupId, long year, long timeDimension, long? quarterId);
    }
}
