using System.ComponentModel.DataAnnotations;

namespace ComplianceTracker.API.Models;

public class UserCompanyFunction
{
    public int Id { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    public int CompanyId { get; set; }
    
    public int FunctionId { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual Company Company { get; set; } = null!;
    public virtual Function Function { get; set; } = null!;
}