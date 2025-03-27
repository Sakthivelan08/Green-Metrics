using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.BAL.Model.App;
using Joy.PIM.BAL.Model.Template;
using Joy.PIM.BAL.Model.Uid;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Joy.PIM.WorkFlow.Repository;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RazorEngine.Templating;

namespace Joy.PIM.BAL.Implementations
{
    public class PgDbCache : IDbCache
    {
        private const string Tenants = "Tenants";
        private const string Users = "Users";
        private readonly IConfiguration _configuration;
        private readonly ICacheHandler _handler;
        private readonly Lazy<ILabelManager> _labelManager;
        private readonly Lazy<IMasterManager> _masterManager;
        private readonly Lazy<IUserManager> _userManager;
        private readonly Lazy<IUIDManager> _uidRepo;
        private readonly Lazy<ITemplates> _template;

        public PgDbCache(ICacheHandler handler,
            IServiceProvider services,
            IConfiguration configuration)
        {
            _handler = handler;
            _configuration = configuration;
            _userManager = new Lazy<IUserManager>(services.GetRequiredService<IUserManager>);
            _masterManager = new Lazy<IMasterManager>(services.GetRequiredService<IMasterManager>);
            _labelManager = new Lazy<ILabelManager>(services.GetRequiredService<ILabelManager>);
            _uidRepo = new Lazy<IUIDManager>(services.GetRequiredService<IUIDManager>);
            _template = new Lazy<ITemplates>(services.GetRequiredService<ITemplates>);
        }

        public async Task Clear()
        {
            await _handler.RemoveItemFromCache(Constants.AllCacheKeys);
        }

        public async Task ClearUserCache(long userId)
        {
            await _handler.RemoveItemFromCache($"{Users}-{userId}");
            await _handler.RemoveItemFromCache($"{Users}-{userId}-me");
        }

        public async Task<AppSettings> FindAppSettings(string key)
        {
            var cacheValue = await this.GetAppSettings();
            return cacheValue.FirstOrDefault(x => x.Name == key);
        }

        public async Task<IEnumerable<LabelModel>> GetAllLabels(long? languageId)
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"Labels-{languageId}",
                async args => await _labelManager.Value.GetLabels(languageId));
            return cacheValue;
        }

        public async Task<AppConfiguration> GetAppConfiguration()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"AppConfiguration",
                async args => await Task.FromResult(new AppConfiguration
                {
                    ApiUrl = _configuration["ApiUrl"],
                    AppUrl = _configuration["AppUrl"],
                    B2C = new B2CConfiguration
                    {
                        Tenant = _configuration["B2C-Tenant"],
                        ClientId = _configuration["B2C-ClientId"],
                        LoginDomain = _configuration["B2C-BaseAddress"]?.Split("//")[1],
                        LoginFlow = _configuration["B2C-LoginPolicy"],
                        ResetPasswordFlow = _configuration["B2C-ForgotPasswordFlow"]
                    }
                }));
            return cacheValue;
        }

        public async Task<IEnumerable<AppSettings>> GetAppSettings()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"AppSettings",
                async args => await _masterManager.Value.GetAppSettings());
            return cacheValue;
        }

        public async Task<List<TemplateMapping>> GetTemplateMappings(long id)
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"TemplateMappings",
                async args =>
                {
                    var user = await _userManager.Value.GetTemplateMappings(id);
                    return user;
                });
            return cacheValue;
        }

        public async Task<List<KeyValuePair<string, string>>> GetMaster(string attrLookupTable,
            string attrLookupTableColumn)
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"GetMaster-{attrLookupTable}",
                async args => await _masterManager.Value.GetMaster(attrLookupTable, attrLookupTableColumn));
            return cacheValue;
        }

        public async Task<IEnumerable<string>> GetApprovedPlanoOrFamilyNames(long divisionId)
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"UidRepo-{divisionId}",
                async args => (await _uidRepo.Value.GetApprovedPlanoOrFamilyNames(divisionId)).ToList());
            return cacheValue;
        }

        public async Task<IEnumerable<T>> GetMaster<T>()
                                                            where T : Entity
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"Master-{typeof(T).FullName}",
                async args => await _masterManager.Value.GetAll<T>());
            return cacheValue;
        }

        public async Task<int> GetMaxFileSize()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                "GetMaxFileSize",
                async args =>
                {
                    int maxFileSize = int.TryParse(_configuration["MaxFileSize"], out maxFileSize)
                        ? maxFileSize
                        : 2097152;
                    return await Task.FromResult(maxFileSize);
                });
            return cacheValue;
        }

        public async Task<AppUser> GetUser(long userId)
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"{Users}-{userId}",
                async args =>
                {
                    var user = await _userManager.Value.Get(userId);
                    return user;
                });
            return cacheValue;
        }

        public async Task<AppUser> GetUserFromEmail(string userEmail)
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"UserEmails-{userEmail}",
                async args =>
                {
                    var user = await _userManager.Value.GetUserByEmail(userEmail);
                    return user;
                });
            return cacheValue;
        }

        public async Task<IEnumerable<long>> GetDeptCode()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"UidRepo",
                async args => (await _uidRepo.Value.GetDeptCode()));
            return cacheValue;
        }

        public async Task<IEnumerable<string>> GetCode()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"subclass",
                async args => (await _uidRepo.Value.GetCode()));
            return cacheValue;
        }

        public async Task<IEnumerable<string>> Purchasetype()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
            $"purchasetype",
            async args => (await _uidRepo.Value.Purchasetype()));
            return cacheValue;
        }

        public async Task<IEnumerable<string>> Pricegrouping()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
            $"Pricegrouping",
            async args => (await _uidRepo.Value.Pricegrouping()));
            return cacheValue;
        }

        public async Task<IEnumerable<string>> Productpurpose()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
            $"Productpurpose",
            async args => (await _uidRepo.Value.Productpurpose()));
            return cacheValue;
        }

        public async Task<IEnumerable<long>> Planocode()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
            $"Planocode",
            async args => (await _uidRepo.Value.Planocode()));
            return cacheValue;
        }

        public async Task<IEnumerable<string>> Productpicture()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
            $"Productpicture",
            async args => (await _uidRepo.Value.Productpicture()));
            return cacheValue;
        }

        public async Task<List<Template>> GetTemplates()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
            $"GetTemplates",
            async args => (await _template.Value.GetTemplates()).ToList());
            return cacheValue;
        }

        public async Task<List<Template>> GetUserTemplates()
        {
            var cacheValue = await _handler.GetFromCacheAsync(
                $"GetUserTemplates",
                async args => (await _template.Value.GetUserTemplates()).ToList());
            return cacheValue;
        }
    }
}
