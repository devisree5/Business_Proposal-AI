import React from 'react';
import { ShieldCheck, FileCheck, Check } from 'lucide-react';

export default function SectionTerms({ proposal, onChange }) {
  const paymentPresets = [
    '30% Upon Kickoff, 40% Mid-Project Milestone, 30% Final Delivery & Acceptance',
    '50% Deposit Upon Contract Signing, 50% Upon Project Completion & Sign-off',
    'Monthly Milestone Invoicing (Net 15 Days)',
    '100% Upfront Annual Prepayment (5% Discount Included)'
  ];

  return (
    <div className="space-y-6">
      {/* Payment Schedule */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Payment Schedule & Commercial Terms</span>
        </h4>

        {/* Quick Presets */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Payment Term Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {paymentPresets.map((term, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange('payment_terms', term)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-slate-200 transition-colors text-left"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Schedule Text</label>
          <textarea
            rows={3}
            value={proposal.payment_terms || ''}
            onChange={(e) => onChange('payment_terms', e.target.value)}
            className="w-full p-3 text-xs text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-600" />
          <span>Terms, Validity & Standard Conditions</span>
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Conditions</label>
          <textarea
            rows={4}
            value={proposal.terms_and_conditions || ''}
            onChange={(e) => onChange('terms_and_conditions', e.target.value)}
            className="w-full p-3 text-xs text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
