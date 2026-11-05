import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Sparkles, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  Plus, 
  RefreshCw,
  Send,
  ShieldCheck,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function SalesInbox() {
  const { 
    emails, 
    setEmails, 
    selectedEmail, 
    setSelectedEmail, 
    openEditorWithProposal, 
    showToast, 
    loadEmails,
    loadProposals 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  
  // Local editable state for Screen 2 AI Analysis review
  const [editableAnalysis, setEditableAnalysis] = useState(null);

  useEffect(() => {
    if (selectedEmail && selectedEmail.analysis_json) {
      setEditableAnalysis(selectedEmail.analysis_json);
    } else {
      setEditableAnalysis(null);
    }
  }, [selectedEmail]);

  const handleSelectEmail = (emailItem) => {
    setSelectedEmail(emailItem);
    if (emailItem.analysis_json) {
      setEditableAnalysis(emailItem.analysis_json);
    } else {
      setEditableAnalysis(null);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!selectedEmail) return;
    setIsAnalyzing(true);
    showToast('Gemini AI analyzing customer requirements...', 'info');
    try {
      const res = await api.analyzeEmail(selectedEmail.id);
      setEditableAnalysis(res.analysis);
      showToast('AI requirement analysis completed!');
      loadEmails();
    } catch (err) {
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!selectedEmail) return;
    try {
      await api.updatePriority(selectedEmail.id, newPriority);
      setSelectedEmail({ ...selectedEmail, lead_priority: newPriority });
      if (editableAnalysis) {
        setEditableAnalysis({ ...editableAnalysis, lead_priority: newPriority });
      }
      showToast(`Priority updated to ${newPriority}`);
      loadEmails();
    } catch (err) {
      showToast('Failed to update priority', 'error');
    }
  };

  // Screen 3 Transition: Pricing and Proposal Creation
  const handleProceedToPricing = async () => {
    if (!selectedEmail) return;

    let analysis = editableAnalysis;
    // If not yet analyzed, run analysis first
    if (!analysis) {
      setIsAnalyzing(true);
      showToast('Analyzing email requirements before generating quote...', 'info');
      try {
        const res = await api.analyzeEmail(selectedEmail.id);
        analysis = res.analysis;
        setEditableAnalysis(analysis);
      } catch (err) {
        showToast('Could not analyze requirements', 'error');
        setIsAnalyzing(false);
        return;
      }
      setIsAnalyzing(false);
    }

    try {
      showToast('Matching requirements with Indian pricing catalogue...', 'info');

      const reqItems = (analysis.quantities || []).map((q) => ({
        requirement_name: q.name,
        description: q.description || '',
        quantity: q.quantity || 1.0,
        unit: q.unit || 'unit'
      }));

      const matchRes = await api.matchPricing(reqItems, analysis.budget, 18.0, false);

      const now = new Date();
      const validDate = new Date();
      validDate.setDate(now.getDate() + 30);

      const proposalPayload = {
        email_id: selectedEmail.id,
        template_id: 'modern',
        title: analysis.project_name || 'E-commerce Website Development Proposal',
        client_name: analysis.client_name || 'Rahul Sharma',
        client_company: analysis.client_company || 'ABC Solutions Pvt. Ltd.',
        client_email: selectedEmail.sender_email,
        client_phone: analysis.contact?.phone || '+91 98765 43210',
        client_address: 'Hitec City, Hyderabad, Telangana',
        client_gstin: '36AABCA1234E1Z1',
        sender_company: 'Nexura Technologies Pvt. Ltd.',
        sender_name: 'Anya Sharma',
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
        created_date: now.toLocaleDateString('en-GB'), // DD/MM/YYYY
        valid_until: validDate.toLocaleDateString('en-GB'),
        currency: 'INR',
        currency_symbol: '₹',
        project_overview: analysis.project_description || '',
        scope_of_work: `Complete development and delivery within ${analysis.expected_timeline || '60 days'} covering all 6 functional modules with Razorpay payment gateway integration, admin controls, and order dispatch alerts.`,
        deliverables: (analysis.features_and_scope || []).map((feat, idx) => ({
          title: `Module ${idx + 1}`,
          description: feat
        })),
        timeline_milestones: [
          { phase: 'Phase 1', title: 'Architecture & UI/UX Wireframes', duration: 'Days 1-15', deliverables: 'Figma wireframes, DB schema and technical sign-off' },
          { phase: 'Phase 2', title: 'Storefront & Customer Catalog', duration: 'Days 16-35', deliverables: 'Product catalog, search filters, cart & customer login' },
          { phase: 'Phase 3', title: 'Payment Gateway & Admin Console', duration: 'Days 36-50', deliverables: 'Razorpay UPI/Cards integration and order dashboard' },
          { phase: 'Phase 4', title: 'QA Testing & Production Launch', duration: 'Days 51-60', deliverables: 'Security review, SSL configuration, and cloud live rollout' }
        ],
        line_items: matchRes.items.map((it) => ({
          id: it.id,
          name: it.name,
          description: it.description,
          unit_type: it.unit_type,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total: it.total,
          matched_service_id: it.matched_service_id,
          is_custom: it.is_custom
        })),
        subtotal: matchRes.subtotal,
        discount_percent: 0.0,
        discount_amount: 0.0,
        gst_rate: 18.0,
        is_interstate: false,
        cgst_amount: matchRes.cgst_amount,
        sgst_amount: matchRes.sgst_amount,
        igst_amount: matchRes.igst_amount,
        tax_amount: matchRes.tax_amount,
        total_amount: matchRes.total_amount,
        payment_terms: '50% Advance with Purchase Order, 30% upon UAT deployment, 20% upon final sign-off. Taxes applicable as per GST norms.',
        terms_and_conditions: '1. Proposal valid for 30 calendar days from issuance.\n2. Scope adjustments handled via written Change Request.\n3. Source code ownership transferred to client upon 100% final settlement.\n4. Dispute jurisdiction subject to Hyderabad courts only.'
      };

      const createdProp = await api.createProposal(proposalPayload);
      showToast(`Proposal #${createdProp.id} created! Total: ₹${createdProp.total_amount.toLocaleString()} INR`);
      loadEmails();
      loadProposals();
      openEditorWithProposal(createdProp);
    } catch (err) {
      showToast(err.message || 'Failed to initialize proposal', 'error');
    }
  };

  // Quick Ingest Simulator with exact Rahul Sharma preset
  const handleQuickIngestRahulSharma = async () => {
    try {
      showToast('Simulating incoming email from Rahul Sharma (ABC Solutions)...', 'info');
      const res = await api.ingestEmail({
        sender_name: 'Rahul Sharma',
        sender_email: 'rahul@abcsolutions.in',
        recipient_email: 'anyaforgerrrr345@gmail.com',
        subject: 'Requirement for E-commerce Website Development',
        body_text: `Hello Sales Team,\n\nWe are looking for a company to develop an e-commerce website for our business.\n\nOur requirements include:\nCustomer registration and login\nProduct catalogue\nShopping cart and checkout\nPayment gateway integration\nAdmin dashboard\nOrder tracking\n\nWe expect the project to be completed within 60 days.\n\nPlease share your estimated pricing and a detailed business proposal.\n\nRegards,\nRahul Sharma\nABC Solutions Pvt. Ltd.`
      });
      showToast(res.message || 'Inbound email received!');
      await loadEmails();
      setSelectedEmail(res.email);
    } catch (e) {
      showToast(e.message || 'Ingestion failed', 'error');
    }
  };

  const filteredEmails = emails.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.lead_priority === priorityFilter;
    const matchesSearch =
      !search ||
      item.sender_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sender_email?.toLowerCase().includes(search.toLowerCase()) ||
      item.subject?.toLowerCase().includes(search.toLowerCase()) ||
      item.body_text?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'High':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">New</span>;
      case 'analyzing':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">Analyzing</span>;
      case 'analyzed':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Analyzed</span>;
      case 'proposal_ready':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Proposal Ready</span>;
      case 'sent':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Sent via Gmail</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">Inbox</span>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* ========================================================
          PANEL 1 (MIDDLE): INCOMING CUSTOMER EMAILS LIST
      ======================================================== */}
      <div className="w-96 lg:w-[420px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Inbox Header */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Customer Sales Inbox</span>
              </h2>
              <div className="text-[11px] text-slate-500 font-mono">
                anyaforgerrrr345@gmail.com
              </div>
            </div>

            <button
              onClick={handleQuickIngestRahulSharma}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              title="Simulate Rahul Sharma's incoming email enquiry"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Email</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, subject, keyword..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-0.5">
            {['all', 'new', 'analyzed', 'proposal_ready', 'sent'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors shrink-0 capitalize ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Email Cards List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No customer inquiries found. Click "Simulate Email" to test.
            </div>
          ) : (
            filteredEmails.map((item) => {
              const isSelected = selectedEmail?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectEmail(item)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {item.sender_name || item.sender_email}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(item.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="font-semibold text-xs text-slate-800 truncate mb-1">
                    {item.subject}
                  </div>

                  <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2 font-sans">
                    {item.body_text}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(item.status)}
                      {getPriorityBadge(item.lead_priority)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.sender_email.includes('@') ? item.sender_email.split('@')[1] : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================
          PANEL 2 (RIGHT): SELECTED EMAIL DETAILS & SCREEN 2 AI ANALYSIS
      ======================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white p-6 space-y-6">
        {selectedEmail ? (
          <>
            {/* Top Bar: Customer Inquiry Header */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedEmail.subject}</h3>
                  {getStatusBadge(selectedEmail.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                  <span><strong>From:</strong> {selectedEmail.sender_name} &lt;{selectedEmail.sender_email}&gt;</span>
                  <span>&bull;</span>
                  <span><strong>To:</strong> {selectedEmail.recipient_email}</span>
                  <span>&bull;</span>
                  <span>{new Date(selectedEmail.received_at).toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              {/* Priority & Quick Actions */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Lead Priority:</span>
                <select
                  value={selectedEmail.lead_priority || 'High'}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                    selectedEmail.lead_priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                {!editableAnalysis && (
                  <button
                    onClick={handleRunAIAnalysis}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-60"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze Requirements'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Inbound Email Content Body */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Original Incoming Email Message (via Gmail API):
              </span>
              <div className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                {selectedEmail.body_text}
              </div>
            </div>

            {/* ========================================================
                SCREEN 2: STRUCTURED AI ANALYSIS TABLE
            ======================================================== */}
            {editableAnalysis ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      Screen 2: AI Requirement Extraction & Customer Details
                    </h4>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Gemini 1.5 Pro Extracted
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Review and correct fields before pricing</span>
                </div>

                {/* Structured Extraction Form/Table matching user prompt */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-40">Field</th>
                        <th className="p-3">Extracted Information (Editable)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      <tr>
                        <td className="p-3 font-bold text-slate-700">Client Organization</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editableAnalysis.client_company || 'ABC Solutions Pvt. Ltd.'}
                            onChange={(e) => setEditableAnalysis({ ...editableAnalysis, client_company: e.target.value })}
                            className="w-full font-semibold text-slate-900 outline-none bg-transparent border-b border-transparent focus:border-blue-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-700">Contact Person</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editableAnalysis.client_name || editableAnalysis.contact?.name || 'Rahul Sharma'}
                            onChange={(e) => setEditableAnalysis({ ...editableAnalysis, client_name: e.target.value })}
                            className="w-full font-semibold text-slate-900 outline-none bg-transparent border-b border-transparent focus:border-blue-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-700">Project Name</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editableAnalysis.project_name || 'E-commerce Website Development'}
                            onChange={(e) => setEditableAnalysis({ ...editableAnalysis, project_name: e.target.value })}
                            className="w-full font-semibold text-slate-900 outline-none bg-transparent border-b border-transparent focus:border-blue-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-700">Expected Timeline</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editableAnalysis.expected_timeline || '60 days'}
                            onChange={(e) => setEditableAnalysis({ ...editableAnalysis, expected_timeline: e.target.value })}
                            className="w-full font-semibold text-slate-900 outline-none bg-transparent border-b border-transparent focus:border-blue-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-700">Client Budget</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editableAnalysis.budget || 'Not specified'}
                            onChange={(e) => setEditableAnalysis({ ...editableAnalysis, budget: e.target.value })}
                            className="w-full font-semibold text-slate-900 outline-none bg-transparent border-b border-transparent focus:border-blue-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-700">
                          Identified Scope ({editableAnalysis.features_and_scope?.length || 6} features)
                        </td>
                        <td className="p-3 space-y-1.5">
                          {(editableAnalysis.features_and_scope || []).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                                ✓
                              </span>
                              <span className="text-slate-800 font-medium">{feat}</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Missing Information</span>
                        </td>
                        <td className="p-3">
                          <ul className="space-y-1 text-amber-900">
                            {(editableAnalysis.missing_information || [
                              'Hosting infrastructure preference (AWS vs Cloud VPS)',
                              'Expected product SKU volume'
                            ]).map((m, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-amber-500">&bull;</span>
                                <span>{m}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bottom Call-To-Action: Proceed to Screen 3 */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-lg shadow-blue-500/20">
                  <div>
                    <h5 className="font-bold text-sm">Next Step: Screen 3 (Pricing & Proposal Creation)</h5>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Match 4 required modules with the Indian IT catalogue in ₹ INR + 18% GST (CGST 9% + SGST 9%)
                    </p>
                  </div>

                  <button
                    onClick={handleProceedToPricing}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs shadow-md transition-all hover:scale-105 active:scale-100"
                  >
                    <span>Configure Pricing & Generate Proposal (₹)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Prompt to trigger AI Analysis */
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Sparkles className="w-8 h-8 text-blue-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">Ready to Extract Customer Requirements</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click below to trigger Gemini AI to extract client contact details, project features, timeline, and detect missing information.
                </p>
                <button
                  onClick={handleRunAIAnalysis}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAnalyzing ? 'Extracting with Gemini...' : 'Run AI Requirement Extraction'}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center text-slate-400 text-sm">
            Select an email enquiry from the list on the left to read and extract requirements.
          </div>
        )}
      </div>
    </div>
  );
}
