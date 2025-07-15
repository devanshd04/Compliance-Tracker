import React from 'react';
import { TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  not_started: {
    label: 'Not Started',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    dotColor: 'bg-gray-400',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-50 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
  },
  delayed: {
    label: 'Delayed',
    className: 'bg-red-50 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
  },
  pending: {
    label: 'Pending',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    dotColor: 'bg-orange-500',
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.className} ${sizeClasses[size]}`}>
      <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </div>
  );
};