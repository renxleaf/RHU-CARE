import React from 'react';
import { FilePieChart, Download, Filter, Calendar, Users, Activity, TrendingUp } from 'lucide-react';
import { QueueItem, Patient } from '../types';

interface FhsisPageProps {
  queueItems: QueueItem[];
  patients: Patient[];
}

export default function FhsisPage({ queueItems, patients }: FhsisPageProps) {
  const servedCount = queueItems.length;
  const totalPatients = patients.length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 italic">Reporting Engine</div>
          <h1 className="text-[28px] font-black tracking-tighter text-slate-900 uppercase">FHSIS Analytics</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-outline border-slate-200 text-slate-600 bg-white shadow-sm flex items-center gap-2">
            <Filter size={14} /> Filter
          </button>
          <button className="btn btn-sm btn-p bg-blue text-white shadow-lg shadow-blue/20 flex items-center gap-2">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <FhsisStat label="Total Consultations" value={servedCount} icon={<Users size={16} />} delta="+12%" />
        <FhsisStat label="Health Center Attendance" value="88%" icon={<Activity size={16} />} delta="Normal" />
        <FhsisStat label="Maternal Coverage" value="94%" icon={<TrendingUp size={16} />} delta="Target Met" color="green" />
        <FhsisStat label="Child Immunization" value="82%" icon={<TrendingUp size={16} />} delta="-3%" color="amber" />
      </div>

      <div className="card p-0 overflow-hidden mb-6">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-[12px] font-black uppercase tracking-tight text-slate-600">Monthly Performance Summary</h3>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <Calendar size={12} /> March 2026
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <FhsisRow label="Antenatal Care (A1)" current={42} target={50} />
            <FhsisRow label="Fully Immunized Children (I1)" current={31} target={45} />
            <FhsisRow label="Hypertension Control (H1)" current={128} target={150} />
            <FhsisRow label="Diabetes Management (D1)" current={56} target={60} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] text-slate-500 italic">
        <p>* All reports are compatible with the DOH Field Health Services Information System (FHSIS) Version 2026.</p>
        <p className="md:text-right">Last synchronized with provincial server: 2 mins ago</p>
      </div>
    </div>
  );
}

function FhsisStat({ label, value, icon, delta, color = 'blue' }: any) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-txt3 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-[20px] font-black text-slate-900">{value}</div>
        <div className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${
          color === 'green' ? 'bg-green-50 text-green-600' : 
          color === 'amber' ? 'bg-amber-50 text-amber-600' : 
          'bg-blue-50 text-blue-600'
        }`}>
          {delta}
        </div>
      </div>
    </div>
  );
}

function FhsisRow({ label, current, target }: any) {
  const percent = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-[13px] font-bold text-slate-700">{label}</div>
        <div className="text-[12px] font-black text-slate-900">{current} / {target}</div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-green-500' : percent > 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
