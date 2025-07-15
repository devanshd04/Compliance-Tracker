// Core Types for Compliance Tracker System

export type UserRole = 'admin' | 'accounts' | 'tax' | 'compliance' | 'audit' | 'management';
export type FunctionType = 'accounting' | 'tax' | 'compliance' | 'audit';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'pending';

// ✅ TaskType covers all valid task strings across task types 
export type TaskType =
  | 'quarterly_financials'
  | 'annual_financials'
  | 'ifrs_packs'
  | 'monthly_reports'
  | 'lender_reports'
  | 'fsc_survey'
  | 'tax_filing'
  | 'minutes_tracker'
  | 'milestone_tracker';

// User 
export interface User {
  id: string;
  name: string;
  email: string;
  roleId: number;
  role: UserRole;
  companies: string[];
  functions: FunctionType[];
  isActive: boolean;
  createdAt: Date;
}

// Company 
export interface Company {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
}

// Role
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

// ✅ Renamed to avoid conflict with built-in 'Function'
export interface FunctionModel {
  id: string;
  name: string;
  description: string;
  type: FunctionType;
}

// Mapping 
export interface UserCompanyFunctionMapping {
  id: string;
  userId: string;
  companyId: string;
  functionId: string;
  isActive: boolean;
}

// Task File 
export interface TaskFile {
  id: string;
  fileName: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  file?: File; 
  rawFile?: File
}

export interface BaseTask {
  id: string;
  entityId: string;
  companyId: string;
  companyName: string;
  functionType: FunctionType;
  assignedTo: string;
  assignedToUserId: string;
  status: TaskStatus;
  plannedDate: Date;
  actualDate?: Date;
  remarks: string;
  files: TaskFile[];
  financialYear: string;
  createdAt: Date;
  updatedAt: Date;
  functionId: number;

  //  Add these 4 fields used in updates
  actualFilingDate?: Date;
  meetingDates?: Date[];
  approvedByBoard?: boolean;
  minutesStatus?: string;
}


// Accounts Task
export interface AccountsTask extends BaseTask {
  type:
    | 'quarterly_financials'
    | 'annual_financials'
    | 'ifrs_packs'
    | 'monthly_reports'
    | 'lender_reports'
    
    | 'fsc_survey';
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  month?: string;
  financialYear: string;
}

// Tax Task
export interface TaxTask extends BaseTask {
  type: 'tax_filing';
  filingDueDate: Date;
  actualFilingDate?: Date;
}

// Compliance Task
export interface ComplianceTask extends BaseTask {
  type: 'minutes_tracker';
  responsiblePerson: string;
  meetingDates: Date[];
  approvedByBoard: boolean;
  minutesStatus: 'pending' | 'draft' | 'approved' | 'circulated';
}

// Audit Task
export interface AuditTask extends BaseTask {
  type: 'milestone_tracker';
  milestone:
    | 'audit_start'
    | 'field_work_done'
    | 'draft_fs_shared'
    | 'cleared_by_auditor'
    | 'signed_fs';
}

// Union Task
export type Task = AccountsTask | TaxTask | ComplianceTask | AuditTask;

// Dashboard Stats
export interface DashboardStats {
  onTrack: number;
  delayed: number;
  pending: number;
  completed: number;
  totalTasks: number;
}

// Exception Report
export interface ExceptionReport {
  entityName: string;
  functionType: FunctionType;
  taskType: TaskType;
  assignedTo: string;
  plannedDate: Date;
  actualDate?: Date;
  delayDays: number;
  status: TaskStatus;
  remarks: string;
  entityId: string; 
  financialYear: string;

}

// Auth Context
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessFunction: (functionType: FunctionType) => boolean;
  canAccessCompany: (companyId: string) => boolean;
}

//  Data Context (Updated with FunctionModel)
export interface DataContextType {
  companies: Company[];
  functions: FunctionModel[];
}

//  Task Creation Object — Final Working Version

export interface CreateTask {
  companyId: number;
  functionId: number;
  assignedToUserId: string;
  taskType: TaskType;
  plannedDate: Date;
  actualDate?: Date;
  remarks: string;
  financialYear: string;
}