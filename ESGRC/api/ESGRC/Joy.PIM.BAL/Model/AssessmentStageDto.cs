﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Joy.PIM.BAL.Model
{
    public class AssessmentStageDto
    {
        public long Id { get; set; }

        public long RoleId { get; set; }

        public long TemplateId { get; set; }

        public string TemplateName { get; set; }
    }
}
