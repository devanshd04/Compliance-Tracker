using ComplianceTracker.API.DTOs;

namespace ComplianceTracker.API.Services;

public interface ICompanyService
{
    Task<List<CompanyDto>> GetCompaniesAsync();
    Task<CompanyDto?> GetCompanyByIdAsync(int companyId);
    Task<CompanyDto> CreateCompanyAsync(CreateCompanyDto createCompanyDto);
    Task<CompanyDto?> UpdateCompanyAsync(int companyId, UpdateCompanyDto updateCompanyDto);
    Task<bool> DeleteCompanyAsync(int companyId);
}