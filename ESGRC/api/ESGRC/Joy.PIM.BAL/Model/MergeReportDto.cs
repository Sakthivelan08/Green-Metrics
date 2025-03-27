using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class MergeReportDto
    {
        public long Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string PdfId { get; set; }

        public string PdfName { get; set; }

        public long ReportId { get; set; }

        public long PageNumber { get; set; }

        public string Type { get; set; }

        public string Guid { get; set; }

        public string UrlName { get; set; }
    }
}
