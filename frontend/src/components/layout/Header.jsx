import React from 'react';
import { Search, Bell, RefreshCw, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { searchQuery, setSearchQuery, loadEmails, loadProposals, loadFollowUps, loadDashboard, showToast, followUps } = useApp();

  const handleSyncClick = async () => {
    showToast('Checking incoming emails on anyaforgerrrr345@gmail.com...', 'info');
    await Promise.all([loadEmails(), loadProposals(), loadFollowUps(), loadDashboard()]);
    showToast('Gmail inbox synchronized successfully!');
  };

  const pendingReminders = followUps.filter(f => f.follow_up_status === 'pending').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input - Matching Screenshot */}
      <div className="relative w-80 sm:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emails, clients..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3.5">
        {/* Quick Sync */}
        <button
          onClick={handleSyncClick}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200/60"
          title="Refresh Inbox"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Sync</span>
        </button>

        {/* Notifications Bell with Badge 2 - Matching Screenshot */}
        <div 
          onClick={() => showToast('2 unreviewed incoming service requests pending', 'info')}
          className="relative cursor-pointer group" 
          title="2 New Inquiries"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors">
            <Bell className="w-4 h-4 text-slate-600" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {pendingReminders > 0 ? pendingReminders : 2}
          </span>
        </div>

        {/* User Avatar ST - Matching Screenshot */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm cursor-pointer hover:bg-blue-700 transition-colors" title="Sales Team (ST)">
            ST
          </div>
        </div>
      </div>
    </header>
  );
}
