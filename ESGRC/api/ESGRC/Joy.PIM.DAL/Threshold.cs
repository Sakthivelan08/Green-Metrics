using System;

namespace Joy.PIM.DAL
{
    public class Threshold : Entity
    {
        public string? AssetCode { get; set; }

        public string? MetriC { get; set; }

        public DateTime? Date { get; set; }
        
        public long? Year { get; set; }

        public long? Value { get; set; }
    }
}
