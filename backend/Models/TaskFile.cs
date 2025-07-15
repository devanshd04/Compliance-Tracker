using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // ← Add this

namespace ComplianceTracker.API.Models;

public class TaskFile
{
    public int Id { get; set; }

    public int TaskId { get; set; }

    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ContentType { get; set; }

    public long FileSize { get; set; }

    [Required]
    public string UploadedByUserId { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // ✅ Map to MySQL column `file_data`
    [Column("file_data")]
    public byte[]? FileData { get; set; }

    public virtual ComplianceTask Task { get; set; } = null!;
    public virtual ApplicationUser UploadedByUser { get; set; } = null!;
}
