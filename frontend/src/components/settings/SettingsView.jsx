import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Mail, 
  Building, 
  CheckCircle2, 
  Save, 
  Receipt, 
  CreditCard, 
  Send, 
  ExternalLink, 
  Copy, 
  Bot, 
  RefreshCw, 
  AlertCircle,
  ShieldCheck,
  Play
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function SettingsView() {
  const { showToast, loadEmails } = useApp();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [geminiKey, setGeminiKey] = useState('');
  const [gmailAppPassword, setGmailAppPassword] = useState('');
  const [companyName, setCompanyName] = useState('Anvayuone');
  const [botName, setBotName] = useState('Anvayuone bot');
  const [companyEmail, setCompanyEmail] = useState('anyaforgerrrr345@gmail.com');
  const [companyPhone, setCompanyPhone] = useState('+91 40 4859 2100');
  const [companyWebsite, setCompanyWebsite] = useState('https://anvayuone.com');
  const [companyAddress, setCompanyAddress] = useState('Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081');
  const [companyGstin, setCompanyGstin] = useState('36AAACN1234F1Z5');
  const [companyPan, setCompanyPan] = useState('AAACN1234F');
  const [companyBankAccount, setCompanyBankAccount] = useState('50200012345678');
  const [companyBankIfsc, setCompanyBankIfsc] = useState('HDFC0001234');

  // Test state
  const [testingGmail, setTestingGmail] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [personalEmail, setPersonalEmail] = useState('');
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [simulatingN8n, setSimulatingN8n] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    api.getSettings()
      .then((data) => {
        setSettings(data);
        if (data.company_profile) {
          setCompanyName(data.company_profile.name || 'Anvayuone');
          setBotName(data.company_profile.bot_name || 'Anvayuone bot');
          setCompanyEmail(data.company_profile.email || 'anyaforgerrrr345@gmail.com');
          setCompanyPhone(data.company_profile.phone || '+91 40 4859 2100');
          setCompanyWebsite(data.company_profile.website || 'https://anvayuone.com');
          setCompanyAddress(data.company_profile.address || '');
          if (data.company_profile.gstin) setCompanyGstin(data.company_profile.gstin);
          if (data.company_profile.pan) setCompanyPan(data.company_profile.pan);
          if (data.company_profile.bank_account) setCompanyBankAccount(data.company_profile.bank_account);
          if (data.company_profile.bank_ifsc) setCompanyBankIfsc(data.company_profile.bank_ifsc);
        }
      })
      .catch((e) => console.warn('Could not load settings', e))
      .finally(() => setLoading(false));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        gemini_api_key: geminiKey || undefined,
        gmail_app_password: gmailAppPassword || undefined,
        company_name: companyName,
        bot_name: botName,
        company_email: companyEmail,
        company_phone: companyPhone,
        company_address: companyAddress,
        company_website: companyWebsite,
        company_gstin: companyGstin,
        company_pan: companyPan,
        company_bank_account: companyBankAccount,
        company_bank_ifsc: companyBankIfsc
      });
      showToast('Settings & Gmail configuration updated successfully!');
      fetchSettings();
      setGeminiKey('');
      setGmailAppPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingGmail(true);
    setTestResult(null);
    try {
      const res = await api.testGmail(gmailAppPassword || undefined);
      setTestResult(res);
      if (res.success) {
        showToast('Gmail connection verified successfully!');
      } else {
        showToast('Gmail login failed. Check credentials.', 'error');
      }
    } catch (err) {
      setTestResult({ success: false, details: [err.message] });
      showToast(err.message || 'Gmail connection test failed', 'error');
    } finally {
      setTestingGmail(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!personalEmail) {
      showToast('Please enter your personal email address', 'error');
      return;
    }
    setSendingTestMail(true);
    try {
      const res = await api.sendTestEmail(personalEmail);
      if (res.success) {
        showToast(`Live email sent to ${personalEmail}! Check your inbox.`);
      } else {
        showToast(res.error || 'Failed to dispatch email', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to send test email', 'error');
    } finally {
      setSendingTestMail(false);
    }
  };

  const handleSimulateN8nTrigger = async () => {
    setSimulatingN8n(true);
    try {
      const res = await api.simulateN8nWebhook({
        from: 'Rahul Sharma <rahul@abcsolutions.in>',
        sender_email: 'rahul@abcsolutions.in',
        sender_name: 'Rahul Sharma',
        subject: 'Requirement for E-commerce Website Development',
        body: 'Hello Anvayuone Team, We need a complete e-commerce website with product catalog, cart, checkout, payment gateway, and admin dashboard completed within 60 days.',
        messageId: `n8n-live-${Date.now()}`
      });
      showToast(`n8n Webhook received & analyzed! Deal registered in Sales Inbox.`);
      loadEmails();
    } catch (err) {
      showToast(err.message || 'Failed to trigger webhook', 'error');
    } finally {
      setSimulatingN8n(false);
    }
  };

  const webhookUrl = `${window.location.origin.replace(/:\d+$/, ':8000')}/api/emails/webhook/gmail`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Anvayuone System & Gmail Settings</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">Live Email Mode</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Connect company sales inbox (<code className="text-blue-600 font-semibold">{companyEmail}</code>), configure n8n automation, and manage GST coordinates
          </p>
        </div>

        <button
          onClick={handleSimulateN8nTrigger}
          disabled={simulatingN8n}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
          title="Simulate n8n sending an incoming inquiry"
        >
          <Play className="w-3.5 h-3.5 fill-purple-700" />
          <span>{simulatingN8n ? 'Triggering...' : 'Test n8n Webhook'}</span>
        </button>
      </div>

      {/* ========================================================
          1. GMAIL INTEGRATION & LIVE OUTBOUND SENDING
      ======================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Company Gmail Connection</h3>
              <p className="text-xs text-slate-500">Dedicated sales inbox: <strong>{companyEmail}</strong></p>
            </div>
          </div>

          {settings?.gmail?.app_password_configured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Gmail Connected (App Password Active)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" /> App Password Not Configured
            </span>
          )}
        </div>

        {/* Google App Password Input */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Google 16-Character App Password
              </label>
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Generate Google App Password</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={gmailAppPassword}
                onChange={(e) => setGmailAppPassword(e.target.value)}
                placeholder={settings?.gmail?.masked_password ? `Current: ${settings.gmail.masked_password}` : 'e.g. abcd efgh ijkl mnop'}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingGmail}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingGmail ? 'animate-spin' : ''}`} />
                <span>{testingGmail ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>

          {/* Test results alert */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{testResult.success ? 'Gmail authentication succeeded!' : 'Connection issue detected:'}</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90 pl-1">
                {(testResult.details || []).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Send Live Test Email to Personal Inbox */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Send Live Test Email to Your Personal Inbox</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Type your personal Gmail address below to receive an actual test email dispatched from <strong>{companyEmail}</strong>:
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="your.personal@gmail.com"
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTestMail}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs shrink-0 flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-3 h-3" />
                <span>{sendingTestMail ? 'Delivering...' : 'Send Live Email'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. n8n AUTOMATION INTEGRATION (anvayuone.app.n8n.cloud)
      ======================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              n8n
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">n8n Email Workflow Trigger</h3>
              <p className="text-xs text-slate-500">Connected instance: <a href="https://anvayuone.app.n8n.cloud/assistant" target="_blank" rel="noreferrer" className="text-orange-600 font-semibold hover:underline">https://anvayuone.app.n8n.cloud/assistant</a></p>
            </div>
          </div>

          <a
            href="https://anvayuone.app.n8n.cloud/assistant"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
          >
            <span>Open n8n Assistant</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Webhook Endpoint Box */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            Application Inbound Webhook URL (Paste into n8n HTTP Request Node)
          </label>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
            <span className="flex-1 truncate">{webhookUrl}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white rounded border border-slate-200 shadow-xs flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Architecture Explanation */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-blue-950">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>How the real-world n8n email automation works:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11.5px] text-blue-800">
            <li><strong>Step 1</strong>: A prospective customer sends an inquiry from their personal Gmail to <strong>{companyEmail}</strong>.</li>
            <li><strong>Step 2</strong>: Your n8n workflow watches <strong>{companyEmail}</strong> via Gmail Trigger.</li>
            <li><strong>Step 3</strong>: n8n sends an HTTP POST request to this application's webhook with email subject and body.</li>
            <li><strong>Step 4</strong>: Our AI analyzes requirements, computes INR pricing with 18% GST, and drafts a proposal.</li>
            <li><strong>Step 5</strong>: The sales team reviews and clicks <strong>"Send Proposal via Gmail"</strong> to deliver the actual vector PDF back to the customer's personal email!</li>
          </ol>
        </div>
      </div>

      {/* ========================================================
          3. GOOGLE GEMINI AI CONFIGURATION
      ======================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Google Gemini AI Engine</h3>
              <p className="text-xs text-slate-500">Understands incoming customer requests and extracts structured requirements</p>
            </div>
          </div>

          {settings?.gemini?.is_configured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected ({settings.gemini.model})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Domain Parser Active
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
          <p className="text-[11px] text-slate-400 mt-1.5">
            Get an API key from Google AI Studio. If empty, the system operates using our built-in domain extraction heuristics.
          </p>
        </div>
      </div>

      {/* ========================================================
          4. COMPANY PROFILE & GST COORDINATES (Anvayuone)
      ======================================================== */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Company Profile & GSTIN Coordinates</h3>
            <p className="text-xs text-slate-500">Corporate details pre-filled on every generated business proposal</p>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>Bot / Sender Name</span>
              </label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Email</label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Phone</label>
              <input
                type="text"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address (Hyderabad)</label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          {/* GSTIN and PAN */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                <span>GSTIN Number (Telangana - 36)</span>
              </label>
              <input
                type="text"
                value={companyGstin}
                onChange={(e) => setCompanyGstin(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number</label>
              <input
                type="text"
                value={companyPan}
                onChange={(e) => setCompanyPan(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Bank Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>HDFC Bank Account Number</span>
              </label>
              <input
                type="text"
                value={companyBankAccount}
                onChange={(e) => setCompanyBankAccount(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code (Madhapur Branch)</label>
              <input
                type="text"
                value={companyBankIfsc}
                onChange={(e) => setCompanyBankIfsc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
