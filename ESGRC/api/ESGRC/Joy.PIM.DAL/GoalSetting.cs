using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class GoalSetting : Entity
    {
        public long Id { get; set; }

        public string? Name { get; set; }

        public long? YearId { get; set; }

        [Editable(true)]
        public string? TargetJson { get; set; }

        public long UploadedFileid { get; set; }
    }
}
