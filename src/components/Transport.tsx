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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2 className="text-[18px] font-bold">Patient Transport</h2>
        <p className="text-[13px] text-txt2">Request & track · Referral tickets</p>
      </div>

      <div className="bg-panel border border-border rounded-r-lg shadow-sh overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-txt">Active Transport Tickets</h2>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-p" disabled={isPatient}>
            <Plus size={16} /> New Request
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg border-b border-border">
                <th className="p-4 px-6 text-[11px] font-bold text-txt2 uppercase tracking-wider">Patient & Route</th>
                <th className="p-4 px-6 text-[11px] font-bold text-txt2 uppercase tracking-wider">Urgency</th>
                <th className="p-4 px-6 text-[11px] font-bold text-txt2 uppercase tracking-wider">Status</th>
                <th className="p-4 px-6 text-[11px] font-bold text-txt2 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.map(t => (
                <tr key={t.id} className="border-b border-panel2 hover:bg-bg/50 transition-colors">
                  <td className="p-4 px-6">
                    <div className="text-[14px] font-semibold text-txt">{t.patient}</div>
                    <div className="text-[12px] text-txt2 flex items-center gap-1.5 mt-0.5">
                      {t.from} → {t.to}
                    </div>
                  </td>
                  <td className="p-4 px-6">
                    <span className={cn(
                      "chip",
                      t.urgency.includes('Emergency') ? "bg-red-l text-red border-red-m" :
                      t.urgency.includes('Urgent') ? "bg-amber-l text-amber border-amber-m" : "bg-blue-l text-blue border-blue-m"
                    )}>
                      {t.urgency.split('—')[0].trim()}
                    </span>
                  </td>
                  <td className="p-4 px-6">
                    <div className="text-[13px] font-medium text-txt">{t.status}</div>
                    <div className="text-[11px] text-txt3">{t.requestedAt}</div>
                  </td>
                  <td className="p-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleGenerateReferral(t)} className="p-2 text-blue hover:bg-blue-l rounded-md transition-colors disabled:opacity-30" title="Generate Referral" disabled={isPatient}>
                        <FileText size={18} />
                      </button>
                      {t.status === 'Requested' && (
                        <button onClick={() => handleUpdate(t.id, 'En Route')} className="btn btn-sm btn-p" disabled={isPatient}>Dispatch</button>
                      )}
                      {t.status === 'En Route' && (
                        <button onClick={() => handleUpdate(t.id, 'Arrived')} className="btn btn-sm btn-s" disabled={isPatient}>Arrived</button>
                      )}
                      <button onClick={() => handleUpdate(t.id, 'Cancelled')} className="p-2 text-txt3 hover:text-red rounded-md transition-colors disabled:opacity-0" disabled={isPatient}>
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {active.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-txt3 italic">No active transport requests</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Request Transport"
        footer={
          <>
            <button className="btn flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-p flex-1" onClick={handleSubmit}>Submit ✓</button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <div className="form-group">
            <label className="form-label">Patient name</label>
            <input className="form-input" placeholder="Patient name or queue number" value={patient} onChange={e => setPatient(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">From</label>
            <select className="form-input" value={from} onChange={e => setFrom(e.target.value)}>
              <option>Calauan Rural Health Unit</option>
              <option>Calauan BHS — Dayap</option>
              <option>Calauan BHS — Lamot</option>
              <option>Patient's home / barangay</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">To (destination)</label>
            <select className="form-input" value={to} onChange={e => setTo(e.target.value)}>
              <option>Laguna Provincial Hospital, Sta. Cruz</option>
              <option>San Pablo City General Hospital</option>
              <option>Calamba Doctors Hospital</option>
              <option>Philippine General Hospital, Manila</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Urgency</label>
            <select className="form-input" value={urgency} onChange={e => setUrgency(e.target.value)}>
              <option>Emergency — immediate dispatch</option>
              <option>Urgent — within 2 hours</option>
              <option>Routine — scheduled</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Clinical notes</label>
            <textarea className="form-input" rows={2} placeholder="Diagnosis, vitals, reason..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
