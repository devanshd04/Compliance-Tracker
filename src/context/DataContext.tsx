import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import type {
  Company,
  Task,
  DashboardStats,
  ExceptionReport,
  User
} from '../types';
import { useAuth } from '../context/AuthContext';

const axiosInstance = axios.create({
  baseURL: '/api'
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface DataContextType {
  companies: Company[];
  tasks: Task[];
  users: User[];
  functions: string[];
  selectedFY: string;
  selectedEntity: string;
  dashboardStats: DashboardStats;
  exceptionReports: ExceptionReport[];
  isLoading: boolean;
  error: string | null;
  setSelectedFY: (fy: string) => void;
  setSelectedEntity: (entity: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: any) => Promise<Task>;
  deleteTask: (taskId: string) => void;
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Promise<void>;
  updateCompany: (companyId: string, updates: Partial<Company>) => void;
  deleteCompany: (companyId: string) => void;
  uploadTaskFiles: (taskId: string, files: File[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [users] = useState<User[]>([]);
  const [functions] = useState<string[]>(['accounting', 'tax', 'compliance', 'audit']);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    onTrack: 0,
    delayed: 0,
    pending: 0,
    completed: 0,
    totalTasks: 0
  });
  const [exceptionReports, setExceptionReports] = useState<ExceptionReport[]>([]);
  const [selectedFY, setSelectedFY] = useState<string>('2024-25');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const [companiesRes, tasksRes] = await Promise.all([
        axiosInstance.get('/companies'),
        axiosInstance.get('/tasks')
      ]);

      const fetchedCompanies = Array.isArray(companiesRes.data)
        ? companiesRes.data
        : companiesRes.data.result ?? [];

      setCompanies(fetchedCompanies);

      const parsedTasks = Array.isArray(tasksRes.data)
        ? tasksRes.data.map((task: any) => ({
            ...task,
            assignedTo: task.assignedToUserId ?? task.assignedTo?.toLowerCase().replace(/\s/g, '_'),
            functionType:
              task.functionType === 'accounts' ? 'accounting' :
              task.functionType === 'taxation' ? 'tax' :
              task.functionType?.toLowerCase(),
            type:
              task.taskType === 'minutes_tracker' ? 'annual_financials' :
              task.taskType === 'quarterly_financials' ? 'quarterly_financials' :
              task.taskType === 'annual_financials' ? 'annual_financials' :
              task.taskType === 'ifrs_packs' ? 'ifrs_packs' :
              task.taskType === 'monthly_reports' ? 'monthly_reports' :
              task.taskType === 'lender_reports' ? 'lender_reports' :
              task.taskType === 'fsc_survey' ? 'fsc_survey' :
              undefined,
            companyName: task.companyName ?? 'Unknown',
            plannedDate: new Date(task.plannedDate),
            actualDate: task.actualDate ? new Date(task.actualDate) : undefined,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          }))
        : [];

      setRawTasks(parsedTasks);

      if (user.role === 'admin' || user.role === 'accounts'){
        const [statsRes, exceptionsRes] = await Promise.all([
          axiosInstance.get('/dashboard/stats'),
          axiosInstance.get('/dashboard/exceptions')
        ]);

        setDashboardStats(statsRes.data || {
          onTrack: 0,
          delayed: 0,
          pending: 0,
          completed: 0,
          totalTasks: 0
        });
        setExceptionReports(Array.isArray(exceptionsRes.data) ? exceptionsRes.data : []);
      } else {
        const assignedTasks = parsedTasks.filter(task =>
          task.assignedTo?.toString().toLowerCase() === user.id?.toString().toLowerCase() ||
          task.assignedToUserId?.toString().toLowerCase() === user.id?.toString().toLowerCase()
        );

        const stats = {
          totalTasks: assignedTasks.length,
          onTrack: assignedTasks.filter(t => t.status === 'On Track').length,
          delayed: assignedTasks.filter(t => t.status === 'Delayed').length,
          pending: assignedTasks.filter(t => t.status === 'Pending').length,
          completed: assignedTasks.filter(t => t.status === 'Completed').length,
        };

        setDashboardStats(stats);
        setExceptionReports([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
      console.error('Error fetching data:', errorMessage);
      if (err.response?.status === 403) {
        setError('You do not have permission to access this data');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const filteredTasks = rawTasks.filter(task => {
    const matchEntity = selectedEntity === '' || task.companyId?.toString() === selectedEntity;
    const matchFY = selectedFY === '' || task.financialYear === selectedFY;

    if (user?.role === 'admin' || user?.role === 'management') {
      return matchEntity && matchFY;
    } else {
      const assignedToMe =
        task.assignedTo?.toString().toLowerCase() === user?.id?.toString().toLowerCase() ||
        task.assignedToUserId?.toString().toLowerCase() === user?.id?.toString().toLowerCase();

      return matchEntity && matchFY && assignedToMe;
    }
  });

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setIsLoading(true);
      const updateDto = {
        status: updates.status,
        actualDate: updates.actualDate,
        remarks: updates.remarks,
        actualFilingDate: updates.actualFilingDate,
        meetingDates: updates.meetingDates,
        approvedByBoard: updates.approvedByBoard,
        minutesStatus: updates.minutesStatus
      };
      const response = await axiosInstance.put(`/tasks/${taskId}`, updateDto);
      const updatedTask = response.data;
      setRawTasks(prev =>
        prev.map(task => (task.id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: any): Promise<Task> => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/tasks', {
        ...taskData,
        plannedDate: taskData.plannedDate.toISOString(),
        actualDate: taskData.actualDate ? taskData.actualDate.toISOString() : null
      });
      const savedTask = response.data;
      const parsedTask = {
        ...savedTask,
        plannedDate: new Date(savedTask.plannedDate),
        actualDate: savedTask.actualDate ? new Date(savedTask.actualDate) : undefined,
        createdAt: new Date(savedTask.createdAt),
        updatedAt: new Date(savedTask.updatedAt),
      };
      setRawTasks(prev => [...prev, parsedTask]);
      return parsedTask;
    } catch (error) {
      console.error('Failed to add task:', error);
      setError('Failed to add task');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadTaskFiles = async (taskId: string, files: File[]): Promise<void> => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      await axiosInstance.post(`/tasks/${taskId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Failed to upload task files:', error);
      setError('Failed to upload files');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/tasks/${taskId}`);
      setRawTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const addCompany = async (companyData: Omit<Company, 'id' | 'createdAt'>) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/companies', companyData);
      const savedCompany = response.data;
      setCompanies(prev => [...prev, savedCompany]);
    } catch (error) {
      console.error('Failed to add company:', error);
      setError('Failed to add company');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompany = async (companyId: string, updates: Partial<Company>) => {
    try {
      setIsLoading(true);
      await axiosInstance.put(`/companies/${companyId}`, updates);
      setCompanies(prev =>
        prev.map(company => (company.id === companyId ? { ...company, ...updates } : company))
      );
    } catch (error) {
      console.error('Failed to update company:', error);
      setError('Failed to update company');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCompany = async (companyId: string) => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/companies/${companyId}`);
      setCompanies(prev => prev.filter(company => company.id !== companyId));
    } catch (error) {
      console.error('Failed to delete company:', error);
      setError('Failed to delete company');
    } finally {
      setIsLoading(false);
    }
  };

  const value: DataContextType = {
    companies,
    tasks: filteredTasks,
    users,
    functions,
    selectedFY,
    selectedEntity,
    dashboardStats,
    exceptionReports,
    isLoading,
    error,
    setSelectedFY,
    setSelectedEntity,
    updateTask,
    addTask,
    deleteTask,
    addCompany,
    updateCompany,
    deleteCompany,
    uploadTaskFiles,
    refreshData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
