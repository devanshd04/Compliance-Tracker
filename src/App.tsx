import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { AccountsView } from './components/functions/AccountsView';
import { TaxView } from './components/functions/TaxView';
import { ComplianceView } from './components/functions/ComplianceView';
import { AuditView } from './components/functions/AuditView';
import { CompaniesView } from './components/master/CompaniesView';
import { UsersView } from './components/master/UsersView';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <LoginForm />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TasksView />;
      case 'accounts':
        return <AccountsView />;
      case 'tax':
        return <TaxView />;
      case 'compliance':
        return <ComplianceView />;
      case 'audit':
        return <AuditView />;
      case 'companies':
        return <CompaniesView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">System configuration and preferences</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Settings page coming soon...</p>
            </div>
          </div>
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 p-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              {renderActiveView()}
            </div>
          </main>
        </div>
      </div>
    </DataProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
