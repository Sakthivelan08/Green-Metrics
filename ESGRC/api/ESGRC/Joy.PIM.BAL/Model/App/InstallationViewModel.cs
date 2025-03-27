﻿using Joy.PIM.BAL.Model.Account;

namespace Joy.PIM.BAL.Model.App
{
    public class InstallationViewModel
    {
        public AddOrUpdateUserViewModel AdminUserModel { get; set; }

        public string CompanyName { get; set; }

        public string TimeZone { get; set; }

        public string Currency { get; set; }

        public string Language { get; set; }
    }
}