namespace Joy.PIM.DAL
{
    public class Bescom : Entity
    {
        public string? Month { get; set; }

        public string? Unit { get; set; }

        public decimal? Amount { get; set; }

        public long? FiscalYearId { get; set; }
    }
}
