import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings, 
  FileText, 
  Calculator,
  Receipt,
  Shield,
  Search
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: 'tasks',
    label: 'My Tasks',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'accounts',
    label: 'Accounts',
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    id: 'tax',
    label: 'Tax',
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: 'audit',
    label: 'Audit',
    icon: <Search className="w-5 h-5" />,
  },
  {
    id: 'companies',
    label: 'Companies',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
