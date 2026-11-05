import React, { useState, useEffect } from 'react';
import { Settings, Key, Mail, Building, CheckCircle2, Shield, Save, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function SettingsView() {
  const { showToast } = useApp();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [geminiKey, setGeminiKey] = useState('');
  const [companyName, setCompanyName] = useState('ProposalGen Solutions Inc.');
  const [companyEmail, setCompanyEmail] = useState('sales@proposalgen.ai');
  const [companyPhone, setCompanyPhone] = useState('+1 (800) 555-0199');
  const [companyWebsite, setCompanyWebsite] = useState('https://proposalgen.ai');
  const [companyAddress, setCompanyAddress] = useState('100 Innovation Way, Suite 400, San Francisco, CA 94107');

  useEffect(() => {
    api.getSettings()
      .then((data) => {
        setSettings(data);
        if (data.company_profile) {
          setCompanyName(data.company_profile.name || '');
          setCompanyEmail(data.company_profile.email || '');
          setCompanyPhone(data.company_profile.phone || '');
          setCompanyWebsite(data.company_profile.website || '');
          setCompanyAddress(data.company_profile.address || '');
        }
      })
      .catch((e) => console.warn('Could not load settings', e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        gemini_api_key: geminiKey || undefined,
        company_name: companyName,
        company_email: companyEmail,
        company_phone: companyPhone,
        company_address: companyAddress,
        company_website: companyWebsite
      });
      showToast('Settings updated successfully!');
      // reload settings
      const updated = await api.getSettings();
      setSettings(updated);
      setGeminiKey('');
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System & Integration Settings</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Configure Gemini AI, Email APIs (Gmail & IMAP), and default corporate branding defaults
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini AI Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Google Gemini AI Engine</h3>
                <p className="text-xs text-slate-500">Powering automated customer requirement extraction and text polishing</p>
              </div>
            </div>

            {settings?.gemini?.is_configured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected ({settings.gemini.model})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Offline Rule-Based Mode Active
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder={settings?.gemini?.masked_key ? `Current: ${settings.gemini.masked_key}` : 'Enter your Google Gemini API Key...'}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              Get an API key from Google AI Studio. If left empty, ProposalGen AI automatically operates using our high-intelligence built-in fallback parser.
            </p>
          </div>
        </div>

        {/* Email Integration Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Inbound & Outbound Email Protocols</h3>
              <p className="text-xs text-slate-500">Gmail API, IMAP Mailbox Polling, and SMTP proposal delivery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-bold text-slate-800">Gmail OAuth 2.0</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Direct Gmail API Ingestion</div>
              <span className="inline-block mt-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Ready for OAuth Client
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-bold text-slate-800">IMAP Protocol</div>
              <div className="text-[11px] text-slate-500 mt-0.5">SSL Port 993 Mailbox Sync</div>
              <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Ingest Engine
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs font-bold text-slate-800">SMTP Outbound</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Automated Client Delivery</div>
              <span className="inline-block mt-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Simulated / Live SMTP
              </span>
            </div>
          </div>
        </div>

        {/* Company Default Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Corporate Branding Defaults</h3>
              <p className="text-xs text-slate-500">Default company information pre-filled on every generated proposal</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Email</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Phone</label>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
