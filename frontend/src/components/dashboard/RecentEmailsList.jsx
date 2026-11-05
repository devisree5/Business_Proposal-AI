import React from 'react';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function RecentEmailsList() {
  const { dashboardData, emails: allEmails, setActiveTab, setSelectedEmail, showToast } = useApp();
  
  const emails = (dashboardData?.recent_emails && dashboardData.recent_emails.length > 0)
    ? dashboardData.recent_emails 
    : (allEmails && allEmails.length > 0) 
      ? allEmails.slice(0, 5) 
      : [
          {
            id: 'demo-1',
            sender_name: 'Acme Corporation',
            subject: 'Hi, we need a proposal for 500 professional licenses...',
            body_text: 'Hi, we need a proposal for 500 professional licenses across our engineering teams.',
            status: 'new',
            received_at: new Date(Date.now() - 2 * 60000).toISOString()
          },
          {
            id: 'demo-2',
            sender_name: 'Global Tech Ltd',
            subject: 'Looking for a custom solution for our remote teams...',
            body_text: 'Looking for a custom solution for our remote teams with automated deployment.',
            status: 'new',
            received_at: new Date(Date.now() - 8 * 60000).toISOString()
          },
          {
            id: 'demo-3',
            sender_name: 'Modern Tools Inc',
            subject: 'Can you send a proposal for your cloud services?',
            body_text: 'Can you send a proposal for your cloud services and ongoing support SLA?',
            status: 'analyzing',
            received_at: new Date(Date.now() - 15 * 60000).toISOString()
          },
          {
            id: 'demo-4',
            sender_name: 'Delta Solutions',
            subject: 'We need a detailed quote for enterprise package...',
            body_text: 'We need a detailed quote for enterprise package with high availability.',
            status: 'processed',
            received_at: new Date(Date.now() - 60 * 60000).toISOString()
          }
        ];

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    setActiveTab('emails');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">New</span>;
      case 'analyzing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-600 border border-purple-200/60 animate-pulse">Analyzing</span>;
      case 'extracted':
      case 'processed':
      case 'proposal_generated':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60">Processed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">Pending</span>;
    }
  };

  const getInitials = (name, comp) => {
    if (comp) {
      const parts = comp.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return comp.slice(0, 2).toUpperCase();
    }
    return (name || 'CL').slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-amber-100 text-amber-700',
      'bg-purple-100 text-purple-700',
      'bg-emerald-100 text-emerald-700'
    ];
    return colors[index % colors.length];
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'just now';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
    if (diff < 1) return 'just now';
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Mail className="w-4 h-4 text-blue-600" />
          <span>Recent Email Requests</span>
        </div>
        <button
          onClick={() => setActiveTab('emails')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {emails.map((email, idx) => (
          <div
            key={email.id || idx}
            onClick={() => handleSelectEmail(email)}
            className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(idx)}`}>
                {getInitials(email.sender_name, email.subject)}
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {email.sender_name || 'Customer Lead'}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5 max-w-md">
                  {email.body_text ? email.body_text.slice(0, 70) + '...' : email.subject}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 pl-3">
              {getStatusBadge(email.status)}
              <span className="text-xs text-slate-400 font-medium">
                {formatTimeAgo(email.received_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
