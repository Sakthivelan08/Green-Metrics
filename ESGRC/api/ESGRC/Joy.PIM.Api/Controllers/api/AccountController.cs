using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.Account;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.CommonWeb;
using Microsoft.AspNetCore.Mvc;

namespace Joy.PIM.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    public class AccountController : BaseApiController
    {
        private readonly IUserManager _userManager;
        private readonly IUserContext _context;

        public AccountController(IUserManager userManager, IUserContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<string>> Authenticate([FromBody] LoginViewModel model)
         {
            model.IpAddress = this._context.GetIpAddress();
            return await _userManager.Authenticate(model);
        }

        [HttpGet]
        public async Task<MeModel> Me()
        {
            return await _userManager.GetCurrentUser();
        }
    }
}