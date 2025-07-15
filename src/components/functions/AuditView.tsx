import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { EntityFYSelector } from '../common/EntityFYSelector';
import { StatusBadge } from '../common/StatusBadge';
import { TaskModal } from '../tasks/TaskModal';
import { AuditTask } from '../../types';

export const AuditView: React.FC = () => {
  const { tasks, companies } = useData();
  const { canAccessFunction } = useAuth();
  const [selectedTask, setSelectedTask] = useState<AuditTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!canAccessFunction('audit')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have access to audit functions.</p>
      </div>
    );
  }

  const auditTasks = tasks.filter(task => task.functionType === 'audit') as AuditTask[];

  const getEntityName = (entityId: string) => {
    const company = companies.find(c => c.id === entityId);
    return company ? `${company.name} (${company.code})` : 'Unknown Entity';
  };

  const getMilestoneLabel = (milestone: string) => {
    const milestoneLabels = {
      audit_start: 'Audit Start',
      field_work_done: 'Field Work Done',
      draft_fs_shared: 'Draft FS Shared',
      cleared_by_auditor: 'Cleared by Auditor',
      signed_fs: 'Signed FS',
    };
    return milestoneLabels[milestone as keyof typeof milestoneLabels] || milestone;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit</h1>
            <p className="text-gray-600">Audit milestone tracking and management</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>
      </div>

      <EntityFYSelector />

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-900">Milestone Tracker</h3>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
              {auditTasks.length}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Milestone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Planned Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditTasks.map((task) => (
                <tr 
                  key={task.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {getEntityName(task.entityId)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getMilestoneLabel(task.milestone)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.financialYear}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.plannedDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {task.actualDate?.toLocaleDateString() || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={task.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {task.remarks || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {auditTasks.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No audit milestones found.</p>
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