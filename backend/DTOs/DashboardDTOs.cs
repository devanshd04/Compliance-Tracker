namespace ComplianceTracker.API.DTOs;

public class DashboardStatsDto
{
    public int OnTrack { get; set; }
    public int Delayed { get; set; }
    public int Pending { get; set; }
    public int Completed { get; set; }
    public int TotalTasks { get; set; }
}

public class ExceptionReportDto
{
    public string EntityName { get; set; } = string.Empty;
    public string FunctionType { get; set; } = string.Empty;
    public string TaskType { get; set; } = string.Empty;
    public string AssignedToUserName { get; set; } = string.Empty;
    public DateTime PlannedDate { get; set; }
    public DateTime? ActualDate { get; set; }
    public int DelayDays { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Remarks { get; set; }
}