using ComplianceTracker.API.DTOs;
using ComplianceTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComplianceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompaniesController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCompanies()
    {
        var companies = await _companyService.GetCompaniesAsync();
        return Ok(companies);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCompany(int id)
    {
        var company = await _companyService.GetCompanyByIdAsync(id);
        if (company == null)
            return NotFound();

        return Ok(company);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Accounts")]
    public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyDto createCompanyDto)
    {
        var company = await _companyService.CreateCompanyAsync(createCompanyDto);
        return CreatedAtAction(nameof(GetCompany), new { id = company.Id }, company);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Accounts")]
    public async Task<IActionResult> UpdateCompany(int id, [FromBody] UpdateCompanyDto updateCompanyDto)
    {
        var company = await _companyService.UpdateCompanyAsync(id, updateCompanyDto);
        if (company == null)
            return NotFound();

        return Ok(company);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Accounts")]
    public async Task<IActionResult> DeleteCompany(int id)
    {
        var result = await _companyService.DeleteCompanyAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}