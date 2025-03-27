using System;
using System.Data;
using System.IO;
using System.Linq;
using Joy.PIM.Common;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Joy.PIM.Migrator
{
    public class MasterDataManager : IDisposable
    {
        private readonly ILogger _logger;
        private readonly NpgsqlConnection _connection;

        public MasterDataManager(string connectionString, ILogger logger)
        {
            _logger = logger;

            _connection = new NpgsqlConnection(connectionString);
            _connection.Open();
        }

        public void Run()
        {
            _logger.LogInformation("Starting Master data loading");

            var lines = File.ReadAllLines("MasterData/roles.csv").Select(x => x.Split(','));
            var roles = lines.Select(line => new Role
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Role", roles);

            lines = File.ReadAllLines("MasterData/languages.csv").Select(x => x.Split(','));
            var languages = lines.Select(line => new Language
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Language", languages);

            lines = File.ReadAllLines("MasterData/metrictype.csv").Select(x => x.Split(','));
            var metricTypes = lines.Select(line => new MetricType
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim()),
                Icon = line[4].Trim()
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("MetricType", metricTypes);

            lines = File.ReadAllLines("MasterData/standards.csv").Select(x => x.Split(','));
            var standards = lines.Select(line => new Standards
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Standards", standards);

            lines = File.ReadAllLines("MasterData/esgrctype.csv").Select(x => x.Split(','));
            var esgrctypes = lines.Select(line => new EsgrcType
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("EsgrcType", esgrctypes);

            lines = File.ReadAllLines("MasterData/uom.csv").Select(x => x.Split(','));
            var uoms = lines.Select(line => new Uom
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Uom", uoms);

            lines = File.ReadAllLines("MasterData/category.csv").Select(x => x.Split(','));
            var categorys = lines.Select(line => new Category
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Category", categorys);

            lines = File.ReadAllLines("MasterData/industry.csv").Select(x => x.Split(','));
            var industrys = lines.Select(line => new Industry
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Industry", industrys);

            lines = File.ReadAllLines("MasterData/uploadedfilestatus.csv").Select(x => x.Split(','));
            var uploadedfilestatuses = lines.Select(line => new UploadedFileStatus
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("UploadedFileStatus", uploadedfilestatuses);

            lines = File.ReadAllLines("MasterData/quatter.csv").Select(x => x.Split(','));
            var quatters = lines.Select(line => new Quatter
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Quatter", quatters);

            lines = File.ReadAllLines("MasterData/month.csv").Select(x => x.Split(','));
            var months = lines.Select(line => new Months
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Months", months);

            lines = File.ReadAllLines("MasterData/validationlist.csv").Select(x => x.Split(','));
            var validationlists = lines.Select(line => new ValidationList
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("ValidationList", validationlists);

            lines = File.ReadAllLines("MasterData/stageaction.csv").Select(x => x.Split(','));
            var stageactions = lines.Select(line => new StageAction
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("StageAction", stageactions);

            lines = File.ReadAllLines("MasterData/compliance.csv").Select(x => x.Split(','));
            var compliances = lines.Select(line => new Compliance
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Compliance", compliances);

            lines = File.ReadAllLines("MasterData/templatestatus.csv").Select(x => x.Split(','));
            var templatestatuses = lines.Select(line => new TemplateStatus
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("TemplateStatus", templatestatuses);

            lines = File.ReadAllLines("MasterData/service.csv").Select(x => x.Split(','));
            var services = lines.Select(line => new Service
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Service", services);

            lines = File.ReadAllLines("MasterData/timedimension.csv").Select(x => x.Split(','));
            var timedimensions = lines.Select(line => new TimeDimension
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("TimeDimension", timedimensions);

            lines = File.ReadAllLines("MasterData/type.csv").Select(x => x.Split(','));
            var types = lines.Select(line => new DAL.Master.Type
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("Type", types);

            lines = File.ReadAllLines("MasterData/formulastandards.csv").Select(x => x.Split(','));
            var formula = lines.Select(line => new DAL.Master.FormulaStandards
            {
                Id = long.Parse(line[0].Trim()),
                Name = line[1].Trim(),
                Description = line[2].Trim(),
                DateCreated = DateTimeOffset.Now,
                DateModified = DateTimeOffset.Now,
                CreatedBy = 1,
                UpdatedBy = 1,
                IsActive = true,
                Code = long.Parse(line[3].Trim())
            }).Cast<object>().ToList();
            _connection.LoadMasterTable("FormulaStandards", formula);

            _logger.LogInformation("Master data loading, completed");
        }

        public void Dispose()
        {
            if (_connection.State == ConnectionState.Open)
            {
                _connection.Close();
            }
        }
    }
}