import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ActivityFeed() {
  const { dashboardData, setActiveTab } = useApp();

  const activities = dashboardData?.recent_activity || [
    { title: 'Proposal #PR-2025-004 generated', created_at: new Date(Date.now() - 2 * 60000).toISOString(), color: 'bg-blue-500' },
    { title: 'Email from Acme Corporation analyzed', created_at: new Date(Date.now() - 5 * 60000).toISOString(), color: 'bg-emerald-500' },
    { title: 'Pricing calculated: $12,500', created_at: new Date(Date.now() - 8 * 60000).toISOString(), color: 'bg-amber-500' },
    { title: 'Proposal sent to client', created_at: new Date(Date.now() - 12 * 60000).toISOString(), color: 'bg-purple-500' },
  ];

  const getActivityColor = (type, idx) => {
    switch (type) {
      case 'proposal_generated':
        return 'bg-blue-500 ring-blue-100';
      case 'email_analyzed':
        return 'bg-emerald-500 ring-emerald-100';
      case 'pricing_calculated':
        return 'bg-amber-500 ring-amber-100';
      case 'proposal_sent':
        return 'bg-purple-500 ring-purple-100';
      default:
        const dots = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
        return dots[idx % dots.length];
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '2m ago';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
    if (diff < 1) return 'just now';
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Latest Activity</span>
        </div>
        <button
          onClick={() => setActiveTab('history')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3.5">
        {activities.map((act, idx) => (
          <div key={act.id || idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ring-4 ${getActivityColor(act.action_type, idx)}`} />
              <span className="font-semibold text-slate-800 truncate">{act.title}</span>
            </div>
            <span className="text-slate-400 font-medium shrink-0 ml-2">
              {formatTimeAgo(act.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
