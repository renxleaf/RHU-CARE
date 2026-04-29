import React from 'react';
import { Home, Users, Heart, Shield, Activity, Droplets, Baby, Zap, CheckCircle2 } from 'lucide-react';
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <h2 className="text-[24px] font-black text-slate-900 tracking-tight leading-none">Barangay Outreach & DOH Programs</h2>
        <p className="text-[14px] text-slate-500 font-medium mt-2">Community monitoring and public health program management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((p) => (
          <div key={p.id} className="card group hover:shadow-xl hover:shadow-slate-200/50 transition-all border-l-4" style={{ borderLeftColor: `var(--${p.color})` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `bg-${p.color}-50 text-${p.color}`)}>
                {p.icon}
              </div>
              <h3 className="text-[16px] font-black text-slate-900 leading-tight">{p.title}</h3>
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
              {p.description}
            </p>

            <div className="space-y-4 border-t border-slate-50 pt-4">
              {p.tracking.map((t, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">{t.label}</span>
                    <span className="text-slate-900">{t.current} / {t.target}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", `bg-${p.color}`)}
                      style={{ width: `${(parseFloat(t.current as string) / parseFloat(t.target as string)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50 hover:text-blue hover:border-blue/20 transition-all flex items-center justify-center gap-2">
              <Zap size={14} /> Update Stats
            </button>
          </div>
        ))}

        {/* Action Card */}
        <div className="flex flex-col gap-4">
          <div className="card bg-green shadow-lg shadow-green/20 border-green text-white flex-1 flex flex-col justify-center items-center text-center p-8">
            <Users size={48} className="mb-4 text-green-100" />
            <h3 className="text-[20px] font-black mb-2">Household Survey</h3>
            <p className="text-[14px] opacity-80 mb-6">Record and update health records for the upcoming community visit.</p>
            <button className="w-full bg-white text-green py-4 rounded-2xl font-black text-[15px] shadow-lg">Start New Survey</button>
          </div>
        </div>
      </div>
    </div>
  );
}
