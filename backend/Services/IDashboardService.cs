using ComplianceTracker.API.DTOs;

namespace ComplianceTracker.API.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync(string? financialYear = null, int? companyId = null);
    Task<DashboardStatsDto> GetDashboardStatsAsync(string userId, string userRole, string? financialYear = null, int? companyId = null);
    Task<List<ExceptionReportDto>> GetExceptionReportsAsync(string userId, string userRole, string? financialYear = null, int? companyId = null);
}
