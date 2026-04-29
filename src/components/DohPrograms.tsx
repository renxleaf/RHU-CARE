import React from 'react';
import { Shield, Activity, Users, Thermometer, Droplets, Heart, FileText, ChevronRight, Search, Filter } from 'lucide-react';
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
          <h2 className="text-[28px] font-black text-sidebar tracking-tight leading-none uppercase">Barangay Health Programs (Calauan, Laguna)</h2>
          <p className="text-[14px] text-txt2 font-medium mt-2">National Health Objectives · Localized Performance Tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-p btn-sm px-6">
            <Activity size={16} /> New Survey
          </button>
          <button className="btn btn-s btn-sm px-6">
            <FileText size={16} /> Annual Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programs.map((prog) => (
          <div key={prog.id} className="card group hover:border-blue transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                prog.color === 'blue' && "bg-blue/10 text-blue",
                prog.color === 'red' && "bg-red/10 text-red",
                prog.color === 'pink' && "bg-pink-100 text-pink-600",
                prog.color === 'teal' && "bg-teal-100 text-teal-600",
                prog.color === 'purple' && "bg-purple-100 text-purple-600",
              )}>
                {prog.icon}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                prog.status === 'On Track' ? "bg-green-100 text-green-700" : 
                prog.status === 'Action Needed' ? "bg-red-100 text-red-700" : "bg-bg text-txt2 border border-border"
              )}>
                {prog.status}
              </span>
            </div>
            
            <h3 className="text-[17px] font-bold text-slate-900 group-hover:text-blue transition-colors mb-1">
              {prog.name}
            </h3>
            <p className="text-[12px] text-txt2 leading-relaxed mb-6 line-clamp-2">
              {prog.description}
            </p>

            <div className="bg-bg rounded-xl p-4 grid grid-cols-3 gap-2 mb-4">
              {Object.entries(prog.stats).map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <span className="text-[9px] font-bold text-txt3 uppercase truncate">{k}</span>
                  <span className="text-[14px] font-black text-slate-800">{v}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-2.5 text-[12px] font-black text-txt2 hover:text-blue flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
              Manage Program <ChevronRight size={14} />
            </button>
          </div>
        ))}

        <div className="card bg-slate-100 border-dashed border-2 flex flex-col items-center justify-center text-center p-8 opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-txt3 font-bold">
            +
          </div>
          <h4 className="text-[14px] font-bold text-slate-600">Propose New Initiative</h4>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[180px]">Add a custom community health program for your barangay.</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[18px] font-black text-slate-900">National Health Status (Analytics Summary)</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt3" />
                <input className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] outline-none" placeholder="Search data..." />
              </div>
              <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl"><Filter size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MiniProgress label="Infant Vaccination Rate" value={78} goal={95} color="blue" />
            <MiniProgress label="TB Case Recovery" value={92} goal={85} color="green" />
            <MiniProgress label="Maternal Visits (Complete)" value={54} goal={90} color="pink" />
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
        <span className="text-[12px] font-black text-slate-900">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            color === 'blue' ? "bg-blue" : color === 'green' ? "bg-green" : color === 'pink' ? "bg-pink-500" : "bg-teal-500"
          )} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
      <div className="text-[10px] text-txt3 font-medium">Target Goal: {goal}%</div>
    </div>
  );
}
