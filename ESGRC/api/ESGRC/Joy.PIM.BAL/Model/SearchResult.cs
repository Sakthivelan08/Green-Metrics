using System.Collections.Generic;
using Joy.PIM.DAL;

namespace Joy.PIM.BAL.Model
{
    public class SearchResult<T>
    {
        private readonly object totalCount;

        public long TotalNoOfRecords { get; set; }

        public List<T> Records { get; set; }
    }
}