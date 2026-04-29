import React, { useState } from 'react';
import { Plus, Truck, MapPin, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { TransportTicket, Profile } from '../types';
import { cn, uid, pst, fmtTime } from '../lib/utils';
import Modal from './Modal';

interface TransportProps {
  transport: {
    data: TransportTicket[];
    addItem: (item: TransportTicket) => void;
    updateItem: (id: string, updates: Partial<TransportTicket>) => void;
    removeItem: (id: string) => void;
    loading: boolean;
  };
  addToast: (msg: string, type?: 'g' | 'r' | 'b' | 'a') => void;
  profile: Profile;
  currentRole: string;
}

export default function Transport({ transport, addToast, profile, currentRole }: TransportProps) {
  const isPatient = currentRole === 'patient';
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patient, setPatient] = useState('');
  const [from, setFrom] = useState('Calauan Rural Health Unit');
  const [to, setTo] = useState('Laguna Provincial Hospital, Sta. Cruz');
  const [urgency, setUrgency] = useState('Emergency — immediate dispatch');
  const [notes, setNotes] = useState('');

  if (transport.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-[14px] text-txt2 font-medium">Syncing with RHU Cloud...</p>
      </div>
    );
  }

  // Initialize demo data if empty
  React.useEffect(() => {
    if (transport.loading) return;
    if (transport.data.length === 0) {
      const demoTickets: TransportTicket[] = [
        { id: uid(), patient: 'Morales, Lourdes', from: 'Calauan Rural Health Unit', to: 'Laguna Provincial Hospital, Sta. Cruz', urgency: 'Emergency — immediate dispatch', notes: 'Hypertensive crisis, BP 190/110', status: 'En Route', requestedAt: '08:15 AM', requestedBy: 'Nurse Reyes' },
        { id: uid(), patient: 'Dela Cruz, Reynaldo', from: 'Calauan Rural Health Unit', to: 'San Pablo City General Hospital', urgency: 'Urgent — within 2 hours', notes: 'Severe hyperglycemia, CBG 450', status: 'Requested', requestedAt: '09:45 AM', requestedBy: 'Nurse Reyes' },
      ];
      demoTickets.forEach(t => transport.addItem(t));
    }
  }, [transport.loading]);

  const active = transport.data.filter(t => t.status !== 'Arrived' && t.status !== 'Cancelled');

  const handleSubmit = () => {
    if (!patient) {
      addToast('Enter patient name', 'r');
      return;
    }
    transport.addItem({
      id: uid(),
      patient,
      from,
      to,
      urgency,
      notes,
      status: 'Requested',
      requestedAt: fmtTime(pst()),
      requestedBy: profile.name
    });
    setPatient(''); setNotes('');
    setIsAddModalOpen(false);
    addToast(`Transport requested for ${patient} ✓`, 'b');
  };

  const handleUpdate = (id: string, status: TransportTicket['status']) => {
    transport.updateItem(id, { status, updatedAt: new Date().toISOString() });
    addToast(`Transport ${status.toLowerCase()} ✓`, status === 'Arrived' ? 'g' : 'b');
  };

  const handleGenerateReferral = (t: TransportTicket) => {
    addToast(`Referral form generated for ${t.patient} ✓`, 'g');
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-[28px] font-black tracking-tight text-txt uppercase italic">Ambulance Fleet & Logistics</h2>
          <p className="text-[14px] text-txt2 font-medium">Inter-facility Referral Tracking · Calauan Network Loop</p>
        </div>
        {!isPatient && (
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="px-6 py-3 bg-red text-white rounded-xl font-bold hover:shadow-lg shadow-red/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Request Dispatch
          </button>
        )}
      </div>

      <div className="bg-panel border border-border rounded-2xl shadow-sh-md overflow-hidden bg-white">
        <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Truck className="text-blue" size={20} />
            <h3 className="text-[16px] font-black text-txt tracking-tight uppercase">Active Logistics Pipeline</h3>
          </div>
          <div className="text-[12px] font-bold text-txt2">
            {active.length} active dispatches
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="p-5 px-8 text-[11px] font-black text-txt3 uppercase tracking-widest">Incident & Route</th>
                <th className="p-5 px-8 text-[11px] font-black text-txt3 uppercase tracking-widest">Classification</th>
                <th className="p-5 px-8 text-[11px] font-black text-txt3 uppercase tracking-widest">Phase</th>
                <th className="p-5 px-8 text-[11px] font-black text-txt3 uppercase tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {active.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-6 px-8">
                    <div className="text-[15px] font-black text-txt group-hover:text-blue transition-colors">{t.patient}</div>
                    <div className="text-[12px] text-txt2 font-medium flex items-center gap-2 mt-1.5 bg-slate-100/50 w-fit px-2 py-0.5 rounded-lg border border-slate-200">
                      <MapPin size={12} className="text-blue" />
                      {t.from} <span className="text-txt3">→</span> {t.to}
                    </div>
                  </td>
                  <td className="p-6 px-8">
                    <span className={cn(
                      "chip text-[9px] px-2 py-0.5",
                      t.urgency.includes('Emergency') ? "bg-red text-white border-red" :
                      t.urgency.includes('Urgent') ? "bg-amber-l text-amber border-amber-m" : "bg-blue-l text-blue border-blue-m"
                    )}>
                      {t.urgency.split('—')[0].trim()}
                    </span>
                    <div className="text-[11px] text-txt3 mt-2 font-medium tracking-tight">Requested by: {t.requestedBy}</div>
                  </td>
                  <td className="p-6 px-8">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          t.status === 'Requested' ? "bg-amber animate-pulse" :
                          t.status === 'En Route' ? "bg-blue animate-pulse" : "bg-green"
                        )} />
                        <span className="text-[13px] font-black text-txt uppercase tracking-tight">{t.status}</span>
                      </div>
                      <div className="text-[11px] text-txt3 font-bold flex items-center gap-1.5">
                        <Clock size={12} /> {t.requestedAt}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleGenerateReferral(t)} 
                        className="p-2.5 text-blue hover:bg-blue/5 rounded-xl border border-transparent hover:border-blue/20 transition-all shadow-sm"
                        title="Generate Referral"
                        disabled={isPatient}
                      >
                        <FileText size={20} />
                      </button>
                      
                      {t.status === 'Requested' && (
                        <button 
                          onClick={() => handleUpdate(t.id, 'En Route')} 
                          className="px-5 py-2.5 bg-sidebar text-white rounded-xl text-[12px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-sidebar/10"
                          disabled={isPatient}
                        >
                          Dispatch Unit
                        </button>
                      )}
                      
                      {t.status === 'En Route' && (
                        <button 
                          onClick={() => handleUpdate(t.id, 'Arrived')} 
                          className="px-5 py-2.5 bg-green text-white rounded-xl text-[12px] font-bold hover:bg-green-700 transition-all shadow-lg shadow-green/10"
                          disabled={isPatient}
                        >
                          Confirm Arrival
                        </button>
                      )}

                      <button 
                        onClick={() => handleUpdate(t.id, 'Cancelled')} 
                        className="p-2.5 text-txt3 hover:text-red hover:bg-red/5 rounded-xl border border-transparent hover:border-red/20 transition-all"
                        disabled={isPatient}
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {active.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Truck size={48} />
                      <p className="text-[16px] font-black uppercase tracking-widest">Fleet Idle · No active dispatches</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Emergency Referral Request"
        footer={
          <div className="flex gap-4 w-full">
            <button className="flex-1 px-6 py-3 border border-border rounded-xl font-bold text-txt" onClick={() => setIsAddModalOpen(false)}>Abort Request</button>
            <button className="flex-1 px-6 py-3 bg-red text-white rounded-xl font-bold shadow-lg shadow-red/20 active:scale-95" onClick={handleSubmit}>Authorize Dispatch ✓</button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 p-2">
          <div className="form-group">
            <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Patient Global ID</label>
            <input className="form-input" placeholder="Patient name or node UUID" value={patient} onChange={e => setPatient(e.target.value)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Origin Node</label>
              <select className="form-input" value={from} onChange={e => setFrom(e.target.value)}>
                <option>Calauan Rural Health Unit</option>
                <option>Calauan BHS — Dayap</option>
                <option>Calauan BHS — Lamot</option>
                <option>Patient's home / barangay</option>
              </select>
            </div>
            <div className="form-group">
              <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Destination Hub</label>
              <select className="form-input" value={to} onChange={e => setTo(e.target.value)}>
                <option>Laguna Provincial Hospital, Sta. Cruz</option>
                <option>San Pablo City General Hospital</option>
                <option>Calamba Doctors Hospital</option>
                <option>Philippine General Hospital, Manila</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Dispatch Urgency</label>
            <select className="form-input text-red font-bold" value={urgency} onChange={e => setUrgency(e.target.value)}>
              <option>Emergency — immediate dispatch</option>
              <option>Urgent — within 2 hours</option>
              <option>Routine — scheduled</option>
            </select>
          </div>

          <div className="form-group">
            <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Logistical & Clinical Notes</label>
            <textarea 
              className="form-input" 
              rows={3} 
              placeholder="Clinical baseline, vitals, mobility status..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
