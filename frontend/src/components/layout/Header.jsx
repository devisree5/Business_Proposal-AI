import React from 'react';
import { Search, Bell, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { searchQuery, setSearchQuery, loadDashboard, showToast } = useApp();

  const handleSyncClick = async () => {
    showToast('Checking incoming emails via IMAP/Gmail...', 'info');
    await loadDashboard();
    showToast('Mailbox synchronized successfully!');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emails, clients..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Sync */}
        <button
          onClick={handleSyncClick}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/60"
          title="Refresh Inbox"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Sync Inbox</span>
        </button>

        {/* Notifications */}
        <div className="relative cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4 text-slate-600" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            2
          </span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            ST
          </div>
        </div>
      </div>
    </header>
  );
}
