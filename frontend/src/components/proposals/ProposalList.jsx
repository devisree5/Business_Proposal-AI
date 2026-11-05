import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Send, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function ProposalList({ initialStatus = 'all' }) {
  const { openEditorWithProposal, setActiveTab, showToast, loadDashboard } = useApp();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [search, setSearch] = useState('');

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const data = await api.getProposals({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined
      });
      setProposals(data);
    } catch (e) {
      console.warn('Error fetching proposals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [statusFilter, search]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete proposal ${id}?`)) return;
    try {
      await api.deleteProposal(id);
      showToast(`Proposal ${id} deleted`);
      fetchProposals();
      loadDashboard();
    } catch (e) {
      showToast(e.message || 'Failed to delete proposal', 'error');
    }
  };

  const handleDownload = (id) => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const link = document.createElement('a');
    link.href = `${apiUrl}/api/proposals/${id}/download-pdf`;
    link.download = `${id}_Proposal.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading ${id} PDF...`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Sent</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Accepted</span>;
      case 'declined':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Declined</span>;
      case 'generated':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Generated</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">Draft</span>;
    }
  };

  const totalValue = proposals.reduce((acc, p) => acc + (p.total_amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Business Proposals</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage, customize, export, and track formal proposals generated from email inquiries
          </p>
        </div>

        <button
          onClick={() => setActiveTab('editor')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Proposal</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{proposals.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Proposals in Pipeline</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-lg">
            ₹
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 font-medium">Total Pipeline Value (INR)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">98%</div>
            <div className="text-xs text-slate-500 font-medium">Client Acceptance Rate</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proposals, client companies..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto">
          {['all', 'draft', 'generated', 'sent', 'accepted'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Proposal ID</th>
                <th className="p-4">Client Organization</th>
                <th className="p-4">Proposal Title</th>
                <th className="p-4">Template</th>
                <th className="p-4 text-right">Total Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Issuance Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading proposals...</td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No proposals found matching criteria</td>
                </tr>
              ) : (
                proposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">
                      <div className="flex items-center gap-1.5">
                        <span>{prop.id}</span>
                        {prop.version && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                            v{prop.version}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{prop.client_company}</div>
                      <div className="text-[11px] text-slate-500">{prop.client_name || prop.client_email}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 max-w-xs truncate">{prop.title}</td>
                    <td className="p-4 capitalize">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {prop.template_id || 'modern'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 text-sm">
                      ₹{(prop.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(prop.status)}
                        {prop.status === 'sent' && prop.follow_up_status === 'pending' && (
                          <span className="text-[9px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                            3d Follow-up Due
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{prop.created_date || 'Nov 05, 2026'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditorWithProposal(prop)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Open Editor"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(prop.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prop.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Proposal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
