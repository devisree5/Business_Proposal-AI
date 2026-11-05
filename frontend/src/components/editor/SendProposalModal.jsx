import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2, FileText, Sparkles, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function SendProposalModal({ isOpen, onClose, proposal, onSent }) {
  const { showToast, loadProposals, loadFollowUps } = useApp();
  const [recipientEmail, setRecipientEmail] = useState(proposal?.client_email || '');
  const [recipientName, setRecipientName] = useState(proposal?.client_name || '');
  const [subject, setSubject] = useState(
    `Business Proposal: ${proposal?.title || 'E-commerce Website Development'} [Ref: ${proposal?.id || 'PR-2025-001'}]`
  );
  const [message, setMessage] = useState(
    `Dear ${proposal?.client_name || 'Rahul Sharma'},\n\nThank you for considering ${proposal?.sender_company || 'Anvayuone'} for your upcoming project. Please find attached our detailed commercial business proposal (Ref: ${proposal?.id || 'PR-2025-001'}) covering scope, 60-day delivery milestones, and GST pricing breakdown.\n\nWe look forward to collaborating with ${proposal?.client_company || 'ABC Solutions Pvt. Ltd.'}.\n\nBest regards,\n${proposal?.sender_name || 'Anvayuone bot'}\nAI Sales Automation | Anvayuone, Hyderabad`
  );
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    showToast('Sending proposal via Gmail API (anyaforgerrrr345@gmail.com)...', 'info');

    try {
      const res = await api.sendProposal(proposal.id, {
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject: subject,
        custom_message: message
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast(`Proposal sent successfully to ${recipientEmail}! Follow-up reminder scheduled for +3 days.`);
      if (onSent) onSent(res);
      await Promise.all([loadProposals(), loadFollowUps()]);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to deliver proposal email', 'error');
    } finally {
      setSending(false);
    }
  };

  const formattedAmount = (proposal?.total_amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Send Proposal to Client</h3>
              <p className="text-xs text-slate-500">
                Proposal #{proposal?.id} &bull; ₹{formattedAmount} INR (incl. 18% GST)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sender Info Banner */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-5 py-2.5 flex items-center justify-between text-[11px] text-blue-900">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Sender: <strong>anyaforgerrrr345@gmail.com</strong> (Gmail API)</span>
          </div>
          <div className="flex items-center gap-1 text-blue-700 font-medium">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>3-Day Follow-Up Auto-Scheduled</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Email *</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Subject Line</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Note / Message</label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 leading-relaxed font-sans"
            />
          </div>

          {/* Attachment Pill */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">{proposal?.id}_{proposal?.client_company?.replace(/\s+/g, '_')}_Proposal.pdf</span>
                <span className="text-[10px] text-slate-400 block">Generated Playwright Vector PDF (with GSTIN & Bank Details)</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Attached
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Delivering via Gmail...' : 'Send Proposal via Gmail'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
