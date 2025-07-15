using System.ComponentModel.DataAnnotations;

namespace ComplianceTracker.API.Models;

public class ComplianceTask
{
    public int Id { get; set; }
    
    public int CompanyId { get; set; }
    
    public int FunctionId { get; set; }
    
    [Required]
    public string AssignedToUserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string TaskType { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "not_started"; // not_started, in_progress, completed, delayed, pending
    
    public DateTime PlannedDate { get; set; }
    
    public DateTime? ActualDate { get; set; }
    
    [MaxLength(1000)]
    public string? Remarks { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string FinancialYear { get; set; } = string.Empty;
    
    // Task-specific fields
    [MaxLength(10)]
    public string? Quarter { get; set; } // Q1, Q2, Q3, Q4
    
    [MaxLength(20)]
    public string? Month { get; set; }
    
    public DateTime? FilingDueDate { get; set; }
    
    public DateTime? ActualFilingDate { get; set; }
    
    [MaxLength(200)]
    public string? ResponsiblePerson { get; set; }
    
    public string? MeetingDates { get; set; } // JSON array of dates
    
    public bool? ApprovedByBoard { get; set; }
    
    [MaxLength(50)]
    public string? MinutesStatus { get; set; } // pending, draft, approved, circulated
    
    [MaxLength(100)]
    public string? Milestone { get; set; } // audit_start, field_work_done, etc.
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Company Company { get; set; } = null!;
    public virtual Function Function { get; set; } = null!;
    public virtual ApplicationUser AssignedToUser { get; set; } = null!;
    public virtual ApplicationUser AssignedByUser { get; set; } = null!;
    public virtual ICollection<TaskFile> Files { get; set; } = new List<TaskFile>();
    public virtual ICollection<TaskUpdate> Updates { get; set; } = new List<TaskUpdate>();
}