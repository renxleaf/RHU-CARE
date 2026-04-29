import { Phone, MapPin, Clock, Info } from 'lucide-react';
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2 className="text-[18px] font-bold">Health Facilities</h2>
        <p className="text-[13px] text-txt2">Referral network · Calauan Laguna · Barangay Health Stations</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {FACS.map((f, i) => (
          <div key={i} className="bg-panel border border-border rounded-r-lg p-3.5 shadow-sh">
            <div className="flex items-center gap-2.5 mb-2">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0", f.av)}>
                {f.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="text-[14px] font-bold text-txt leading-tight">{f.name}</div>
                <div className="text-[11px] text-txt2 leading-tight">{f.loc}</div>
              </div>
            </div>
            <span className="chip bg-blue-l border-blue-m text-blue text-[10px] mb-2">{f.type}</span>
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="text-[12px] text-txt2 flex items-center gap-2">
                <Clock size={12} className="shrink-0" /> <strong>Hours:</strong> {f.hours}
              </div>
              <div className="text-[12px] text-txt2 flex items-center gap-2">
                <Phone size={12} className="shrink-0" /> <strong>Contact:</strong> {f.contact}
              </div>
              <div className="text-[12px] text-txt2 flex items-start gap-2">
                <Info size={12} className="shrink-0 mt-0.5" /> 
                <span><strong>Services:</strong> {f.services}</span>
              </div>
            </div>
            
            {!isPatient && (
              <div className="flex gap-2 mt-3.5">
                <button className="btn btn-p btn-sm flex-1">Refer Patient</button>
                <a 
                  href={`tel:${f.contact.replace(/[^0-9]/g, '')}`} 
                  className="btn btn-sm flex-1 flex items-center justify-center gap-2"
                >
                  <Phone size={14} /> Call
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
