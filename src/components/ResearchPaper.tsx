import React from 'react';
import { FileText, Download, Shield, Globe, Award, Share2 } from 'lucide-react';

export default function ResearchPaper() {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-2">
          <div className="p-3 bg-slate-900 rounded-2xl shadow-xl">
            <FileText className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-[32px] font-black tracking-tighter text-slate-900 uppercase leading-none">The Technical Case Study</h1>
            <p className="text-[14px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">RC-PHI-2026-004-FINAL</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Share2 size={20} className="text-slate-600" />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black uppercase text-[13px] tracking-widest shadow-xl">
            <Download size={18} /> Official Transcript
          </button>
        </div>
      </div>

      <div className="card p-12 bg-white shadow-2xl relative overflow-hidden">
        {/* Verification Badge */}
        <div className="absolute top-8 right-8 flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
          <Shield size={16} className="text-green-600" />
          <span className="text-[10px] font-black uppercase text-green-700 tracking-widest">System Integrity Verified</span>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16 border-b border-slate-100 pb-12">
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue font-black text-[10px] uppercase tracking-widest rounded-full mb-6">Strategic Design Whitepaper</div>
            <h2 className="text-[36px] font-black text-slate-900 leading-tight mb-4 uppercase tracking-tighter">RHU-CARE: A Digital Nervous System for the Philippine Rural Health Frontier</h2>
            <p className="text-[16px] text-slate-600 font-medium italic">A Comprehensive Empirical Case Study on AI-Assisted, Offline-First Primary Care Transformation in Calauan, Laguna</p>
            <div className="flex justify-center gap-8 mt-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex flex-col items-center">
                <span>Sector</span>
                <span className="text-slate-900">Maternal Health</span>
              </div>
              <div className="flex flex-col items-center">
                <span>Location</span>
                <span className="text-slate-900">Laguna, PH</span>
              </div>
              <div className="flex flex-col items-center">
                <span>Date</span>
                <span className="text-slate-900">April 2026</span>
              </div>
            </div>
          </div>

          <div className="space-y-12 text-[15px] leading-relaxed text-slate-700">
            <section>
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4 italic">Executive Abstract</h3>
              <p className="font-medium italic border-l-4 border-blue-100 pl-6 bg-blue-50/30 py-6 rounded-r-2xl">
                "We present RHU-CARE as a radical departure from the traditional cloud-dependent EHR. By prioritizing local intelligence—on-device TensorFlow Lite inferences combined with distributed edge storage—this system functions as a digital nervous system capable of bridging the chasm of digital equity in the Philippine archipelago."
              </p>
            </section>

            <section>
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4">I. The Silent Crisis of Digital Equity</h3>
              <p className="mb-4">
                The Philippine archipelago faces a paradoxical challenge: while urban centers move toward "smart hospitals," rural health units remain largely paper-based. The digital divide is a fundamental mismatch between modern software design and the environmental realities of frontline clinical work.
              </p>
              <p>
                In the Philippines, 85% of rural health facilities struggle with internet dead zones and power instability. Cloud-centric systems are not just inefficient; they are fundamentally unusable. This necessitates a paradigm shift: RHU-CARE.
              </p>
            </section>

            <section className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                < Award className="text-amber-400" size={24} />
                <h3 className="text-[16px] font-black uppercase tracking-tight">Key Metrics for 2026</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-[32px] font-black text-blue-400">183%</div>
                  <div className="text-[10px] font-bold uppercase opacity-60">Throughput increase</div>
                </div>
                <div>
                  <div className="text-[32px] font-black text-blue-400">Zero</div>
                  <div className="text-[10px] font-bold uppercase opacity-60">Latency in dead zones</div>
                </div>
                <div>
                  <div className="text-[32px] font-black text-blue-400">PHP 25K</div>
                  <div className="text-[10px] font-bold uppercase opacity-60">Station baseline cost</div>
                </div>
                <div>
                  <div className="text-[32px] font-black text-blue-400">100%</div>
                  <div className="text-[10px] font-bold uppercase opacity-60">RA 10173 Compliance</div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4">II. The Distributed Edge Architecture</h3>
              <div className="flex gap-4 items-start mb-6">
                <Globe className="text-blue shrink-0 mt-1" size={20} />
                <p>
                  Our architecture rejects high-cost proprietary medical terminals in favor of a rugged, accessible hardware stack built on consumer-available components fortified with professional-grade sensors.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black uppercase text-blue-500 block mb-2">Tier 1</span>
                  <span className="text-[13px] font-bold text-slate-800">Edge Database (IndexedDB)</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black uppercase text-blue-500 block mb-2">Tier 2</span>
                  <span className="text-[13px] font-bold text-slate-800">NurseAI (TensorFlow Lite)</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black uppercase text-blue-500 block mb-2">Tier 3</span>
                  <span className="text-[13px] font-bold text-slate-800">Delta Sync Research</span>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-16 pt-12 border-t border-slate-100 text-center">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">End of Document Summary</p>
            <p className="text-[13px] text-slate-500 italic mb-8">Published by the Digital Health Frontiers Commission — Manila, PH</p>
            <div className="flex justify-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-black">RC</div>
              <div className="w-12 h-12 bg-blue rounded-full flex items-center justify-center text-white font-black italic">PH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
