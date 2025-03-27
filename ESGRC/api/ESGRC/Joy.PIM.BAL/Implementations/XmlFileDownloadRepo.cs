using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml.Linq;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.Common;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Microsoft.Extensions.Configuration;

namespace Joy.PIM.BAL.Implementations
{
    public class XmlFileDownloadRepo : PgEntityAction<MetricAnswerOptions>, IXmlFileDownload
    {
        private readonly IDbCache _cache;
        private readonly IUserContext _userContext;
        private readonly IBlobRepo _lobRepo;

        public XmlFileDownloadRepo(IUserContext userContext, IDbConnectionFactory connectionFactory,
      IConfiguration configuration, IDbCache cache, IBlobRepo blobRepo)
      : base(userContext, connectionFactory, configuration)
        {
            _cache = cache;
            _userContext = userContext;
            _lobRepo = blobRepo;
        }

        public async Task<byte[]> GenerateXmlFile(long assessmentid, long auditid)
        {
            string jsonData;
            using var connection = this.GetConnection();
            string query = "SELECT responseJson FROM metricansweroptions WHERE assessmentid = @assessmentid and auditid = @auditid";
            jsonData = await connection.QueryFirstOrDefaultAsync<string>(query, new { assessmentid, auditid }).ConfigureAwait(true);

            if (string.IsNullOrEmpty(jsonData))
            {
                throw new HandledException("No data found for the given ID.");
            }

            var data = JsonSerializer.Deserialize<Dictionary<string, string>>(jsonData);

            var sanitizedData = data.ToDictionary(
             kvp => SanitizeXmlElementName(kvp.Key), 
             kvp => kvp.Value);

            var xml = new XElement("Metrics",
                sanitizedData.Select(kvp => new XElement(kvp.Key, kvp.Value)));

            using (var memoryStream = new MemoryStream())
            {
                xml.Save(memoryStream, SaveOptions.DisableFormatting);
                return memoryStream.ToArray();
            }
        }

        private static string SanitizeXmlElementName(string key)
        {
            // Replace invalid characters with underscores
            var sanitized = Regex.Replace(key, @"[^a-zA-Z0-9_]", "_");
            if (char.IsDigit(sanitized[0]))
            {
                sanitized = "_" + sanitized;
            }

            return sanitized;
        }
    }
}
