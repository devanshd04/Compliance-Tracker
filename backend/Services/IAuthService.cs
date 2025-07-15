using ComplianceTracker.API.DTOs;

namespace ComplianceTracker.API.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    Task<bool> RegisterAsync(RegisterRequestDto request);
    Task<UserDto?> GetUserProfileAsync(string userId);
}