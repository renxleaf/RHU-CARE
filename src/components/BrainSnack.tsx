import React from 'react';
import { Brain, ExternalLink, Lightbulb, Clock, BookOpen, Quote } from 'lucide-react';

export default function BrainSnack() {
  const snacks = [
    {
      id: 1,
      title: "Optimizing Maternal Triage",
      source: "Journal of Rural Midwifery, 2025",
      text: "Recent findings suggest that implementing a one-hand triage tool in high-volume clinics reduces identification time for pre-eclampsia risk factors by 24%.",
      tip: "Focus on systolic spikes relative to patient baseline, not just absolute thresholds.",
      tags: ["OBSTETRICS", "TRIAGE"]
    },
    {
      id: 2,
      title: "Cold Chain Resilience",
      source: "Archipelagic Health Logistics, 2026",
      text: "Localized sensor bridges can predict vaccine refrigeration failure 4 hours earlier than standard manual logs in high-humidity environments.",
      tip: "Monitor humidity fluctuations as a leading indicator of compressor fatigue.",
      tags: ["SUPPLY CHAIN", "LOGISTICS"]
    },
    {
      id: 3,
      title: "Hybrid EHR Adoption",
      source: "Healthcare Engineering Review, 2025",
      text: "The transition from paper-based to digital nervous systems works best when nurses are empowered to perform documentation in 'interrupted bursts'.",
      tip: "Utilize volatile caching to prevent data loss during emergency pulls.",
      tags: ["INFORMATICS", "UX"]
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue/20">
            <Brain className="text-white" size={24} />
          </div>
          <h1 className="text-[28px] font-black tracking-tighter text-slate-900 uppercase">Brain Snack (Tier 3)</h1>
        </div>
        <p className="text-slate-500 font-medium italic">Snackable research translations for the Philippine frontier provider.</p>
      </div>

      <div className="grid gap-8">
        {snacks.map((snack) => (
          <div key={snack.id} className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue/20 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative card p-8 bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                  <Clock size={12} /> Recent Update
                </div>
                <div className="flex gap-2">
                  {snack.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded uppercase">{tag}</span>
                  ))}
                </div>
              </div>

              <h2 className="text-[20px] font-black text-slate-900 mb-2 leading-tight uppercase group-hover:text-blue transition-colors">{snack.title}</h2>
              <div className="flex items-center gap-2 text-txt3 text-[12px] mb-4 font-medium italic">
                <BookOpen size={14} /> {snack.source}
              </div>

              <div className="flex gap-4 mb-6">
                <div className="text-blue opacity-20">
                  <Quote size={32} />
                </div>
                <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                  {snack.text}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                <Lightbulb className="text-amber-500 shrink-0" size={18} />
                <div className="text-[12px] text-amber-900 leading-tight">
                  <span className="font-black uppercase tracking-tighter block mb-1">Clinical Insight:</span>
                  {snack.tip}
                </div>
              </div>

              <button className="mt-6 flex items-center gap-2 text-[11px] font-black text-blue hover:text-blue-700 transition-colors uppercase tracking-widest">
                Read Full Paper <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-8 border border-dashed border-slate-200 rounded-3xl">
        <p className="text-[13px] text-slate-400 font-medium italic mb-4">New snacks are synchronized during non-blocking delta syncs.</p>
        <button className="btn btn-sm btn-outline border-slate-200 text-slate-500 bg-white">Request Topic Analysis</button>
      </div>
    </div>
  );
}
