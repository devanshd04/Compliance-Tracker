using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ComplianceTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignedByUserIdToComplianceTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
           // migrationBuilder.AddColumn<byte[]>(
           //     name: "file_data",
            //    table: "TaskFiles",
            //   type: "varbinary(1000)",
             //   nullable: true);

         //   migrationBuilder.AddColumn<string>(
         //       name: "AssignedByUserId",
          //      table: "ComplianceTasks",
          //      type: "varchar(255)",
           //     nullable: false,
            //    defaultValue: "")
            //    .Annotation("MySql:CharSet", "utf8mb4");

         //   migrationBuilder.CreateIndex(
          //      name: "IX_ComplianceTasks_AssignedByUserId",
           //     table: "ComplianceTasks",
           //     column: "AssignedByUserId");

           // migrationBuilder.AddForeignKey(
            //    name: "FK_ComplianceTasks_AspNetUsers_AssignedByUserId",
            //    table: "ComplianceTasks",
            //    column: "AssignedByUserId",
             //   principalTable: "AspNetUsers",
             //   principalColumn: "Id",
             //   onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ComplianceTasks_AspNetUsers_AssignedByUserId",
                table: "ComplianceTasks");

            migrationBuilder.DropIndex(
                name: "IX_ComplianceTasks_AssignedByUserId",
                table: "ComplianceTasks");

            migrationBuilder.DropColumn(
                name: "file_data",
                table: "TaskFiles");

            migrationBuilder.DropColumn(
                name: "AssignedByUserId",
                table: "ComplianceTasks");
        }
    }
}
