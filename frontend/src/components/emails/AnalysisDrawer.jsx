import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  ListChecks, 
  ArrowRight,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AnalysisDrawer({ isOpen, onClose, email, analysis, onContinue }) {
  const { createProposalFromAnalysis, showToast } = useApp();
  
  // Local editable state for review before proposal generation
  const [editableAnalysis, setEditableAnalysis] = useState(analysis);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  if (!isOpen || !analysis) return null;

  const handleRequirementChange = (idx, field, value) => {
    const updated = { ...editableAnalysis };
    updated.quantities[idx][field] = value;
    setEditableAnalysis(updated);
  };

  const handleProceed = () => {
    onContinue(editableAnalysis, email?.id, selectedTemplate);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">AI Requirements Extraction</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
                  {Math.round((editableAnalysis.confidence_score || 0.95) * 100)}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-500">Extracted from email: "{email?.subject || 'Service Inquiry'}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Client & Project Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Client Organization</span>
              </div>
              <input
                type="text"
                value={editableAnalysis.client_company}
                onChange={(e) => setEditableAnalysis({ ...editableAnalysis, client_company: e.target.value })}
                className="font-bold text-slate-900 text-sm w-full border-b border-dashed border-slate-300 focus:border-blue-500 outline-none pb-0.5"
              />
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <input
                  type="text"
                  value={editableAnalysis.client_name || editableAnalysis.contact?.name || ''}
                  onChange={(e) => setEditableAnalysis({ ...editableAnalysis, client_name: e.target.value })}
                  placeholder="Contact Name"
                  className="w-full border-b border-dashed border-slate-200 focus:border-blue-500 outline-none text-xs"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Timeline & Budget</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className="text-xs text-slate-400">Timeline:</span>
                <input
                  type="text"
                  value={editableAnalysis.expected_timeline || '4 - 6 Weeks'}
                  onChange={(e) => setEditableAnalysis({ ...editableAnalysis, expected_timeline: e.target.value })}
                  className="w-full border-b border-dashed border-slate-200 focus:border-blue-500 outline-none text-xs font-semibold"
                />
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mt-2">
                <span className="text-xs text-slate-400">Budget:</span>
                <input
                  type="text"
                  value={editableAnalysis.budget || 'Not specified (flexible)'}
                  onChange={(e) => setEditableAnalysis({ ...editableAnalysis, budget: e.target.value })}
                  className="w-full border-b border-dashed border-slate-200 focus:border-blue-500 outline-none text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Project Title & Description */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Project / Proposal Title
            </label>
            <input
              type="text"
              value={editableAnalysis.project_name}
              onChange={(e) => setEditableAnalysis({ ...editableAnalysis, project_name: e.target.value })}
              className="w-full font-bold text-slate-900 text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1"
            />
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block pt-2">
              Executive Project Overview
            </label>
            <textarea
              rows={3}
              value={editableAnalysis.project_description}
              onChange={(e) => setEditableAnalysis({ ...editableAnalysis, project_description: e.target.value })}
              className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 outline-none leading-relaxed"
            />
          </div>

          {/* Extracted Requirements & Quantities for Pricing Matching */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <ListChecks className="w-4 h-4 text-blue-600" />
                <span>Extracted Services & Quantities ({editableAnalysis.quantities?.length || 0})</span>
              </div>
              <span className="text-[11px] text-slate-500">Will match with pricing catalogue</span>
            </div>

            <div className="space-y-2.5">
              {(editableAnalysis.quantities || []).map((req, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={req.name}
                      onChange={(e) => handleRequirementChange(idx, 'name', e.target.value)}
                      className="font-semibold text-xs text-slate-900 bg-transparent w-full outline-none"
                    />
                    <input
                      type="text"
                      value={req.description || ''}
                      onChange={(e) => handleRequirementChange(idx, 'description', e.target.value)}
                      placeholder="Service details / specs..."
                      className="text-[11px] text-slate-500 bg-transparent w-full outline-none mt-0.5"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      value={req.quantity || 1}
                      onChange={(e) => handleRequirementChange(idx, 'quantity', parseFloat(e.target.value) || 1)}
                      className="w-16 px-2 py-1 text-xs font-bold text-center border border-slate-200 rounded bg-white outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing or Unclear Information (CRITICAL REQUIREMENT) */}
          {editableAnalysis.missing_information && editableAnalysis.missing_information.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Missing / Unclear Information Identified by AI</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-900">
                {editableAnalysis.missing_information.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-amber-700/80 italic">
                * These items can be clarified during the proposal presentation or handled in the Terms & Conditions section.
              </p>
            </div>
          )}

          {/* Select Proposal Template */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Choose PDF Proposal Template
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'modern', name: 'Modern Business', desc: 'Clean & Tech' },
                { id: 'corporate', name: 'Corporate Elegance', desc: 'Executive & Formal' },
                { id: 'minimal', name: 'Minimal Style', desc: 'Swiss & Elegant' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplate === t.id
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{t.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleProceed}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Match Pricing & Open Editor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
