using ComplianceTracker.API.Data;
using ComplianceTracker.API.DTOs;
using ComplianceTracker.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ComplianceTracker.API.Controllers;

//[Authorize(Roles = "admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;

    public UsersController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsersAsync()
    {
        var users = await _userManager.Users.ToListAsync();

        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var companyFunctions = await _context.UserCompanyFunctions
                .Include(ucf => ucf.Company)
                .Include(ucf => ucf.Function)
                .Where(ucf => ucf.UserId == user.Id && ucf.IsActive)
                .ToListAsync();

            userDtos.Add(new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                FullName = user.FullName,
                Role = roles.FirstOrDefault() ?? string.Empty,
                IsActive = user.IsActive,
                CompanyIds = companyFunctions.Select(x => x.CompanyId).Distinct().ToList(),
                FunctionTypes = companyFunctions.Select(x => x.Function.Type).Distinct().ToList()
            });
        }

        return Ok(userDtos);
    }
} 
