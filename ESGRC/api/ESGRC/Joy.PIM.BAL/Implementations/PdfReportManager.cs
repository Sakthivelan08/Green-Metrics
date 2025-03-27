using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Joy.PIM.BAL.Contracts;
using Joy.PIM.BAL.Model;
using Joy.PIM.Common.Interfaces;
using Joy.PIM.DAL;
using Microsoft.Extensions.Configuration;

namespace Joy.PIM.BAL.Implementations
{
    public class PdfReportManager : PgEntityAction<MergeReport>, IPdfReportManager
    {
        private readonly IDbCache _cache;
        private readonly IUserContext _userContext;
        private readonly IBlobRepo _lobRepo;

        public PdfReportManager(IUserContext userContext, IDbConnectionFactory connectionFactory,
       IConfiguration configuration, IDbCache cache, IBlobRepo blobRepo)
       : base(userContext, connectionFactory, configuration)
        {
            _cache = cache;
            _userContext = userContext;
            _lobRepo = blobRepo;
        }

        public async Task AddPdfReport(MergeReport model)
        {
            using var connection = this.GetConnection();

            await AddOrUpdate(model);
        }

        public async Task<List<MergeReportDto>> GetPdfMerge()
        {
            using var connection = this.GetConnection();

            var data = await connection.QueryAsync<MergeReportDto>($"SELECT mr.*, STRING_AGG(SUBSTRING(pr.url FROM '([^/]+$)'), ', ') AS pdfname FROM mergereport mr " +
                $"JOIN pdfreports pr ON pr.id::text = ANY(STRING_TO_ARRAY(mr.pdfid, ',')) " +
                $"where mr.isactive = true " +
                $"GROUP BY mr.id").ConfigureAwait(true);

            return data.ToList();
        }
    }
}
