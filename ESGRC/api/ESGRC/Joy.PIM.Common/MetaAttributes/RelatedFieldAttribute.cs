﻿using System;

namespace Joy.PIM.Common.MetaAttributes
{
    public class RelatedFieldAttribute : Attribute
    {
        public RelatedFieldAttribute(string parentEntityName)
        {
            this.ParentEntityName = parentEntityName;
        }

        public string ParentEntityName { get; }
    }
}