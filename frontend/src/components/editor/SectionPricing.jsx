import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, AlertCircle, CheckCircle, Tag } from 'lucide-react';
import { api } from '../../services/api';

export default function SectionPricing({ proposal, onChange }) {
  const [catalogue, setCatalogue] = useState([]);
  const [showCataloguePicker, setShowCataloguePicker] = useState(false);

  useEffect(() => {
    api.getPricingCatalogue()
      .then((data) => setCatalogue(data))
      .catch((err) => console.warn('Could not load catalogue for dropdown', err));
  }, []);

  const lineItems = proposal.line_items || [];

  const recalculateTotals = (items, discountPercent = proposal.discount_percent || 0, taxPercent = proposal.tax_percent ?? 10) => {
    const subtotal = items.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);
    const discountAmount = subtotal * (discountPercent / 100.0);
    const net = Math.max(0, subtotal - discountAmount);
    const taxAmount = net * (taxPercent / 100.0);
    const totalAmount = net + taxAmount;

    onChange('line_items', items);
    onChange('subtotal', Math.round(subtotal * 100) / 100);
    onChange('discount_percent', discountPercent);
    onChange('tax_percent', taxPercent);
    onChange('tax_amount', Math.round(taxAmount * 100) / 100);
    onChange('total_amount', Math.round(totalAmount * 100) / 100);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0;
      const r = field === 'unit_price' ? parseFloat(value) || 0 : parseFloat(item.unit_price) || 0;
      item.total = Math.round(q * r * 100) / 100;
    }

    updated[index] = item;
    recalculateTotals(updated);
  };

  const handleAddItemFromCatalogue = (catItem) => {
    const newItem = {
      id: `item-${Date.now().toString().slice(-4)}`,
      name: catItem.name,
      description: catItem.description || '',
      unit_type: catItem.unit_type || 'fixed',
      quantity: catItem.default_quantity || 1.0,
      unit_price: catItem.default_rate || 0.0,
      total: Math.round((catItem.default_quantity || 1.0) * (catItem.default_rate || 0.0) * 100) / 100,
      matched_service_id: catItem.code,
      is_custom: false
    };

    const updated = [...lineItems, newItem];
    recalculateTotals(updated);
    setShowCataloguePicker(false);
  };

  const handleAddCustomItem = () => {
    const newItem = {
      id: `custom-${Date.now().toString().slice(-4)}`,
      name: 'Custom Tailored Service',
      description: 'Custom client requirement quoted separately',
      unit_type: 'unit',
      quantity: 1.0,
      unit_price: 1000.0,
      total: 1000.0,
      matched_service_id: null,
      is_custom: true
    };
    const updated = [...lineItems, newItem];
    recalculateTotals(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = lineItems.filter((_, i) => i !== index);
    recalculateTotals(updated);
  };

  return (
    <div className="space-y-6">
      {/* Table of Line Items */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Commercial Pricing & Line Items ({lineItems.length})</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Automated deterministic pricing with full manual adjustment control
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCataloguePicker(!showCataloguePicker)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add from Catalogue</span>
            </button>
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Add Custom Item</span>
            </button>
          </div>
        </div>

        {/* Dropdown to pick from catalogue */}
        {showCataloguePicker && (
          <div className="p-3 bg-slate-50 rounded-xl border border-blue-200 space-y-2">
            <div className="text-xs font-bold text-slate-700">Select a Service from Predefined Catalogue:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {catalogue.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleAddItemFromCatalogue(cat)}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-left transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 truncate">{cat.name}</div>
                    <div className="text-[10px] text-slate-400">{cat.category} &bull; ${cat.default_rate} / {cat.unit_type}</div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 shrink-0 ml-2">+ Add</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div className="space-y-3">
          {lineItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No pricing items added yet. Click above to add items from the catalogue.
            </div>
          ) : (
            lineItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="font-bold text-xs text-slate-900 w-full outline-none border-b border-transparent focus:border-blue-500"
                        placeholder="Service / Deliverable Name..."
                      />
                      {item.is_custom ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Custom Item
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          {item.matched_service_id || 'Matched'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="text-xs text-slate-500 w-full outline-none border-b border-transparent focus:border-blue-500"
                      placeholder="Item specifications and deliverables..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Rates & Calculations Row */}
                <div className="grid grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Unit Type</label>
                    <input
                      type="text"
                      value={item.unit_type || 'unit'}
                      onChange={(e) => handleItemChange(idx, 'unit_type', e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Rate (${proposal.currency})</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-slate-800 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Line Total</label>
                    <div className="w-full mt-0.5 px-2 py-1 font-extrabold text-slate-900 text-xs text-right bg-slate-100 rounded">
                      ${(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Calculations & Totals Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-sm">Totals & Financial Adjustments</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Corporate Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={proposal.discount_percent || 0}
              onChange={(e) => recalculateTotals(lineItems, parseFloat(e.target.value) || 0, proposal.tax_percent)}
              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Estimated Tax / VAT (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={proposal.tax_percent ?? 10}
              onChange={(e) => recalculateTotals(lineItems, proposal.discount_percent, parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg outline-none"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl space-y-2 pt-3 border border-slate-200/60">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold">${(proposal.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          {proposal.discount_percent > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 font-semibold">
              <span>Discount ({proposal.discount_percent}%):</span>
              <span>-${((proposal.subtotal || 0) * proposal.discount_percent / 100.0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-600">
            <span>Tax ({proposal.tax_percent}%):</span>
            <span className="font-semibold">${(proposal.tax_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Grand Total:</span>
            <span className="text-blue-600">${(proposal.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {proposal.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
