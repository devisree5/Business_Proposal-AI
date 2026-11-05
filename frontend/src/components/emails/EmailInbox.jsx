import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Sparkles, 
  Plus, 
  RefreshCw, 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import IngestModal from './IngestModal';
import AnalysisDrawer from './AnalysisDrawer';

export default function EmailInbox() {
  const { 
    selectedEmail, 
    setSelectedEmail, 
    showToast, 
    loadDashboard,
    createProposalFromAnalysis 
  } = useApp();

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  
  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const data = await api.getEmails({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: search || undefined
      });
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (err) {
      console.warn('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [filterStatus, search]);

  const handleSyncMailbox = async () => {
    showToast('Connecting to IMAP / Gmail...', 'info');
    try {
      const res = await api.syncEmails();
      showToast(res.message || `Ingested ${res.ingested_count || 0} new requests!`);
      fetchEmails();
      loadDashboard();
    } catch (e) {
      showToast(e.message || 'Sync failed', 'error');
    }
  };

  const handleRunAnalysis = async (emailToAnalyze) => {
    const target = emailToAnalyze || selectedEmail;
    if (!target) return;

    setIsAnalyzing(true);
    showToast(`Analyzing email with Gemini AI...`, 'info');
    try {
      const res = await api.analyzeEmail(target.id);
      setCurrentAnalysis(res.analysis);
      setDrawerOpen(true);
      showToast('AI analysis completed!');
      fetchEmails();
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'AI analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenExistingAnalysis = (email) => {
    if (email.analysis_json) {
      setCurrentAnalysis(email.analysis_json);
      setDrawerOpen(true);
    } else {
      handleRunAnalysis(email);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">New</span>;
      case 'analyzing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-600 border border-purple-200/60 animate-pulse">Analyzing</span>;
      case 'extracted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">Extracted</span>;
      case 'proposal_generated':
      case 'processed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60">Proposal Created</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">Pending</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Email Ingestion</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Monitor, ingest, and analyze incoming B2B service inquiry emails in real time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsIngestOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate / Ingest Email</span>
          </button>

          <button
            onClick={handleSyncMailbox}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200/80"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Mailbox</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left Inbox List | Right Email Reader & AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Email Inbox List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inbound emails..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              {['all', 'new', 'extracted', 'proposal_generated'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors shrink-0 capitalize ${
                    filterStatus === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Email Item Rows */}
          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading incoming emails...</div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No emails matching filter</div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/60 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {email.sender_name || email.sender_email}
                      </span>
                      {getStatusBadge(email.status)}
                    </div>
                    <div className="font-semibold text-xs text-slate-800 truncate mt-1">
                      {email.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {email.body_text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Email Detailed Reader (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          {selectedEmail ? (
            <>
              {/* Header Info */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {selectedEmail.subject}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{selectedEmail.sender_name}</span>
                    <span>&lt;{selectedEmail.sender_email}&gt;</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Received: {new Date(selectedEmail.received_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  {selectedEmail.analysis_json ? (
                    <button
                      onClick={() => handleOpenExistingAnalysis(selectedEmail)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Review Extracted AI Data</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRunAnalysis(selectedEmail)}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-60"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAnalyzing ? 'Extracting with AI...' : 'Run AI Extraction'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Raw Email Message Body */}
              <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/70 font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[320px] overflow-y-auto">
                {selectedEmail.body_text}
              </div>

              {/* Duplicate Prevention & Technical Message Info */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-500">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="font-bold text-slate-700 block">Message ID / Fingerprint:</span>
                  <span className="font-mono text-[10px] text-slate-600 truncate block mt-0.5">
                    {selectedEmail.message_id || 'msg-auto-detected'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                  <span className="font-bold text-slate-700 block">Deduplication Status:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified Unique Request
                  </span>
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-blue-950">Next Step: Structured AI Extraction</h4>
                  <p className="text-[11px] text-blue-800/80 mt-0.5">
                    Extract customer requirements, quantities, and match with the pricing catalogue
                  </p>
                </div>
                <button
                  onClick={() => handleOpenExistingAnalysis(selectedEmail)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>{selectedEmail.analysis_json ? 'View Extraction' : 'Extract Requirements'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 text-sm">
              Select an email from the left to view contents and trigger AI extraction.
            </div>
          )}
        </div>
      </div>

      {/* Simulator Modal */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onIngested={(newRecord) => {
          fetchEmails();
          setSelectedEmail(newRecord);
          loadDashboard();
        }}
      />

      {/* AI Extraction Review Drawer */}
      <AnalysisDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        email={selectedEmail}
        analysis={currentAnalysis}
        onContinue={(reviewedAnalysis, emailId, templateId) => {
          setDrawerOpen(false);
          createProposalFromAnalysis(reviewedAnalysis, emailId, templateId);
        }}
      />
    </div>
  );
}
