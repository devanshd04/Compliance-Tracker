import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const EntityFYSelector: React.FC = () => {
  const { companies, selectedFY, selectedEntity, setSelectedFY, setSelectedEntity } = useData();
  const { canAccessCompany } = useAuth();

  // Filter only companies the user can access (except Admins who see all via canAccessCompany logic)
  const availableCompanies = companies.filter(company => canAccessCompany(company.id.toString()));

  const fyOptions = [
    '2024-25',
    '2023-24',
    '2022-23',
    '2021-22',
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <label htmlFor="entity-select" className="block text-sm font-medium text-gray-700 mb-2">
            Entity
          </label>
          <select
            id="entity-select"
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Entities</option>
            {availableCompanies.map((company) => (
              <option key={company.id} value={company.id.toString()}>
                {company.name} ({company.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-40">
          <label htmlFor="fy-select" className="block text-sm font-medium text-gray-700 mb-2">
            Financial year
          </label>
          <select
            id="fy-select"
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {fyOptions.map((fy) => (
              <option key={fy} value={fy}>
                FY {fy}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
