import React from 'react';
import { FilePieChart, Download, Filter, Calendar, Users, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { QueueItem, Patient } from '../types';

interface FhsisPageProps {
  queueItems: QueueItem[];
  patients: Patient[];
}

export default function FhsisPage({ queueItems, patients }: FhsisPageProps) {
  const servedCount = queueItems.length;
  const totalPatients = patients.length;

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <div className="text-[10px] font-black text-blue uppercase tracking-[0.3em] mb-1 italic opacity-80">Health Intelligence Node</div>
          <h1 className="text-[32px] font-black tracking-tight text-txt uppercase italic">FHSIS Analytics Terminal</h1>
          <p className="text-[14px] text-txt2 font-medium">Field Health Service Information System · Cross-Data Validation</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-slate-200 text-txt2 rounded-xl text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} /> Data Triage
          </button>
          <button className="px-8 py-3 bg-blue text-white rounded-xl text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-d transition-all shadow-lg shadow-blue/20 active:scale-95">
            <Download size={16} /> Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FhsisStat label="Total Consultations" value={servedCount} icon={<Users size={20} />} delta="+12%" color="blue" />
        <FhsisStat label="Node Attendance" value="88%" icon={<Activity size={20} />} delta="Stable" color="green" />
        <FhsisStat label="Maternal Registry" value="94%" icon={<TrendingUp size={20} />} delta="High" color="pink" />
        <FhsisStat label="Child Immunization" value="82%" icon={<TrendingUp size={20} />} delta="Lagging" color="red" />
      </div>

      <div className="bg-panel border border-border rounded-[32px] overflow-hidden shadow-sh bg-white">
        <div className="bg-slate-50 p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-[14px] font-black uppercase tracking-widest text-txt leading-none">Monthly Performance Log</h3>
            <p className="text-[11px] text-txt3 font-bold mt-1">Calauan Health Node Instance: 0-LAG-001</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-border shadow-sm">
            <Calendar size={14} className="text-blue" />
            <span className="text-[12px] font-black text-txt uppercase">March 2026</span>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <FhsisRow label="Antenatal Care (A1)" current={42} target={50} color="pink" />
            <FhsisRow label="Fully Immunized Children (I1)" current={31} target={45} color="blue" />
            <FhsisRow label="Hypertension Control (H1)" current={128} target={150} color="red" />
            <FhsisRow label="Diabetes Management (D1)" current={56} target={60} color="teal" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] font-black uppercase tracking-widest text-txt3 opacity-60 italic">
        <p>• DOH FHSIS COMPLIANCE VERSION 2026.0</p>
        <p className="md:text-right">NODE PULSE: SYNCHRONIZED WITH PROVINCIAL HUB (120s LAGGING)</p>
      </div>
    </div>
  );
}

function FhsisStat({ label, value, icon, delta, color }: any) {
  return (
    <div className="card group hover:shadow-2xl transition-all border-none bg-white p-6 relative overflow-hidden">
      <div className={cn("absolute top-0 right-0 w-16 h-16 opacity-[0.03] -translate-y-1/2 translate-x-1/2 rounded-full", `bg-${color}`)} />
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", `bg-${color}`)}>
          {icon}
        </div>
        <div className={cn("text-[9px] font-black px-2 py-0.5 rounded-full uppercase border", 
          delta.includes('+') || delta === 'High' || delta === 'Stable' ? "bg-green-l text-green border-green/20" : 
          "bg-red-l text-red border-red/20"
        )}>
          {delta}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-black text-txt2 uppercase tracking-widest mb-1">{label}</div>
        <div className="text-[28px] font-black text-txt tracking-tighter leading-none">{value}</div>
      </div>
    </div>
  );
}

function FhsisRow({ label, current, target, color }: any) {
  const percent = Math.min((current / target) * 100, 100);
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-3">
        <div>
          <div className="text-[13px] font-black text-txt tracking-tight group-hover:text-blue transition-colors">{label}</div>
          <div className="text-[10px] font-black text-txt3 uppercase tracking-tighter mt-0.5 italic">Target Threshold Alignment</div>
        </div>
        <div className="text-right">
          <div className="text-[18px] font-black text-txt tracking-tighter">{current} <span className="text-[11px] text-txt3 font-bold opacity-50">/ {target}</span></div>
        </div>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn("h-full rounded-full shadow-sm shadow-black/5", `bg-${color}`)}
        />
      </div>
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-txt3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Completion: {Math.floor(percent)}%</span>
        <span>Variance: {target - current} units</span>
      </div>
    </div>
  );
}
