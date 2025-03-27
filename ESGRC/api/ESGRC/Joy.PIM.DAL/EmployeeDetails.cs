using System;

namespace Joy.PIM.DAL
{
    public class EmployeeDetails : Entity
    {
        public string EmployeeId { get; set; }

        public string Name { get; set; }

        public string BusinessUnit { get; set; }

        public string BloodGroup { get; set; }

        public string Doj { get; set; }

        public string? Dol { get; set; }

        public string Gender { get; set; }

        public string Esi { get; set; }

        public string Pf { get; set; }

        public string Lwf { get; set; }

        public string Designation { get; set; }

        public string OnboardingStatus { get; set; }

        public string? OfferReleasedDate { get; set; }

        public string? OfferAcceptedDate { get; set; }

        public string EmploymentType { get; set; }

        public string EmploymentStatus { get; set; }

        public string Client { get; set; }

        public string StaffingStartDate { get; set; }

        public string StaffingEndDate { get; set; }

        public string StaffingStatus { get; set; }

        public string WorkingLocation { get; set; }

        public string WorkingState { get; set; }

        public string? Education { get; set; }

        public string HealthInsurance { get; set; }

        public string AccidentalInsurance { get; set; }

        public string TrainingInduction { get; set; }

        public string HealthAndSafetyMeasures { get; set; }

        public string SkillUpGradation { get; set; }

        // public long FiscalYearId { get; set; }
    }
}
