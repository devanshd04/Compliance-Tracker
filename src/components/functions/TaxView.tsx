import React, { useState } from 'react';
import { Receipt, Plus, Filter, LayoutGrid, List, CalendarDays, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { EntityFYSelector } from '../common/EntityFYSelector';
import { StatusBadge } from '../common/StatusBadge';
import { TaskModal } from '../tasks/TaskModal';           
import { TaxTask } from '../../types';                          

export const TaxView: React.FC = () => {
  const { tasks, companies } = useData();
  const { canAccessFunction } = useAuth();
  const [selectedTask, setSelectedTask] = useState<TaxTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  if (!canAccessFunction('tax')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have access to tax functions.</p>
      </div>
    );
  }

  const taxTasks = tasks.filter(task => task.functionType === 'tax') as TaxTask[];

  const getEntityName = (entityId: string) => {
    const company = companies.find(c => c.id === entityId);
    return company ? `${company.name} (${company.code})` : 'Unknown Entity';
  };

  const renderTasks = () => {
    if (viewMode === 'list') {
      return (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Tax Filing Form</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {taxTasks.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filing Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Filing Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FY</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {taxTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{getEntityName(task.companyId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.filingDueDate ? new Date(task.filingDueDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.actualFilingDate ? new Date(task.actualFilingDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.financialYear}</td>
                    <td className="px-6 py-4"><StatusBadge status={task.status} size="sm" /></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.files.length} file(s)</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{task.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {taxTasks.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500">No tax filing tasks found.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Card view
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {taxTasks.map((task) => (
          <div
            key={task.id}
            className="group relative bg-gradient-to-br from-[#fdfdfd] via-[#f1f1f1] to-[#fdfdfd] rounded-xl shadow-md border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => {
              setSelectedTask(task);
              setIsModalOpen(true);
            }}
          >
            <div className={`absolute top-0 left-0 h-1 w-full ${
              task.status === 'completed' ? 'bg-green-500' :
              task.status === 'in_progress' ? 'bg-blue-500' :
              task.status === 'delayed' ? 'bg-red-500' :
              task.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
            }`} />

            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {getEntityName(task.companyId)}
                </span>
                <StatusBadge status={task.status} size="sm" />
              </div>

              <h3 className="text-base font-bold text-gray-800 capitalize mb-2">
                {task.financialYear}
              </h3>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Due:</span>
                  <span className="font-medium">{task.filingDueDate ? new Date(task.filingDueDate).toLocaleDateString() : '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Filed:</span>
                  <span className={`font-medium ${task.actualFilingDate ? 'text-gray-800' : 'text-gray-400'}`}>{task.actualFilingDate ? new Date(task.actualFilingDate).toLocaleDateString() : 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Files:</span>
                  <span className="font-medium">{task.files.length} file(s)</span>
                </div>
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
        <div className="flex items-center gap-3">
          <Receipt className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tax</h1>
            <p className="text-gray-600">Tax compliance and filing management</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex border rounded-md gap-2 p-1 bg-green-100">
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Add Tax Filing
          </button>
        </div>
      </div>

      <EntityFYSelector />

      {renderTasks()}

      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};
