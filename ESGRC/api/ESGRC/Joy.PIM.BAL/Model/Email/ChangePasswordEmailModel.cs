using System;

namespace Joy.PIM.BAL.Model.Email
{
    public class ChangePasswordEmailModel
    {
        public string Name { get; set; }

        public string VerificationUrl { get; set; }

        public DateTimeOffset ExpiresAt { get; set; }
    }
}