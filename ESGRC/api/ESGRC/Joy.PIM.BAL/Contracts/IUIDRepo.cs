using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.Uid;
using Joy.PIM.Common;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Contracts
{
    public interface IUIDManager
    {
        Task<bool> IsAlreadyExist(string planogramOrFamilyName);

        Task<T> GetPreviewInfo<T>(long workFlowRunId, string tableName);

        Task<List<PlanagromRecortList>> GetPlanogramApprovalListAsync(string roleId, string divisionid);

        Task<List<PlanagromRecortList>> GetPlanogramListAsync();

        Task<Stream> GetPlanogramApprovalListAsync(bool isGetAll, DateTime? startDate, DateTime? endDate);

        Task<Stream> UIDExcel(UidSearchModel uidSearchModel);

        Task<List<PlanagromRecortList>> UidSearchByCriteria(UidSearchModel uidSearchModel);

        Task<EmailContentModel> EmailContent(long userid);

        Task<string> SendEmail();

        Task<IEnumerable<string>> GetApprovedPlanoOrFamilyNames(long divisionId);

        Task<IEnumerable<long>> GetDeptCode();

        Task<IEnumerable<string>> GetCode();

        Task<IEnumerable<string>> Purchasetype();

        Task<IEnumerable<string>> Pricegrouping();

        Task<IEnumerable<string>> Productpurpose();

        Task<IEnumerable<string>> Productpicture();

        Task<IEnumerable<long>> Planocode();

        Task UpdateRejectedName(string[] name);
    }
}
