import React, { useState } from 'react';
import { Calculator, Plus, Filter, LayoutGrid, List, CalendarDays, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { EntityFYSelector } from '../common/EntityFYSelector';
import { StatusBadge } from '../common/StatusBadge';
import { TaskModal } from '../tasks/TaskModal';
import { AccountsTask } from '../../types';

export const AccountsView: React.FC = () => {
  const { tasks, companies } = useData();
  const { user, canAccessFunction } = useAuth();
  const [selectedTask, setSelectedTask] = useState<AccountsTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  if (!canAccessFunction('accounting')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have access to accounting functions.</p>
      </div>
    );
  }

  // ✅ Filter by accounting + assigned user (unless admin)
  const allAccountsTasks = tasks.filter(task => {
    const isAccounting = task.functionType === 'accounting';
    const isMine = task.assignedToUserId === user?.id;
    const isAdmin = user?.role === 'admin';
    return isAccounting && (isAdmin || isMine);
  }) as AccountsTask[];

  const filteredTasks =
    taskTypeFilter === 'all'
      ? allAccountsTasks
      : allAccountsTasks.filter(task => task.type === taskTypeFilter);

  const getEntityName = (entityId: string) => {
    const company = companies.find(c => c.id === entityId);
    return company ? `${company.name} (${company.code})` : 'Unknown Entity';
  };

  const renderTasks = () => {
    if (viewMode === 'list') {
      return (
        <div className="space-y-6">
          {taskTypeFilter === 'all' || taskTypeFilter === 'annual_financials' ? (
            <TaskSection title="Annual Financials" tasks={filteredTasks.filter(t => t.type === 'annual_financials')} icon={<Calculator className="w-5 h-5 text-green-500" />} />
          ) : null}
          {taskTypeFilter === 'all' || taskTypeFilter === 'quarterly_financials' ? (
            <TaskSection title="Quarterly Financials" tasks={filteredTasks.filter(t => t.type === 'quarterly_financials')} icon={<Calculator className="w-5 h-5 text-blue-500" />} />
          ) : null}
          {taskTypeFilter === 'all' || taskTypeFilter === 'ifrs_packs' ? (
            <TaskSection title="IFRS Packs" tasks={filteredTasks.filter(t => t.type === 'ifrs_packs')} icon={<Calculator className="w-5 h-5 text-purple-500" />} />
          ) : null}
          {taskTypeFilter === 'all' || taskTypeFilter === 'monthly_reports' ? (
            <TaskSection title="Monthly Reports" tasks={filteredTasks.filter(t => t.type === 'monthly_reports')} icon={<Calculator className="w-5 h-5 text-orange-500" />} />
          ) : null}
          {taskTypeFilter === 'all' || taskTypeFilter === 'lender_reports' ? (
            <TaskSection title="Reports to Lenders" tasks={filteredTasks.filter(t => t.type === 'lender_reports')} icon={<Calculator className="w-5 h-5 text-red-500" />} />
          ) : null}
          {taskTypeFilter === 'all' || taskTypeFilter === 'fsc_survey' ? (
            <TaskSection title="FSC Survey" tasks={filteredTasks.filter(t => t.type === 'fsc_survey')} icon={<Calculator className="w-5 h-5 text-teal-500" />} />
          ) : null}
        </div>
      );
    }

    // ✅ Card view
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="group relative bg-gradient-to-br from-[#fdfdfd] via-[#f1f1f1] to-[#fdfdfd] rounded-xl shadow-md border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
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
            }`}></div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {getEntityName(task.companyId)}
                </span>
                <StatusBadge status={task.status} size="sm" />
              </div>

              <h3 className="text-base font-bold text-gray-800 capitalize mb-2">
                {task.type.replace(/_/g, ' ')}
              </h3>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Planned:</span>
                  <span className="font-medium">{task.plannedDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Actual:</span>
                  <span className={`font-medium ${task.actualDate ? 'text-gray-800' : 'text-gray-400'}`}>
                    {task.actualDate?.toLocaleDateString() || 'Not set'}
                  </span>
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

  const TaskSection = ({ title, tasks, icon }: { title: string; tasks: AccountsTask[]; icon: React.ReactNode }) => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quarter/Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Planned Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedTask(task);
                  setIsModalOpen(true);
                }}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{getEntityName(task.companyId)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{task.quarter || task.month || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{task.plannedDate.toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{task.actualDate?.toLocaleDateString() || '-'}</td>
                <td className="px-6 py-4"><StatusBadge status={task.status} size="sm" /></td>
                <td className="px-6 py-4 text-sm text-gray-600">{task.files.length}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No tasks found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600">Financial reporting and accounting tasks</p>
          </div>
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
          <select
            value={taskTypeFilter}
            onChange={(e) => setTaskTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Task Types</option>
            <option value="annual_financials">Annual Financials</option>
            <option value="quarterly_financials">Quarterly Financials</option>
            <option value="ifrs_packs">IFRS Packs</option>
            <option value="monthly_reports">Monthly Reports</option>
            <option value="lender_reports">Reports to Lenders</option>
            <option value="fsc_survey">FSC Survey</option>
          </select>
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
