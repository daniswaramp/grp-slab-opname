import React from 'react';
import { LayoutDashboard, Box, ListChecks, Settings, Database } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Opname Slab', icon: Box },
    { name: 'Opname List', icon: ListChecks },
    { name: 'Setting', icon: Settings },
    { name: 'Database', icon: Database },
  ];

  return (
    <div className="bg-white border-b border-gray-100 overflow-x-auto no-scrollbar shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-3 px-6 py-4 text-xs font-black transition-all whitespace-nowrap border-b-4 uppercase tracking-wider ${
                isActive 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                  : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {tab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;