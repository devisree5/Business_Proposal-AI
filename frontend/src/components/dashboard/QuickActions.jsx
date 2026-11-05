import React from 'react';
import { Sparkles, FilePlus, History, DollarSign, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function QuickActions() {
  const { setActiveTab, setSelectedEmail, dashboardData } = useApp();

  const handleAnalyzeFirstEmail = () => {
    const firstEmail = dashboardData?.recent_emails?.[0];
    if (firstEmail) {
      setSelectedEmail(firstEmail);
    }
    setActiveTab('emails');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-4 pb-3 border-b border-slate-100">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span>Quick Actions</span>
      </div>

      <div className="space-y-2.5">
        {/* Primary Action Button */}
        <button
          onClick={handleAnalyzeFirstEmail}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 group"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
            <span>Analyze Selected Email</span>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Secondary Actions */}
        <button
          onClick={() => setActiveTab('editor')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors text-left"
        >
          <FilePlus className="w-4 h-4 text-slate-500" />
          <span>Create New Proposal</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors text-left"
        >
          <History className="w-4 h-4 text-slate-500" />
          <span>View Proposal History</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors text-left"
        >
          <DollarSign className="w-4 h-4 text-slate-500" />
          <span>Manage Pricing</span>
        </button>
      </div>
    </div>
  );
}
