import { Phone, MapPin, Clock, Info, Activity, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Role } from '../types';

const FACS = [
  { name: 'Calauan Rural Health Unit', loc: 'Calauan, Laguna', type: 'RHU', hours: 'Mon–Fri 7AM–5PM', contact: '(049) 555-0142', services: 'OPD, Prenatal, Immunization, TB DOTS, Family Planning', av: 'bg-blue-l text-blue' },
  { name: 'Calauan BHS — Dayap', loc: 'Brgy. Dayap, Calauan', type: 'Barangay Health Station', hours: 'Mon–Sat 8AM–5PM', contact: '(049) 555-0101', services: 'Primary Care, Maternal, Immunization', av: 'bg-green-l text-green' },
  { name: 'Calauan BHS — Lamot', loc: 'Brgy. Lamot, Calauan', type: 'Barangay Health Station', hours: 'Mon–Fri 8AM–5PM', contact: '(049) 555-0102', services: 'Primary Care, TB DOTS, Family Planning', av: 'bg-teal-l text-teal' },
  { name: 'Calauan BHS — Mabacan', loc: 'Brgy. Mabacan, Calauan', type: 'Barangay Health Station', hours: 'Mon–Sat 8AM–5PM', contact: '(049) 555-0103', services: 'Primary Care, Dental, Child Health', av: 'bg-indigo-l text-indigo' },
  { name: 'Laguna Provincial Hospital', loc: 'Sta. Cruz, Laguna', type: 'Provincial Hospital', hours: '24/7', contact: '(049) 555-0001', services: 'Emergency, Surgery, Obstetrics, ICU, Blood Bank', av: 'bg-red-l text-red' },
  { name: 'San Pablo City General Hospital', loc: 'San Pablo, Laguna', type: 'General Hospital', hours: '24/7', contact: '(049) 562-4000', services: 'Emergency, Surgery, Radiology, Oncology', av: 'bg-amber-l text-amber' },
  { name: 'Philippine General Hospital', loc: 'Manila', type: 'National Tertiary', hours: '24/7', contact: '(02) 8554-8400', services: 'All specialties, Trauma, ICU, Oncology', av: 'bg-purple-l text-purple' },
  { name: 'Batangas Medical Center', loc: 'Batangas City', type: 'Public Tertiary', hours: '24/7', contact: '(043) 723-0165', services: 'Specialized Surgery, Oncology, Renal Care', av: 'bg-sky-l text-sky' },
  { name: 'Calamba Doctors Hospital', loc: 'Calamba, Laguna', type: 'Private General', hours: '24/7', contact: '(049) 545-0000', services: 'OPD, ER, Laboratory, Imaging', av: 'bg-rose-l text-rose' },
];

interface FacilitiesProps {
  currentRole: Role;
}

export default function Facilities({ currentRole }: FacilitiesProps) {
  const isPatient = currentRole === 'patient';

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-[28px] font-black tracking-tight text-txt uppercase">Health Facility Network</h2>
          <p className="text-[14px] text-txt2 font-medium">Distributed Care Points · Calauan Laguna Referral Path</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {FACS.map((f, i) => (
          <div 
            key={i} 
            className="card flex flex-col justify-between group overflow-hidden relative"
          >
            {/* Top Bar for status */}
            <div className={cn(
              "absolute top-0 left-0 right-0 h-1",
              f.hours === '24/7' ? "bg-green" : "bg-blue"
            )} />

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-[16px] font-black shrink-0 shadow-sm", f.av)}>
                  {f.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                {f.hours === '24/7' && (
                  <span className="flex items-center gap-1 text-[9px] font-black bg-green-l text-green px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    <Activity size={10} /> Emergency Ready
                  </span>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-[18px] font-black text-txt leading-tight group-hover:text-blue transition-colors">{f.name}</h3>
                <div className="flex items-center gap-1.5 text-[12px] text-txt2 font-medium mt-1">
                  <MapPin size={14} className="text-blue" />
                  <span>{f.loc}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 my-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-txt2">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-txt3 uppercase tracking-widest">Operation Hours</div>
                    <div className="text-[13px] font-bold text-txt">{f.hours}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-txt2">
                    <Phone size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-txt3 uppercase tracking-widest">Clinical Contact</div>
                    <div className="text-[13px] font-bold text-txt">{f.contact}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                <div className="text-[10px] font-black text-txt3 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-blue" /> Specialized Services
                </div>
                <p className="text-[12px] text-txt font-medium leading-relaxed">{f.services}</p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <a 
                href={`tel:${f.contact.replace(/[^0-9]/g, '')}`} 
                className="btn btn-sm flex-1 flex items-center justify-center gap-2 hover:bg-blue hover:text-white transition-colors"
              >
                <Phone size={14} /> Call Hub
              </a>
              {!isPatient && (
                <button className="btn btn-p btn-sm flex-1">Issue Referral</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
