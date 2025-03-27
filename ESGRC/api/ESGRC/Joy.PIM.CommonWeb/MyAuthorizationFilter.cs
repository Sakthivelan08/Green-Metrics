using Hangfire.Dashboard;

namespace Joy.PIM.CommonWeb;

public class MyAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        return true;
    }
}