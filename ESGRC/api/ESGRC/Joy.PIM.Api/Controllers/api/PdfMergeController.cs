using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Implementations;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class PdfMergeController : BaseApiController
    {
        private readonly IPdfMerger _pdfMerger;

        public PdfMergeController(IPdfMerger pdfMerger)
        {
            _pdfMerger = pdfMerger;
        }

        [HttpPost]
        public async Task AddPdfReport([FromBody] PdfReports model)
        {
            await _pdfMerger.AddPdfReport(model);
        }

        [HttpPost]
        public async Task AddAirEmissionPdfReport([FromBody] AirEmissionReport model)
        {
            await _pdfMerger.AddAirEmissionPdfReport(model);
        }

        [HttpGet]
        public async Task<List<PdfReports>> GetAllPdfReports()
        {
           return await _pdfMerger.GetAllPdfReports();
        }

        [HttpGet]
        public async Task<List<AirEmissionReport>> GetAllAirEmissionPdfReports()
        {
            return await _pdfMerger.GetAllAirEmissionPdfReports();
        }

        [HttpGet]
        public async Task<IActionResult> PdfMergerByBlob(long year, long fiscalyearid, long quarterid, long reportid)
        {
            var result = await _pdfMerger.PdfMergerByBlob(year, fiscalyearid, quarterid, reportid);
            if (result is FileStreamResult fileStreamResult)
            {
                return fileStreamResult;
            }

            return NotFound("PDF not found");
        }

        [HttpGet]
        public async Task<IActionResult> PdfGHIReport(long reportid)
        {
            var result = await _pdfMerger.PdfGHIReport(reportid);
            if (result is FileStreamResult fileStreamResult)
            {
                return fileStreamResult;
            }

            return NotFound("PDF not found");
        }

        [HttpGet]
        public async Task<IActionResult> PdfMergerByAirBlob(long metricgroupId, long year, long timeDimension, long? quarterId)
        {
            var result = await _pdfMerger.PdfMergerByAirBlob(metricgroupId, year, timeDimension, quarterId);
            if (result is FileStreamResult fileStreamResult)
            {
                return fileStreamResult;
            }

            return NotFound("PDF not found");
        }
    }
}
