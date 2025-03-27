using Dapper;
using Joy.PIM.Common;
using Joy.PIM.Common.MetaAttributes;

namespace Joy.PIM.DAL;
public class HyperlinkEdit : Entity
{
    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string Email { get; set; } = null!;

    public string? Mobile { get; set; } = null!;

    public long Id { get; set; }

    public string? Address { get; set; } = null!;
}