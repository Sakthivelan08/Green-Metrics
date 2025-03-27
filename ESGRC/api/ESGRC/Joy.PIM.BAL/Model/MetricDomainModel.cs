using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class MetricDomainModel
    {
        public long? Id { get; set; }

        public string Name { get; set; }

        public string DisplayLabel { get; set; }

        public long TypeId { get; set; }

        public long GroupId { get; set; }

        public long MetrictypeId { get; set; }

        public string TypeName { get; set; }

        public string ValidationId { get; set; }

        public string ValidationName { get; set; }

        public string? LookupTable { get; set; }

        public string? LookupTableColumn { get; set; }

        public string MetricsQuestion { get; set; }

        public long EsgrcType { get; set; }

        public string EsgrcName { get; set; }

        public long Uom { get; set; }

        public string UomName { get; set; }

        public long Category { get; set; }

        public string CategoryName { get; set; }

        public long Standard { get; set; }

        public string StandardName { get; set; }

        public long Departmentid { get; set; }

        public string DepartmentName { get; set; }

        public string? Target { get; set; }

        public string? StandardYear { get; set; }

        public long Serviceid { get; set; }

        public long? Parentid { get; set; }

        public long Regulationtypeid { get; set; }

        public bool IsKeyIndicator { get; set; }

        public string? ServiceName { get; set; }

        public DateTime? DateCreated { get; set; }

        public DateTime? DateModified { get; set; }

        public long? CreatedBy { get; set; }

        public long? UpdatedBy { get; set; }

        public long? TemplateId { get; set; }

        public long? TimeDimension { get; set; }

        public string? FormulaeField { get; set; }

        public decimal? Value { get; set; }
    }
}