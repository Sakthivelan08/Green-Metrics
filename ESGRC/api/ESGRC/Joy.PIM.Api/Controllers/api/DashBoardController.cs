using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model.Dashboard;
using Joy.PIM.Common;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Microsoft.AspNetCore.Mvc;

namespace Joy.PIM.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]
    [MultiplePoliciesAuthorize(Constants.Policies.All)]
    public class DashBoardController : BaseApiController
    {
        private readonly IUserManager _userManager;

        public DashBoardController(IUserManager userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<int> GetUserCount()
        {
            return await _userManager.GetUserCount();
        }

        [HttpGet]
        public async Task<IEnumerable<ReportCountsModel>> GetRecentLoginHistoryCountDateWise()
        {
            return await _userManager.GetRecentLoginHistoryCountDateWise();
        }
    }
}