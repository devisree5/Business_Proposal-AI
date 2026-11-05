import React from 'react';
import { Search, Bell, RefreshCw, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { searchQuery, setSearchQuery, loadEmails, loadProposals, loadFollowUps, showToast, followUps } = useApp();

  const handleSyncClick = async () => {
    showToast('Checking incoming emails on anyaforgerrrr345@gmail.com...', 'info');
    await Promise.all([loadEmails(), loadProposals(), loadFollowUps()]);
    showToast('Gmail inbox synchronized successfully!');
  };

  const pendingReminders = followUps.filter(f => f.follow_up_status === 'pending').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search enquiries, clients (e.g. Rahul Sharma)..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Connected Gmail Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Mail className="w-3.5 h-3.5 text-red-500" />
          <span className="font-medium text-slate-700">anyaforgerrrr345@gmail.com</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected"></span>
        </div>

        {/* Quick Sync */}
        <button
          onClick={handleSyncClick}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/60"
          title="Refresh Inbox"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Sync Gmail</span>
        </button>

        {/* Follow-up Reminders Alert */}
        <div className="relative cursor-pointer group" title={`${pendingReminders} Pending Follow-up Reminders`}>
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4 text-slate-600" />
          </div>
          {pendingReminders > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {pendingReminders}
            </span>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            AB
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Anvayuone bot</p>
            <p className="text-[10px] text-slate-500">Anvayuone &bull; Hyd</p>
          </div>
        </div>
      </div>
    </header>
  );
}
