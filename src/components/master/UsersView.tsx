import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  Building2,
  Settings,
  Mail
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole, FunctionType } from '../../types';

export const UsersView: React.FC = () => {
  const { companies } = useData();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'accounts' as UserRole,
    roleId: 0,
    companies: [] as string[],
    functions: [] as FunctionType[],
    isActive: true,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (currentUser?.role === 'admin') {
          const response = await axios.get('/api/users', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          const transformed = response.data.map((u: any): User => ({
            id: u.id,
            email: u.email,
            name: u.fullName,
            role: u.role,
            roleId: 0,
            companies: u.companyIds.map((id: number) => id.toString()),
            functions: u.functionTypes,
            isActive: u.isActive,
            createdAt: new Date(),
          }));

          setUsers(transformed);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      setUsers(prev => prev.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData, name: formData.name }
          : user
      ));
    } else {
      const newUser: User = {
        ...formData,
        id: Date.now().toString(),
        name: formData.name,
        createdAt: new Date(),
      };
      setUsers(prev => [...prev, newUser]);
    }

    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'accounts',
      roleId: 0,
      companies: [],
      functions: [],
      isActive: true,
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      companies: user.companies,
      functions: user.functions,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleCompanyToggle = (companyId: string) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.includes(companyId)
        ? prev.companies.filter(id => id !== companyId)
        : [...prev.companies, companyId]
    }));
  };

  const handleFunctionToggle = (functionType: FunctionType) => {
    setFormData(prev => ({
      ...prev,
      functions: prev.functions.includes(functionType)
        ? prev.functions.filter(f => f !== functionType)
        : [...prev.functions, functionType]
    }));
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      admin: { label: 'Admin', className: 'bg-purple-100 text-purple-800', icon: Shield },
      management: { label: 'Management', className: 'bg-blue-100 text-blue-800', icon: Users },
      accounts: { label: 'Accounts', className: 'bg-green-100 text-green-800', icon: Settings },
      tax: { label: 'Tax', className: 'bg-orange-100 text-orange-800', icon: Settings },
      compliance: { label: 'Compliance', className: 'bg-red-100 text-red-800', icon: Settings },
      audit: { label: 'Audit', className: 'bg-indigo-100 text-indigo-800', icon: Settings },
    } as Record<string, any>;

    const config = roleConfig[role];
    if (!config) return null;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.className}`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getCompanyNames = (companyIds: string[]) => {
    return companyIds
      .map(id => companies.find(c => c.id.toString() === id)?.code)
      .filter(Boolean)
      .join(', ') || 'None';
  };

  const getFunctionNames = (functionTypes: FunctionType[]) => {
    return functionTypes.map(type => type.charAt(0).toUpperCase() + type.slice(1)).join(', ') || 'None';
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-xl animate-fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">User Directory</h1>
            <p className="text-gray-500">Manage roles, permissions, and assignments</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border-l-4 border-indigo-500 shadow">
          <h2 className="text-sm text-gray-500">Total Users</h2>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border-l-4 border-green-500 shadow">
          <h2 className="text-sm text-gray-500">Active Users</h2>
          <p className="text-3xl font-bold">{users.filter(u => u.isActive).length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border-l-4 border-purple-500 shadow">
          <h2 className="text-sm text-gray-500">Companies</h2>
          <p className="text-3xl font-bold">{companies.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Companies</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Functions</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{getCompanyNames(user.companies)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{getFunctionNames(user.functions)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
