using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.Common.MetaAttributes;

namespace Joy.PIM.DAL
{
    [SearchField(new[] { "Name" })]
    public class UploadedFile : Entity
    {
        public string Name { get; set; }

        public string BlobUrl { get; set; }

        public long? UploadedFileStatusId { get; set; }

        public long? TemplateId { get; set; }

        public long? GoalSettingId { get; set; }

        public long? MetricStandardId { get; set; }

        public long? AssessmentId { get; set; }

        public long? AuditId { get; set; }

        public long? TemplateStageId { get; set; }

        public long? MetricId { get; set; }
    }
}
