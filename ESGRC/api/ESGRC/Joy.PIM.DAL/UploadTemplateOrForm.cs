using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.DAL
{
    public class UploadTemplateOrForm : Entity
    {
        public long ProcessStageId { get; set; }

        public long NextStageId { get; set; }

        public long? ProductId { get; set; }

        public long TemplateId { get; set; }

        public Dictionary<string, object>? Dict { get; set; }

        public Dictionary<string, object>? ErrorData { get; set; }

        public long LanguageId { get; set; }
    }
}
