using ComplianceTracker.API.DTOs;
using ComplianceTracker.API.Services;
using ComplianceTracker.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ComplianceTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Accounts")] // Base authorization for all endpoints
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ApplicationDbContext _context;

    public TasksController(ITaskService taskService, ApplicationDbContext context)
    {
        _taskService = taskService;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks(
        [FromQuery] int? companyId = null,
        [FromQuery] string? functionType = null,
        [FromQuery] string? status = null,
        [FromQuery] string? financialYear = null,
        [FromQuery] bool myTasks = false)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // If myTasks is true but no userId, return bad request
        if (myTasks && string.IsNullOrEmpty(userId))
        {
            return BadRequest("User ID is required when filtering for myTasks");
        }

        var tasks = await _taskService.GetTasksAsync(
            userId: myTasks ? userId : null,
            companyId: companyId,
            functionType: functionType,
            status: status,
            financialYear: financialYear);

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        if (task == null)
            return NotFound();

        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto createTaskDto)
    {
        var task = await _taskService.CreateTaskAsync(createTaskDto);
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto updateTaskDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Get logged-in user ID
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User ID not found");

        var task = await _taskService.UpdateTaskAsync(id, updateTaskDto, userId);
        if (task == null)
            return NotFound("Task not found");

        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var result = await _taskService.DeleteTaskAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id}/files")]
    public async Task<IActionResult> UploadFile(int id, [FromForm(Name = "file")] IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var taskFileDto = await _taskService.UploadTaskFileAsync(id, file, userId);
        if (taskFileDto == null)
            return BadRequest(new { message = "File upload failed" });

        return Ok(taskFileDto);
    }

    [HttpDelete("files/{fileId}")]
    public async Task<IActionResult> DeleteFile(int fileId)
    {
        var result = await _taskService.DeleteTaskFileAsync(fileId);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpGet("{taskId}/files/{fileId}")]
    [AllowAnonymous]
    public async Task<IActionResult> ViewTaskFile(int taskId, int fileId)
    {
        var file = await _context.TaskFiles
            .Where(f => f.Id == fileId && f.TaskId == taskId)
            .Select(f => new
            {
                f.FileData,
                f.FileName
            })
            .FirstOrDefaultAsync();

        if (file == null || file.FileData == null)
            return NotFound();

        var contentType = GetContentType(file.FileName);
        return File(file.FileData, contentType, file.FileName);
    }

    private string GetContentType(string fileName)
    {
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(fileName, out var contentType))
        {
            contentType = "application/octet-stream";
        }
        return contentType;
    }
}