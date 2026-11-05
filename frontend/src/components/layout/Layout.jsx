import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardView from '../dashboard/DashboardView';
import SalesInbox from '../inbox/SalesInbox';
import FollowUpReminders from '../inbox/FollowUpReminders';
import ProposalList from '../proposals/ProposalList';
import ProposalEditor from '../editor/ProposalEditor';
import PricingCatalogue from '../pricing/PricingCatalogue';
import SettingsView from '../settings/SettingsView';
import HistoryView from './HistoryView';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Layout() {
  const { activeTab, toast } = useApp();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto">
          {(activeTab === 'dashboard' || !activeTab) && <DashboardView />}
          {(activeTab === 'emails' || activeTab === 'inbox') && <SalesInbox />}
          {activeTab === 'proposals' && <ProposalList />}
          {activeTab === 'sent' && <ProposalList initialStatus="sent" />}
          {activeTab === 'followups' && <FollowUpReminders />}
          {activeTab === 'editor' && <ProposalEditor />}
          {activeTab === 'pricing' && <PricingCatalogue />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'history' && <HistoryView />}
        </main>
      </div>

      {/* Global Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700/80 animate-in slide-in-from-bottom-4 duration-150 max-w-md">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold leading-snug">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
