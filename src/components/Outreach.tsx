import React from 'react';
import { Home, Users, Heart, Shield, Activity, Droplets, Baby, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Outreach() {
  const programs = [
    {
      id: 'nip',
      title: 'National Immunization Program (NIP)',
      description: 'Provides free vaccines to infants, children, and pregnant women to prevent vaccine-preventable diseases.',
      icon: <Shield size={20} />,
      color: 'blue',
      tracking: [
        { label: 'Infants Fully Immunized (FIC)', target: 85, current: 72 },
        { label: 'Pentavalent 3 Coverage', target: 95, current: 88 }
      ]
    },
    {
      id: 'ntp',
      title: 'National TB Control Program (NTP)',
      description: 'Zero TB in the community through active case finding and DOTS treatment adherence.',
      icon: <Activity size={20} />,
      color: 'red',
      tracking: [
        { label: 'Sputum Collection (Day)', target: 10, current: 12 },
        { label: 'DOTS Adherence Rate', target: 100, current: 94 }
      ]
    },
    {
      id: 'mnc',
      title: 'Maternal & Newborn Care',
      description: 'Ensuring safe motherhood and newborn survival through facility-based deliveries.',
      icon: <Baby size={20} />,
      color: 'pink',
      tracking: [
        { label: 'Prenatal Checkups (4 visits)', target: 20, current: 18 },
        { label: 'Post-Partum Visits', target: 20, current: 15 }
      ]
    },
    {
      id: 'bns',
      title: 'Barangay Nutrition Program',
      description: 'Combating malnutrition through Operation Timbang and micronutrient supplementation.',
      icon: <Droplets size={20} />,
      color: 'green',
      tracking: [
        { label: 'Stunting Prevalence', target: '<5%', current: '7.2%' },
        { label: 'Vit A Supplementation', target: 50, current: 48 }
      ]
    },
    {
      id: 'ncd',
      title: 'NCD Prevention (Lifestyle)',
      description: 'Fighting Hypertension and Diabetes through community screening and health education.',
      icon: <Heart size={20} />,
      color: 'purple',
      tracking: [
        { label: 'BP Screening (Adults)', target: 100, current: 85 },
        { label: 'Sugar Level Check (CBG)', target: 50, current: 32 }
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-[28px] font-black tracking-tight text-txt uppercase italic">Program Outreach Hub</h2>
          <p className="text-[14px] text-txt2 font-medium">BHW Distributed Monitoring · DOH National Health Alignment</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-black text-txt3 uppercase tracking-widest">Aggregate Score</div>
            <div className="text-[18px] font-black text-green">84.2% Accuracy</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green/10 flex items-center justify-center text-green border border-green/20">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programs.map((p) => (
          <div key={p.id} className="card group hover:shadow-2xl hover:shadow-slate-200/50 transition-all border-none bg-white relative overflow-hidden">
            {/* Color Accent Bar */}
            <div className={cn("absolute top-0 left-0 w-1 h-full", `bg-${p.color}`)} />
            
            <div className="flex items-center gap-4 mb-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", `bg-${p.color}-l text-${p.color}`)}>
                {React.cloneElement(p.icon as React.ReactElement, { size: 28 })}
              </div>
              <div>
                <h3 className="text-[17px] font-black text-txt leading-tight group-hover:text-blue transition-colors">{p.title}</h3>
                <span className={cn("text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full", `bg-${p.color}-l text-${p.color}`)}>
                  Active Program
                </span>
              </div>
            </div>
            
            <p className="text-[13px] text-txt2 font-medium leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
              {p.description}
            </p>

            <div className="space-y-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {p.tracking.map((t, idx) => {
                const perc = (parseFloat(t.current as string) / parseFloat(t.target as string)) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] font-black text-txt3 uppercase tracking-widest">{t.label}</span>
                      <span className="text-[14px] font-black text-txt tracking-tighter">{t.current} <span className="text-[10px] text-txt3 font-bold">/ {t.target}</span></span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100 p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${perc}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn("h-full rounded-full shadow-sm", `bg-${p.color}`)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest text-txt hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-200">
              <Zap size={14} /> Log Data Update
            </button>
          </div>
        ))}

        {/* Action Card - Modernized */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group flex-1 flex flex-col justify-center items-center text-center">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue/20 rounded-3xl flex items-center justify-center text-blue shadow-glow mb-6 group-hover:scale-110 transition-transform cursor-pointer">
                <Users size={40} />
              </div>
              <h3 className="text-[24px] font-black mb-3 tracking-tight">Household Census</h3>
              <p className="text-[14px] opacity-60 mb-8 max-w-[200px] font-medium leading-relaxed italic">
                Capture community vitals directly on the edge.
              </p>
              <button className="px-10 py-4 bg-blue text-white rounded-2xl font-black text-[15px] shadow-lg shadow-blue/20 hover:bg-blue-d active:scale-95 transition-all">
                Launch Survey Node
              </button>
            </div>
            
            {/* Design flair */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
