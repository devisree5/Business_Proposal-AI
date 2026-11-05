import React from 'react';
import { FileText, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TemplateShowcase() {
  const { setActiveTab, currentProposal, setCurrentProposal } = useApp();

  const templates = [
    {
      id: 'modern',
      title: 'Modern Business',
      subtitle: 'Clean & Professional',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
      tag: 'Most Popular',
      color: '#2563eb'
    },
    {
      id: 'corporate',
      title: 'Corporate Elegance',
      subtitle: 'Bold & Sophisticated',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
      tag: 'Executive',
      color: '#0f172a'
    },
    {
      id: 'minimal',
      title: 'Minimal Style',
      subtitle: 'Simple & Elegant',
      image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80',
      tag: 'Minimalist',
      color: '#18181b'
    }
  ];

  const handleSelectTemplate = (templateId) => {
    if (currentProposal) {
      setCurrentProposal({ ...currentProposal, template_id: templateId });
    }
    setActiveTab('editor');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-4 pb-3 border-b border-slate-100">
        <FileText className="w-4 h-4 text-blue-600" />
        <span>Proposal Templates</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="group rounded-xl border border-slate-200 overflow-hidden hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="h-28 overflow-hidden relative bg-slate-100">
              <img
                src={tpl.image}
                alt={tpl.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs">
                {tpl.tag}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between bg-white">
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {tpl.title}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {tpl.subtitle}
                </div>
              </div>

              <button
                onClick={() => handleSelectTemplate(tpl.id)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
