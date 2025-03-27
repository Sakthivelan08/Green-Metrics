using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Implementations.FileProcessor;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Microsoft.AspNetCore.Mvc;

namespace ESGRC.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class UploadFileController : BaseApiController
    {
        private readonly IuploadFileManager _uploadFileManager;
        private readonly IBlobRepo _blobRepo;
        private readonly IDbCache _cache;
        private readonly IUserContext _context;

        public UploadFileController(IuploadFileManager manager, IBlobRepo blobRepo,  IDbCache cache, IUserContext context)
        {
            _uploadFileManager = manager;
            _blobRepo = blobRepo;
            _cache = cache;
            _context = context;
        }

        [HttpGet]
        public async Task<string> GetAuthorizedUrlForWrite(string fileName)
        {
            return await _blobRepo.GetPublicAccessWriteUrl(ContainerNames.FileContainer, fileName.ToUniqueFileNameUrl());
        }

        [HttpGet]
        public async Task<string> GetAuthorizedUrlForWriteForUrl(string url)
        {
            return await _blobRepo.GetPublicAccessWriteUrl(url);
        }

        [HttpPost]
        public async Task<List<UploadedFileData>> UploadAndValidateFile([FromBody] UploadedFile file)
        {
            file = await _uploadFileManager.UploadFile(file);
            return await _uploadFileManager.ProcessFile(file);
        }

        [HttpPost]
        public async Task<List<MetricAnswerOptions>> FormUploadAndValidateFile([FromBody] UploadedFile file)
        {
            file = await _uploadFileManager.UploadFile(file);
            return await _uploadFileManager.FromProcessFile(file);
        }

        [HttpPost]
        public async Task<List<MetricStandard>> UploadandValiadMetricstandard([FromBody] UploadedFile file)
        {
            file = await _uploadFileManager.UploadFile(file);
            return await _uploadFileManager.ProcessFile1(file);
        }

        [HttpPost]
        public async Task<List<GoalSetting>> UploadandValiadGoalSettings([FromBody] UploadedFile file)
        {
            file = await _uploadFileManager.UploadFile(file);
            return await _uploadFileManager.ProcessFile2(file);
        }
    }
}
