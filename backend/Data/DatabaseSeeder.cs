using ComplianceTracker.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ComplianceTracker.API.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Seed Roles
        await SeedRolesAsync(roleManager);

        // Seed Functions
        await SeedFunctionsAsync(context);

        // Seed Companies
        await SeedCompaniesAsync(context);

        // Seed Users
        await SeedUsersAsync(userManager);

        // Seed User-Company-Function mappings
        await SeedUserCompanyFunctionsAsync(context, userManager);

        await context.SaveChangesAsync();
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        string[] roles = { "Admin", "Management", "Accounts", "Tax", "Compliance", "Audit" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }

    private static async Task SeedFunctionsAsync(ApplicationDbContext context)
    {
        if (!await context.Functions.AnyAsync())
        {
            var functions = new[]
            {
                new Function { Name = "Accounting", Description = "Financial reporting and accounting", Type = "accounting" },
                new Function { Name = "Tax", Description = "Tax compliance and filing", Type = "tax" },
                new Function { Name = "Compliance", Description = "Regulatory compliance", Type = "compliance" },
                new Function { Name = "Audit", Description = "Internal and external audits", Type = "audit" }
            };

            context.Functions.AddRange(functions);
        }
    }

    private static async Task SeedCompaniesAsync(ApplicationDbContext context)
    {
        if (!await context.Companies.AnyAsync())
        {
            var companies = new[]
            {
                new Company { Name = "ABC Limited", Code = "ABC" },
                new Company { Name = "XYZ Private Ltd", Code = "XYZ" },
                new Company { Name = "DEF Corp", Code = "DEF" }
            };

            context.Companies.AddRange(companies);
        }
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager)
    {
        var users = new[]
        {
            new { Email = "admin@company.com", FullName = "Admin User", Role = "Admin" },
            new { Email = "management@company.com", FullName = "Mike Management", Role = "Management" },
            new { Email = "accounts@company.com", FullName = "John Accounts", Role = "Accounts" },
            new { Email = "tax@company.com", FullName = "Sarah Tax", Role = "Tax" },
            new { Email = "compliance@company.com", FullName = "Lisa Compliance", Role = "Compliance" },
            new { Email = "audit@company.com", FullName = "David Audit", Role = "Audit" }
        };

        foreach (var userData in users)
        {
            var existingUser = await userManager.FindByEmailAsync(userData.Email);
            if (existingUser == null)
            {
                var user = new ApplicationUser
                {
                    UserName = userData.Email,
                    Email = userData.Email,
                    FullName = userData.FullName,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(user, "Password123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, userData.Role);
                }
            }
        }
    }

    private static async Task SeedUserCompanyFunctionsAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        if (!await context.UserCompanyFunctions.AnyAsync())
        {
            var adminUser = await userManager.FindByEmailAsync("admin@company.com");
            var managementUser = await userManager.FindByEmailAsync("management@company.com");
            var accountsUser = await userManager.FindByEmailAsync("accounts@company.com");
            var taxUser = await userManager.FindByEmailAsync("tax@company.com");

            var companies = await context.Companies.ToListAsync();
            var functions = await context.Functions.ToListAsync();

            var mappings = new List<UserCompanyFunction>();

            // Admin and Management have access to all companies and functions
            foreach (var company in companies)
            {
                foreach (var function in functions)
                {
                    if (adminUser != null)
                    {
                        mappings.Add(new UserCompanyFunction
                        {
                            UserId = adminUser.Id,
                            CompanyId = company.Id,
                            FunctionId = function.Id
                        });
                    }

                    if (managementUser != null)
                    {
                        mappings.Add(new UserCompanyFunction
                        {
                            UserId = managementUser.Id,
                            CompanyId = company.Id,
                            FunctionId = function.Id
                        });
                    }
                }
            }

            // Accounts user has access to accounting function for specific companies
            if (accountsUser != null)
            {
                var accountingFunction = functions.First(f => f.Type == "accounting");
                foreach (var company in companies.Take(2)) // First 2 companies
                {
                    mappings.Add(new UserCompanyFunction
                    {
                        UserId = accountsUser.Id,
                        CompanyId = company.Id,
                        FunctionId = accountingFunction.Id
                    });
                }
            }

            // Tax user has access to tax function for specific companies
            if (taxUser != null)
            {
                var taxFunction = functions.First(f => f.Type == "tax");
                foreach (var company in companies.Skip(1)) // Last 2 companies
                {
                    mappings.Add(new UserCompanyFunction
                    {
                        UserId = taxUser.Id,
                        CompanyId = company.Id,
                        FunctionId = taxFunction.Id
                    });
                }
            }

            context.UserCompanyFunctions.AddRange(mappings);
        }
    }
}