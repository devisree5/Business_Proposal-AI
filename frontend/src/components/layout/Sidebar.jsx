import React from 'react';
import { 
  Mail, 
  FileText, 
  Database, 
  Settings, 
  Send, 
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab, emails, proposals, followUps } = useApp();

  const newEmailsCount = emails.filter(e => e.status === 'new').length;
  const pendingFollowUps = followUps.filter(f => f.follow_up_status === 'pending').length;

  const navItems = [
    { id: 'inbox', label: 'Sales Inbox', icon: Mail, badge: newEmailsCount > 0 ? newEmailsCount : undefined },
    { id: 'proposals', label: 'Proposals', icon: FileText, badge: proposals.length > 0 ? proposals.length : undefined },
    { id: 'sent', label: 'Sent Proposals', icon: Send },
    { id: 'followups', label: 'Follow-Up Reminders', icon: Clock, badge: pendingFollowUps > 0 ? pendingFollowUps : undefined, badgeColor: 'bg-amber-500' },
    { id: 'pricing', label: 'Pricing Catalogue (₹)', icon: Database },
    { id: 'settings', label: 'Settings & GST', icon: Settings },
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
            <h1 className="text-white font-bold text-base tracking-tight leading-none flex items-center gap-1.5">
              Nexura <span className="text-blue-400 font-semibold text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">Sales AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1">₹ INR &bull; Hyderabad</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
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
      </div>

      {/* User & Footer Info */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xs">
              AS
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-semibold text-white truncate">Anya Sharma</p>
              <p className="text-[10px] text-slate-400 truncate">anyaforgerrrr345@gmail.com</p>
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1 border-t border-slate-700/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gmail Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
