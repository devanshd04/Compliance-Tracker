# Compliance Tracker API - .NET Core Backend

A comprehensive .NET Core 8 Web API for the Compliance Tracker System with MySQL database integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Entity Framework Core**: MySQL database integration with code-first migrations
- **RESTful API**: Complete CRUD operations for all entities
- **File Upload**: Support for task file attachments
- **Role-Based Security**: Admin, Management, Accounts, Tax, Compliance, Audit roles
- **Dashboard Analytics**: Real-time statistics and exception reporting
- **Swagger Documentation**: Auto-generated API documentation

## 🛠️ Technology Stack

- **.NET Core 8**: Latest LTS version
- **Entity Framework Core**: ORM with MySQL provider
- **ASP.NET Core Identity**: User management and authentication
- **JWT Bearer Authentication**: Secure token-based auth
- **AutoMapper**: Object-to-object mapping
- **Swagger/OpenAPI**: API documentation
- **MySQL**: Database engine

## 📋 Prerequisites

- .NET 8 SDK
- MySQL Server 8.0+
- MySQL Workbench (recommended)
- Visual Studio 2022 or VS Code

## 🔧 Setup Instructions

### 1. Database Setup

1. **Install MySQL Server** and **MySQL Workbench**
2. **Create Database**:
   ```sql
   CREATE DATABASE ComplianceTrackerDB;
   ```

3. **Update Connection String** in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=ComplianceTrackerDB;User=root;Password=your_password_here;"
     }
   }
   ```

### 2. Install Dependencies

```bash
cd backend/ComplianceTracker.API
dotnet restore
```

### 3. Run Database Migrations

```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### 4. Start the API

```bash
dotnet run
```

The API will be available at:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`
- **Swagger UI**: `https://localhost:5001/swagger`

## 🔐 Default Users

The system automatically seeds with these test users:

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | Password123! | Admin |
| management@company.com | Password123! | Management |
| accounts@company.com | Password123! | Accounts |
| tax@company.com | Password123! | Tax |
| compliance@company.com | Password123! | Compliance |
| audit@company.com | Password123! | Audit |

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `GET /api/auth/profile` - Get user profile

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/{id}` - Get specific task
- `POST /api/tasks` - Create new task (Admin/Management)
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task (Admin only)
- `POST /api/tasks/{id}/files` - Upload file to task
- `DELETE /api/tasks/files/{fileId}` - Delete task file

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/{id}` - Get specific company
- `POST /api/companies` - Create company (Admin only)
- `PUT /api/companies/{id}` - Update company (Admin only)
- `DELETE /api/companies/{id}` - Delete company (Admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/exceptions` - Get exception reports

## 🗄️ Database Schema

### Core Tables

1. **Companies**
   - Id, Name, Code, IsActive, CreatedAt

2. **Functions**
   - Id, Name, Description, Type, IsActive

3. **ComplianceTasks**
   - Id, CompanyId, FunctionId, AssignedToUserId
   - TaskType, Status, PlannedDate, ActualDate
   - FinancialYear, Quarter, Month, Remarks
   - Task-specific fields for different function types

4. **TaskFiles**
   - Id, TaskId, FileName, FilePath, FileSize
   - UploadedByUserId, UploadedAt

5. **UserCompanyFunctions**
   - Id, UserId, CompanyId, FunctionId, IsActive

### Identity Tables (ASP.NET Core Identity)
- AspNetUsers, AspNetRoles, AspNetUserRoles, etc.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Different access levels for different roles
- **CORS Configuration**: Configured for React frontend
- **Input Validation**: Data annotations and model validation
- **SQL Injection Protection**: Entity Framework parameterized queries

## 📁 Project Structure

```
ComplianceTracker.API/
├── Controllers/          # API controllers
├── Data/                # Database context and seeding
├── DTOs/                # Data transfer objects
├── Models/              # Entity models
├── Services/            # Business logic services
├── Migrations/          # EF Core migrations
├── Program.cs           # Application entry point
└── appsettings.json     # Configuration
```

## 🚀 Deployment

### Development
```bash
dotnet run --environment Development
```

### Production
```bash
dotnet publish -c Release
dotnet run --environment Production
```

## 🔧 Configuration

Key configuration sections in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ComplianceTrackerDB;User=root;Password=your_password;"
  },
  "JwtSettings": {
    "Secret": "YourSuperSecretKeyThatIsAtLeast32CharactersLong123456789",
    "ExpiryInDays": 7
  }
}
```

## 📊 Monitoring & Logging

- Built-in ASP.NET Core logging
- Swagger UI for API testing
- Entity Framework query logging in development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

