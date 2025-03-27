using System;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.CommonWeb;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class XmlFileDownlodController : BaseApiController
    {
        private readonly IXmlFileDownload _xmlFileDownload;

        public XmlFileDownlodController(IXmlFileDownload xmlFileDownload)
        {
            _xmlFileDownload = xmlFileDownload;
        }

        [HttpGet]
        public async Task<IActionResult> DownloadXmlFile(long assessmentid, long auditid)
        {
            try
            {
                var fileContent = await _xmlFileDownload.GenerateXmlFile(assessmentid, auditid);
                var fileName = $"MetricData_{auditid}.xml";

                return File(fileContent, "application/xml", fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
