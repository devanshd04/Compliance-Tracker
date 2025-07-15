using ComplianceTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ComplianceTracker.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Management,Accounts,Tax,Compliance,Audit")]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats(
        [FromQuery] string? financialYear = null,
        [FromQuery] int? companyId = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "user";

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User identification missing" });
        }

        var stats = await _dashboardService.GetDashboardStatsAsync(userId, userRole, financialYear, companyId);
        return Ok(stats);
    }

    [HttpGet("exceptions")]
    public async Task<IActionResult> GetExceptionReports(
        [FromQuery] string? financialYear = null,
        [FromQuery] int? companyId = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "user";

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User identification missing" });
        }

        var reports = await _dashboardService.GetExceptionReportsAsync(userId, userRole, financialYear, companyId);
        return Ok(reports);
    }
}
