using ComplianceTracker.API.DTOs;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ComplianceTracker.API.Services
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskDto>> GetTasksAsync(
            string? userId,
            int? companyId,
            string? functionType,
            string? status,
            string? financialYear);

        Task<TaskDto?> GetTaskByIdAsync(int taskId);

        Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto);

        Task<TaskDto?> UpdateTaskAsync(int taskId, UpdateTaskDto updateTaskDto, string userId);

        Task<bool> DeleteTaskAsync(int taskId);

        // ✅ Updated return type to TaskFileDto
        Task<TaskFileDto?> UploadTaskFileAsync(int taskId, IFormFile file, string uploadedByUserId);

        Task<bool> DeleteTaskFileAsync(int fileId);
    }
}
