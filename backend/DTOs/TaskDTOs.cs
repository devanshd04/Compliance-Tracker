using System.ComponentModel.DataAnnotations;

namespace ComplianceTracker.API.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyCode { get; set; } = string.Empty;
    public int FunctionId { get; set; }
    public string FunctionType { get; set; } = string.Empty;
    public string AssignedToUserId { get; set; } = string.Empty;
    public string AssignedToUserName { get; set; } = string.Empty;
    public string TaskType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime PlannedDate { get; set; }
    public DateTime? ActualDate { get; set; }
    public string? Remarks { get; set; }
    public string FinancialYear { get; set; } = string.Empty;
    public string? Quarter { get; set; }
    public string? Month { get; set; }
    public DateTime? FilingDueDate { get; set; }
    public DateTime? ActualFilingDate { get; set; }
    public string? ResponsiblePerson { get; set; }
    public List<DateTime>? MeetingDates { get; set; }
    public bool? ApprovedByBoard { get; set; }
    public string? MinutesStatus { get; set; }
    public string? Milestone { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<TaskFileDto> Files { get; set; } = new();
}

public class CreateTaskDto
{
    [Required]
    public int CompanyId { get; set; }

    [Required]
    public int FunctionId { get; set; }

    [Required]
    public string AssignedToUserId { get; set; } = string.Empty;

    [Required]
    public string TaskType { get; set; } = string.Empty;

    [Required]
    public DateTime PlannedDate { get; set; }

    public DateTime? ActualDate { get; set; }

    public string? Remarks { get; set; }

    [Required]
    public string FinancialYear { get; set; } = string.Empty;

    public string? Quarter { get; set; }
    public string? Month { get; set; }
    public DateTime? FilingDueDate { get; set; }
    public DateTime? ActualFilingDate { get; set; }
    public string? ResponsiblePerson { get; set; }
    public List<DateTime>? MeetingDates { get; set; }
    public bool? ApprovedByBoard { get; set; }
    public string? MinutesStatus { get; set; }
    public string? Milestone { get; set; }
}

public class UpdateTaskDto
{
    public string? Status { get; set; }
    public DateTime? ActualDate { get; set; }
    public string? Remarks { get; set; }
    public DateTime? ActualFilingDate { get; set; }
    public List<DateTime>? MeetingDates { get; set; }
    public bool? ApprovedByBoard { get; set; }
    public string? MinutesStatus { get; set; }
}

public class TaskFileDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public long FileSize { get; set; }
    public string UploadedByUserName { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }

    // ✅ New: Include the binary data
    public byte[]? FileData { get; set; }
}
