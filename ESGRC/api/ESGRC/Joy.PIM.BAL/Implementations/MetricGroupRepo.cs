using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Aspose.Pdf.Operators;
using Azure.Storage.Blobs;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Joy.PIM.DAL.DomainModel;
using Joy.PIM.DAL.Enum;
using Joy.PIM.DAL.Master;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Configuration;
using OfficeOpenXml.Table.PivotTable;

namespace Joy.PIM.BAL.Implementations
{
    public class MetricGroupRepo : PgEntityAction<MetricGroup>, IMetricGroup
    {
        private readonly IDbConnectionFactory _connectionFactory;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public MetricGroupRepo(IDbConnectionFactory connectionFactory,
            IUserContext userContext, IConfiguration configuration)
            : base(userContext, connectionFactory, configuration)
        {
            _connectionFactory = connectionFactory;
            _configuration = configuration;
            _userContext = userContext;
        }

        public async Task AddOrUpdateMetricGroup(MetricGroup model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name))
                {
                    throw new Exception("MetricGroup name cannot be empty.");
                }

                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<dynamic>($"select 1 from MetricGroup where name = '{model.Name}'");
                if (model.Id == 0 && data.Count() > 0)
                {
                    throw new Exception($"metricGroup {model.Name} already exists.");
                }

                if (model.IsHierarchy == true)
                {
                    await connection.ExecuteAsync($"update metricGroup set ishierarchy = 'true' where id = {model.ParentId} ").ConfigureAwait(false);
                    model.IsHierarchy = false;
                }

