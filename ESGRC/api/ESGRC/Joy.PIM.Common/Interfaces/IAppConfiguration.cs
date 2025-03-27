using System.Threading.Tasks;

namespace Joy.PIM.Common.Interfaces
{
    public interface IAppConfiguration
    {
        Task<string> GetValue(string key);

        Task Reload();
    }
}