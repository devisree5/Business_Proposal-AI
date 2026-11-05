import React from 'react';
import { 
  LayoutDashboard, 
  Mail, 
  FileText, 
  Database, 
  Settings, 
  History, 
  Send, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab, dashboardData } = useApp();

  const newEmailsCount = dashboardData?.metrics?.new_requests || 3;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'emails', label: 'Emails', icon: Mail, badge: newEmailsCount },
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'pricing', label: 'Pricing Catalogue', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <aside className="w-64 bg-[#091124] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800/80 shadow-xl select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-6 pb-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight leading-none flex items-center gap-1.5">
              ProposalGen <span className="text-blue-400 font-semibold text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Email → Proposal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white shadow-sm'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User & Footer Info */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
              ST
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-400 font-medium">Welcome back,</p>
              <p className="text-sm font-semibold text-white truncate">Sales Team!</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors pt-1 border-t border-slate-700/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Workspace Profile</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
