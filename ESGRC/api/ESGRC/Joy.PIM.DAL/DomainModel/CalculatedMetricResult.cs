namespace Joy.PIM.DAL.DomainModel;

public class CalculatedMetricResult
{
    public string MetricsQuestion { get; set; }

    public int MetricGroupId { get; set; }

    public string FormulaeField { get; set; }

    public double MetricValue { get; set; }

    public double CalculatedResult { get; set; }
}
