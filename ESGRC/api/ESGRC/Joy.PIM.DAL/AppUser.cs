using System;
using System.ComponentModel.DataAnnotations;
using Joy.PIM.Common.MetaAttributes;

namespace Joy.PIM.DAL
{
    [SearchField(new[] {"Address", "Domain", "FirstName", "Email", "Name", "LastName", "EmployeeNo", "Mobile"})]
    public class AppUser : Entity
    {
        public string Address { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        [Required(ErrorMessage = "Please input your E-mail!")]
        public string Email { get; set; } = null!;

        public string EncryptionKey { get; set; } = null!;

        public string FirstName { get; set; } = null!;

        public bool HasAcceptedPrivacyPolicy { get; set; }

        public bool HasAcceptedTerms { get; set; }

        public bool IsDeleted { get; set; }

        public bool Isemailverified { get; set; }

        public string LastName { get; set; } = null!;

        [StringLength(12, MinimumLength = 4)]
        [Required(ErrorMessage = "Please input phone number!")]
        public string Mobile { get; set; } = null!;

        [StringLength(100, MinimumLength = 2)]
        [Required(ErrorMessage = "Please input name!")]
        public string Name { get; set; } = null!;

        public string Password { get; set; } = null!;

        public string VerificationKey { get; set; } = null!;

        public DateTimeOffset VerificationKeyExpiryTime { get; set; }
    }
}