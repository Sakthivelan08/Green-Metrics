using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class MetricStandard : Entity
    {
        public long? YearId { get; set; }

        [Editable(true)]
        public string? StandardJson { get; set; }

        public long UploadedFileid { get; set; }
    }
}
