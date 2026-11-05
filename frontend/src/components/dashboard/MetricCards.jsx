import React from 'react';
import { Mail, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MetricCards() {
  const { dashboardData } = useApp();
  const m = dashboardData?.metrics || {
    new_requests: 3,
    new_requests_change: '+20%',
    proposals_generated: 12,
    proposals_change: '+12%',
    success_rate: 98,
    success_rate_change: '+2%',
    avg_turnaround: '2.5h',
    turnaround_change: '-18%'
  };

  const cards = [
    {
      label: 'New Requests',
      value: m.new_requests,
      change: m.new_requests_change,
      changePositive: true,
      icon: Mail,
      iconBg: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Proposals Generated',
      value: m.proposals_generated,
      change: m.proposals_change,
      changePositive: true,
      icon: FileText,
      iconBg: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: 'Success Rate',
      value: `${m.success_rate}%`,
      change: m.success_rate_change,
      changePositive: true,
      icon: CheckCircle2,
      iconBg: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      label: 'Avg. Turnaround',
      value: m.avg_turnaround,
      change: m.turnaround_change,
      changePositive: true, // Lower turnaround is positive!
      icon: Clock,
      iconBg: 'bg-amber-500/10 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{c.value}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{c.label}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[11px] font-bold ${c.change.startsWith('+') ? 'text-emerald-600' : 'text-emerald-600'}`}>
                    {c.change.startsWith('+') ? '↑' : '↓'} {c.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
