import React from 'react';
import { Plus, Trash2, CheckCircle2, ListChecks } from 'lucide-react';

export default function SectionDeliverables({ proposal, onChange }) {
  const deliverables = proposal.deliverables || [];

  const handleAddDeliverable = () => {
    const nextIndex = deliverables.length + 1;
    const updated = [
      ...deliverables,
      { title: `Deliverable ${nextIndex}`, description: 'New verified project milestone deliverable' }
    ];
    onChange('deliverables', updated);
  };

  const handleUpdate = (index, field, value) => {
    const updated = [...deliverables];
    if (typeof updated[index] === 'string') {
      updated[index] = { title: `Deliverable ${index + 1}`, description: updated[index] };
    }
    updated[index] = { ...updated[index], [field]: value };
    onChange('deliverables', updated);
  };

  const handleRemove = (index) => {
    const updated = deliverables.filter((_, i) => i !== index);
    onChange('deliverables', updated);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-600" />
          <span>Authorized Deliverables ({deliverables.length})</span>
        </h4>

        <button
          type="button"
          onClick={handleAddDeliverable}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Deliverable</span>
        </button>
      </div>

      <div className="space-y-3">
        {deliverables.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No deliverables listed yet. Click "Add Deliverable" to add one.
          </div>
        ) : (
          deliverables.map((item, idx) => {
            const title = typeof item === 'string' ? `Deliverable ${idx + 1}` : (item.title || `Deliverable ${idx + 1}`);
            const desc = typeof item === 'string' ? item : (item.description || item.details || '');

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 group hover:border-slate-300 transition-colors"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                      className="font-bold text-xs text-slate-900 bg-transparent w-full outline-none focus:border-b focus:border-blue-500"
                      placeholder="Deliverable Name / Title..."
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={desc}
                    onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                    className="w-full text-xs text-slate-600 bg-transparent outline-none focus:border-b focus:border-blue-500 pl-7 leading-relaxed resize-none"
                    placeholder="Deliverable specifications, acceptance criteria, or technical details..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                  title="Remove Deliverable"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
