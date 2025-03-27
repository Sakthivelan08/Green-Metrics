using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class CalculationProcessDto
    {
        public long? Id { get; set; }

        public long? TimeDimension { get; set; }

        public long? FormulaStandardId { get; set; }

        public string FormulaStandardName { get; set; }

        public string FormulaInput { get; set; }

        public long? FormulaOutput { get; set; }

        public string FormulainputName { get; set; }

        public string FormulaoutputName { get; set; }

        public string ChildQuestion { get; set; }

        public long? ChildQuestionId { get; set; }
    }
}
