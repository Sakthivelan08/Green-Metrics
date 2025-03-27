using System;

namespace Joy.PIM.BAL.Model.Account
{
    public class LastLoginHistory
    {
        public long UserId { get; set; }

        public DateTime LastLoginDate { get; set; }

        public string Location { get; set; }
    }
}