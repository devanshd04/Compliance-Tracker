using ComplianceTracker.API.Data;
using ComplianceTracker.API.DTOs;
using ComplianceTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ComplianceTracker.API.Services;

public class CompanyService : ICompanyService
{
    private readonly ApplicationDbContext _context;

    public CompanyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CompanyDto>> GetCompaniesAsync()
    {
        var companies = await _context.Companies
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return companies.Select(MapToCompanyDto).ToList();
    }

    public async Task<CompanyDto?> GetCompanyByIdAsync(int companyId)
    {
        var company = await _context.Companies.FindAsync(companyId);
        return company == null ? null : MapToCompanyDto(company);
    }

    public async Task<CompanyDto> CreateCompanyAsync(CreateCompanyDto createCompanyDto)
    {
        var company = new Company
        {
            Name = createCompanyDto.Name,
            Code = createCompanyDto.Code.ToUpper(),
            IsActive = true
        };

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        return MapToCompanyDto(company);
    }

    public async Task<CompanyDto?> UpdateCompanyAsync(int companyId, UpdateCompanyDto updateCompanyDto)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null)
            return null;

        company.Name = updateCompanyDto.Name;
        company.Code = updateCompanyDto.Code.ToUpper();
        company.IsActive = updateCompanyDto.IsActive;

        await _context.SaveChangesAsync();

        return MapToCompanyDto(company);
    }

    public async Task<bool> DeleteCompanyAsync(int companyId)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null)
            return false;

        company.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }

    private static CompanyDto MapToCompanyDto(Company company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Code = company.Code,
            IsActive = company.IsActive,
            CreatedAt = company.CreatedAt
        };
    }
}