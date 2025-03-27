using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Implementations;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.Geo;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class PdfReportController : BaseApiController
    {
        private readonly IPdfReportManager _pdfReportManager;

        public PdfReportController(IPdfReportManager pdfReportManager)
        {
            _pdfReportManager = pdfReportManager;
        }

        [HttpPost]
        public async Task AddPdfReport([FromBody] MergeReport model)
        {
            await _pdfReportManager.AddPdfReport(model);
        }

        [HttpGet]
        public async Task<List<MergeReportDto>> GetPdfMerge()
        {
            return await _pdfReportManager.GetPdfMerge();
        }
    }
}
