using ComplianceTracker.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ComplianceTracker.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Company> Companies { get; set; }
    public DbSet<Function> Functions { get; set; }
    public DbSet<UserCompanyFunction> UserCompanyFunctions { get; set; }
    public DbSet<ComplianceTask> ComplianceTasks { get; set; }
    public DbSet<TaskFile> TaskFiles { get; set; }
    public DbSet<TaskUpdate> TaskUpdates { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Company configuration
        builder.Entity<Company>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
        });

        // Function configuration
        builder.Entity<Function>(entity =>
        {
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
        });

        // UserCompanyFunction configuration
        builder.Entity<UserCompanyFunction>(entity =>
        {
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserCompanyFunctions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Company)
                .WithMany(c => c.UserCompanyFunctions)
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Function)
                .WithMany(f => f.UserCompanyFunctions)
                .HasForeignKey(e => e.FunctionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.CompanyId, e.FunctionId }).IsUnique();
        });

        // ComplianceTask configuration
        builder.Entity<ComplianceTask>(entity =>
        {
            entity.Property(e => e.TaskType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.FinancialYear).IsRequired().HasMaxLength(20);

            entity.HasOne(e => e.Company)
                .WithMany(c => c.Tasks)
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Function)
                .WithMany(f => f.Tasks)
                .HasForeignKey(e => e.FunctionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AssignedToUser)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(e => e.AssignedToUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TaskFile configuration
        builder.Entity<TaskFile>(entity =>
        {
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);

            entity.Property(e => e.FileData)
                .HasColumnType("LONGBLOB")
                .IsRequired(false);

            entity.HasOne(e => e.Task)
                .WithMany(t => t.Files)
                .HasForeignKey(e => e.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.UploadedByUser)
                .WithMany()
                .HasForeignKey(e => e.UploadedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // TaskUpdate configuration
        builder.Entity<TaskUpdate>(entity =>
        {
            entity.HasOne(t => t.Task)
                .WithMany(t => t.Updates)
                .HasForeignKey(t => t.TaskID)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.UpdatedByUser)
                .WithMany()
                .HasForeignKey(t => t.UpdatedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}