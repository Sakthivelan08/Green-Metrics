using System;
using Dapper;

namespace Joy.PIM.Common.PostgresTypes
{
    public class PostgresLowerCaseTableNameResolver : SimpleCRUD.ITableNameResolver
    {
        public string ResolveTableName(Type type)
        {
            return type.Name.ToLower();
        }
    }
}