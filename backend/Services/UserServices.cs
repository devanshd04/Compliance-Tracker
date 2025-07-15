using ComplianceTracker.API.Data;
using ComplianceTracker.API.DTOs;
using ComplianceTracker.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ComplianceTracker.API.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllUsersAsync();
}

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserService(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _userManager.Users
            .Where(u => u.IsActive)
            .ToListAsync();

        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var ucf = await _context.UserCompanyFunctions
                .Where(ucf => ucf.UserId == user.Id && ucf.IsActive)
                .Include(ucf => ucf.Company)
                .Include(ucf => ucf.Function)
                .ToListAsync();

            userDtos.Add(new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                FullName = user.FullName,
                Role = roles.FirstOrDefault() ?? "",
                IsActive = user.IsActive,
                CompanyIds = ucf.Select(c => c.CompanyId).Distinct().ToList(),
                FunctionTypes = ucf.Select(f => f.Function.Type).Distinct().ToList()
            });
        }

        return userDtos;
    }
}
