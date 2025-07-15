# Database Migrations

This folder will contain Entity Framework Core migrations for the MySQL database.

## Setup Instructions

1. **Update Connection String**: 
   - Open `appsettings.json`
   - Update the MySQL connection string with your database credentials:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=ComplianceTrackerDB;User=root;Password=your_password_here;"
   }
   ```

2. **Install MySQL Workbench** (if not already installed):
   - Download from: https://dev.mysql.com/downloads/workbench/
   - Create a new database named `ComplianceTrackerDB`

3. **Run Migrations**:
   ```bash
   cd backend/ComplianceTracker.API
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

4. **Start the API**:
   ```bash
   dotnet run
   ```

## Database Schema

The database includes the following tables:
- **AspNetUsers** - User authentication (Identity)
- **AspNetRoles** - User roles
- **Companies** - Company entities
- **Functions** - Business functions (Accounting, Tax, etc.)
- **UserCompanyFunctions** - User access mappings
- **ComplianceTasks** - Main task tracking
- **TaskFiles** - File attachments

## Default Users

The system seeds with these default users:
- **admin@company.com** / Password123! (Admin)
- **management@company.com** / Password123! (Management)
- **accounts@company.com** / Password123! (Accounts)
- **tax@company.com** / Password123! (Tax)
- **compliance@company.com** / Password123! (Compliance)
- **audit@company.com** / Password123! (Audit)