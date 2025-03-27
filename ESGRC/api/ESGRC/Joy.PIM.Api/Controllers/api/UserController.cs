using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hangfire;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.Tenant;
using Joy.PIM.BAL.Model.Uid;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RbacDashboard.Common.Interface;

namespace Joy.PIM.Api.Controllers.api;

[Route("/api/[controller]/[action]")]
public class UserController : BaseApiController
{
    private readonly IUserManager _userManager;
    private readonly IDbCache _dbCache;
    private readonly IRbacAccessTokenRepository _rbacAccessTokenRepository;
    private readonly IDataProcess _dataProcess;

    public UserController(IUserManager userManager, IDbCache dbCache, IRbacAccessTokenRepository rbacAccessTokenRepository, IDataProcess dataProcess)
    {
        _userManager = userManager;
        _dbCache = dbCache;
        _rbacAccessTokenRepository = rbacAccessTokenRepository;
        _dataProcess = dataProcess;
    }

    [HttpPost]
    public async Task AddOrUpdateUser([FromBody] HyperlinkEdit model)
    {
        await _userManager.AddOrUpdateUser(model);
    }

    [HttpPost]
    public async Task<string> ProcessDataFromTemplate(string messageName)
    {
        await _dataProcess.ProcessDataFromTemplate(messageName, false);
        return "Added Successfully";
    }

    [HttpGet]
    public async Task<List<AppUser>> ActiveUsers()
    {
        return await _userManager.GetAllActiveUsers();
    }

    [HttpGet]
    public async Task<List<AppUser>> InactiveUsers()
    {
        return await _userManager.GetAllInactiveUsers();
    }

    [HttpGet]
    public async Task<SearchResult<UserListItemModel>> SearchUsers(bool isActive)
    {
        return await _userManager.SearchUsers(isActive);
    }

    [HttpGet]
    public async Task<SearchResult<UserListItemModel>> SearchAllUsers(IsActiveFilter isActiveFilter)
    {
        return await _userManager.SearchAllUsers(isActiveFilter);
    }

    [HttpGet]
    public async Task<AppUser> GetUserByEmail(string userEmail)
    {
        return await _userManager.GetUserByEmail(userEmail);
    }

    [HttpPut]
    public async Task UpdateUser(UserListItemModel appUser)
    {
        await _userManager.UpdateUser(appUser);
    }

    [HttpPut]
    public async Task ActivateUser(long id)
    {
        await _userManager.ActivateUser(id);
    }

    [HttpPut]
    public async Task ActivateUserBatch(long[] ids)
    {
        await _userManager.ActivateUserBatch(ids);
    }

    [HttpPut]
    public async Task DeactivateUser(long id)
    {
        await _userManager.DeactivateUser(id);
    }

    [HttpPut]
    public async Task DeactivateUserBatch(long[] ids)
    {
        await _userManager.DeactivateUserBatch(ids);
    }

    [HttpGet]
    public async Task<int> GetUserCount()
    {
        return await _userManager.GetUserCount();
    }

    [HttpPost]
    public async Task AddRole([FromBody] Role model)
    {
        model.Name = model.Name?.ToUpper();
        await _userManager.AddRole(model);
    }

    [HttpPost]
    public async Task AddUserRole([FromBody] AppUserRoleModel model)
    {
        await _userManager.AddUserRole(model);
    }

    [HttpDelete]
    public async Task DeleteDepartmentToUser([FromBody] AppUserRole appUserRole)
    {
        await _userManager.DeleteDepartment(appUserRole);
    }

    [HttpGet]
    public async Task<IEnumerable<string>> ListFilesFromSftp()
    {
        return await _userManager.ListFilesFromSftp();
    }

    [HttpGet]
    public async Task<string> GetAccessDataByToken()
    {
        var result = await this._userManager.GetAccessDataByToken();
        if (!string.IsNullOrEmpty(result))
        {
            var jsonResult = JsonConvert.DeserializeObject<List<Guid>>(result);
            var response = await this._rbacAccessTokenRepository.GetByRoleIds(jsonResult);
            return response;
        }

        return string.Empty;
    }

    [HttpGet]
    public async Task<List<dynamic>> GetAccessDetails()
    {
        return await this._userManager.GetAccessDetails();
    }
}