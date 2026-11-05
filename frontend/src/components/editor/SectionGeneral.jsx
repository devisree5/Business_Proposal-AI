import React from 'react';
import { Building, User, Calendar, Palette, Mail, Phone, MapPin } from 'lucide-react';

export default function SectionGeneral({ proposal, onChange }) {
  const colors = [
    { label: 'Royal Blue', hex: '#2563eb' },
    { label: 'Navy Slate', hex: '#0f172a' },
    { label: 'Emerald Tech', hex: '#059669' },
    { label: 'Purple Indigo', hex: '#6366f1' },
    { label: 'Amber Executive', hex: '#d97706' },
    { label: 'Nordic Charcoal', hex: '#18181b' },
  ];

  return (
    <div className="space-y-6">
      {/* Proposal Title & Currency */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          <span>Proposal Identification & Branding</span>
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proposal Title</label>
            <input
              type="text"
              value={proposal.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="e.g. Enterprise Cloud Infrastructure & Software Provisioning"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="text"
                value={proposal.created_date || ''}
                onChange={(e) => onChange('created_date', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="e.g. November 05, 2026"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valid Until</label>
              <input
                type="text"
                value={proposal.valid_until || ''}
                onChange={(e) => onChange('valid_until', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="e.g. December 05, 2026"
              />
            </div>
          </div>

          {/* Accent Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>Document Accent Color</span>
            </label>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => onChange('accent_color', c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    proposal.accent_color === c.hex ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
              <input
                type="color"
                value={proposal.accent_color || '#2563eb'}
                onChange={(e) => onChange('accent_color', e.target.value)}
                className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                title="Custom hex color"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Client Details */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>Client Details (Recipient)</span>
        </h4>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization *</label>
              <input
                type="text"
                value={proposal.client_company || ''}
                onChange={(e) => onChange('client_company', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="e.g. Acme Corporation"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name</label>
              <input
                type="text"
                value={proposal.client_name || ''}
                onChange={(e) => onChange('client_name', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="e.g. Marcus Vance"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={proposal.client_email || ''}
                onChange={(e) => onChange('client_email', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="e.g. marcus@acmecorp.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={proposal.client_phone || ''}
                onChange={(e) => onChange('client_phone', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="e.g. +1 (415) 882-9011"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Client Address</label>
            <input
              type="text"
              value={proposal.client_address || ''}
              onChange={(e) => onChange('client_address', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              placeholder="e.g. 500 Market Street, San Francisco, CA"
            />
          </div>
        </div>
      </div>

      {/* Service Provider Details */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Building className="w-4 h-4 text-purple-600" />
          <span>Service Provider (Your Organization)</span>
        </h4>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Company Name</label>
              <input
                type="text"
                value={proposal.sender_company || ''}
                onChange={(e) => onChange('sender_company', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Representative</label>
              <input
                type="text"
                value={proposal.sender_name || ''}
                onChange={(e) => onChange('sender_name', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Email</label>
              <input
                type="email"
                value={proposal.sender_email || ''}
                onChange={(e) => onChange('sender_email', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Phone</label>
              <input
                type="text"
                value={proposal.sender_phone || ''}
                onChange={(e) => onChange('sender_phone', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
