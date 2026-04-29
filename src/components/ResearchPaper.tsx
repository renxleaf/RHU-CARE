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
            <section id="introduction">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4 italic">Introduction: The Silent Crisis of Digital Equity</h3>
              <p className="mb-4">
                The Philippine archipelago, characterized by its complex geography and vast rural stretches, faces a paradoxical challenge in healthcare. While urban centers like Metro Manila move toward high-tech "smart hospitals," the backbone of the nation’s health, the Rural Health Units (RHUs) remains shackled to a paper-based legacy.
              </p>
              <p>
                In remote municipalities, the "digital divide" is a fundamental mismatch between modern software design and environmental realities. Most digital health solutions assume constant connectivity. In the Philippines, where 85% of rural health facilities struggle with internet "dead zones," cloud-centric systems are unusable. Enter RHU-CARE: a specialized, offline-first AI nursing station designed for the specific ergonomic and connectivity constraints of the Philippine nurse.
              </p>
            </section>

            <section id="background">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4">I. Anatomy of the Conflict: The SEIPS Environmental Audit</h3>
              <p className="mb-4">
                Using the SEIPS (Systems Engineering Initiative for Patient Safety) framework, our audit revealed a workspace that is physically and cognitively hostile to traditional nursing. RHU offices are typically shared, cramped spaces with substandard lighting and high ambient noise.
              </p>
              <p>
                Nurses are interrupted every 8 minutes on average. In this environment, the cognitive load of "interruption-driven charting" is a primary driver of the 68% transcription error rate. Searching for a single record in a mountain of paper wastes 10–15% of total encounter time.
              </p>
            </section>

            <section className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Award className="text-amber-400" size={24} />
                <h3 className="text-[16px] font-black uppercase tracking-tight">Clinical Transformation</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-[32px] font-black text-blue-400">183%</div>
                  <div className="text-[10px] font-bold uppercase opacity-60">Throughput increase</div>
                </div>
                <div>
                  <div className="text-[32px] font-black text-blue-400">68%</div>
                  <div className="text-[10px] font-bold uppercase opacity-60">Error Reduction Target</div>
                </div>
                <div>
                  <div className="text-[32px] font-black text-blue-400">PHP 25K</div>
                  <div className="text-[10px] font-bold uppercase opacity-60">Station baseline cost</div>
                </div>
                <div>
                  <div className="text-[32px] font-black text-blue-400">8 Sec</div>
                  <div className="text-[10px] font-bold uppercase opacity-60">Edge-AI Inference Time</div>
                </div>
              </div>
            </section>

            <section id="hardware">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4">II. The Hardware Ecosystem: PHP 25,000 Station</h3>
              <p className="mb-4">
                The nerve center is the TechLife Pad Plus, an Android 15 tablet powered by the Helio G91 processor, chosen for its edge-computing AI ability and 8,000mAh battery providing 10+ hours of operation during "brownouts."
              </p>
              <p>
                We bypass manual entry via USB On-The-Go (OTG), integrating digital BP monitors, pulse oximeters, and infrared thermometers directly. For high-risk cohorts, we include Bluetooth wearables like the Xiaomi Mi Band 8 for continuous monitoring.
              </p>
            </section>

            <section id="architecture">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4">III. Three-Tiered Software Architecture</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-[14px] text-blue underline mb-2">Tier 1: CHITS-Compatible EHR Foundation</h4>
                  <p className="text-[14px]">Built for rural viability using IndexedDB for instant offline documentation. A single "Sync" button batches encrypted records to the DOH cloud when connectivity is restored.</p>
                </div>
                <div>
                  <h4 className="font-bold text-[14px] text-blue underline mb-2">Tier 2: NurseAI (TensorFlow Lite Intelligence)</h4>
                  <p className="text-[14px]">Runs locally on the tablet. Cross-references vitals against NANDA-I taxonomy in under 8 seconds. Proposes NNN (Nanda-Nic-Noc) linkages for nurse approval.</p>
                </div>
                <div>
                  <h4 className="font-bold text-[14px] text-blue underline mb-2">Tier 3: Brain Snack (Research Translation)</h4>
                  <p className="text-[14px]">Addresses the Research Literacy Gap by summarizing complex journals into layered, "snackable" summaries in a Filipino-friendly format.</p>
                </div>
              </div>
            </section>

            <section id="workflow">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4">IV. Clinical Workflow Transformation</h3>
              <p className="mb-4">
                Throughput increases from 6 patients/hour to 17 patients/hour. The digital queue eliminates "talking-level noise" of nurses shouting for status updates.
              </p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-black uppercase text-[11px] text-slate-400 mb-2">The "Maria Santos" Case Study</h4>
                <p className="text-[13px] italic">Nurse connects USB BP monitor → Reading (160/100) flashes → NurseAI triggers alert → Suggests NANDA plan → Nurse adds "Nutritional Counseling" → Encounter finished in {"< 3"} mins.</p>
              </div>
            </section>

            <section id="design-fixes">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4">V. The Three Design Fixes</h3>
              <ul className="space-y-3">
                <li className="flex gap-2 text-[14px]"><span className="font-bold text-blue">Fix 1:</span> Sequential medication checklist to combat 8-minute interruptions.</li>
                <li className="flex gap-2 text-[14px]"><span className="font-bold text-blue">Fix 2:</span> Centralized instant lookup (Name/PhilHealth ID) saving 5-7 minutes.</li>
                <li className="flex gap-2 text-[14px]"><span className="font-bold text-blue">Fix 3:</span> Offline Queue & Document Mode, removing internet dependency.</li>
              </ul>
            </section>

            <section id="privacy">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4">VI. Security, Compliance, and Ethics</h3>
              <p className="mb-4">
                In compliance with RA 10173 (Data Privacy Act of 2012), data is encrypted with 256-bit AES.
              </p>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-xl border border-green-100 text-[13px] font-medium">
                <Shield size={18} />
                "Lost Device Protocol" triggers remote wipe and microSD auto-backup recovery.
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
