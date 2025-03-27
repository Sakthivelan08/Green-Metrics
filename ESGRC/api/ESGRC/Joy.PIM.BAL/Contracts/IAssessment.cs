using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Joy.PIM.BAL.Model;
using Joy.PIM.DAL;
using Joy.PIM.DAL.Master;

namespace Joy.PIM.BAL.Contracts
{
    public interface IAssessment
    {
        Task CreateServices(Service model);

        Task CreateAssessment(Assessment model);

        Task<IEnumerable<AssessmentDto>> GetAssessments();

        Task<IEnumerable<Service>> GetServicesAssessment();

        Task<IEnumerable<Assessment>> GetAssessmentList();
    }
}
