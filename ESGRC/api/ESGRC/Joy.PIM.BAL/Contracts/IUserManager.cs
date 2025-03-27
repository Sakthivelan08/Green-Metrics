using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.Account;
using Joy.PIM.BAL.Model.Dashboard;
using Joy.PIM.BAL.Model.Tenant;
using Joy.PIM.BAL.Model.Uid;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Renci.SshNet.Sftp;

namespace Joy.PIM.BAL.Contracts
{
    public interface IUserManager
    {
        Task AddOrUpdateUser(HyperlinkEdit modelAdminUserModel, long? overrideUserId = null);

        Task<AppUser> Get(long userId);

        Task<AppUser> GetUserByEmail(string userEmail);

        Task<string> Authenticate(LoginViewModel model);

        Task<MeModel> GetCurrentUser();

        Task UpdateUser(UserListItemModel appuser);

        Task<List<TemplateMapping>> GetTemplateMappings(long id);

        Task ActivateUser(long id);

        Task ActivateUserBatch(long[] ids);

        Task DeactivateUser(long id);

        Task DeactivateUserBatch(long[] ids);

        Task<SearchResult<UserListItemModel>> SearchUsers(bool isActive);

        Task<SearchResult<UserListItemModel>> SearchAllUsers(IsActiveFilter isActiveFilter);

        Task<MeModel> Me(long userId);

        Task<int> GetUserCount();

        Task<IEnumerable<ReportCountsModel>> GetRecentLoginHistoryCountDateWise();

        Task<List<AppUser>> GetAllActiveUsers();

        Task<List<AppUser>> GetAllInactiveUsers();

        // Task<string> AddLabel(LabelModel model);
        Task AddRole(Role model);

        Task AddUserRole(AppUserRoleModel model);

        Task DeleteDepartment(AppUserRole appUserRole);

        Task<IEnumerable<string>> ListFilesFromSftp();

        Task<string> GetAccessDataByToken();

        Task<List<dynamic>> GetAccessDetails();
    }
}