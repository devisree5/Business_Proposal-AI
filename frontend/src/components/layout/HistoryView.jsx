import React, { useState, useEffect } from 'react';
import { History, Activity, Calendar, ArrowRight, CheckCircle2, Mail, FileText, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function HistoryView() {
  const { dashboardData, openEditorWithProposal } = useApp();
  const [activities, setActivities] = useState(dashboardData?.recent_activity || []);

  useEffect(() => {
    if (dashboardData?.recent_activity) {
      setActivities(dashboardData.recent_activity);
    }
  }, [dashboardData]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'proposal_generated':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'email_analyzed':
        return <Mail className="w-4 h-4 text-emerald-600" />;
      case 'pricing_calculated':
        return <DollarSign className="w-4 h-4 text-amber-600" />;
      case 'proposal_sent':
        return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Log & Workflow History</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Chronological record of incoming customer emails, AI analysis jobs, pricing runs, and outbound proposal delivery
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="space-y-6">
          {activities.map((item, idx) => (
            <div key={item.id || idx} className="flex items-start gap-4 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getActivityIcon(item.action_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
                {item.reference_id && item.reference_id.startsWith('PR-') && (
                  <button
                    onClick={() => {
                      api.getProposal(item.reference_id).then(openEditorWithProposal);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold mt-2 hover:underline"
                  >
                    <span>View Proposal Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
