import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { AuthContextType, User, FunctionType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);

      const normalizedUser: User = {
        ...parsed,
        role: (parsed.role ?? parsed.Role ?? '').toLowerCase(), // 🔥 Normalize to lowercase
        functions: parsed.functionTypes ?? parsed.functions ?? [],
        companies: (parsed.companyIds ?? parsed.companies ?? []).map((id: any) => id.toString()), // 🔄 Ensure string type
      };

      setUser(normalizedUser);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { user: loggedInUser, token } = response.data;

      if (!loggedInUser || !token) return false;

      const normalizedUser: User = {
        ...loggedInUser,
        role: (loggedInUser.role ?? loggedInUser.Role ?? '').toLowerCase(),
        functions: loggedInUser.functionTypes ?? loggedInUser.functions ?? [],
        companies: (loggedInUser.companyIds ?? loggedInUser.companies ?? []).map((id: any) => id.toString()),
      };

      setUser(normalizedUser);
      localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
      localStorage.setItem('token', token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const rolePermissions: Record<string, string[]> = {
      admin: ['*'],
      management: ['view_dashboard', 'view_reports', 'view_all_tasks'],
      accounts: ['view_dashboard', 'view_tasks', 'update_tasks', 'upload_files', 'view_reports', 'view_all_tasks'],
      tax: ['view_tasks', 'update_tasks', 'upload_files'],
      compliance: ['view_tasks', 'update_tasks', 'upload_files'],
      audit: ['view_tasks', 'update_tasks', 'upload_files'],
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };

  const canAccessFunction = (fn: FunctionType): boolean => {
    return Array.isArray(user?.functions) && user.functions.includes(fn);
  };

  const canAccessCompany = (companyId: string): boolean => {
    return user?.companies.includes(companyId.toString()) ?? false;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasPermission,
    canAccessFunction,
    canAccessCompany,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