                await this.AddOrUpdate(model);
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<MetricGroup>> ListMetricGroupWithParent(long parentid)
        {
            try
            {
                using var connection = this.GetConnection();
                return (await connection.QueryAsync<MetricGroup>("select * from metricgroup where parentid = @ParentId", new { ParentId = parentid })).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task ActivateMetricGroup(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<MetricGroup>("select * from MetricGroup where id = @id", new { id });

                if (data.Count() == 0)
                {
                    throw new HandledException(code: 400, message: "no data found with this id");
                }

                await connection.ExecuteScalarAsync<MetricGroup>($"update MetricGroup set isactive = true where id = @id", new
                {
                    id
                });
                connection.Close();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task ActivateMetricGroupBatch(long[] ids)
        {
            foreach (long id in ids)
            {
                await this.ActivateMetricGroup(id);
            }
        }

        public async Task DeactivateMetricGroup(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<MetricGroup>("select * from MetricGroup where id = @id", new { id });

                if (data.Count() == 0)
                {
                    throw new HandledException(code: 400, message: "no data found with this id");
                }

                await connection.ExecuteScalarAsync<MetricGroup>($"update MetricGroup set isactive = false where id = @id", new
                {
                    id
                });
                connection.Close();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task DeactivateMetricGroupBatch(long[] ids)
        {
            foreach (long id in ids)
            {
                await this.DeactivateMetricGroup(id);
            }
        }

        public async Task DeleteMetricGroup(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                await connection.QueryAsync<MetricGroup>($"Delete from metricgroup where Id = @id ",
                    new { id });
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task DeleteParentMetricGroup(List<long> ids)
        {
            using var connection = this.GetConnection();
            foreach (var id in ids)
            {
                await connection.ExecuteAsync($"update metricgroup set parentid = 0 where id = @Id", new { id = id }).ConfigureAwait(false);
            }
        }

        // public async Task<List<GetMetricGroup>> GetActiveMetricGroupsWithCount()
        // {
        //    using var connection = this.GetConnection();

        // var sql = @"
        // SELECT 

        // mg.Id as GroupId,
        //    mg.parentid as ParentId,
        //    mg.ishierarchy as IsHierarchy,
        //    mg.Label,
        //    mg.Name,
        //    mg.ComplianceId,
        //    mg.Industry,
        //    i.Name as IndustryName,
        //    COUNT(DISTINCT m.regulationtypeid) as regulationcount
        // FROM MetricGroup as mg
        // JOIN industry as i ON i.Id = mg.Industry
        // LEFT JOIN mgmultiselection as ms ON ms.metricgroupid = mg.id
        // LEFT JOIN Metric as m ON m.GroupId = mg.Id AND m.isActive = true
        // WHERE mg.isActive = true
        // GROUP BY mg.Id, mg.Label, mg.Name, mg.ComplianceId,  mg.Industry, i.Name order by groupid";

        // var metricGroups = await connection.QueryAsync<GetMetricGroup>(sql).ConfigureAwait(false);

        // return metricGroups.ToList();
        // }
        public async Task<List<GetMetricGroup>> GetActiveMetricGroupsWithCount()
        {
            using var connection = this.GetConnection();

            var sql = @"
    SELECT 
        mg.Id as GroupId,
        mg.parentid as ParentId,
        mg.ishierarchy as IsHierarchy,
        mg.Label,
        mg.Name,
        mg.ComplianceId,
        mg.Industry,
        i.Name as IndustryName,
        (SELECT COUNT(DISTINCT m.regulationtypeid) 
         FROM Metric as m 
         WHERE m.GroupId = mg.Id AND m.isActive = true) as regulationcount
    FROM MetricGroup as mg
    JOIN industry as i ON i.Id = mg.Industry
    WHERE mg.isActive = true
    ORDER BY mg.Id";

            var metricGroups = await connection.QueryAsync<GetMetricGroup>(sql).ConfigureAwait(false);

            return metricGroups.ToList();
        }

        public async Task<List<GetMetricGroup>> GetActiveRegulationWithCount(long regulationtypeid)
        {
            using var connection = this.GetConnection();

            if (regulationtypeid == (long)RegulationTypeEnum.Regulation)
            {
                var sql = $@"
                SELECT 
                    mg.Id as GroupId,
                    mg.Label,
                    mg.Name,
                    mg.ComplianceId,
                    mg.Industry,
                    i.Name as IndustryName,
                    m.regulationtypeid,
                    COUNT(ms.Id) as MetricCount,
                    COUNT(DISTINCT m.regulationtypeid) as regulationcount
                FROM MetricGroup as mg
                JOIN industry as i ON i.Id = mg.Industry
                JOIN mgmultiselection as ms ON ms.metricgroupid = mg.id
                JOIN Metric as m ON ms.metricid = m.Id AND m.isActive = true AND m.regulationtypeid = {(long)RegulationTypeEnum.Regulation}
                WHERE mg.isActive = true
                GROUP BY mg.Id, mg.Label, mg.Name, mg.ComplianceId, mg.Industry, m.regulationtypeid, i.Name
                ORDER BY mg.Id";

                var metricGroups = await connection.QueryAsync<GetMetricGroup>(sql).ConfigureAwait(false);

                return metricGroups.ToList();
            }
            else
            {
                var sql = $@"
                SELECT 
                    mg.Id as GroupId,
                    mg.Label,
                    mg.Name,
                    mg.ComplianceId,
                    mg.Industry,
                    i.Name as IndustryName,
                    m.regulationtypeid,
                    COUNT(ms.Id) as MetricCount
                FROM MetricGroup as mg
                JOIN industry as i ON i.Id = mg.Industry
                JOIN mgmultiselection as ms ON ms.metricgroupid = mg.id
                JOIN Metric as m ON ms.metricid = m.Id AND m.isActive = true AND m.regulationtypeid = {regulationtypeid}
                WHERE mg.isActive = true
                GROUP BY mg.Id, mg.Label, mg.Name, mg.ComplianceId, mg.Industry, m.regulationtypeid, i.Name
                ORDER BY mg.Id";

                var metricGroups = await connection.QueryAsync<GetMetricGroup>(sql).ConfigureAwait(false);

                return metricGroups.ToList();
            }
        }

        public async Task DeleteMetricGroupId(long id, long groupId)
        {
            if (groupId <= 0)
            {
                throw new Exception("Invalid groupId.");
            }

            using var connection = this.GetConnection();
            await connection.QueryAsync<Metric>($"UPDATE Metric SET GroupId = NULL WHERE Id = @id AND GroupId = @groupId",
                new { id, groupId });
        }

        public async Task<List<MetricDomainModel>> GetMetricsByGroupId(string groupId)
        {
            try
            {
                using var connection = this.GetConnection();

                var metrics = await connection.QueryAsync<MetricDomainModel>($"SELECT m.*, et.name as EsgrcName, MetricType.name as typename FROM Metric m  " +
                                                                                                                                $"join mgmultiselection as ms ON ms.metricid = m.id " +
                                                                                                                                $"JOIN MetricType ON m.typeId = MetricType.id " +
                                                                                                                                $"JOIN Esgrctype as et on m.esgrctype = et.id " +
                                                                                                                                $"WHERE ms.metricgroupid = ({groupId})");

                return metrics.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<MgmultiselectionDto>> GetMetricshow(string groupId)
        {
            try
            {
                using var connection = this.GetConnection();
                var metric = await connection.QueryAsync<MgmultiselectionDto>($"SELECT mg.*, m.metricsquestion AS metricsQuestion, mt.name AS typeName FROM mgmultiselection AS mg JOIN metric AS m   ON mg.metricid = m.id JOIN metrictype AS mt ON m.typeid = mt.id WHERE mg.metricgroupid = {groupId}");
                return metric.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<MetricDomainModel>> GetMetricsByTemplateId(long templateId)
        {
            try
            {
                using var connection = this.GetConnection();

                var metrics = await connection.QueryAsync<MetricDomainModel>($"select m.*, et.name as EsgrcName, s.name as StandardName, mt.name as typename from templategroup as tg " +
                    $"JOIN mgmultiselection as ms ON tg.metricgroupid = ms.metricgroupid " +
                    $"JOIN metric as m on ms.metricid = m.id " +
                    $"JOIN MetricType as mt ON m.typeId = mt.id " +
                    $"JOIN Esgrctype as et on m.esgrctype = et.id " +
                    $"JOIN standards as s on m.standard = s.id " +
                    $"where tg.templateid = {templateId} ").ConfigureAwait(true);

                return metrics.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<Auditresponsedata>> GetApproveData(long auditid, long templatestageid)
        {
            try
            {
                using var connection = this.GetConnection();

                var query = await connection.QueryAsync<Auditresponsedata>(
                    "SELECT mr.responsejson " +
                    "FROM metricansweroptions AS mr " +
                    "JOIN processstages AS ps ON ps.auditid = mr.auditid " +
                    "WHERE mr.auditid = @AuditId AND ps.templatestageid = @TemplateStageId",
                    new { AuditId = auditid, TemplateStageId = templatestageid });

                return query.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<MetricGroup>> GetMetricGroupWithId(long id)
        {
            try
            {
                using var connection = this.GetConnection();
                var data = await connection.QueryAsync<MetricGroup>($"SELECT * FROM metricgroup where Id = {id}").ConfigureAwait(true);
                return data.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task<List<MetricGroup>> GetMetricGroupWithRegulationList()
        {
            try
            {
                using var connection = this.GetConnection();

                var res = await connection.QueryAsync<MetricGroup>($"select * from metricGroup");
                return res.ToList();
            }
            catch (Exception ex)
            {
                throw new HandledException(ex.Message);
            }
        }

        public async Task UpdateParentId(long parentId, long[] metricgroupId)
        {
            try
            {
                using var connection = this.GetConnection();
                foreach (var metricgroup in metricgroupId)
                {
                    await connection.ExecuteAsync("Update metricgroup set parentid = @ParentId where id = @MetricGroupId", new { ParentId = parentId, MetricGroupId = metricgroup });
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<List<GetMetricDetailsModel>> GetMetricDetails()
        {
            try
            {
                using var connection = this.GetConnection();
                var sql = "select m.id, m.metricsquestion as Metric,mt.name as Datatype, a.name as Createdby from metric m " +
                                "JOIN metrictype mt ON m.typeid = mt.id " +
                                "JOIN appuser a ON m.createdby = a.id";

                var metricGroups = await connection.QueryAsync<GetMetricDetailsModel>(sql).ConfigureAwait(false);

                return metricGroups.ToList();
            }
            catch
            {
                throw;
            }
        }

        public async Task<List<PrefixMetricsModel>> GetPrefixMetricsById(long? templateId)
        {
            try
            {
                using var connection = this.GetConnection();
                var metricIds = await connection.QueryAsync<long?>("SELECT metricid FROM templategroup WHERE templateid = @TemplateId", new { TemplateId = templateId });

                var metrics = new List<PrefixMetricsModel>();
                foreach (var id in metricIds.Where(id => id.HasValue).Select(id => id.Value))
                {
                    var metric = await connection.QueryAsync<PrefixMetricsModel>("SELECT m.metricsquestion as Metric,mt.name as DataType FROM metric m JOIN metrictype mt on m.typeid = mt.id WHERE m.id = @Id", new { Id = id });
                    metrics.AddRange(metric);
                }

                return metrics;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task<long> UploadPdfFileAsync(IFormFile file, long metricgroupId)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty.");
            }

            var azureConnection = _configuration["AzureBlobStorageKey"];
            var containerName = _configuration["PdfContainerName"];

            var blobServiceClient = new BlobServiceClient(azureConnection);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

            // Ensure the container exists
            await containerClient.CreateIfNotExistsAsync();

            var originalFileName = Path.GetFileNameWithoutExtension(file.FileName);
            var fileExtension = Path.GetExtension(file.FileName);

            var cleanedFileName = System.Text.RegularExpressions.Regex.Replace(originalFileName, @"\s*\(\d+\)$", " ").Trim();
            var targetFileName = $"{cleanedFileName}{fileExtension}";

            var blobClient = containerClient.GetBlobClient(targetFileName);

            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, overwrite: true).ConfigureAwait(false);
            }

            var blobUrl = blobClient.Uri.ToString();

            var sql = @"
     INSERT INTO UploadedFile 
     (Name, BlobUrl, MetricId, IsActive)
     VALUES 
     (@Name, @BlobUrl, @MetricId, @IsActive)
     RETURNING Id
 ";

            using var connection = this.GetConnection();
            var uploadedFileId = await connection.ExecuteScalarAsync<long>(sql, new
            {
                Name = targetFileName,
                BlobUrl = blobUrl,
                MetricId = metricgroupId,
                IsActive = true
            }).ConfigureAwait(true);

            return uploadedFileId;
        }

        public async Task<List<UploadedFile>> GetUploadedFileLink(long metricgroupId)
        {
            using var connection = this.GetConnection();
            return (await connection.QueryAsync<UploadedFile>($"select * from uploadedfile where isactive = true and metricid = {metricgroupId}").ConfigureAwait(false)).ToList();
        }
    }
}
