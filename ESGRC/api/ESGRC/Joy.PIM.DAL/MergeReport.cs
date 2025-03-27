using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class MergeReport : Entity
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public string PdfId { get; set; }
    }
}
