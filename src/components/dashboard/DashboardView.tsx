import React, { useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../common/StatusBadge';
import { EntityFYSelector } from '../common/EntityFYSelector';

export const DashboardView: React.FC = () => {
  const { 
    dashboardStats: initialStats, 
    exceptionReports: allExceptions, 
    companies, 
    selectedFY, 
    selectedEntity 
  } = useData();

  // Filter exception reports based only on company name
  const filteredExceptions = useMemo(() => {
    if (!selectedEntity) return allExceptions; // Return all if no company selected
    
    return allExceptions.filter(report => {
      // Find the selected company
      const selectedCompany = companies.find(c => c.id.toString() === selectedEntity);
      if (!selectedCompany) return false;
      
      // Match by company name (case insensitive)
      return report.entityName?.toLowerCase() === selectedCompany.name.toLowerCase();
    });
  }, [allExceptions, selectedEntity, companies]);

  // Rest of your original component...
  const statsCards = [
    {
      title: 'On Track',
      value: initialStats.onTrack,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-50 text-green-700',
      iconColor: 'text-green-500',
    },
    {
      title: 'Delayed',
      value: initialStats.delayed,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-50 text-red-700',
      iconColor: 'text-red-500',
    },
    {
      title: 'Pending',
      value: initialStats.pending,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-orange-50 text-orange-700',
      iconColor: 'text-orange-500',
    },
    {
      title: 'Completed',
      value: initialStats.completed,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-500',
    },
  ];

  const completionPercentage =
    initialStats.totalTasks > 0
      ? Math.round((initialStats.completed / initialStats.totalTasks) * 100)
      : 0;

  const selectedCompany = selectedEntity 
    ? companies.find(c => c.id.toString() === selectedEntity)?.name 
    : null;

  return (
    <div className="space-y-6">
      {/* Header and EntityFYSelector remain the same */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of compliance activities across all entities</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <EntityFYSelector />

      {/* Active filters indicator */}
      {selectedEntity && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
          Currently viewing: {selectedCompany}
        </div>
      )}

      {/* Stats Cards - Using original unfiltered stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <div className={stat.iconColor}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Overview - Using original unfiltered stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-sm text-gray-500">
              {initialStats.completed} of {initialStats.totalTasks} tasks completed
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Entity Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Entities</span>
              <span className="font-semibold">
                {selectedEntity ? 1 : companies.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Tasks</span>
              <span className="font-semibold">{initialStats.totalTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Functions</span>
              <span className="font-semibold">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exception Reports - Filtered by company name only */}
      {filteredExceptions.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Exception Reports</h3>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {filteredExceptions.length}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Function
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExceptions.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.entityName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {report.functionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {report.taskType.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {report.plannedDate
                        ? new Date(report.plannedDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {report.actualDate
                        ? new Date(report.actualDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {report.delayDays} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={report.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">
            {allExceptions.length === 0 
              ? 'No exception reports available' 
              : selectedEntity
                ? 'No exception reports for the selected company'
                : 'No exception reports available'}
          </p>
        </div>
      )}
    </div>
  );
};