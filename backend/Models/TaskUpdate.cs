using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ComplianceTracker.API.Models
{
    public class TaskUpdate
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UpdateID { get; set; }

        public int TaskID { get; set; }
        public ComplianceTask? Task { get; set; }

        public string? UpdatedBy { get; set; }  // User ID as string
        public ApplicationUser? UpdatedByUser { get; set; }

        public string? Status { get; set; }  // Just store status as string (e.g., "completed")
        public string? Remark { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}