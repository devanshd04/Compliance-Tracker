import React, { useState } from 'react';
import { Plus, Filter, Download, LayoutGrid, List, CalendarDays, FileText, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../common/StatusBadge';
import { EntityFYSelector } from '../common/EntityFYSelector';
import { Task, TaskStatus } from '../../types';
import { TaskModal } from './TaskModal';

export const TasksView: React.FC = () => {
  const { user, canAccessFunction } = useAuth();
  const { tasks, companies, selectedEntity, selectedFY } = useData();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [functionFilter, setFunctionFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  const userTasks = tasks.filter(task => {
    if (user?.role !== 'admin' && user?.role !== 'management' && task.assignedTo !== user?.id) return false;
    if (!canAccessFunction(task.functionType)) return false;
    if (selectedEntity && task.entityId !== selectedEntity) return false;
    if (task.financialYear !== selectedFY) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (functionFilter !== 'all' && task.functionType !== functionFilter) return false;
    return true;
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const getEntityName = (entityId: string) => {
    const company = companies.find(c => c.id === entityId);
    return company ? `${company.name} (${company.code})` : 'Unknown Entity';
  };

  const renderTasks = () => {
    if (viewMode === 'list') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{getEntityName(task.companyId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{task.functionType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.type?.replace('_', ' ') || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(task.plannedDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.actualDate ? new Date(task.actualDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={task.status} size="sm" /></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.files.length} file(s)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userTasks.length === 0 && (
            <div className="p-8 text-center text-gray-500">No tasks found matching your criteria.</div>
          )}
        </div>
      );
    }

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {userTasks.map((task) => (
          <div
            key={task.id}
            className="group relative bg-gradient-to-br from-[#fdfdfd] via-[#f1f1f1] to-[#fdfdfd] rounded-xl shadow-md border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => handleTaskClick(task)}
          >
            <div className={`absolute top-0 left-0 h-1 w-full ${
              task.status === 'completed' ? 'bg-green-500' :
              task.status === 'in_progress' ? 'bg-blue-500' :
              task.status === 'delayed' ? 'bg-red-500' :
              task.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
            }`}></div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 truncate">
                    {getEntityName(task.companyId)}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mt-1">
                    {task.functionType}
                  </span>
                </div>
                <StatusBadge status={task.status} size="sm" />
              </div>

              <h2 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
                {task.type?.replace(/_/g, ' ')}
              </h2>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Planned:</span>{' '}
                    <span className="font-medium">{task.plannedDate.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Actual:</span>{' '}
                    <span className={`font-medium ${
                      task.actualDate ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {task.actualDate?.toLocaleDateString() || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>{task.files.length} {task.files.length === 1 ? 'file' : 'files'}</span>
                </div>
                {task.assignedTo && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="truncate max-w-[80px]">You</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Manage your assigned compliance tasks</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex border rounded-md gap-2 p-1 bg-blue-100">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded cursor-pointer hover:bg-white ${viewMode === 'card' ? 'bg-white shadow' : ''}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded cursor-pointer hover:bg-white ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List size={18} />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      <EntityFYSelector />

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={functionFilter}
            onChange={(e) => setFunctionFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Functions</option>
            <option value="accounting">Accounting</option>
            <option value="tax">Tax</option>
            <option value="compliance">Compliance</option>
            <option value="audit">Audit</option>
          </select>
          <div className="ml-auto text-sm text-gray-500">{userTasks.length} task(s) found</div>
        </div>
      </div>

      {renderTasks()}

      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
