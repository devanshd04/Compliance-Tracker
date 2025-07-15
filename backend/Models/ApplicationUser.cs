using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ComplianceTracker.API.Models;

public class ApplicationUser : IdentityUser
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public virtual ICollection<UserCompanyFunction> UserCompanyFunctions { get; set; } = new List<UserCompanyFunction>();
    public virtual ICollection<ComplianceTask> AssignedTasks { get; set; } = new List<ComplianceTask>();
}