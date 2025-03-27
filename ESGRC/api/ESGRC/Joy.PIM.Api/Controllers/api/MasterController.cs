using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.App;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.CommonWeb;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Org.BouncyCastle.Asn1.X509.Qualified;

namespace Joy.PIM.Api.Controllers.Api
{
    [Route("/api/[controller]/[action]")]

    public class MasterController : BaseApiController
    {
        private readonly IDbCache _cache;
        private readonly ILabelManager _labelManager;
        private readonly IMasterManager _masterManager;

        // Constructor of the class.
        public MasterController(IDbCache cache, ILabelManager labelManager, IMasterManager masterManager)
        {
            _cache = cache;
            _labelManager = labelManager;
            _masterManager = masterManager;
        }

        // Get data from roles table.
        [HttpGet]
        public async Task<IEnumerable<Role>> GetRoles(bool isActive)
        {
            return await _masterManager.Search<Role>(isActive);
        }

        // Get data from table.
        [HttpGet]
        public async Task<AppConfiguration> GetAppConfiguration()
        {
            return await _cache.GetAppConfiguration();
        }

        // Get data from table.
        [HttpGet]
        public async Task<IEnumerable<LabelModel>> GetLabels(long? languageId)
        {
            return await _cache.GetAllLabels(languageId);
        }

        // Get data from table.
        [HttpGet]
        public async Task<SearchResult<LabelModel>> SearchLabels(
            long languageId)
        {
            return await _labelManager.Search(languageId);
        }

        // [HttpGet]
        // public async Task<SearchResult<LabelModel>> SearchLabels(string? searchKey, int pageNumber, int pageSize,
        //    long languageId)
        // {
        //    return await _labelManager.Search(searchKey, pageNumber, pageSize, languageId);
        // }

        // Get data from languages table.
        [HttpGet]
        public async Task<IEnumerable<Language>> GetLanguages()
        {
            return await _cache.GetMaster<Language>();
        }

        [HttpGet]
        public async Task<IEnumerable<AppSettings>> GetAppConfig()
        {
            return await _cache.GetAppSettings();
        }

        [HttpPut]
        public async Task ActivateRole(long id)
        {
            await _labelManager.ActivateRole(id);
        }

        [HttpPut]
        public async Task ActivateRoleBatch(long[] ids)
        {
            await _labelManager.ActivateRoleBatch(ids);
        }

        [HttpPut]
        public async Task DeactivateRole(long id)
        {
            await _labelManager.DeactivateRole(id);
        }

        [HttpPut]
        public async Task DeactivateRoleBatch(long[] ids)
        {
            await _labelManager.DeactivateRoleBatch(ids);
        }

        // [HttpPut]
        // public async Task<string> UpdateLabel(long id, string name, string
        // )
        // {
        //    return await _labelManager.UpdateLabel(id, name, description);
        // }
        [HttpPut]
        public async Task UpdateRoles(long id, string? name, string? description, bool? isActive)
        {
            await _labelManager.UpdateRoles(id, name, description, isActive);
        }

        [HttpPut]
        public async Task Ismail(string email)
        {
            await _labelManager.Ismail(email);
        }

        [HttpGet]
        public async Task<IEnumerable> GetUserRoles(long? appuserId)
        {
            return await _masterManager.GetUserRole(appuserId);
        }

        [HttpDelete]
        public async Task DeleteRoles(long appuserId, long roleId)
        {
            await _labelManager.DeleteRoles(appuserId, roleId);
        }

        [HttpGet]
        public async Task<IEnumerable> GetErrorLogUser(DateTime fromDate, DateTime toDate)
        {
            return await _labelManager.GetErrorLogUser(fromDate, toDate);
        }

        [HttpGet]
        public async Task<IEnumerable<RejectionReason>> GetRejectReason()
        {
            return await _cache.GetMaster<RejectionReason>();
        }

        [HttpGet]
        public async Task<IEnumerable<UploadedFileStatus>> GetUploadedFileStatus()
        {
            return await _cache.GetMaster<UploadedFileStatus>();
        }

