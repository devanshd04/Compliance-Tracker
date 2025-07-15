using ComplianceTracker.API.Data;
using ComplianceTracker.API.DTOs;
using ComplianceTracker.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ComplianceTracker.API.Services;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<TaskService> _logger;
    private readonly UserManager<ApplicationUser> _userManager;

    public TaskService(
        ApplicationDbContext context,
        IWebHostEnvironment environment,
        ILogger<TaskService> logger,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _environment = environment;
        _logger = logger;
        _userManager = userManager;
    }

    public async Task<IEnumerable<TaskDto>> GetTasksAsync(string? userId = null, int? companyId = null, string? functionType = null, string? status = null, string? financialYear = null)
    {
        var query = _context.ComplianceTasks
            .Include(t => t.Company)
            .Include(t => t.Function)
            .Include(t => t.AssignedToUser)
            .Include(t => t.Files)
                .ThenInclude(f => f.UploadedByUser)
            .AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(t => t.AssignedToUserId == userId);

        if (companyId.HasValue)
            query = query.Where(t => t.CompanyId == companyId.Value);

        if (!string.IsNullOrEmpty(functionType))
            query = query.Where(t => t.Function.Type == functionType);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        if (!string.IsNullOrEmpty(financialYear))
            query = query.Where(t => t.FinancialYear == financialYear);

        var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

        foreach (var task in tasks)
        {
            _ = task.Files.Select(f => f.FileData).ToList();
        }

        return tasks.Select(MapToTaskDto).ToList();
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int taskId)
    {
        var task = await _context.ComplianceTasks
            .Include(t => t.Company)
            .Include(t => t.Function)
            .Include(t => t.AssignedToUser)
            .Include(t => t.AssignedByUser) // safe even if null
            .Include(t => t.Files)
                .ThenInclude(f => f.UploadedByUser)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task != null)
        {
            _ = task.Files.Select(f => f.FileData).ToList();
        }

        return task == null ? null : MapToTaskDto(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto)
    {
        var task = new ComplianceTask
        {
            CompanyId = createTaskDto.CompanyId,
            FunctionId = createTaskDto.FunctionId,
            AssignedToUserId = createTaskDto.AssignedToUserId,
            TaskType = createTaskDto.TaskType,
            Status = "not_started",
            PlannedDate = createTaskDto.PlannedDate,
            ActualDate = createTaskDto.ActualDate,
            Remarks = createTaskDto.Remarks,
            FinancialYear = createTaskDto.FinancialYear,
            Quarter = createTaskDto.Quarter,
            Month = createTaskDto.Month,
            FilingDueDate = createTaskDto.FilingDueDate,
            ActualFilingDate = createTaskDto.ActualFilingDate,
            ResponsiblePerson = createTaskDto.ResponsiblePerson,
            MeetingDates = createTaskDto.MeetingDates != null ? JsonSerializer.Serialize(createTaskDto.MeetingDates) : null,
            ApprovedByBoard = createTaskDto.ApprovedByBoard,
            MinutesStatus = createTaskDto.MinutesStatus,
            Milestone = createTaskDto.Milestone
        };

        _context.ComplianceTasks.Add(task);
        await _context.SaveChangesAsync();

        return await GetTaskByIdAsync(task.Id) ?? throw new InvalidOperationException("Failed to retrieve created task");
    }

    public async Task<TaskDto?> UpdateTaskAsync(int taskId, UpdateTaskDto updateTaskDto, string userId)
    {
        var task = await _context.ComplianceTasks
            .Include(t => t.Company)
            .Include(t => t.Function)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            return null;

        var user = await _context.Users.FindAsync(userId);
        if (user == null) 
            return null;

        bool isAdmin = await _userManager.IsInRoleAsync(user, "Admin");

        bool isAnyUpdate = updateTaskDto.Status != null ||
                           updateTaskDto.Remarks != null ||
                           updateTaskDto.ActualFilingDate.HasValue ||
                           updateTaskDto.MeetingDates != null ||
                           updateTaskDto.ApprovedByBoard.HasValue ||
                           updateTaskDto.MinutesStatus != null;

        if (!isAdmin && isAnyUpdate)
        {
            task.ActualDate = DateTime.UtcNow;
        }

        if (isAdmin && updateTaskDto.ActualDate.HasValue)
        {
            task.ActualDate = updateTaskDto.ActualDate;
        }

        if (!string.IsNullOrWhiteSpace(updateTaskDto.Status))
            task.Status = updateTaskDto.Status;

        if (updateTaskDto.Remarks != null)
            task.Remarks = updateTaskDto.Remarks;

        if (updateTaskDto.ActualFilingDate.HasValue)
            task.ActualFilingDate = updateTaskDto.ActualFilingDate;

        if (updateTaskDto.MeetingDates != null)
        {
            try
            {
                task.MeetingDates = JsonSerializer.Serialize(updateTaskDto.MeetingDates);
            }
            catch
            {
                task.MeetingDates = null;
            }
        }

        if (updateTaskDto.ApprovedByBoard.HasValue)
            task.ApprovedByBoard = updateTaskDto.ApprovedByBoard;

        if (!string.IsNullOrWhiteSpace(updateTaskDto.MinutesStatus))
            task.MinutesStatus = updateTaskDto.MinutesStatus;

        task.UpdatedAt = DateTime.UtcNow;

        // Insert into TaskUpdates
        if (isAnyUpdate)
        {
            var update = new TaskUpdate
            {
                TaskID = taskId,
                Status = updateTaskDto.Status,
                Remark = updateTaskDto.Remarks,
                UpdatedBy = userId,
                UpdatedAt = DateTime.UtcNow
            };
            _context.TaskUpdates.Add(update);
        }

        await _context.SaveChangesAsync();

        return await GetTaskByIdAsync(taskId);
    }

    public async Task<bool> DeleteTaskAsync(int taskId)
    {
        var task = await _context.ComplianceTasks.FindAsync(taskId);
        if (task == null)
            return false;

        _context.ComplianceTasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<TaskFileDto?> UploadTaskFileAsync(int taskId, IFormFile file, string userId)
    {
        var task = await _context.ComplianceTasks.FindAsync(taskId);
        if (task == null || file == null || file.Length == 0)
            return null;

        byte[] fileBytes;
        using (var memoryStream = new MemoryStream())
        {
            await file.CopyToAsync(memoryStream);
            fileBytes = memoryStream.ToArray();
        }

        var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "Uploads", "tasks");
        Directory.CreateDirectory(uploadsPath);

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsPath, fileName);
        await File.WriteAllBytesAsync(filePath, fileBytes);

        var taskFile = new TaskFile
        {
            TaskId = taskId,
            FileName = file.FileName,
            FilePath = $"/Uploads/tasks/{fileName}",
            ContentType = file.ContentType,
            FileSize = file.Length,
            UploadedByUserId = userId,
            UploadedAt = DateTime.UtcNow,
            FileData = fileBytes
        };

        _context.TaskFiles.Add(taskFile);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return new TaskFileDto
        {
            Id = taskFile.Id,
            FileName = taskFile.FileName,
            FilePath = taskFile.FilePath,
            ContentType = taskFile.ContentType,
            FileSize = taskFile.FileSize,
            UploadedAt = taskFile.UploadedAt,
            UploadedByUserName = user?.FullName ?? "Unknown",
            FileData = null
        };
    }

    public async Task<bool> DeleteTaskFileAsync(int fileId)
    {
        var file = await _context.TaskFiles.FindAsync(fileId);
        if (file == null)
            return false;

        var physicalPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, file.FilePath.TrimStart('/'));
        if (File.Exists(physicalPath))
        {
            File.Delete(physicalPath);
        }

        _context.TaskFiles.Remove(file);
        await _context.SaveChangesAsync();

        return true;
    }

    private static TaskDto MapToTaskDto(ComplianceTask task)
    {
        List<DateTime>? meetingDates = null;
        if (!string.IsNullOrEmpty(task.MeetingDates))
        {
            try
            {
                meetingDates = JsonSerializer.Deserialize<List<DateTime>>(task.MeetingDates);
            }
            catch
            {
                meetingDates = null;
            }
        }

        return new TaskDto
        {
            Id = task.Id,
            CompanyId = task.CompanyId,
            CompanyName = task.Company?.Name ?? "Unknown",
            CompanyCode = task.Company?.Code ?? "",
            FunctionId = task.FunctionId,
            FunctionType = task.Function?.Type ?? "",
            AssignedToUserId = task.AssignedToUserId,
            AssignedToUserName = task.AssignedToUser?.FullName ?? "Unknown",
            TaskType = task.TaskType,
            Status = task.Status,
            PlannedDate = task.PlannedDate,
            ActualDate = task.ActualDate,
            Remarks = task.Remarks,
            FinancialYear = task.FinancialYear,
            Quarter = task.Quarter,
            Month = task.Month,
            FilingDueDate = task.FilingDueDate,
            ActualFilingDate = task.ActualFilingDate,
            ResponsiblePerson = task.ResponsiblePerson,
            MeetingDates = meetingDates,
            ApprovedByBoard = task.ApprovedByBoard,
            MinutesStatus = task.MinutesStatus,
            Milestone = task.Milestone,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            Files = task.Files.Select(f => new TaskFileDto
            {
                Id = f.Id,
                FileName = f.FileName,
                FilePath = f.FilePath,
                ContentType = f.ContentType,
                FileSize = f.FileSize,
                UploadedByUserName = f.UploadedByUser?.FullName ?? "Unknown",
                UploadedAt = f.UploadedAt,
                FileData = f.FileData
            }).ToList()
        };
    }

    // ✅ NEW METHOD — fetch task updates with username
    public async Task<List<object>> GetTaskUpdatesWithUsernamesAsync(int taskId)
    {
        return await _context.TaskUpdates
            .Where(u => u.TaskID == taskId)
            .OrderByDescending(u => u.UpdatedAt)
            .Select(u => new
            {
                u.Status,
                u.Remark,
                u.UpdatedAt,
                UpdatedBy = _context.Users
                    .Where(user => user.Id == u.UpdatedBy)
                    .Select(user => user.FullName)
                    .FirstOrDefault()
            })
            .ToListAsync<object>();
    }
}
