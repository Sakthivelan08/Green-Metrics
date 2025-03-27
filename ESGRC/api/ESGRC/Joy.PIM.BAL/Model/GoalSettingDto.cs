using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class GoalSettingDto
    {
        public long Id { get; set; }

        public string? Name { get; set; }

        public long YearId { get; set; }

        public string? YearName { get; set; }

        public Dictionary<string, object> TargetJson { get; set; }
    }
}
