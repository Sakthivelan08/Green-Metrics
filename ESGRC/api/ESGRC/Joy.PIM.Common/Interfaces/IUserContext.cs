using System.Threading.Tasks;

namespace Joy.PIM.Common.Interfaces
{
    public interface IUserContext
    {
        Task<long> GetUserId();

        Task<long> GetDepartmentId();

        Task<string> GetDepartmentIds();

        Task<string> GetRoleId();

        Task<bool> IsAuthorized();

        Task<string> GetUserEmail();

        Task<string> GetName();

        string GetIpAddress();
    }
}