using System.Threading.Tasks;

namespace Joy.PIM.BAL.Contracts
{
    public interface IMailEngine
    {
        Task SendEmail(string templateName, object model, string subject, string fromEmail,
            string[] toEmails,
            string[] ccEmails = null, string[] bccEmails = null);
    }
}