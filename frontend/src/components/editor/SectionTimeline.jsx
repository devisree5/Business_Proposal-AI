import React from 'react';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';

export default function SectionTimeline({ proposal, onChange }) {
  const milestones = proposal.timeline_milestones || [];

  const handleAddMilestone = () => {
    const nextPhase = milestones.length + 1;
    const updated = [
      ...milestones,
      {
        phase: `Phase ${nextPhase}`,
        title: 'Milestone Execution & Sign-off',
        duration: 'Weeks 4-5',
        deliverables: 'Functional staging and testing verification'
      }
    ];
    onChange('timeline_milestones', updated);
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    onChange('timeline_milestones', updated);
  };

  const handleRemove = (index) => {
    const updated = milestones.filter((_, i) => i !== index);
    onChange('timeline_milestones', updated);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Project Timeline & Delivery Milestones ({milestones.length})</span>
        </h4>

        <button
          type="button"
          onClick={handleAddMilestone}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Phase / Milestone</span>
        </button>
      </div>

      <div className="space-y-3">
        {milestones.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No milestones configured. Click above to add project phases.
          </div>
        ) : (
          milestones.map((m, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={m.phase || `Phase ${idx + 1}`}
                    onChange={(e) => handleMilestoneChange(idx, 'phase', e.target.value)}
                    className="font-bold text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg w-28 outline-none"
                    placeholder="Phase 1"
                  />
                  <input
                    type="text"
                    value={m.title || ''}
                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    className="font-bold text-xs text-slate-900 w-full outline-none border-b border-transparent focus:border-blue-500"
                    placeholder="Milestone Title (e.g. Discovery & Architecture Blueprint)..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={m.duration || ''}
                      onChange={(e) => handleMilestoneChange(idx, 'duration', e.target.value)}
                      className="w-24 px-2 py-0.5 text-xs border border-slate-200 rounded font-medium text-slate-700 outline-none"
                      placeholder="e.g. Weeks 1-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={m.deliverables || ''}
                  onChange={(e) => handleMilestoneChange(idx, 'deliverables', e.target.value)}
                  className="w-full text-xs text-slate-600 border border-slate-200/60 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 bg-slate-50/50"
                  placeholder="Key deliverables and acceptance criteria for this phase..."
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
