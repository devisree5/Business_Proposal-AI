import React, { useState } from 'react';
import { Sparkles, FileText, Check, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function SectionOverview({ proposal, onChange }) {
  const { showToast } = useApp();
  const [polishing, setPolishing] = useState(false);

  const handlePolish = async (action) => {
    if (!proposal.project_overview) {
      showToast('Please enter some text in Project Overview first', 'error');
      return;
    }

    setPolishing(true);
    showToast(`AI polishing text with ${action} tone...`, 'info');
    try {
      const res = await api.polishText(proposal.project_overview, action);
      onChange('project_overview', res.polished);
      showToast('Executive summary refined with AI!');
    } catch (e) {
      showToast(e.message || 'AI polishing failed', 'error');
    } finally {
      setPolishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Executive Strategic Summary</span>
          </h4>

          {/* Quick AI Polish Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" /> AI Assist:
            </span>
            <button
              type="button"
              disabled={polishing}
              onClick={() => handlePolish('executive')}
              className="px-2 py-1 text-[11px] font-semibold rounded bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors disabled:opacity-50"
            >
              Executive
            </button>
            <button
              type="button"
              disabled={polishing}
              onClick={() => handlePolish('persuasive')}
              className="px-2 py-1 text-[11px] font-semibold rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors disabled:opacity-50"
            >
              Persuasive
            </button>
            <button
              type="button"
              disabled={polishing}
              onClick={() => handlePolish('professional')}
              className="px-2 py-1 text-[11px] font-semibold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors disabled:opacity-50"
            >
              Formal
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={proposal.project_overview || ''}
          onChange={(e) => onChange('project_overview', e.target.value)}
          placeholder="State the core business objectives, strategic value, and high-level architectural approach..."
          className="w-full p-3.5 text-xs text-slate-800 leading-relaxed border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-sans"
        />
        <p className="text-[11px] text-slate-400">
          Tip: This appears prominently in Section 1 of all generated proposal templates.
        </p>
      </div>

      {/* Scope Narrative */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Scope of Work Narrative</span>
        </h4>
        <textarea
          rows={5}
          value={proposal.scope_of_work || ''}
          onChange={(e) => onChange('scope_of_work', e.target.value)}
          placeholder="Define what is included and authorized within this statement of work..."
          className="w-full p-3.5 text-xs text-slate-800 leading-relaxed border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-sans"
        />
      </div>
    </div>
  );
}
