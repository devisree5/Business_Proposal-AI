import React from 'react';
import { 
  Home,
  Mail, 
  FileText, 
  Database, 
  Settings, 
  Send, 
  Clock,
  LogOut,
  Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab, emails, proposals, followUps, showToast } = useApp();

  const newEmailsCount = emails.filter(e => e.status === 'new').length;
  const pendingFollowUps = followUps.filter(f => f.follow_up_status === 'pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'emails', label: 'Emails', icon: Mail, badge: newEmailsCount > 0 ? newEmailsCount : 3, badgeColor: 'bg-red-500' },
    { id: 'proposals', label: 'Proposals', icon: FileText, badge: proposals.length > 0 ? proposals.length : undefined },
    { id: 'pricing', label: 'Pricing Catalogue', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <aside className="w-64 bg-[#091124] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800/80 shadow-xl select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 pb-4 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base tracking-tight leading-none">
              ProposalGen AI
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Email &rarr; Proposal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'emails' && activeTab === 'inbox');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badgeColor 
                        ? `${item.badgeColor} text-white` 
                        : isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white shadow-sm'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Links Section */}
        <div className="px-5 pt-3 mt-2 border-t border-slate-800/60">
          <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider mb-2">Automations</p>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('sent')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'sent' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Sent Proposals</span>
              <Send className="w-3 h-3 text-slate-500" />
            </button>
            <button
              onClick={() => setActiveTab('followups')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'followups' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Follow-Up Alerts</span>
              {pendingFollowUps > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold">
                  {pendingFollowUps}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* User & Footer Card matching Screenshot */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="bg-[#0e172e] rounded-2xl p-3.5 border border-slate-800/80 flex flex-col gap-2.5 shadow-inner">
          <div>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">Welcome back,</p>
            <p className="text-xs font-bold text-white leading-tight mt-0.5">Sales Team!</p>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-[11px] shadow-sm">
              ST
            </div>
            <button
              onClick={() => showToast('Sales session is active & synchronized', 'info')}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
