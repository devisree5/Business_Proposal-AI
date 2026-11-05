import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Send, 
  FileText, 
  Sparkles, 
  Building, 
  IndianRupee, 
  Calendar, 
  ShieldCheck, 
  ListChecks, 
  GitBranch,
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
  const { currentProposal, setCurrentProposal, setActiveTab, showToast, loadProposals, loadEmails } = useApp();

  const [proposal, setProposal] = useState(currentProposal || {
    id: 'PR-2025-001',
    version: 1,
    template_id: 'modern',
    title: 'E-commerce Website Development Proposal',
    status: 'generated',
    client_name: 'Rahul Sharma',
    client_company: 'ABC Solutions Pvt. Ltd.',
    client_email: 'rahul@abcsolutions.in',
    client_phone: '+91 98765 43210',
    client_address: 'Hitec City, Hyderabad, Telangana',
    client_gstin: '36AABCA1234E1Z1',
    sender_company: 'Anvayuone',
    sender_name: 'Anvayuone bot',
    sender_email: 'anyaforgerrrr345@gmail.com',
    sender_phone: '+91 40 4859 2100',
    sender_address: 'Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081',
    sender_gstin: '36AAACN1234F1Z5',
    sender_pan: 'AAACN1234F',
    bank_name: 'HDFC Bank Ltd.',
    bank_account: '50200012345678',
    bank_ifsc: 'HDFC0001234',
    bank_branch: 'Madhapur Branch, Hyderabad',
    accent_color: '#2563eb',
    created_date: new Date().toLocaleDateString('en-GB'),
    valid_until: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB'),
    currency: 'INR',
    currency_symbol: '₹',
    project_overview: 'End-to-end custom e-commerce web platform engineered for ABC Solutions Pvt. Ltd., incorporating secure customer registration, dynamic product catalog, shopping cart, Indian payment gateway integration (Razorpay / UPI), admin dashboard, and real-time order tracking within 60 days.',
    scope_of_work: 'Complete development across 6 core modules: customer auth, catalog with search, cart/checkout, payment integration, admin console, and order dispatch tracking.',
    deliverables: [
      { title: 'Customer Registration & Auth', description: 'OTP and email based secure registration and customer profile management' },
      { title: 'Dynamic Product Catalogue', description: 'Rich product listing with categories, filters, variants, and search indexing' },
      { title: 'Cart & Checkout Engine', description: 'Optimized shopping cart with coupon support and multi-step checkout' },
      { title: 'Payment Gateway Integration', description: 'Razorpay & Paytm integration supporting UPI, Credit/Debit cards, and Netbanking' },
      { title: 'Admin Dashboard', description: 'Comprehensive order fulfillment, stock management, and sales reporting' },
      { title: 'Order Tracking & Alerts', description: 'Real-time dispatch tracking with automated customer notification status' }
    ],
    timeline_milestones: [
      { phase: 'Phase 1', title: 'Discovery & UI/UX Wireframing', duration: 'Days 1-15', deliverables: 'Figma wireframes, DB schema and technical sign-off' },
      { phase: 'Phase 2', title: 'Storefront & Customer Catalog', duration: 'Days 16-35', deliverables: 'Product catalog, search filters, cart & customer login' },
      { phase: 'Phase 3', title: 'Payment & Admin Dashboard', duration: 'Days 36-50', deliverables: 'Razorpay integration, order tracking & admin console' },
      { phase: 'Phase 4', title: 'QA Testing & Production Launch', duration: 'Days 51-60', deliverables: 'End-to-end testing, SSL configuration & live deployment' }
    ],
    line_items: [
      { id: 'item-1', name: 'Website development', description: 'Custom responsive e-commerce web platform', unit_type: 'fixed', quantity: 1.0, unit_price: 50000.0, total: 50000.0, matched_service_id: 'WEB-DEV', is_custom: false },
      { id: 'item-2', name: 'Admin dashboard', description: 'Backend administrative dashboard for order tracking', unit_type: 'fixed', quantity: 1.0, unit_price: 15000.0, total: 15000.0, matched_service_id: 'ADMIN-DASH', is_custom: false },
      { id: 'item-3', name: 'Payment integration', description: 'Razorpay / Paytm / UPI gateway integration', unit_type: 'fixed', quantity: 1.0, unit_price: 8000.0, total: 8000.0, matched_service_id: 'PAY-INT', is_custom: false },
      { id: 'item-4', name: 'Testing and deployment', description: 'QA testing, SSL setup, and cloud deployment', unit_type: 'fixed', quantity: 1.0, unit_price: 7000.0, total: 7000.0, matched_service_id: 'QA-DEPLOY', is_custom: false }
    ],
    subtotal: 80000.0,
    discount_percent: 0.0,
    discount_amount: 0.0,
    gst_rate: 18.0,
    is_interstate: false,
    cgst_amount: 7200.0,
    sgst_amount: 7200.0,
    igst_amount: 0.0,
    tax_amount: 14400.0,
    total_amount: 94400.0,
    payment_terms: '50% Advance with Purchase Order (₹47,200), 30% upon UAT deployment (₹28,320), 20% upon final sign-off (₹18,880).',
    terms_and_conditions: '1. Proposal valid for 30 calendar days from issuance.\n2. Scope adjustments handled via written Change Request.\n3. Source code ownership transferred to client upon 100% final settlement.\n4. Dispute jurisdiction subject to Hyderabad courts only.'
  });

  const [activeSection, setActiveSection] = useState('pricing'); // Default to pricing as requested!
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
      const saved = await api.updateProposal(proposal.id, proposal);
      setProposal(saved);
      setCurrentProposal(saved);
      showToast('Proposal changes saved successfully!');
      loadProposals();
    } catch (e) {
      showToast(e.message || 'Failed to save proposal', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Proposal Version Tracking: creates v2, preserving v1
  const handleCreateRevision = async () => {
    if (!window.confirm(`Create a new revision (v${(proposal.version || 1) + 1}) for this proposal? The current version will remain preserved in history.`)) return;
    try {
      showToast('Branching proposal version...', 'info');
      const revised = await api.reviseProposal(proposal.id);
      setProposal(revised);
      setCurrentProposal(revised);
      showToast(`Revision ${revised.id} (v${revised.version}) created!`);
      loadProposals();
    } catch (e) {
      showToast(e.message || 'Failed to create revision', 'error');
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    showToast('Rendering high-definition vector PDF with Playwright in INR...', 'info');
    try {
      await api.updateProposal(proposal.id, proposal);
      const res = await api.generatePDF(proposal.id, proposal.template_id);
      
      const link = document.createElement('a');
      link.href = `/api/proposals/${proposal.id}/download-pdf`;
      link.download = `${proposal.id}_Proposal.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('PDF downloaded successfully!');
    } catch (e) {
      console.warn('PDF download fallback to browser print', e);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: 'pricing', label: '1. Pricing & GST (₹)', icon: IndianRupee, badge: proposal.line_items?.length },
    { id: 'general', label: '2. Client & GSTIN Details', icon: Building },
    { id: 'overview', label: '3. Scope & Objectives', icon: FileText },
    { id: 'deliverables', label: '4. Module Deliverables', icon: ListChecks },
    { id: 'timeline', label: '5. 60-Day Timeline', icon: Calendar },
    { id: 'terms', label: '6. Indian Commercial Terms', icon: ShieldCheck },
  ];

  const templates = [
    { id: 'modern', label: 'Modern Tech' },
    { id: 'corporate', label: 'Corporate Elegance' },
    { id: 'minimal', label: 'Minimal Swiss' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Application Bar */}
      <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('inbox')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sales Inbox</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {proposal.id || 'PR-2025-001'} (v{proposal.version || 1})
            </span>
            <input
              type="text"
              value={proposal.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="font-bold text-sm text-slate-900 hover:bg-slate-50 focus:bg-white px-2 py-1 rounded outline-none border border-transparent focus:border-blue-500 w-80 truncate"
              placeholder="Proposal Title"
            />
          </div>

          {/* Status selector */}
          <select
            value={proposal.status || 'generated'}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 outline-none cursor-pointer"
          >
            <option value="draft">Draft</option>
            <option value="generated">Proposal Ready</option>
            <option value="sent">Sent via Gmail</option>
            <option value="accepted">Accepted / Won</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* Actions Bar */}
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

          {/* Create Revision (Version Tracking) */}
          <button
            onClick={handleCreateRevision}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
            title="Create new proposal revision while preserving v1"
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-600" />
            <span>Revise (v{(proposal.version || 1) + 1})</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveProposal}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
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

          {/* Screen 4: Send via Gmail API */}
          <button
            onClick={() => setSendModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-100"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Client via Gmail</span>
          </button>
        </div>
      </div>

      {/* Editor Split 50/50 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Half: Section Builder (6 cols) */}
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
            {activeSection === 'pricing' && (
              <SectionPricing proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'general' && (
              <SectionGeneral proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'overview' && (
              <SectionOverview proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'deliverables' && (
              <SectionDeliverables proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'timeline' && (
              <SectionTimeline proposal={proposal} onChange={handleFieldChange} />
            )}
            {activeSection === 'terms' && (
              <SectionTerms proposal={proposal} onChange={handleFieldChange} />
            )}
          </div>
        </div>

        {/* Right Half: Live Document Sheet Preview in INR (6 cols) */}
        <div className="lg:col-span-6 h-full p-4 overflow-hidden">
          <LiveDocumentPreview
            proposal={proposal}
            onPrint={handlePrint}
            onDownload={handleDownloadPDF}
          />
        </div>
      </div>

      {/* Screen 4: Send Proposal Modal via Gmail API */}
      <SendProposalModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        proposal={proposal}
        onSent={(res) => {
          handleFieldChange('status', 'sent');
          loadProposals();
          loadEmails();
        }}
      />
    </div>
  );
}
