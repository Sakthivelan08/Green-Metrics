using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class CalculationProcess : Entity
    {
        public long? TimeDimension { get; set; }

        public long? FormulaStandardId { get; set; }

        public long? FormulaInput { get; set; }

        public string? FormulaOutput { get; set; }

        public long? MetricId { get; set; }

        public string? ExcelFormulae { get; set; }
    }
}
