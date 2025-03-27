using System.Security.Claims;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model.Account;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Contracts
{
    public interface IAuthenticationProvider
    {
        Task<AppUser> GenerateToken(LoginViewModel request);

        ClaimsPrincipal ValidateToken(string token);

        Task RegisterUsers(AppUser[] users);
    }
}