import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Send, 
  FileText, 
  Eye, 
  Sparkles, 
  Building, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  ListChecks, 
  Check, 
  Layers,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import SectionGeneral from './SectionGeneral';
import SectionOverview from './SectionOverview';
import SectionDeliverables from './SectionDeliverables';
import SectionPricing from './SectionPricing';
import SectionTimeline from './SectionTimeline';
import SectionTerms from './SectionTerms';
import LiveDocumentPreview from './LiveDocumentPreview';
import SendProposalModal from './SendProposalModal';

export default function ProposalEditor() {
  const { currentProposal, setCurrentProposal, setActiveTab, showToast, loadDashboard } = useApp();

  // If no proposal is loaded, fetch latest or create a default proposal
  const [proposal, setProposal] = useState(currentProposal || {
    id: 'PR-2025-001',
    template_id: 'modern',
    title: 'Enterprise Commercial Proposal',
    status: 'draft',
    client_name: 'Marcus Vance',
    client_company: 'Acme Corporation',
    client_email: 'marcus.vance@acmecorp.com',
    client_phone: '+1 (415) 882-9011',
    client_address: '500 Market Street, San Francisco, CA',
    sender_company: 'ProposalGen Solutions Inc.',
    sender_name: 'Sarah Jenkins',
    sender_email: 'sarah.jenkins@proposalgen.ai',
    sender_phone: '+1 (800) 555-0199',
    sender_address: '100 Innovation Way, Suite 400, San Francisco, CA 94107',
    accent_color: '#2563eb',
    created_date: 'November 05, 2026',
    valid_until: 'December 05, 2026',
    currency: 'USD',
    project_overview: 'Comprehensive digital infrastructure upgrade and professional software licensing provisioned for Acme Corporation with multi-region AWS cloud setup, security audit, and 24/7 SLA.',
    scope_of_work: 'Complete turnkey execution including environment staging, directory sync, SSO integration, security hardening, and staff onboarding.',
    deliverables: [
      { title: 'Enterprise Licenses', description: '500 active user seats with SAML SSO integration' },
      { title: 'Cloud Infrastructure', description: 'Multi-region AWS cloud topology orchestration via Terraform' },
      { title: 'Security Audit', description: 'SOC2/GDPR compliance verification and penetration assessment' }
    ],
    timeline_milestones: [
      { phase: 'Phase 1', title: 'Architecture & Discovery', duration: 'Weeks 1-2', deliverables: 'Kickoff and specifications blueprint' },
      { phase: 'Phase 2', title: 'Cloud Implementation', duration: 'Weeks 3-4', deliverables: 'Environment deployment and testing' },
      { phase: 'Phase 3', title: 'Security Audit & Rollout', duration: 'Weeks 5-6', deliverables: 'Penetration verification and team handover' }
    ],
    line_items: [
      { id: 'item-1', name: 'Enterprise Professional License', description: '500 user seat pack', unit_type: 'per_user', quantity: 50.0, unit_price: 240.0, total: 12000.0, matched_service_id: 'LIC-ENT', is_custom: false },
      { id: 'item-2', name: 'Cloud Infrastructure & High-Availability Architecture', description: 'AWS redundant topology', unit_type: 'fixed', quantity: 1.0, unit_price: 6500.0, total: 6500.0, matched_service_id: 'CLD-ARCH', is_custom: false },
      { id: 'item-3', name: 'Enterprise Security Audit & Compliance Assessment', description: 'Full penetration scan', unit_type: 'fixed', quantity: 1.0, unit_price: 4500.0, total: 4500.0, matched_service_id: 'SEC-AUDIT', is_custom: false }
    ],
    subtotal: 23000.0,
    discount_percent: 5.0,
    tax_percent: 10.0,
    tax_amount: 2185.0,
    total_amount: 24035.0,
    payment_terms: '30% Upon Kickoff, 40% Mid-Project Milestone, 30% Final Delivery & Acceptance',
    terms_and_conditions: 'This proposal is valid for 30 calendar days from the date of issue. Changes in scope will be handled through written change orders.'
  });

  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);

  useEffect(() => {
    if (currentProposal) {
      setProposal(currentProposal);
    }
  }, [currentProposal]);

  const handleFieldChange = (field, value) => {
    const updated = { ...proposal, [field]: value };
    setProposal(updated);
    setCurrentProposal(updated);
  };

  const handleSaveProposal = async () => {
    setIsSaving(true);
    try {
      if (proposal.id && proposal.id.startsWith('PR-')) {
        const saved = await api.updateProposal(proposal.id, proposal);
        setProposal(saved);
        setCurrentProposal(saved);
        showToast('Proposal saved successfully!');
      } else {
        const created = await api.createProposal(proposal);
        setProposal(created);
        setCurrentProposal(created);
        showToast(`Proposal #${created.id} created successfully!`);
      }
      loadDashboard();
    } catch (e) {
      showToast(e.message || 'Failed to save proposal', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    showToast('Rendering high-definition vector PDF with Playwright...', 'info');
    try {
      // First ensure latest updates are saved
      await api.updateProposal(proposal.id, proposal);
      const res = await api.generatePDF(proposal.id, proposal.template_id);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = `/api/proposals/${proposal.id}/download-pdf`;
      link.download = `${proposal.id}_Proposal.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('PDF downloaded successfully!');
    } catch (e) {
      console.warn('Backend PDF download error, attempting browser print fallback', e);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'general', label: '1. General & Parties', icon: Building },
    { id: 'overview', label: '2. Overview & Scope', icon: FileText },
    { id: 'deliverables', label: '3. Deliverables', icon: ListChecks },
    { id: 'pricing', label: '4. Pricing & Rates', icon: DollarSign, badge: proposal.line_items?.length },
    { id: 'timeline', label: '5. Timeline & Milestones', icon: Calendar },
    { id: 'terms', label: '6. Terms & Signatures', icon: ShieldCheck },
  ];

  const templates = [
    { id: 'modern', label: 'Modern Business' },
    { id: 'corporate', label: 'Corporate Elegance' },
    { id: 'minimal', label: 'Minimal Style' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Application Bar */}
      <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('proposals')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Proposals</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {proposal.id || 'PR-DRAFT'}
            </span>
            <input
              type="text"
              value={proposal.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="font-bold text-sm text-slate-900 hover:bg-slate-50 focus:bg-white px-2 py-1 rounded outline-none border border-transparent focus:border-blue-500 w-72 truncate"
              placeholder="Proposal Title"
            />
          </div>

          {/* Status selector */}
          <select
            value={proposal.status || 'draft'}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 outline-none cursor-pointer"
          >
            <option value="draft">Draft</option>
            <option value="generated">Generated</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* Template Switcher & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Template pills */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleFieldChange('template_id', t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  (proposal.template_id || 'modern') === t.id
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveProposal}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200/80"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>{isDownloading ? 'Rendering PDF...' : 'Download PDF'}</span>
          </button>

          {/* Send to Client */}
          <button
            onClick={() => setSendModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Client</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content: Split 50/50 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Half: Tabbed Section Editor (6 cols) */}
        <div className="lg:col-span-6 flex flex-col h-full border-r border-slate-200 bg-slate-50 overflow-hidden">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 px-4 py-2.5 bg-white border-b border-slate-200 overflow-x-auto text-xs shrink-0">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Section Form Container */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === 'general' && (
              <SectionGeneral proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'overview' && (
              <SectionOverview proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'deliverables' && (
              <SectionDeliverables proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'pricing' && (
              <SectionPricing proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'timeline' && (
              <SectionTimeline proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'terms' && (
              <SectionTerms proposal={proposal} onChange={handleFieldChange} />
            )}
          </div>
        </div>

        {/* Right Half: Live Document Sheet Preview (6 cols) */}
        <div className="lg:col-span-6 h-full p-4 overflow-hidden">
          <LiveDocumentPreview
            proposal={proposal}
            onPrint={handlePrint}
            onDownload={handleDownloadPDF}
          />
        </div>
      </div>

      {/* Send Proposal Modal */}
      <SendProposalModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        proposal={proposal}
        onSent={(res) => {
          handleFieldChange('status', 'sent');
        }}
      />
    </div>
  );
}
