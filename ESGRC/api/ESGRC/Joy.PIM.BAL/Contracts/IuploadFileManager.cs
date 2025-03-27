using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Contracts
{
    public interface IuploadFileManager
    {
        Task<UploadedFile> UploadFile(UploadedFile file, IDbTransaction transaction = null);

        Task<List<UploadedFileData>> ProcessFile(UploadedFile file);

        Task<List<MetricAnswerOptions>> FromProcessFile(UploadedFile file);

        Task<List<MetricStandard>> ProcessFile1(UploadedFile file);

        Task<List<GoalSetting>> ProcessFile2(UploadedFile file);

        Task<(DataTable DataTable, List<string> Errors)> ValidationForMetricAnswerOption(UploadedFile file);

        Task<DataTable> ValidationForUploadexcel(UploadedFile file);
    }
}
