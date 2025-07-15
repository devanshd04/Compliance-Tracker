using ComplianceTracker.API.Data;
using ComplianceTracker.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ComplianceTracker.API.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Original implementation for admin fallback
    public async Task<DashboardStatsDto> GetDashboardStatsAsync(string? financialYear = null, int? companyId = null)
    {
        return await GetDashboardStatsAsync(null, "admin", financialYear, companyId);
    }

    // New stats method with user filtering
    public async Task<DashboardStatsDto> GetDashboardStatsAsync(string userId, string userRole, string? financialYear = null, int? companyId = null)
    {
        var query = _context.ComplianceTasks.AsQueryable();

        if (!string.IsNullOrEmpty(financialYear))
            query = query.Where(t => t.FinancialYear == financialYear);

        if (companyId.HasValue)
            query = query.Where(t => t.CompanyId == companyId.Value);

        if (!string.IsNullOrEmpty(userId) && !IsAdminOrManagement(userRole))
            query = query.Where(t => t.AssignedToUserId == userId);

        var tasks = await query.ToListAsync();

        return new DashboardStatsDto
        {
            TotalTasks = tasks.Count,
            Completed = tasks.Count(t => t.Status == "completed"),
            Pending = tasks.Count(t => t.Status == "not_started" || t.Status == "pending"),
            OnTrack = tasks.Count(t => t.Status == "completed" ||
                (t.Status == "in_progress" && (t.ActualDate == null || t.ActualDate <= t.PlannedDate))),
            Delayed = tasks.Count(t => t.ActualDate != null && t.ActualDate > t.PlannedDate)
        };
    }

    // Updated: Exception report with user filtering
    public async Task<List<ExceptionReportDto>> GetExceptionReportsAsync(
        string userId,
        string userRole,
        string? financialYear = null,
        int? companyId = null)
    {
        var query = _context.ComplianceTasks
            .Include(t => t.Company)
            .Include(t => t.Function)
            .Include(t => t.AssignedToUser)
            .Where(t => t.ActualDate != null && t.ActualDate > t.PlannedDate);

        if (!string.IsNullOrEmpty(financialYear))
            query = query.Where(t => t.FinancialYear == financialYear);

        if (companyId.HasValue)
            query = query.Where(t => t.CompanyId == companyId.Value);

        // Apply user filtering if not admin or management
        if (!IsAdminOrManagement(userRole) && !string.IsNullOrEmpty(userId))
            query = query.Where(t => t.AssignedToUserId == userId);

        var delayedTasks = await query.ToListAsync();

        return delayedTasks.Select(task => new ExceptionReportDto
        {
            EntityName = task.Company?.Name ?? "Unknown",
            FunctionType = task.Function?.Type ?? "Unknown",
            TaskType = task.TaskType,
            AssignedToUserName = task.AssignedToUser?.FullName ?? "Unassigned",
            PlannedDate = task.PlannedDate,
            ActualDate = task.ActualDate,
            DelayDays = task.ActualDate.HasValue
                ? (int)(task.ActualDate.Value - task.PlannedDate).TotalDays
                : 0,
            Status = task.Status,
            Remarks = task.Remarks
        }).ToList();
    }

    private bool IsAdminOrManagement(string userRole)
    {
        return userRole.Equals("admin", StringComparison.OrdinalIgnoreCase) ||
               userRole.Equals("management", StringComparison.OrdinalIgnoreCase);
    }
}
