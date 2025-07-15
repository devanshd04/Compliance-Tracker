using System.ComponentModel.DataAnnotations;

namespace ComplianceTracker.API.Models;

public class Function
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // accounting, tax, compliance, audit
    
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<UserCompanyFunction> UserCompanyFunctions { get; set; } = new List<UserCompanyFunction>();
    public virtual ICollection<ComplianceTask> Tasks { get; set; } = new List<ComplianceTask>();
}