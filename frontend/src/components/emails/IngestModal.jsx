import React, { useState } from 'react';
import { X, Mail, Sparkles, Send } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function IngestModal({ isOpen, onClose, onIngested }) {
  const { showToast } = useApp();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      label: 'Acme Corp (500 Licenses & Cloud)',
      name: 'Marcus Vance',
      email: 'marcus.vance@acmecorp.com',
      subject: 'Request for Proposal - Enterprise Licenses & Cloud Setup',
      body: `Hi Sales Team,\n\nWe need a formal proposal for 500 professional user licenses, high-availability AWS cloud topology setup, and a full Enterprise Security Audit. Our target timeline is within 4-6 weeks and budget is $50k-$60k.\n\nBest regards,\nMarcus Vance\nAcme Corporation`
    },
    {
      label: 'Global Tech (Custom Web App)',
      name: 'Elena Rostova',
      email: 'elena.r@globaltech.io',
      subject: 'Inquiry: Custom Solution for Remote Teams',
      body: `Hello,\n\nGlobal Tech is looking for a custom full-stack web application with responsive dashboard and two-way API integration with our CRM. Please send us pricing and estimated delivery milestones.\n\nThanks,\nElena Rostova\nGlobal Tech Ltd`
    },
    {
      label: 'Modern Tools (DB Migration)',
      name: 'David Miller',
      email: 'david.m@moderntools.com',
      subject: 'Cloud Services & Infrastructure Migration Quote',
      body: `Hi,\n\nWe are looking to migrate our legacy databases to AWS with zero downtime, and need a 24/7 dedicated support SLA for 12 months. Budget is around $30,000.\n\nRegards,\nDavid Miller\nModern Tools Inc`
    }
  ];

  const applyPreset = (p) => {
    setSenderName(p.name);
    setSenderEmail(p.email);
    setSubject(p.subject);
    setBodyText(p.body);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!senderEmail || !subject || !bodyText) {
      showToast('Please fill in sender email, subject, and body', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.ingestEmail({
        sender_name: senderName,
        sender_email: senderEmail,
        subject: subject,
        body_text: bodyText
      });
      showToast(res.message || 'Email ingested successfully!');
      onIngested(res.email);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to ingest email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Inbound Email Ingestion Simulator</h3>
              <p className="text-xs text-slate-500">Test email-to-proposal workflow with realistic inquiries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Test Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 border border-slate-200 transition-colors"
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Email *</label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. client@company.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Line *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Request for Proposal - Custom Web Portal"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Body Content *</label>
              <textarea
                required
                rows={5}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Paste or write the customer service request email here..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-sans"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Ingesting...' : 'Ingest & Process Email'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
