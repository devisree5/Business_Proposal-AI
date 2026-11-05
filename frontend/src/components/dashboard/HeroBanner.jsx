import React from 'react';
import { ArrowRight, RefreshCw, Sparkles, Mail, FileCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function HeroBanner() {
  const { setActiveTab, loadDashboard, showToast } = useApp();

  const handleSync = async () => {
    showToast('Scanning email mailbox for service requests...', 'info');
    await loadDashboard();
    showToast('Found 3 pending customer service requests!');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50/40 border border-blue-100 p-8 shadow-xs">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        <div className="max-w-xl">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Turn Customer Requests <br />
            into <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Professional Proposals</span>
          </h2>
          <p className="mt-2.5 text-slate-600 text-sm font-medium">
            AI-powered automation for your B2B sales workflow
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSync}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync New Emails</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 font-semibold text-sm transition-all border border-slate-200/80 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Review Inquiries</span>
            </button>
          </div>
        </div>

        {/* Hero Visual Graphic */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="flex items-center gap-4">
            {/* Email Card Graphic */}
            <div className="w-28 h-24 bg-white rounded-2xl shadow-lg border border-blue-100 flex flex-col items-center justify-center p-3 transform -rotate-3 hover:rotate-0 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-1">
                @
              </div>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
            </div>

            {/* Transition Arrow */}
            <div className="text-blue-400 flex items-center">
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
            </div>

            {/* Proposal Document Graphic */}
            <div className="w-32 h-36 bg-white rounded-xl shadow-xl border border-slate-200/80 p-3 flex flex-col justify-between transform rotate-3 hover:rotate-0 transition-transform">
              <div>
                <div className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wider">PROPOSAL</div>
                <div className="mt-2 space-y-1.5">
                  <div className="w-full h-1.5 bg-blue-200 rounded-full"></div>
                  <div className="w-4/5 h-1.5 bg-slate-200 rounded-full"></div>
                  <div className="w-3/5 h-1.5 bg-slate-200 rounded-full"></div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-1.5 flex justify-end">
                <span className="font-serif italic text-xs text-blue-700 font-bold">~ Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