        [HttpGet]
        public async Task<IEnumerable<TemplateStatus>> GetTemplateStatus()
        {
            return await _cache.GetMaster<TemplateStatus>();
        }

        [HttpGet]
        public async Task<IEnumerable<TableMetadata>> GetTables()
        {
            return await _cache.GetMaster<TableMetadata>();
        }

        [HttpGet]
        public async Task<IEnumerable<TableMetaDataColumn>> GetTableColumns()
        {
            return await _cache.GetMaster<TableMetaDataColumn>();
        }

        [HttpGet]
        public async Task<IEnumerable<Season>> GetSeasons()
        {
            return await _cache.GetMaster<Season>();
        }

        [HttpGet]
        public async Task<IEnumerable<GeoGraphy>> GeoGraphyList(long id)
        {
            return await _masterManager.GeoGraphyList(id);
        }

        [HttpGet]
        public async Task<IEnumerable<ValidationList>> GetValidationList()
        {
            return await _cache.GetMaster<ValidationList>();
        }

        [HttpGet]
        public async Task<IEnumerable<StageAction>> GetStageActions()
        {
            return await _cache.GetMaster<StageAction>();
        }

        [HttpGet]
        public async Task<IEnumerable<EsgrcType>> GetEsgrc()
        {
            return await _cache.GetMaster<EsgrcType>();
        }

        [HttpGet]
        public async Task<IEnumerable<Uom>> GetUom()
        {
            return await _cache.GetMaster<Uom>();
        }

        [HttpGet]
        public async Task<IEnumerable<Months>> GetMonth()
        {
            return await _cache.GetMaster<Months>();
        }

        [HttpGet]
        public async Task<IEnumerable<Category>> GetCategory()
        {
            return await _cache.GetMaster<Category>();
        }

        [HttpGet]
        public async Task<IEnumerable<Standards>> GetStandards()
        {
            return await _cache.GetMaster<Standards>();
        }

        [HttpGet]
        public async Task<IEnumerable<Industry>> GetIndustry()
        {
            return await _cache.GetMaster<Industry>();
        }

        [HttpGet]
        public async Task<IEnumerable<Department>> GetDepartment()
        {
            return await _cache.GetMaster<Department>();
        }

        [HttpGet]
        public async Task<IEnumerable<Quatter>> GetQuatter()
        {
            return await _cache.GetMaster<Quatter>();
        }

        [HttpGet]
        public async Task<IEnumerable<Months>> GetMonths()
        {
            return await _cache.GetMaster<Months>();
        }

        [HttpGet]
        public async Task<IEnumerable<DAL.Master.Type>> GetTypes()
        {
            return await _cache.GetMaster<DAL.Master.Type>();
        }

        [HttpGet]
        public async Task<IEnumerable<Service>> GetServices()
        {
            return await _cache.GetMaster<Service>();
        }

        [HttpGet]
        public async Task<IEnumerable<TimeDimension>> GetTimeDimension()
        {
            return await _cache.GetMaster<TimeDimension>();
        }

        [HttpGet]
        public async Task<IEnumerable<FormulaStandards>> GetFormulaStandards()
        {
            return await _cache.GetMaster<FormulaStandards>();
        }

        [HttpGet]
        public async Task<IEnumerable<DataviewDimensions>> GetDataviewDimensions()
        {
            return await _cache.GetMaster<DataviewDimensions>();
        }

        [HttpGet]
        public async Task<IEnumerable<MetricsPrefix>> GetMetricsPrefix()
        {
            return await _cache.GetMaster<MetricsPrefix>();
        }

        [HttpGet]
        public async Task<IEnumerable<Currency>> GetCurrency()
        {
            return await _cache.GetMaster<Currency>();
        }

        [HttpGet]
        public async Task<IEnumerable<BusinessUnits>> GetBusinessUnits()
        {
            return await _cache.GetMaster<BusinessUnits>();
        }

        [HttpGet]
        public async Task<IEnumerable<Organizations>> GetOrganizations()
        {
            return await _cache.GetMaster<Organizations>();
        }

        [HttpGet]
        public async Task<IEnumerable<Facility>> GetFacilities()
        {
            return await _cache.GetMaster<Facility>();
        }
    }
}