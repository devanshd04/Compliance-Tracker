using System.ComponentModel.DataAnnotations;

namespace ComplianceTracker.API.Models;

public class Company
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<UserCompanyFunction> UserCompanyFunctions { get; set; } = new List<UserCompanyFunction>();
    public virtual ICollection<ComplianceTask> Tasks { get; set; } = new List<ComplianceTask>();
}