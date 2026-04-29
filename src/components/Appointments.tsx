import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, Edit2, Trash2, ShieldCheck, Info, Search, ChevronRight } from 'lucide-react';
import { SURNAMES, FIRST_NAMES } from '../lib/commonData';
import { Appointment, Role, Profile, Patient } from '../types';
import { cn, todayKey, uid, pst, fmtDate, fmtShort } from '../lib/utils';
import { MAX_PER_SLOT } from '../constants';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';

interface AppointmentsProps {
  appointments: {
    data: Appointment[];
    addItem: (item: Appointment) => void;
    updateItem: (id: string, updates: Partial<Appointment>) => void;
    removeItem: (id: string) => void;
    loading: boolean;
  };
  patients: {
    data: Patient[];
  };
  addToast: (msg: string, type?: 'g' | 'r' | 'b' | 'a') => void;
  isBookingOnly?: boolean;
  currentRole?: Role;
  profile?: Profile;
  isGuest?: boolean;
}

export default function Appointments({ appointments, patients, addToast, isBookingOnly, currentRole, profile, isGuest }: AppointmentsProps) {
  const isPatient = currentRole === 'patient';
  const today = todayKey();

  // 1. All Hooks Must Be At The Top
  const [isBookModalOpen, setIsBookModalOpen] = useState(isBookingOnly || false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [editStatus, setEditStatus] = useState<Appointment['status'] | null>(null);
  const [name, setName] = useState(isPatient ? (profile?.name || '') : '');
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const availableSlots = [
    '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  const isSlotAvailable = (d: string, t: string) => {
    const count = appointments.data.filter(a => a.date === d && a.time === t && a.status !== 'Cancelled').length;
    const now = pst();
    const todayStr = todayKey();
    if (d < todayStr) return { available: false, count, isPast: true };
    if (d === todayStr) {
      const [hStr, mStrPart] = t.split(':');
      const [mStr, ampm] = mStrPart.split(' ');
      let h = parseInt(hStr);
      const m = parseInt(mStr);
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      if (h < currentH || (h === currentH && m <= currentM)) {
        return { available: false, count, isPast: true };
      }
    }
    return { available: count < MAX_PER_SLOT, count, isPast: false };
  };

  const getFirstAvailable = (d: string) => {
    return availableSlots.find(t => isSlotAvailable(d, t).available) || '7:00 AM';
  };

  const [time, setTime] = useState(() => getFirstAvailable(today));
  const [type, setType] = useState('General Check-up (Konsulta)');
  const [facility, setFacility] = useState('Calauan RHU, Laguna');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (selectedAppt) {
      setEditStatus(selectedAppt.status);
    }
  }, [selectedAppt]);

  React.useEffect(() => {
    setTime(getFirstAvailable(date));
  }, [date]);

  React.useEffect(() => {
    if (appointments.loading || currentRole === 'patient') return;
    const isSeeded = localStorage.getItem('rhucare_seeded_v3');
    if (isSeeded) return;

    if (appointments.data.length === 0) {
      const demoAppts: Appointment[] = [
        { id: uid(), name: 'Morales, Lourdes', date: today, time: '8:00 AM', type: 'Hypertension / BP Check', facility: 'Calauan RHU, Laguna', status: 'Confirmed', bookedAt: new Date().toISOString(), bookedBy: 'System' },
        { id: uid(), name: 'Reyes, Jose', date: today, time: '9:30 AM', type: 'General Check-up (Konsulta)', facility: 'Calauan RHU, Laguna', status: 'Scheduled', bookedAt: new Date().toISOString(), bookedBy: 'System' },
        { id: uid(), name: 'Dela Cruz, Reynaldo', date: today, time: '10:30 AM', type: 'Diabetes / Sugar Check', facility: 'Calauan RHU, Laguna', status: 'Scheduled', bookedAt: new Date().toISOString(), bookedBy: 'System' },
        { id: uid(), name: 'Garcia, Elena', date: today, time: '1:30 PM', type: 'Prenatal Check-up (Buntis)', facility: 'Calauan RHU, Laguna', status: 'Confirmed', bookedAt: new Date().toISOString(), bookedBy: 'System' },
      ];
      demoAppts.forEach(a => appointments.addItem(a));
    }
  }, [appointments.loading, currentRole, today]);

  // 2. Early Returns
  if (appointments.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-[14px] text-txt2 font-medium">Syncing with RHU Cloud...</p>
      </div>
    );
  }

  const sorted = [...appointments.data]
    .filter(a => a.status !== 'Cancelled')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
  
  // For patients, only show their own appointments (strictly by name match for this demo)
  const myAppts = isPatient 
    ? sorted.filter(a => {
        const targetName = isGuest ? name : (profile?.name || '');
        if (!targetName || targetName.length < 2) return false;
        return a.name.toLowerCase().includes(targetName.toLowerCase());
      })
    : sorted;

  const todayAppts = myAppts.filter(a => a.date === today);
  const futureAppts = myAppts.filter(a => a.date > today).slice(0, 10);

  const handleBook = () => {
    if (!name) {
      addToast('Enter patient name', 'r');
      return;
    }
    const avail = isSlotAvailable(date, time);
    if (!avail.available) {
      if (avail.isPast) {
        addToast('Cannot book an appointment in the past', 'r');
      } else {
        addToast('Selected time slot is already full', 'r');
      }
      return;
    }
    appointments.addItem({
      id: uid(),
      name,
      date,
      time,
      type,
      facility,
      notes,
      status: 'Scheduled',
      bookedAt: new Date().toISOString(),
      bookedBy: isPatient ? 'Self' : 'Nurse Reyes'
    });
    if (!isPatient) setName(''); 
    setNotes('');
    setIsBookModalOpen(false);
    addToast(`Appointment confirmed for ${name} ✓`, 'g');
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    appointments.updateItem(id, { status });
    setIsEditModalOpen(false);
    setEditStatus(null);
    addToast('Status updated successfully ✓', 'g');
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Appointment',
      message: `Are you sure you want to delete the appointment for ${name}?`,
      onConfirm: () => {
        appointments.removeItem(id);
        setIsEditModalOpen(false);
        addToast('Appointment deleted', 'r');
      }
    });
  };

  if (isBookingOnly || isPatient) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <h2 className="text-[24px] font-black text-slate-900 tracking-tight">
            {isPatient ? 'My Health Appointments' : 'Book Appointment'}
          </h2>
          <p className="text-[14px] text-slate-500 font-medium">
            {isPatient ? 'Manage your visits to Calauan RHU' : 'Real-time Cloud Sync · No internet needed'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="card h-fit">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">New Booking</h3>
                <p className="text-[12px] text-slate-500">Select your preferred schedule</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="form-group relative">
                <label className="form-label">Patient Name</label>
                <input 
                  className="form-input" 
                  placeholder="Last name, First name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  readOnly={isPatient && !isGuest}
                  autoComplete="off"
                />
                {!isPatient && name.length >= 2 && (
                  <div className="absolute top-[100%] left-0 right-0 z-[60] bg-white border border-border rounded-xl shadow-sh-md mt-1 overflow-hidden">
                    {/* Primary suggestions from patient db */}
                    {patients.data
                      .filter(p => p.name.toLowerCase().includes(name.toLowerCase()))
                      .slice(0, 4)
                      .map(p => (
                        <button 
                          key={p.id}
                          onClick={() => setName(p.name)}
                          className="w-full px-4 py-3 text-left hover:bg-bg border-b border-border last:border-0 flex items-center justify-between group"
                        >
                          <div>
                            <div className="text-[14px] font-bold text-slate-900 group-hover:text-blue">{p.name}</div>
                            <div className="text-[11px] text-txt2">{p.age}y · {p.philhealth}</div>
                          </div>
                          <Search size={14} className="text-blue opacity-50" />
                        </button>
                      ))
                    }
                    {/* Common names if matches are few */}
                    {patients.data.filter(p => p.name.toLowerCase().includes(name.toLowerCase())).length < 2 && 
                      SURNAMES.filter(s => s.toLowerCase().includes(name.toLowerCase())).slice(0, 3).map(s => (
                        <button 
                          key={s}
                          onClick={() => setName(`${s}, `)}
                          className="w-full px-4 py-2 text-left hover:bg-bg border-b border-border last:border-0 text-[13px] text-txt2 italic"
                        >
                          Suggested: {s}, [First Name]
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} min={todayKey()} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <select className="form-input" value={time} onChange={e => setTime(e.target.value)}>
                    {availableSlots.map(t => {
                      const { available, isPast } = isSlotAvailable(date, t);
                      return (
                        <option key={t} value={t} disabled={!available}>
                          {t} {isPast ? '(Passed)' : available ? '(Available)' : '(Full)'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason for Visit</label>
                <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
                  <option>General Check-up (Konsulta)</option>
                  <option>Follow-up Visit (Balik-Konsulta)</option>
                  <option>Vaccination (Bakuna)</option>
                  <option>Prenatal Check-up (Buntis)</option>
                  <option>Diabetes / Sugar Check</option>
                  <option>Hypertension / BP Check</option>
                  <option>TB DOTS / Cough Check</option>
                  <option>Family Planning</option>
                  <option>Dental Check-up</option>
                  <option>Emergency / Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Health Facility</label>
                <select className="form-input" value={facility} onChange={e => setFacility(e.target.value)}>
                  <option>Calauan RHU, Laguna</option>
                  <option>Calauan BHS — Dayap</option>
                  <option>Calauan BHS — Lamot</option>
                  <option>Calauan BHS — Mabacan</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-input" rows={3} placeholder="Describe symptoms or reason..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <button className="btn btn-p w-full py-4 text-[15px] font-bold shadow-lg shadow-blue/20" onClick={handleBook}>
                Confirm Appointment ✓
              </button>
            </div>
          </div>

          {/* My Appointments List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-slate-900">
                {isPatient ? 'My Schedule' : 'Recent Bookings'}
              </h3>
              <span className="text-[12px] font-bold text-blue bg-blue-50 px-2 py-1 rounded-md">
                {myAppts.length} Total
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {isGuest && !name && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
                  <CalendarIcon className="mx-auto text-blue-300 mb-3" size={32} />
                  <p className="text-[14px] text-blue-700 font-bold tracking-tight">Search your schedule</p>
                  <p className="text-[12px] text-blue-600/70 mt-1">Enter your name in the booking form to see your existing appointments.</p>
                </div>
              )}
              {myAppts.length === 0 && (isGuest ? name.length >= 2 : true) ? (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center">
                  <CalendarIcon className="mx-auto text-slate-300 mb-3" size={32} />
                  <p className="text-[14px] text-slate-500 font-medium">
                    {isGuest && name.length >= 2 ? `No appointments found for "${name}"` : 'No appointments found.'}
                  </p>
                  <p className="text-[12px] text-slate-400">Your scheduled visits will appear here.</p>
                </div>
              ) : (
                myAppts.map(appt => (
                  <ApptItem 
                    key={appt.id} 
                    appt={appt} 
                    showDate 
                    onClick={() => { setSelectedAppt(appt); setIsEditModalOpen(true); }} 
                    isPatient={isPatient}
                  />
                ))
              )}
            </div>

            {isPatient && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                <Info className="text-amber-600 shrink-0" size={18} />
                <p className="text-[12px] text-amber-800 leading-relaxed">
                  <strong>Note:</strong> Please arrive at least 15 minutes before your scheduled time. Bring your PhilHealth ID or any valid government ID.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal for Patients (Cancel only) */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Appointment Details"
          subtitle={`${selectedAppt?.type} · ${selectedAppt?.facility}`}
          footer={
            <>
              <button className="btn btn-d flex-1" onClick={() => selectedAppt && handleDelete(selectedAppt.id, selectedAppt.name)}>
                {isPatient ? 'Cancel Appointment' : 'Delete'}
              </button>
              <button className="btn flex-1" onClick={() => setIsEditModalOpen(false)}>Close</button>
              {!isPatient && (
                <button 
                  className="btn btn-p flex-1 shadow-lg shadow-blue/20" 
                  onClick={() => selectedAppt && editStatus && handleUpdateStatus(selectedAppt.id, editStatus)}
                >
                  Apply Update ✓
                </button>
              )}
            </>
          }
        >
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</div>
                <div className="text-[14px] font-bold text-slate-900">{selectedAppt ? fmtShort(new Date(selectedAppt.date + 'T00:00:00')) : ''}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</div>
                <div className="text-[14px] font-bold text-blue">{selectedAppt?.time}</div>
              </div>
            </div>
            
            {isPatient ? (
              <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Status</div>
                  <div className="text-[16px] font-black text-blue">{selectedAppt?.status}</div>
                </div>
                <ShieldCheck className="text-blue-200" size={32} />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label mb-3">Action: Update Patient Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Scheduled', 'Confirmed', 'Waiting', 'In Progress', 'Done', 'No-show', 'Cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => setEditStatus(s as any)}
                      className={cn(
                        "px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all text-center",
                        editStatus === s 
                          ? "bg-blue text-white border-blue shadow-lg shadow-blue/20 scale-[1.02]" 
                          : "bg-panel2 text-txt3 border-border hover:border-blue/30 hover:text-blue"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedAppt?.notes && (
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</div>
                <div className="text-[13px] text-slate-600 italic">"{selectedAppt.notes}"</div>
              </div>
            )}
          </div>
        </Modal>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-[28px] font-black tracking-tight text-txt uppercase">Clinical Scheduler</h2>
          <p className="text-[14px] text-txt2 font-medium">{fmtDate(pst())} · Sync: Edge Node Calauan</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-sidebar text-white rounded-xl font-bold shadow-lg shadow-sidebar/20 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-panel border border-border rounded-2xl shadow-sh-md overflow-hidden bg-white">
            <div className="p-6 border-b border-border bg-slate-50/50">
              <h3 className="text-[18px] font-black text-txt tracking-tight uppercase flex items-center gap-2">
                Today's Registry
                <span className="text-[10px] bg-blue text-white px-2 py-0.5 rounded-full font-black animate-pulse">LIVE</span>
              </h3>
            </div>
            
            <div className="divide-y divide-border">
              {todayAppts.map(appt => (
                <div 
                  key={appt.id} 
                  className="p-5 hover:bg-slate-50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center bg-blue-l rounded-xl p-2 min-w-[70px] border border-blue-m">
                      <Clock size={16} className="text-blue mb-1" />
                      <span className="text-[13px] font-black text-blue tabular-nums">{appt.time}</span>
                    </div>
                    <div>
                      <div className="text-[16px] font-bold text-txt group-hover:text-blue transition-colors">{appt.name}</div>
                      <div className="flex items-center gap-2 text-[12px] text-txt2 font-medium">
                        <span>{appt.type}</span>
                        <span>•</span>
                        <span className="opacity-70">{appt.facility}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                      appt.status === 'In Progress' ? "bg-blue-l border-blue-m text-blue" : 
                      (appt.status === 'Done' || appt.status === 'Confirmed') ? "bg-green-l border-green-m text-green" : "bg-amber-l border-amber-m text-amber"
                    )}>
                      {appt.status}
                    </span>
                    <button 
                      onClick={() => { setSelectedAppt(appt); setIsEditModalOpen(true); }} 
                      className="p-2 text-txt3 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              
              {todayAppts.length === 0 && (
                <div className="p-20 flex flex-col items-center justify-center text-center opacity-30">
                  <CalendarIcon size={48} className="mb-4" />
                  <p className="text-[16px] font-bold">No Appointments Today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-panel border border-border rounded-2xl shadow-sh-md overflow-hidden bg-white">
            <div className="p-6 border-b border-border bg-slate-50/50">
              <h3 className="text-[15px] font-black text-txt tracking-tight uppercase">Upcoming (10 Days)</h3>
            </div>
            
            <div className="divide-y divide-border">
              {futureAppts.map(appt => (
                <button 
                  key={appt.id} 
                  onClick={() => { setSelectedAppt(appt); setIsEditModalOpen(true); }}
                  className="w-full p-4 hover:bg-slate-50 transition-all flex flex-col items-start gap-1 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-black text-blue uppercase tracking-tighter">
                      {fmtShort(new Date(appt.date + 'T00:00:00'))} @ {appt.time}
                    </span>
                    <ChevronRight size={14} className="text-txt3 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-[14px] font-bold text-txt line-clamp-1">{appt.name}</div>
                  <div className="text-[11px] text-txt2 font-medium line-clamp-1">{appt.type}</div>
                </button>
              ))}
              
              {futureAppts.length === 0 && (
                <div className="p-10 flex flex-col items-center justify-center text-center opacity-30">
                  <p className="text-[13px] font-bold">Empty Queue</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-sidebar rounded-2xl p-6 text-white shadow-xl flex flex-col gap-4">
            <ShieldCheck size={32} className="text-blue-300" />
            <div>
              <h4 className="text-[16px] font-black uppercase tracking-tight">Security Protocol</h4>
              <p className="text-[12px] opacity-70 mt-1">All data is encrypted at rest and stored locally. RA 10173 Audit in effect.</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-[11px] font-medium leading-relaxed italic">
              "Privacy means people know what they're signing up for, in plain English and repeatedly."
            </div>
          </div>
        </div>
      </div>

      {/* Book Modal */}
      <Modal 
        isOpen={isBookModalOpen} 
        onClose={() => setIsBookModalOpen(false)} 
        title="Book Appointment"
        footer={
          <>
            <button className="btn flex-1" onClick={() => setIsBookModalOpen(false)}>Cancel</button>
            <button className="btn btn-p flex-1" onClick={handleBook}>Save ✓</button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <div className="form-group">
            <label className="form-label">Patient name</label>
            <input className="form-input" placeholder="Last name, First name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} min={todayKey()} />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <select className="form-input" value={time} onChange={e => setTime(e.target.value)}>
                {availableSlots.map(t => {
                  const { available, isPast } = isSlotAvailable(date, t);
                  return (
                    <option key={t} value={t} disabled={!available}>
                      {t} {isPast ? '(Passed)' : available ? '(Available)' : '(Full)'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Visit type</label>
            <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
              <option>General Check-up (Konsulta)</option>
              <option>Follow-up Visit (Balik-Konsulta)</option>
              <option>Vaccination (Bakuna)</option>
              <option>Prenatal Check-up (Buntis)</option>
              <option>Diabetes / Sugar Check</option>
              <option>Hypertension / BP Check</option>
              <option>TB DOTS / Cough Check</option>
              <option>Family Planning</option>
              <option>Dental Check-up</option>
              <option>Emergency / Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Facility</label>
            <select className="form-input" value={facility} onChange={e => setFacility(e.target.value)}>
              <option>Calauan RHU, Laguna</option>
              <option>Calauan BHS — Dayap</option>
              <option>Calauan BHS — Lamot</option>
              <option>Calauan BHS — Mabacan</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Appointment"
        subtitle={`${selectedAppt?.name} · ${selectedAppt?.type}`}
        footer={
          <>
            {currentRole !== 'bhw' && (
              <button className="btn btn-d btn-sm" onClick={() => selectedAppt && handleDelete(selectedAppt.id, selectedAppt.name)}>Delete</button>
            )}
            <button className="btn flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button 
              className="btn btn-p flex-1 shadow-lg shadow-blue/20" 
              onClick={() => selectedAppt && editStatus && handleUpdateStatus(selectedAppt.id, editStatus)}
            >
              Confirm Update ✓
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label mb-3">Select Status Pathway</label>
          <div className="grid grid-cols-2 gap-2">
            {['Scheduled', 'Confirmed', 'Waiting', 'In Progress', 'Done', 'No-show', 'Cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setEditStatus(s as any)}
                className={cn(
                  "px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all text-center",
                  editStatus === s 
                    ? "bg-blue text-white border-blue shadow-lg shadow-blue/20 scale-[1.02]" 
                    : "bg-panel2 text-txt3 border-border hover:border-blue/30 hover:text-blue"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
}

const ApptItem: React.FC<{ appt: Appointment; showDate?: boolean; onClick: () => void; isPatient?: boolean }> = ({ appt, showDate, onClick, isPatient }) => {
  return (
    <div className="bg-panel border border-border rounded-r-lg p-3 shadow-sh flex items-center gap-2.5">
      <div className="min-w-[56px] text-center">
        <div className="text-[13px] font-bold text-blue tabular-nums">{appt.time}</div>
        {showDate && <div className="text-[10px] text-txt2">{fmtShort(new Date(appt.date + 'T00:00:00'))}</div>}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-bold">{appt.name}</div>
        <div className="text-[11px] text-txt2">{appt.type} {appt.facility && `· ${appt.facility}`}</div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={cn(
          "chip text-[10px]",
          appt.status === 'In Progress' ? "bg-blue-l border-blue-m text-blue" : 
          (appt.status === 'Done' || appt.status === 'Confirmed') ? "bg-green-l border-green-m text-green" : "bg-amber-l border-amber-m text-amber"
        )}>
          {appt.status}
        </span>
        {!isPatient && (
          <button className="btn btn-sm" onClick={onClick}><Edit2 size={12} /></button>
        )}
      </div>
    </div>
  );
}
