namespace Joy.PIM.DAL.DomainModel;

public class GHIReportDto
{
    public string ActivityType { get; set; }

    public decimal TargetEmissions { get; set; }

    public decimal ActualEmissions { get; set; }

    public decimal Variance { get; set; }
}
