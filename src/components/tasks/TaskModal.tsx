import React, { useState, useEffect } from 'react';
import {
  X, Calendar, FileText, Clock, User,
  Bookmark, Layers, CalendarCheck, Eye
} from 'lucide-react';
import { Task, TaskStatus, TaskFile, FunctionType } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { FileUpload } from '../common/FileUpload';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  entityId: string;
  functionType: FunctionType;
  type: string;
  plannedDate: string;
  actualDate: string;
  status: TaskStatus;
  remarks: string;
  financialYear: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, addTask, companies } = useData();
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    entityId: '',
    functionType: 'accounting',
    type: 'quarterly_financials',
    plannedDate: '',
    actualDate: '',
    status: 'not_started',
    remarks: '',
    financialYear: '2024-25',
  });

  const [files, setFiles] = useState<(TaskFile & { rawFile?: File })[]>([]);

  useEffect(() => {
    if (task) {
      setFormData({
        entityId: task.entityId,
        functionType: task.functionType,
        type: task.type,
        plannedDate: task.plannedDate.toISOString().split('T')[0],
        actualDate: task.actualDate?.toISOString().split('T')[0] || '',
        status: task.status,
        remarks: task.remarks,
        financialYear: task.financialYear,
      });

      setFiles(
        task.files.map((file) => ({
          ...file,
          uploadedAt: new Date(file.uploadedAt),
          rawFile: undefined,
        }))
      );
    } else {
      setFormData({
        entityId: '',
        functionType: 'accounting',
        type: 'quarterly_financials',
        plannedDate: '',
        actualDate: '',
        status: 'not_started',
        remarks: '',
        financialYear: '2024-25',
      });
      setFiles([]);
    }
  }, [task]);

  const getFunctionId = (type: FunctionType): number => {
    switch (type) {
      case 'accounting': return 1;
      case 'tax': return 2;
      case 'compliance': return 3;
      case 'audit': return 4;
      default: return 0;
    }
  };

  const uploadFiles = async (taskId: string) => {
    for (const file of files) {
      if (file.rawFile) {
        const formData = new FormData();
        formData.append('file', file.rawFile);

        try {
          const response = await fetch(`/api/tasks/${taskId}/files`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
            body: formData,
          });

          if (!response.ok) {
            console.error(`Failed to upload ${file.fileName}:`, await response.text());
          } else {
            console.log(`✅ Uploaded: ${file.rawFile.name}`);
          }
        } catch (error) {
          console.error(`Failed to upload file ${file.fileName}:`, error);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (task) {
      await updateTask(task.id, {
        status: formData.status,
        actualDate: formData.actualDate ? new Date(formData.actualDate) : undefined,
        remarks: formData.remarks,
      });
      await uploadFiles(task.id);
    } else {
      const createdTask = await addTask({
        companyId: formData.entityId,
        functionId: getFunctionId(formData.functionType),
        assignedToUserId: user?.id || '',
        taskType: formData.type,
        plannedDate: new Date(formData.plannedDate),
        actualDate: formData.actualDate ? new Date(formData.actualDate) : undefined,
        remarks: formData.remarks,
        financialYear: formData.financialYear,
      } as any);

      if (createdTask?.id) {
        await uploadFiles(createdTask.id);
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  const isEditing = !!task;
  const canEdit = !task || user?.role === 'admin' || task?.assignedTo === user?.id;
  const canViewFiles = user?.role === 'admin' || task?.assignedTo === user?.id || !isEditing;

  const getFunctionDetails = (type: FunctionType) => {
    switch (type) {
      case 'accounting':
        return { icon: <Layers className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-100' };
      case 'tax':
        return { icon: <Bookmark className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-100' };
      case 'compliance':
        return { icon: <FileText className="w-4 h-4 text-green-600" />, bg: 'bg-green-100' };
      case 'audit':
        return { icon: <CalendarCheck className="w-4 h-4 text-orange-600" />, bg: 'bg-orange-100' };
      default:
        return { icon: <FileText className="w-4 h-4 text-gray-600" />, bg: 'bg-gray-100' };
    }
  };

  const functionDetails = getFunctionDetails(formData.functionType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'View Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-800 font-semibold">Entity:</span>
                <span className="text-sm text-gray-700">
                  {companies.find(c => c.id === formData.entityId || c.id === (task as any)?.entityId || c.id === (task as any)?.companyId)?.name || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {functionDetails.icon}
                <span className="text-sm text-gray-800 font-semibold">Function:</span>
                <span className="text-sm text-gray-700 capitalize">{formData.functionType}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-800 font-semibold">Task Type:</span>
                <span className="text-sm text-gray-700 capitalize">{formData.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-800 font-semibold">Financial Year:</span>
                <span className="text-sm text-gray-700">{formData.financialYear}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-800 font-semibold">Planned Date:</span>
                <span className="text-sm text-gray-700">
                  {formData.plannedDate ? new Date(formData.plannedDate).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-blue-600" />
              Status
            </label>
            <div className="flex items-center gap-4">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                disabled={!canEdit}
                className={`flex-1 px-3 py-2 border ${canEdit ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 shadow-inner ring-2 ring-blue-200/50 focus:ring-0 transition-all duration-200'} rounded-lg`}
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="pending">Pending</option>
              </select>
              <StatusBadge status={formData.status} />
            </div>
          </div>

          {formData.status === 'completed' && user?.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-orange-600" />
                  Actual Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.actualDate}
                  onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
                  disabled={!canEdit}
                  className={`w-full px-3 py-2 border ${canEdit ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50 text-gray-700 shadow-inner ring-2 ring-orange-200/50 focus:ring-0 transition-all duration-200'} rounded-lg`}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              disabled={!canEdit}
              className={`w-full px-3 py-2 border ${canEdit ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-green-50 text-gray-700 shadow-inner ring-2 ring-green-200/50 focus:ring-0 transition-all duration-200'} rounded-lg`}
              placeholder="Add any notes or comments..."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Attachments
            </label>
            <FileUpload files={files} onFilesChange={setFiles} taskId={task?.id || ''} />
          </div>

          {/* ✅ Show only if status is 'completed' */}
          {formData.status === 'completed' && files.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Uploaded Files
              </label>
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium truncate max-w-xs">{file.fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                      {canViewFiles && (
                        <a
                          href={`http://localhost:5000/api/tasks/${task?.id}/files/${file.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task && (
            <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
              <p>Created: {task.createdAt.toLocaleString()}</p>
              <p>Last Updated: {task.updatedAt.toLocaleString()}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-md transition-all duration-200"
              >
                {isEditing ? 'Update Task' : 'Create Task'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};