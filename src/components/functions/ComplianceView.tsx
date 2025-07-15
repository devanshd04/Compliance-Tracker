import React, { useState } from 'react';
import { Shield, Plus, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { EntityFYSelector } from '../common/EntityFYSelector';
import { StatusBadge } from '../common/StatusBadge';
import { TaskModal } from '../tasks/TaskModal';
import { ComplianceTask } from '../../types';

export const ComplianceView: React.FC = () => {
  const { tasks, companies } = useData();
  const { canAccessFunction } = useAuth();
  const [selectedTask, setSelectedTask] = useState<ComplianceTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!canAccessFunction('compliance')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have access to compliance functions.</p>
      </div>
    );
  }

  const complianceTasks = tasks.filter(task => task.functionType === 'compliance') as ComplianceTask[];

  const getEntityName = (entityId: string) => {
    const company = companies.find(c => c.id === entityId);
    return company ? `${company.name} (${company.code})` : 'Unknown Entity';
  };

  const getMinutesStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      draft: { label: 'Draft', className: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      circulated: { label: 'Circulated', className: 'bg-purple-100 text-purple-800' },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
            <p className="text-gray-600">Regulatory compliance and meeting management</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add Minutes Tracker
          </button>
        </div>
      </div>

      <EntityFYSelector />

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Minutes Tracker</h3>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {complianceTasks.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsible Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meeting Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Board Approved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Minutes Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complianceTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {getEntityName(task.companyId)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.responsiblePerson}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="space-y-1">
                      {Array.isArray(task.meetingDates) && task.meetingDates.slice(0, 2).map((date, index) => (
                        <div key={index}>{new Date(date).toLocaleDateString()}</div>
                      ))}
                      {Array.isArray(task.meetingDates) && task.meetingDates.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{task.meetingDates.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.approvedByBoard
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.approvedByBoard ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getMinutesStatusBadge(task.minutesStatus)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.financialYear}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={task.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {complianceTasks.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No compliance tasks found.</p>
            </div>
          )}
        </div>
      </div>

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
