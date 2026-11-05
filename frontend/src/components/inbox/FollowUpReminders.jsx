import React, { useState, useEffect } from 'react';
import { Bell, Clock, Send, CheckCircle2, User, Building, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function FollowUpReminders() {
  const { followUps, setFollowUps, loadFollowUps, showToast, openEditorWithProposal } = useApp();
  const [loading, setLoading] = useState(false);
  const [dispatchingId, setDispatchingId] = useState(null);

  useEffect(() => {
    loadFollowUps();
  }, []);

  const handleSendFollowUp = async (proposalId, clientName) => {
    setDispatchingId(proposalId);
    showToast(`Sending gentle follow-up email via Gmail to ${clientName}...`, 'info');
    try {
      await api.sendFollowUp(proposalId);
      showToast(`Follow-up delivered to ${clientName}!`);
      loadFollowUps();
    } catch (e) {
      showToast(e.message || 'Failed to send follow-up', 'error');
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Automatic 3-Day Follow-Up Reminders</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Proposals sent to customers where no response has been logged after 3 business days
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          {followUps.length} Pending Follow-Ups
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {followUps.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">All Proposals Up to Date!</h4>
            <p className="text-xs text-slate-500">
              No pending customer proposals requiring a 3-day follow-up at this time.
            </p>
          </div>
        ) : (
          followUps.map((task) => (
            <div
              key={task.proposal_id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {task.proposal_id}
                  </span>
                  <span className="font-bold text-sm text-slate-900">{task.client_company}</span>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {task.days_since_sent >= 3 ? `${task.days_since_sent} days overdue` : 'Follow-up Due Today'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{task.client_name} &lt;{task.client_email}&gt;</span>
                  </span>
                  <span>&bull;</span>
                  <span className="font-bold text-slate-900">₹{task.total_amount?.toLocaleString()} INR</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sent: {new Date(task.sent_at).toLocaleDateString('en-GB')}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => {
                    api.getProposal(task.proposal_id).then(openEditorWithProposal);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  View Proposal
                </button>

                <button
                  onClick={() => handleSendFollowUp(task.proposal_id, task.client_name)}
                  disabled={dispatchingId === task.proposal_id || task.status === 'reminded'}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {task.status === 'reminded'
                      ? 'Follow-up Already Sent'
                      : dispatchingId === task.proposal_id
                      ? 'Sending...'
                      : 'Send Follow-Up via Gmail'}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
