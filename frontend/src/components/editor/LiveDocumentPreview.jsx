import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Download, Printer } from 'lucide-react';

export default function LiveDocumentPreview({ proposal, onPrint, onDownload }) {
  const [zoom, setZoom] = useState(100);
  const printRef = useRef(null);

  const tpl = proposal.template_id || 'modern';
  const accent = proposal.accent_color || (tpl === 'corporate' ? '#0f172a' : tpl === 'minimal' ? '#18181b' : '#2563eb');
  const curr = proposal.currency === 'USD' ? '$' : '₹';

  const formatCurrency = (val) => {
    return (parseFloat(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isInterstate = Boolean(proposal.is_interstate);
  const cgst = proposal.cgst_amount ?? ((proposal.tax_amount || 0) / 2);
  const sgst = proposal.sgst_amount ?? ((proposal.tax_amount || 0) / 2);
  const igst = proposal.igst_amount ?? (proposal.tax_amount || 0);

  return (
    <div className="flex flex-col h-full bg-slate-200/70 rounded-2xl border border-slate-300/80 overflow-hidden shadow-inner">
      {/* Zoom & Document Toolbar */}
      <div className="h-11 bg-slate-100 border-b border-slate-300/70 px-4 flex items-center justify-between shrink-0 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">A4 Live Document Preview</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 font-semibold uppercase tracking-wider">
            {tpl} template
          </span>
          {proposal.version && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
              v{proposal.version}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setZoom(Math.max(60, zoom - 15))}
            className="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] w-9 text-center font-bold text-slate-700">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom(Math.min(140, zoom + 15))}
            className="w-7 h-7 rounded hover:bg-slate-200 flex items-center justify-center text-slate-600"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-[11px] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* A4 Document Viewport */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <div
          ref={printRef}
          id="proposal-print-area"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[18mm] rounded-sm select-text text-slate-800 transition-all font-sans relative"
        >
          {/* ========================================================
              TEMPLATE 1: MODERN BUSINESS (₹ INR & Indian GST)
          ======================================================== */}
          {tpl === 'modern' && (
            <div className="space-y-6 text-[12px] leading-relaxed">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b-2" style={{ borderColor: accent }}>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{proposal.sender_company}</h1>
                  <p className="text-[11px] text-slate-500 mt-0.5">{proposal.sender_address || 'Plot 42, Hitec City Phase 2, Madhapur, Hyderabad, Telangana 500081'}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: 36AAACN1234F1Z5 &bull; PAN: AAACN1234F</p>
                </div>
                <div className="text-right">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                  >
                    Business Proposal {proposal.version ? `(v${proposal.version})` : ''}
                  </span>
                  <div className="text-sm font-bold text-slate-900">{proposal.id || 'PR-2025-001'}</div>
                  <div className="text-[11px] text-slate-500">Date: {proposal.created_date}</div>
                  <div className="text-[11px] text-slate-500">Valid Until: {proposal.valid_until}</div>
                </div>
              </div>

              {/* Parties Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prepared For (Client)</span>
                  <div className="font-bold text-sm text-slate-900">{proposal.client_company}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Attn: {proposal.client_name || 'Client Lead'}</div>
                  <div className="text-[11px] text-slate-600">{proposal.client_email}</div>
                  {proposal.client_phone && <div className="text-[11px] text-slate-600">{proposal.client_phone}</div>}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prepared By (Provider)</span>
                  <div className="font-bold text-sm text-slate-900">{proposal.sender_name}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{proposal.sender_company}</div>
                  <div className="text-[11px] text-slate-600">{proposal.sender_email}</div>
                  <div className="text-[11px] text-slate-600">{proposal.sender_phone}</div>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  <span className="w-1 h-3.5 rounded-full" style={{ backgroundColor: accent }} />
                  <span>1. Executive Summary & Project Overview</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">{proposal.project_overview}</p>
              </div>

              {/* 2. Scope & Deliverables */}
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  <span className="w-1 h-3.5 rounded-full" style={{ backgroundColor: accent }} />
                  <span>2. Scope of Work & Deliverables</span>
                </div>
                {proposal.scope_of_work && (
                  <p className="text-slate-700 text-[11.5px] mb-2 leading-relaxed">{proposal.scope_of_work}</p>
                )}
                <div className="space-y-1.5">
                  {(proposal.deliverables || []).map((del, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-50 border border-slate-100 text-[11px]">
                      <span className="font-bold text-sm leading-none" style={{ color: accent }}>✓</span>
                      <div>
                        {typeof del === 'string' ? del : (
                          <><strong>{del.title || del.name}</strong>: {del.description || del.details}</>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Milestones */}
              {proposal.timeline_milestones && proposal.timeline_milestones.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    <span className="w-1 h-3.5 rounded-full" style={{ backgroundColor: accent }} />
                    <span>3. Delivery Schedule & Milestones</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {proposal.timeline_milestones.map((m, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-white" style={{ borderTop: `2px solid ${accent}` }}>
                        <div className="text-[10px] font-bold uppercase" style={{ color: accent }}>{m.phase || `Phase ${i+1}`}</div>
                        <div className="font-bold text-[11.5px] text-slate-900 my-0.5">{m.title}</div>
                        <div className="text-[10px] text-slate-500">⏱ {m.duration}</div>
                        <div className="text-[10px] text-slate-600 mt-1 pt-1 border-t border-dashed border-slate-200">{m.deliverables}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Pricing Table */}
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  <span className="w-1 h-3.5 rounded-full" style={{ backgroundColor: accent }} />
                  <span>4. Commercial Investment & Pricing Breakdown (₹ INR)</span>
                </div>
                <table className="w-full text-left text-[11px] border border-slate-200 rounded overflow-hidden">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Rate</th>
                      <th className="p-2 text-right">Amount ({curr})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(proposal.line_items || []).map((it, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                        <td className="p-2">
                          <div className="font-semibold text-slate-900">{it.name}</div>
                          {it.description && <div className="text-[10px] text-slate-500">{it.description}</div>}
                        </td>
                        <td className="p-2 text-center">{it.quantity} {it.unit_type}</td>
                        <td className="p-2 text-right">{curr}{formatCurrency(it.unit_price)}</td>
                        <td className="p-2 text-right font-semibold text-slate-900">{curr}{formatCurrency(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* GST Breakdown & Totals */}
                <div className="flex justify-between items-start mt-3 gap-4">
                  {/* Bank Coordinates */}
                  <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                    <div className="font-bold text-slate-800 uppercase tracking-wider text-[9px]">NEFT / RTGS Bank Details:</div>
                    <div>Bank: HDFC Bank Ltd. | Branch: Madhapur, Hyderabad</div>
                    <div>A/C Name: {proposal.sender_company || 'Anvayuone'}</div>
                    <div>Account No: <span className="font-mono font-bold text-slate-900">50200012345678</span> | IFSC: <span className="font-mono font-bold text-slate-900">HDFC0001234</span></div>
                  </div>

                  <div className="w-64 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{curr}{formatCurrency(proposal.subtotal)}</span>
                    </div>
                    {proposal.discount_percent > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Discount ({proposal.discount_percent}%):</span>
                        <span>-{curr}{formatCurrency((proposal.subtotal * proposal.discount_percent) / 100.0)}</span>
                      </div>
                    )}
                    {!isInterstate ? (
                      <>
                        <div className="flex justify-between text-slate-600 text-[10.5px]">
                          <span>CGST (9%):</span>
                          <span className="font-semibold">{curr}{formatCurrency(cgst)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-[10.5px]">
                          <span>SGST (9%):</span>
                          <span className="font-semibold">{curr}{formatCurrency(sgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-slate-600 text-[10.5px]">
                        <span>IGST (18%):</span>
                        <span className="font-semibold">{curr}{formatCurrency(igst)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t-2" style={{ borderColor: accent }}>
                      <span>Total Investment:</span>
                      <span style={{ color: accent }}>{curr}{formatCurrency(proposal.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Terms */}
              <div className="p-3 bg-slate-50 rounded-lg border-l-2 text-[10.5px] text-slate-600 space-y-1" style={{ borderColor: accent }}>
                <div><strong>Payment Terms:</strong> {proposal.payment_terms || '50% advance upon project sign-off, 30% upon UAT milestone, 20% on final handover.'}</div>
                <div><strong>Terms & Conditions:</strong> {proposal.terms_and_conditions || '18% GST applicable under Telangana jurisdiction. Standard 1-year bug-fix warranty included.'}</div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-[11px]">
                <div>
                  <div className="font-bold text-slate-900">Accepted by: {proposal.client_company}</div>
                  <div className="text-[10px] text-slate-500 mt-4 pt-1 border-t border-slate-300">Authorized Signature & Date</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Issued by: {proposal.sender_company}</div>
                  <div className="text-[10px] text-slate-500 mt-4 pt-1 border-t border-slate-300">{proposal.sender_name}, Solutions Lead</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TEMPLATE 2: CORPORATE ELEGANCE (₹ INR & Indian GST)
          ======================================================== */}
          {tpl === 'corporate' && (
            <div className="space-y-6 text-[12px] leading-relaxed">
              {/* Executive Dark Top Bar */}
              <div className="bg-slate-950 text-white p-5 rounded border-b-4 border-amber-500 flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-lg font-bold tracking-wide">{proposal.sender_company}</h1>
                  <p className="text-[10.5px] text-slate-400">Enterprise Software & Cloud Architecture &bull; Hyderabad, India</p>
                  <p className="text-[9.5px] text-amber-400 font-mono mt-0.5">GSTIN: 36AAACN1234F1Z5 &bull; PAN: AAACN1234F</p>
                </div>
                <div className="text-right text-[11px] text-slate-300">
                  <div className="font-bold text-amber-400 text-sm">{proposal.id} {proposal.version ? `(v${proposal.version})` : ''}</div>
                  <div>Issuance: {proposal.created_date}</div>
                  <div>Valid: {proposal.valid_until}</div>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-base font-bold text-slate-900">{proposal.title}</h2>
                <p className="text-xs text-slate-500">Formal Commercial Statement of Work (₹ INR)</p>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-300 p-3 bg-slate-50/50 border-t-2 border-t-slate-900">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Client Entity</span>
                  <div className="font-serif font-bold text-sm text-slate-950">{proposal.client_company}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Attn: {proposal.client_name || 'Commercial Officer'}</div>
                  <div className="text-[11px] text-slate-600">{proposal.client_email}</div>
                </div>
                <div className="border border-slate-300 p-3 bg-slate-50/50 border-t-2 border-t-slate-900">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Service Entity</span>
                  <div className="font-serif font-bold text-sm text-slate-950">{proposal.sender_company}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Account Exec: {proposal.sender_name}</div>
                  <div className="text-[11px] text-slate-600">{proposal.sender_email}</div>
                </div>
              </div>

              {/* Strategic Summary */}
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
                  I. Strategic Executive Summary
                </h3>
                <div className="border-l-4 border-slate-900 bg-slate-100/70 p-3 italic text-[11.5px] text-slate-800">
                  "{proposal.project_overview}"
                </div>
              </div>

              {/* Scope */}
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
                  II. Authorized Scope & Deliverables
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {(proposal.deliverables || []).map((d, i) => (
                    <div key={i} className="border border-slate-200 p-2 bg-white">
                      <div className="font-bold text-slate-900">
                        {typeof d === 'string' ? `Deliverable ${i+1}` : (d.title || `Deliverable ${i+1}`)}
                      </div>
                      <div className="text-slate-600 text-[10.5px]">
                        {typeof d === 'string' ? d : (d.description || d.details)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Table */}
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
                  III. Rate Schedule & Investment (₹ INR)
                </h3>
                <table className="w-full text-left text-[11px] border border-slate-800">
                  <thead className="bg-slate-900 text-white uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Service Description</th>
                      <th className="p-2 text-center">Units</th>
                      <th className="p-2 text-right">Rate</th>
                      <th className="p-2 text-right">Total ({curr})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(proposal.line_items || []).map((it, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : ''}>
                        <td className="p-2">
                          <strong className="text-slate-950">{it.name}</strong>
                          {it.description && <div className="text-[10px] text-slate-500">{it.description}</div>}
                        </td>
                        <td className="p-2 text-center">{it.quantity} {it.unit_type}</td>
                        <td className="p-2 text-right">{curr}{formatCurrency(it.unit_price)}</td>
                        <td className="p-2 text-right font-bold text-slate-950">{curr}{formatCurrency(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Corporate Totals & Bank details */}
                <div className="flex justify-between items-start mt-2 gap-4">
                  <div className="flex-1 border border-slate-300 p-2.5 bg-slate-50 text-[10px] text-slate-600 space-y-0.5">
                    <div className="font-bold text-slate-900 uppercase">HDFC Corporate Remittance:</div>
                    <div>Account No: <span className="font-mono font-bold text-slate-950">50200012345678</span></div>
                    <div>IFSC Code: <span className="font-mono font-bold text-slate-950">HDFC0001234</span> &bull; Madhapur, Hyd</div>
                  </div>

                  <div className="w-64 border border-slate-400 p-3 bg-slate-50 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Contract Subtotal:</span>
                      <span>{curr}{formatCurrency(proposal.subtotal)}</span>
                    </div>
                    {proposal.discount_percent > 0 && (
                      <div className="flex justify-between text-amber-700">
                        <span>Corporate Discount ({proposal.discount_percent}%):</span>
                        <span>-{curr}{formatCurrency((proposal.subtotal * proposal.discount_percent)/100.0)}</span>
                      </div>
                    )}
                    {!isInterstate ? (
                      <>
                        <div className="flex justify-between text-slate-600 text-[10.5px]">
                          <span>CGST (9%):</span>
                          <span>{curr}{formatCurrency(cgst)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-[10.5px]">
                          <span>SGST (9%):</span>
                          <span>{curr}{formatCurrency(sgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-slate-600 text-[10.5px]">
                        <span>IGST (18%):</span>
                        <span>{curr}{formatCurrency(igst)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold text-slate-950 pt-1 border-t border-slate-900">
                      <span>Total Value:</span>
                      <span>{curr}{formatCurrency(proposal.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-[11px]">
                <div>
                  <div className="border-b border-slate-800 h-6 mb-1" />
                  <div className="font-bold text-slate-900">For {proposal.client_company}</div>
                  <div className="text-[10px] text-slate-500">Authorized Officer & Date</div>
                </div>
                <div>
                  <div className="border-b border-slate-800 h-6 mb-1" />
                  <div className="font-bold text-slate-900">For {proposal.sender_company}</div>
                  <div className="text-[10px] text-slate-500">{proposal.sender_name}, Commercial Officer</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TEMPLATE 3: MINIMAL STYLE (₹ INR & Indian GST)
          ======================================================== */}
          {tpl === 'minimal' && (
            <div className="space-y-6 text-[12px] leading-relaxed">
              <div>
                <div className="text-xs font-semibold text-slate-900 mb-6 tracking-tight">
                  {proposal.sender_company} &bull; <span className="font-mono text-[10px] text-slate-500">GSTIN: 36AAACN1234F1Z5</span>
                </div>
                <div className="flex items-end justify-between border-b border-slate-900 pb-2">
                  <div className="text-lg font-medium tracking-tight text-slate-950">
                    {proposal.title} {proposal.version ? `(v${proposal.version})` : ''}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">{proposal.id} &bull; {proposal.created_date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-[11.5px]">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Client</div>
                  <div className="font-semibold text-slate-900">{proposal.client_company}</div>
                  <div className="text-slate-500">{proposal.client_name} &bull; {proposal.client_email}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Provider</div>
                  <div className="font-semibold text-slate-900">{proposal.sender_name}</div>
                  <div className="text-slate-500">{proposal.sender_email} &bull; {proposal.sender_phone}</div>
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">01 / Overview</div>
                <p className="text-slate-800 text-[11.5px] leading-relaxed">{proposal.project_overview}</p>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">02 / Scope</div>
                <div className="divide-y divide-slate-100 text-[11px]">
                  {(proposal.deliverables || []).map((d, i) => (
                    <div key={i} className="py-1.5 flex gap-2">
                      <span className="text-slate-400">—</span>
                      <div>{typeof d === 'string' ? d : <>{d.title || d.name}: {d.description || d.details}</>}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">03 / Financials (₹ INR)</div>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 text-[10px] uppercase">
                      <th className="py-1">Item</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Rate</th>
                      <th className="py-1 text-right">Total ({curr})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(proposal.line_items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2">
                          <span className="font-medium text-slate-900">{it.name}</span>
                        </td>
                        <td className="py-2 text-center text-slate-500">{it.quantity} {it.unit_type}</td>
                        <td className="py-2 text-right">{curr}{formatCurrency(it.unit_price)}</td>
                        <td className="py-2 text-right font-medium text-slate-900">{curr}{formatCurrency(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex flex-col items-end pt-3 text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between w-56">
                    <span>Subtotal:</span>
                    <span>{curr}{formatCurrency(proposal.subtotal)}</span>
                  </div>
                  {proposal.discount_percent > 0 && (
                    <div className="flex justify-between w-56 text-emerald-600">
                      <span>Discount ({proposal.discount_percent}%):</span>
                      <span>-{curr}{formatCurrency((proposal.subtotal * proposal.discount_percent)/100.0)}</span>
                    </div>
                  )}
                  {!isInterstate ? (
                    <>
                      <div className="flex justify-between w-56 text-[10.5px]">
                        <span>CGST (9%):</span>
                        <span>{curr}{formatCurrency(cgst)}</span>
                      </div>
                      <div className="flex justify-between w-56 text-[10.5px]">
                        <span>SGST (9%):</span>
                        <span>{curr}{formatCurrency(sgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between w-56 text-[10.5px]">
                      <span>IGST (18%):</span>
                      <span>{curr}{formatCurrency(igst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-56 font-bold text-slate-950 text-xs pt-1 border-t border-slate-900">
                    <span>Total Investment:</span>
                    <span>{curr}{formatCurrency(proposal.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-[11px]">
                <div>
                  <div className="font-medium text-slate-900">{proposal.client_company}</div>
                  <div className="text-[10px] text-slate-400">Accepted & Approved</div>
                </div>
                <div>
                  <div className="font-medium text-slate-900">{proposal.sender_company}</div>
                  <div className="text-[10px] text-slate-400">Prepared by {proposal.sender_name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
