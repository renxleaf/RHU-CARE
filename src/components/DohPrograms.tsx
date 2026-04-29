import React from 'react';
import { Shield, Activity, Users, Thermometer, Droplets, Heart, FileText, ChevronRight, Search, Filter, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function DohPrograms() {
  const programs = [
    { 
      id: 'nip', 
      name: 'National Immunization Program', 
      description: 'Universal access to safe and effective vaccines for infants, children, and seniors.',
      icon: <Shield size={24} />, 
      color: 'blue',
      stats: { targeted: 120, reached: 85, completion: '71%' },
      status: 'On Track'
    },
    { 
      id: 'ntp', 
      name: 'National TB Control Program', 
      description: 'Ensuring early detection, diagnosis, and treatment of Tuberculosis in the community.',
      icon: <Activity size={24} />, 
      color: 'red',
      stats: { diagnosed: 42, onTreatment: 38, completion: '90%' },
      status: 'Action Needed'
    },
    { 
      id: 'mcp', 
      name: 'Maternal Care Program', 
      description: 'Comprehensive prenatal and postpartum care to reduce maternal and neonatal mortality.',
      icon: <Heart size={24} />, 
      color: 'pink',
      stats: { prenatal: 64, highRisk: 8, deliveries: 12 },
      status: 'On Track'
    },
    { 
      id: 'mnp', 
      name: 'Nutrition Program', 
      description: 'Micronutrient supplementation and monitoring of growth for children in indigent areas.',
      icon: <Droplets size={24} />, 
      color: 'teal',
      stats: { weighed: 250, stunting: '12%', wasted: '4%' },
      status: 'Monitoring'
    },
    { 
      id: 'fhd', 
      name: 'Family Planning', 
      description: 'Access to modern family planning methods and reproductive health education.',
      icon: <Users size={24} />, 
      color: 'purple',
      stats: { enrollees: 142, followUps: 32, unmetNeed: '5%' },
      status: 'On Track'
    }
  ];

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-[28px] font-black text-sidebar tracking-tight leading-none uppercase italic">National Health Analytics</h2>
          <p className="text-[14px] text-txt2 font-medium mt-2">DOH Strategic Objectives · Regional Compliance Terminal</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <Activity size={16} /> Data Survey
          </button>
          <button className="px-6 py-2.5 bg-white border border-slate-200 text-txt rounded-xl text-[13px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <FileText size={16} /> Annual Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programs.map((prog) => (
          <div key={prog.id} className="card group hover:shadow-2xl transition-all border-none bg-white p-8 relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                prog.color === 'blue' && "bg-blue/10 text-blue shadow-blue/10",
                prog.color === 'red' && "bg-red/10 text-red shadow-red/10",
                prog.color === 'pink' && "bg-pink-100 text-pink-600 shadow-pink-100",
                prog.color === 'teal' && "bg-teal-100 text-teal-600 shadow-teal-100",
                prog.color === 'purple' && "bg-purple-100 text-purple-600 shadow-purple-100",
              )}>
                {React.cloneElement(prog.icon as React.ReactElement, { size: 32 })}
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                prog.status === 'On Track' ? "bg-green-l text-green border-green/20" : 
                prog.status === 'Action Needed' ? "bg-red-l text-red border-red/20" : "bg-slate-50 text-txt2 border-slate-200"
              )}>
                {prog.status}
              </span>
            </div>
            
            <h3 className="text-[20px] font-black text-txt tracking-tight group-hover:text-blue transition-colors mb-2">
              {prog.name}
            </h3>
            <p className="text-[13px] text-txt2 leading-relaxed mb-8 opacity-70 font-medium">
              {prog.description}
            </p>

            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 grid grid-cols-3 gap-4 mb-6">
              {Object.entries(prog.stats).map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <span className="text-[9px] font-black text-txt3 uppercase tracking-tighter mb-0.5 truncate">{k}</span>
                  <span className="text-[16px] font-black text-txt">{v}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-3.5 bg-slate-900/5 text-txt2 text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-blue hover:text-white transition-all flex items-center justify-center gap-2 group-hover:gap-3">
              Operational Protocol <ChevronRight size={16} />
            </button>
          </div>
        ))}

        <div className="bg-panel border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-10 group cursor-pointer hover:border-blue hover:bg-blue/5 transition-all">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-txt3 group-hover:bg-blue group-hover:text-white transition-all">
            <Plus size={32} />
          </div>
          <h4 className="text-[16px] font-black text-txt tracking-tight uppercase">Custom Initiative</h4>
          <p className="text-[12px] text-txt2 mt-2 max-w-[200px] font-medium leading-relaxed italic">Draft a localized community health mandate.</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-panel border border-border rounded-3xl shadow-sh-md overflow-hidden bg-white">
          <div className="p-8 border-b border-border bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-[18px] font-black text-txt uppercase tracking-tight">System Global Status</h3>
              <p className="text-[13px] text-txt2 font-medium">Cross-node analytics summary from Calauan RHU Instance</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt3" />
                <input className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium outline-none focus:ring-4 focus:ring-blue/5 transition-all" placeholder="Search program data..." />
              </div>
              <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"><Filter size={20} className="text-txt2" /></button>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <MiniProgress label="Infant Vaccination Rate" value={78} goal={95} color="blue" />
            <MiniProgress label="TB Case Recovery" value={92} goal={85} color="green" />
            <MiniProgress label="Maternal Visits (Complete)" value={54} goal={90} color="red" />
            <MiniProgress label="Stunting Awareness" value={41} goal={100} color="teal" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniProgress({ label, value, goal, color }: { label: string, value: number, goal: number, color: string }) {
  const percentage = Math.min(100, Math.floor((value / goal) * 100));
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <span className="text-[11px] font-black text-txt3 uppercase tracking-widest max-w-[120px] leading-tight">{label}</span>
        <div className="text-right">
          <div className="text-[18px] font-black text-txt tracking-tighter leading-none">{value}%</div>
        </div>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className={cn(
            "h-full rounded-full shadow-sm shadow-black/5",
            color === 'blue' ? "bg-blue" : color === 'green' ? "bg-green" : color === 'red' ? "bg-red" : "bg-teal"
          )} 
        />
      </div>
      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-txt3">
        <span>Current</span>
        <span>Goal: {goal}%</span>
      </div>
    </div>
  );
}
