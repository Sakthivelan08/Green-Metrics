namespace Joy.PIM.DAL
{
    public class Metric : Entity
    {
        public string? Name { get; set; }

        public string? DisplayLabel { get; set; }

        public long? TypeId { get; set; }

        public long? GroupId { get; set; }

        public string? ValidationId { get; set; }

        public string? MetricsQuestion { get; set; }

        public string? LookupTable { get; set; }

        public string? LookupTableColumn { get; set; }

        // public long? AnswerOption { get; set; }
        // public long? Standard { get; set; }
        public long? EsgrcType { get; set; }

        public long? Uom { get; set; }

        public long? Category { get; set; }

        public long? Standard { get; set; }

        public long? Department { get; set; }

        public bool? IsKeyIndicator { get; set; }

        public string? Target { get; set; }

        public string? StandardYear { get; set; }

        public long Serviceid { get; set; }

        public long? Parentid { get; set; }

        public long Regulationtypeid { get; set; }

        public bool Isunique { get; set; } = false;

        public long? TimeDimension { get; set; }

        public string? FormulaeField { get; set; }

        public long? Prefix { get; set; }
    }
}
