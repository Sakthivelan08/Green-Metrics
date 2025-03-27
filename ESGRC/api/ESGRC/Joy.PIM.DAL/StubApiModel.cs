using System.Collections.Generic;

namespace Joy.PIM.DAL;

public class StubApiModel : Entity
{
    public long? MetricGroupId { get; set; }

    public long? TimeDimension { get; set; }

    public long? Uom { get; set; }

    public Dictionary<string, object> Data { get; set; }

    public string? ConversionFormulae { get; set; }

    public Dictionary<string, object> CalculatedJson { get; set; }
}
