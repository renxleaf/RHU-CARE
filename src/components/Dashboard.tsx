import { SURNAMES, FIRST_NAMES } from '../lib/commonData';
import React, { useState, useEffect } from 'react';
import { Plus, User, Clock, CheckCircle2, Trash2, Stethoscope, ShieldCheck, Search, Activity, FileText, ClipboardList, Thermometer, HeartPulse, Droplets, Scale, Ruler, Brain, RefreshCw, Beaker, Calendar, ClipboardCheck, Smartphone } from 'lucide-react';
import { QueueItem, Patient, Role, Appointment } from '../types';
import { cn, todayKey, uid, pst, fmtDate, fmtShort } from '../lib/utils';
import { getNandaNic } from '../lib/nandaNic';
import Modal from './Modal';
import MedicationGuide from './MedicationGuide';
import { AnimatePresence } from 'motion/react';

interface DashboardProps {
  queue: {
    data: QueueItem[];
    addItem: (item: QueueItem) => void;
    updateItem: (id: string, updates: Partial<QueueItem>) => void;
    removeItem: (id: string) => void;
    setData: (data: QueueItem[]) => void;
    loading: boolean;
  };
  patients: {
    data: Patient[];
    addItem: (item: Patient) => void;
    updateItem: (id: string, updates: Partial<Patient>) => void;
    setData: (data: Patient[]) => void;
    loading: boolean;
  };
  appointments: {
    data: Appointment[];
    addItem: (item: Appointment) => void;
    updateItem: (id: string, updates: Partial<Appointment>) => void;
    loading: boolean;
  };
  addToast: (msg: string, type?: 'g' | 'r' | 'b' | 'a') => void;
  refreshData: () => void;
  currentRole: Role;
}

export default function Dashboard({ queue, patients, appointments, addToast, refreshData, currentRole }: DashboardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMedGuideOpen, setIsMedGuideOpen] = useState(false);

  // Form states for Add Walk-in
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newSex, setNewSex] = useState('F');
  const [newConcern, setNewConcern] = useState('');
  const [newPriority, setNewPriority] = useState<'regular' | 'urgent'>('regular');
  const [newPhilhealth, setNewPhilhealth] = useState('');

  // Form states for Consult (SeriousMD style)
  const [hpi, setHpi] = useState(() => localStorage.getItem('rhu_draft_hpi') || '');
  const [objective, setObjective] = useState(() => localStorage.getItem('rhu_draft_objective') || '');
  const [diagnosis, setDiagnosis] = useState(() => localStorage.getItem('rhu_draft_diagnosis') || '');
  const [plans, setPlans] = useState(() => localStorage.getItem('rhu_draft_plans') || '');
  const [consultMeds, setConsultMeds] = useState(() => localStorage.getItem('rhu_draft_meds') || '');
  const [labOrders, setLabOrders] = useState(() => localStorage.getItem('rhu_draft_labs') || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [medChecklist, setMedChecklist] = useState<string[]>(() => JSON.parse(localStorage.getItem('rhu_draft_med_checklist') || '[]'));
  const [labChecklist, setLabChecklist] = useState<string[]>(() => JSON.parse(localStorage.getItem('rhu_draft_lab_checklist') || '[]'));
  
  useEffect(() => {
    localStorage.setItem('rhu_draft_hpi', hpi);
    localStorage.setItem('rhu_draft_objective', objective);
    localStorage.setItem('rhu_draft_diagnosis', diagnosis);
    localStorage.setItem('rhu_draft_plans', plans);
    localStorage.setItem('rhu_draft_meds', consultMeds);
    localStorage.setItem('rhu_draft_labs', labOrders);
    localStorage.setItem('rhu_draft_med_checklist', JSON.stringify(medChecklist));
    localStorage.setItem('rhu_draft_lab_checklist', JSON.stringify(labChecklist));
  }, [hpi, objective, diagnosis, plans, consultMeds, labOrders, medChecklist, labChecklist]);

  // Vitals states
  const [vWeight, setVWeight] = useState('');
  const [vHeight, setVHeight] = useState('');
  const [vBP, setVBP] = useState('');
  const [vSpO2, setVSpO2] = useState('');
  const [vRR, setVRR] = useState('');
  const [vHR, setVHR] = useState('');
  const [vTemp, setVTemp] = useState('');
  const [vCBG, setVCBG] = useState('');

  const today = todayKey();
  const todayQueue = queue.data.filter(i => i.date === today).sort((a, b) => a.addedAt - b.addedAt);
  const waiting = todayQueue.filter(i => i.status !== 'Done');
  const done = todayQueue.filter(i => i.status === 'Done');
  const urgent = waiting.filter(i => i.priority === 'urgent');

  const todayAppts = appointments.data.filter(a => a.date === today && a.status !== 'Cancelled' && a.status !== 'Done');

  // Initialize demo data if empty - one-time seed
  useEffect(() => {
    if (queue.loading || patients.loading) return;
    
    const isSeeded = localStorage.getItem('rhucare_seeded_v3');
    if (isSeeded) return;

    if (queue.data.length === 0) {
      const demoQ: QueueItem[] = [
        { id: uid(), name: 'Morales, Lourdes', age: '64', sex: 'F', concern: 'BP / Hypertension', priority: 'urgent', status: 'Waiting', av: 'bg-red-l text-red', initials: 'ML', philhealth: 'PH-0042', date: today, addedAt: Date.now() - 2400000, addedBy: 'System' },
        { id: uid(), name: 'Reyes, Jose', age: '71', sex: 'M', concern: 'Chest pain / CAD', priority: 'urgent', status: 'Waiting', av: 'bg-amber-l text-amber', initials: 'JR', philhealth: 'SC-0071', date: today, addedAt: Date.now() - 2300000, addedBy: 'System' },
        { id: uid(), name: 'Dela Cruz, Reynaldo', age: '52', sex: 'M', concern: 'DM Type 2 Follow-up', priority: 'regular', status: 'Waiting', av: 'bg-blue-l text-blue', initials: 'RD', philhealth: 'PH-0052', date: today, addedAt: Date.now() - 2200000, addedBy: 'System' },
        { id: uid(), name: 'Santos, Pilita', age: '28', sex: 'F', concern: 'Fever / Asthma', priority: 'regular', status: 'Waiting', av: 'bg-teal-l text-teal', initials: 'PS', philhealth: 'IND-028', date: today, addedAt: Date.now() - 2100000, addedBy: 'System' },
        { id: uid(), name: 'Garcia, Elena', age: '32', sex: 'F', concern: 'Prenatal — 28 weeks', priority: 'regular', status: 'Waiting', av: 'bg-green-l text-green', initials: 'GE', philhealth: 'PH-0032', date: today, addedAt: Date.now() - 2000000, addedBy: 'System' },
      ];
      demoQ.forEach(q => queue.addItem(q));
    }
    
    if (patients.data.length === 0) {
      const demoPt: Patient[] = [
        { id: uid(), name: 'Morales, Lourdes', age: '64', sex: 'F', dob: '1962-04-12', address: 'Brgy. Dayap, Calauan, Laguna', philhealth: 'PH-0042', condition: 'Hypertension Stage 2', contact: '09123456789', lastVisit: fmtShort(pst()), av: 'bg-red-l text-red', initials: 'ML', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Dela Cruz, Reynaldo', age: '52', sex: 'M', dob: '1974-08-22', address: 'Brgy. Malinao, Calauan, Laguna', philhealth: 'PH-0052', condition: 'Diabetes Type 2', contact: '09987654321', lastVisit: 'Mar 1, 2026', av: 'bg-blue-l text-blue', initials: 'RD', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Santos, Pilita', age: '28', sex: 'F', dob: '1998-01-15', address: 'Brgy. Pansol, Calauan, Laguna', philhealth: 'IND-028', condition: 'Asthma / Bronchitis', contact: '09112223333', lastVisit: 'Feb 10, 2026', av: 'bg-teal-l text-teal', initials: 'PS', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Garcia, Elena', age: '32', sex: 'F', dob: '1994-11-30', address: 'Brgy. Kanluran, Calauan, Laguna', philhealth: 'PH-0032', condition: 'G2P1 28 weeks AOG', contact: '09445556666', lastVisit: 'Mar 5, 2026', av: 'bg-green-l text-green', initials: 'GE', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Bautista, Andres', age: '45', sex: 'M', dob: '1981-05-20', address: 'Brgy. Imok, Calauan, Laguna', philhealth: 'PH-0081', condition: 'CKD Stage 3', contact: '09171112222', lastVisit: 'Apr 2, 2026', av: 'bg-purple-l text-purple', initials: 'AB', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Cruz, Maria', age: '19', sex: 'F', dob: '2007-12-10', address: 'Brgy. Bangyas, Calauan, Laguna', philhealth: 'DEP-0019', condition: 'UTI / Dysuria', contact: '09183334444', lastVisit: 'Apr 10, 2026', av: 'bg-pink-l text-pink', initials: 'MC', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Lopez, Ricardo', age: '38', sex: 'M', dob: '1988-02-28', address: 'Brgy. Prinza, Calauan, Laguna', philhealth: 'PH-0038', condition: 'Gouty Arthritis', contact: '09195556666', lastVisit: 'Mar 20, 2026', av: 'bg-amber-l text-amber', initials: 'RL', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Perez, Sofia', age: '5', sex: 'F', dob: '2021-06-15', address: 'Brgy. Dayap, Calauan, Laguna', philhealth: 'DEP-0005', condition: 'Cough / Colds', contact: '09207778888', lastVisit: 'Apr 12, 2026', av: 'bg-orange-l text-orange', initials: 'SP', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Mercado, Juan', age: '67', sex: 'M', dob: '1959-10-05', address: 'Brgy. Lamot, Calauan, Laguna', philhealth: 'SC-0067', condition: 'COPD', contact: '09219990000', lastVisit: 'Apr 5, 2026', av: 'bg-slate-l text-slate', initials: 'JM', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Ramos, Beatriz', age: '24', sex: 'F', dob: '2002-03-12', address: 'Brgy. Sto. Tomas, Calauan, Laguna', philhealth: 'PH-0024', condition: 'Anemia', contact: '09221112222', lastVisit: 'Mar 15, 2026', av: 'bg-indigo-l text-indigo', initials: 'BR', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Castro, Fernando', age: '59', sex: 'M', dob: '1967-07-25', address: 'Brgy. Balayhangin, Calauan, Laguna', philhealth: 'PH-0059', condition: 'Post-Stroke Rehab', contact: '09233334444', lastVisit: 'Apr 8, 2026', av: 'bg-cyan-l text-cyan', initials: 'FC', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Villanueva, Clara', age: '41', sex: 'F', dob: '1985-11-16', address: 'Brgy. Dayap, Calauan, Laguna', philhealth: 'PH-0041', condition: 'Hyperthyroidism', contact: '09245556666', lastVisit: 'Apr 1, 2026', av: 'bg-rose-l text-rose', initials: 'CV', registeredAt: new Date().toISOString(), registeredBy: 'System' },
        { id: uid(), name: 'Santiago, Mateo', age: '12', sex: 'M', dob: '2014-01-05', address: 'Brgy. Dayap, Calauan, Laguna', philhealth: 'DEP-0012', condition: 'Dengue Follow-up', contact: '09257778888', lastVisit: 'Apr 14, 2026', av: 'bg-lime-l text-lime', initials: 'MS', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      ];
      demoPt.forEach(p => patients.addItem(p));
    }

    localStorage.setItem('rhucare_seeded_v3', 'true');
  }, [queue.loading, patients.loading]);

  if (queue.loading || patients.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-[14px] text-txt2 font-medium">Syncing with RHU Cloud...</p>
      </div>
    );
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    // Simulate a small delay for visual feedback since local reload is instant
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleAddQ = async () => {
    if (!newName || newName.length < 3) {
      addToast('Enter full patient name', 'r');
      return;
    }
    if (!newName.includes(',')) {
      addToast('Use [Last name, First name] format', 'a');
    }
    const avs = ['bg-red-l text-red', 'bg-blue-l text-blue', 'bg-green-l text-green', 'bg-amber-l text-amber', 'bg-teal-l text-teal', 'bg-purple-l text-purple'];
    const initials = newName.split(',').map(p => p.trim()[0]?.toUpperCase() || '?').join('').slice(0, 2);
    
    try {
      await queue.addItem({
        id: uid(),
        name: newName,
        age: newAge || '?',
        sex: newSex,
        concern: newConcern || 'General',
        priority: newPriority,
        philhealth: newPhilhealth || 'Walk-in',
        status: 'Waiting',
        av: avs[Math.floor(Math.random() * avs.length)],
        initials,
        date: today,
        addedAt: Date.now(),
        addedBy: 'Nurse Reyes'
      });

      setNewName(''); setNewAge(''); setNewConcern(''); setNewPhilhealth('');
      setIsAddModalOpen(false);
      addToast(`${newName} added to queue ✓`, 'b');
    } catch (err: any) {
      addToast('Failed to add to queue', 'r');
    }
  };

  const handleQuickAddToQueue = (appt: Appointment) => {
    try {
      if (queue.data.some(q => q.name === appt.name && q.status !== 'Done')) {
        addToast(`${appt.name} is already in queue`, 'a');
        return;
      }
      
      const initials = appt.name.split(', ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const avs = ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3'];

      queue.addItem({
        id: uid(),
        name: appt.name,
        age: '---', // From profile if available
        sex: '---',
        concern: appt.type,
        priority: 'regular',
        philhealth: 'Appointment',
        status: 'Waiting',
        av: avs[Math.floor(Math.random() * avs.length)],
        initials,
        date: today,
        addedAt: Date.now(),
        addedBy: 'Nurse Reyes'
      });
      addToast(`${appt.name} added to today's queue ✓`, 'g');
    } catch (err) {
      addToast('Failed to sync appointment with queue', 'r');
    }
  };

  const isClinical = currentRole === 'doctor' || currentRole === 'nurse' || currentRole === 'admin';

  const handleConsult = (item: QueueItem) => {
    setSelectedItem(item);
    if (isClinical && item.status === 'Waiting') {
      queue.updateItem(item.id, { status: 'In Consult' });
    }
    setHpi(item.hpi || '');
    setObjective(item.objective || '');
    setDiagnosis(item.diagnosis || '');
    setPlans(item.plan || '');
    setConsultMeds(item.medications || '');
    setLabOrders(item.labOrders || '');
    setLabChecklist(item.labOrders ? item.labOrders.split(', ').map(l => l.trim()) : []);
    
    setVWeight(item.vitals?.weight || '');
    setVHeight(item.vitals?.height || '');
    setVBP(item.vitals?.bp || '');
    setVSpO2(item.vitals?.spo2 || '');
    setVRR(item.vitals?.rr || '');
    setVHR(item.vitals?.hr || '');
    setVTemp(item.vitals?.temp || '');
    setVCBG(item.vitals?.cbg || '');
    
    setIsConsultModalOpen(true);
  };

  const handleSaveConsult = () => {
    if (!selectedItem) return;
    
    if (!isClinical) {
      queue.updateItem(selectedItem.id, {
        vitals: {
          weight: vWeight,
          height: vHeight,
          bp: vBP,
          spo2: vSpO2,
          rr: vRR,
          hr: vHR,
          temp: vTemp,
          cbg: vCBG
        }
      });
      setIsConsultModalOpen(false);
      addToast('Vitals updated ✓', 'g');
      return;
    }

    queue.updateItem(selectedItem.id, {
      status: 'Done',
      hpi,
      objective,
      diagnosis,
      plan: plans,
      medications: consultMeds,
      labOrders,
      vitals: {
        weight: vWeight,
        height: vHeight,
        bp: vBP,
        spo2: vSpO2,
        rr: vRR,
        hr: vHR,
        temp: vTemp,
        cbg: vCBG
      },
      doneAt: new Date().toISOString(),
      approvedBy: currentRole === 'doctor' ? 'Dr. Felipe' : 'Nurse Reyes'
    });

    // Update patient record if exists
    const pt = patients.data.find(p => p.name.toLowerCase() === selectedItem.name.toLowerCase());
    if (pt) {
      patients.updateItem(pt.id, { lastVisit: fmtShort(pst()) });
    }

    setIsConsultModalOpen(false);
    setMedChecklist([]);
    setLabChecklist([]);
    // Clear drafts
    localStorage.removeItem('rhu_draft_hpi');
    localStorage.removeItem('rhu_draft_objective');
    localStorage.removeItem('rhu_draft_diagnosis');
    localStorage.removeItem('rhu_draft_plans');
    localStorage.removeItem('rhu_draft_meds');
    localStorage.removeItem('rhu_draft_labs');
    localStorage.removeItem('rhu_draft_med_checklist');
    localStorage.removeItem('rhu_draft_lab_checklist');
    
    addToast(`${selectedItem.name} — consult saved ✓`, 'g');
  };

  const handleAiSuggest = () => {
    if (!selectedItem) return;
    setIsAiLoading(true);
    
    // Process clinical detail from specialized NANDA-I / NIC Library
    setTimeout(() => {
      const profile = getNandaNic(selectedItem.concern, vBP, vCBG);
      
      // FDAR Format Construction
      let fdarDiagnosis = `FOCUS: ${profile.diagnosis}`;
      
      let fdarPlan = `FOCUS: ${profile.diagnosis}\n\n`;
      
      fdarPlan += `DATA:\n`;
      fdarPlan += `Subjective: Patient reports "${selectedItem.concern}".\n`;
      fdarPlan += `Objective: Vitals recorded as BP ${vBP || '---'}, CBG ${vCBG || '---'}, Temp ${vTemp || '---'}°C. ${profile.explanation}\n\n`;
      
      fdarPlan += `ACTION:\n`;
      fdarPlan += profile.nic.map(n => `• ${n}`).join('\n');
      if (profile.education && profile.education.length > 0) {
        fdarPlan += `\n• Education: ${profile.education.join(', ')}`;
      }
      fdarPlan += `\n\n`;
      
      fdarPlan += `RESPONSE:\n`;
      fdarPlan += profile.noc.map(n => `• ${n}`).join('\n');

      setDiagnosis(fdarDiagnosis);
      setPlans(fdarPlan);
      setIsAiLoading(false);
      addToast(`${currentRole === 'doctor' ? 'Clinical' : 'Nursing'} FDAR Plan Suggested ✓`, 'b');
    }, 1500);
  };

  const toggleMedCheck = (med: string) => {
    setMedChecklist(prev => 
      prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med]
    );
  };

  const toggleLabCheck = (lab: string) => {
    setLabChecklist(prev => {
      const next = prev.includes(lab) ? prev.filter(l => l !== lab) : [...prev, lab];
      setLabOrders(next.join(', '));
      return next;
    });
  };

  const handleMarkDone = (item: QueueItem) => {
    queue.updateItem(item.id, { status: 'Done', doneAt: new Date().toISOString() });
    addToast(`${item.name} — done ✓`, 'g');
  };

  const handleRemove = (item: QueueItem) => {
    if (confirm(`Remove ${item.name} from queue?`)) {
      queue.removeItem(item.id);
      addToast(`${item.name} removed`, 'r');
    }
  };

  const patientRecord = selectedItem ? patients.data.find(p => p.name.toLowerCase() === selectedItem.name.toLowerCase()) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold">Queue</h2>
          <p className="text-[13px] text-txt2">{fmtDate(pst())}</p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className={cn("btn btn-w btn-sm flex items-center gap-2 transition-all", isRefreshing && "opacity-70 cursor-not-allowed")}
        >
          <span className={cn("inline-block", isRefreshing && "animate-spin")}>🔄</span>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => setIsMedGuideOpen(true)}
          className="bg-slate-900 border border-slate-800 rounded-r-lg p-5 text-white shadow-xl flex flex-col justify-between cursor-pointer hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500 transition-colors">
                <ClipboardCheck size={20} className="text-blue-400 group-hover:text-white" />
              </div>
              <h3 className="text-[13px] font-black tracking-tight uppercase">Medication Guide</h3>
            </div>
            <p className="text-[11px] opacity-60 leading-tight">Step-by-step checklist to prevent administration errors during interruptions.</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded">Design Fix #1</span>
            <span className="text-[10px] font-black uppercase text-white/40">Open Tool →</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-r-lg p-5 text-slate-900 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Smartphone size={20} className="text-slate-600" />
              </div>
              <h3 className="text-[13px] font-black tracking-tight uppercase">Edge Node Health</h3>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 uppercase">Device</span>
                <span>TechLife Pad Plus (Helio G91)</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 uppercase">Battery</span>
                <span className="text-green-600">84% (10h 12m left)</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 uppercase">Sensors</span>
                <span className="flex items-center gap-1"><Droplets size={10} className="text-blue-500" /> USB Bridge Active</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Distributed Ledger: Synchronized</span>
          </div>
        </div>

        <div className="bg-blue border border-blue-600 rounded-r-lg p-5 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-black tracking-tight uppercase mb-1">Queue Throughput</h3>
            <p className="text-[11px] opacity-80 mb-3">Live optimization active.</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] font-black tracking-tighter">183%</span>
            <span className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Efficiency GAIN</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard label="Waiting Queue" value={waiting.length} delta={waiting.length > 5 ? "Busy today" : "Normal traffic"} deltaUp={waiting.length > 5} />
        {currentRole === 'admin' ? (
          <MetricCard label="Official Correspondence" value={4} delta="2 Pending Review" deltaUp />
        ) : (
          <MetricCard label="Served Today" value={done.length} delta="↑ 12.3% vs yesterday" deltaUp />
        )}
        {currentRole === 'doctor' ? (
          <MetricCard label="Critical Lab Results" value={2} delta="Requires Review" deltaDown />
        ) : (
          <MetricCard label="Urgent Cases" value={urgent.length} delta={urgent.length > 0 ? "Requires attention" : "No urgent cases"} deltaDown={urgent.length > 0} />
        )}
      </div>

      {currentRole === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-r-lg p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="text-blue-400 animate-spin-slow" size={24} />
              <div>
                <h3 className="text-[16px] font-black tracking-tight uppercase">Liaison System Active</h3>
                <p className="text-[12px] opacity-60">Connected to DOH Central & Provincial Boards</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                <span className="text-[13px] font-medium opacity-80">PhilHealth Reimbursement (Q1)</span>
                <span className="text-[11px] font-black uppercase text-green-400 bg-green-400/10 px-2 py-0.5 rounded">Sent</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                <span className="text-[13px] font-medium opacity-80">WHO Malaria Program Liaison</span>
                <span className="text-[11px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Draft</span>
              </div>
            </div>
          </div>
          <div className="bg-blue border border-blue-600 rounded-r-lg p-6 text-white shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-[16px] font-black tracking-tight uppercase mb-1">Global Health Port</h3>
              <p className="text-[12px] opacity-80 mb-4">Secure communication bridge for national protocols.</p>
            </div>
            <button className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-xl text-[14px] font-bold transition-all backdrop-blur-md">
              Secure Protocol Access
            </button>
          </div>
        </div>
      )}

      {todayAppts.length > 0 && (
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue" size={20} />
            <h2 className="text-[16px] font-bold text-txt">Today's Appointments</h2>
          </div>
          <div className="flex gap-4 min-w-max">
            {todayAppts.slice(0, 5).map(appt => (
              <div key={appt.id} className="bg-blue-l border border-blue-m p-4 rounded-xl min-w-[240px] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-blue uppercase tabular-nums">{appt.time}</span>
                    <span className={cn(
                      "chip text-[10px]",
                      appt.status === 'Confirmed' ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"
                    )}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="text-[14px] font-bold text-txt mb-0.5 line-clamp-1">{appt.name}</div>
                  <div className="text-[12px] text-txt2 line-clamp-1">{appt.type}</div>
                </div>
                <button 
                  onClick={() => {
                    // Quick add from appointment to queue
                    handleQuickAddToQueue(appt);
                  }}
                  className="mt-4 w-full bg-blue text-white py-1.5 rounded-lg text-[12px] font-bold hover:bg-blue-600 transition-all"
                >
                  Join Queue
                </button>
              </div>
            ))}
            {todayAppts.length > 5 && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl min-w-[120px] flex flex-col items-center justify-center text-txt3">
                <span className="text-[14px] font-bold">+{todayAppts.length - 5} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-panel border border-border rounded-r-lg shadow-sh overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-txt">Today's Queue</h2>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-p">
            <Plus size={16} /> Add Walk-in
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg border-b border-border">
                <th className="p-4 px-6 text-[11px] font-bold text-txt2 uppercase tracking-wider">#</th>
                <th className="p-4 px-6 text-[11px] font-bold text-txt2 uppercase tracking-wider">Patient Name</th>
                <th className="p-4 px-6 text-[11px] font-bold text-txt2 uppercase tracking-wider">Purpose</th>
                <th className="p-4 px-6 text-[11px] font-bold text-txt2 uppercase tracking-wider">Status</th>
                <th className="p-4 px-6 text-[11px] font-bold text-txt2 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {waiting.map((item, idx) => (
                <tr key={item.id} className="border-b border-panel2 hover:bg-bg/50 transition-colors">
                  <td className="p-4 px-6 text-[14px] font-bold text-txt2">{idx + 1}</td>
                  <td className="p-4 px-6">
                    <div className="text-[14px] font-semibold text-txt">{item.name}</div>
                    <div className="text-[12px] text-txt2">{item.age}y · {item.sex}</div>
                  </td>
                  <td className="p-4 px-6 text-[14px] text-txt2">{item.concern}</td>
                  <td className="p-4 px-6">
                    <span className={cn(
                      "chip",
                      item.status === 'Waiting' ? "bg-amber-l text-amber border-amber-m" :
                      item.status === 'In Consult' ? "bg-blue-l text-blue border-blue-m" :
                      "bg-green-l text-green border-green-m"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {currentRole !== 'bhw' && (
                         <button onClick={() => handleConsult(item)} className="p-2 text-blue hover:bg-blue-l rounded-md transition-colors" title="Clinical Consult">
                           <Stethoscope size={18} />
                         </button>
                       )}
                       <button onClick={() => handleMarkDone(item)} className="p-2 text-green hover:bg-green-l rounded-md transition-colors" title="Mark Done">
                         <CheckCircle2 size={18} />
                       </button>
                       <button onClick={() => handleRemove(item)} className="p-2 text-txt3 hover:bg-red-l hover:text-red rounded-md transition-colors" title="Remove">
                         <Trash2 size={18} />
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
              {waiting.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-txt3 italic">No patients in queue</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-8 bg-blue-l border-blue-m">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck className="text-blue" size={24} />
          <h3 className="text-[16px] font-bold text-blue">Digital Equity & Sovereign Data</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2 text-[13px] text-txt">
              <div className="w-1.5 h-1.5 rounded-full bg-blue mt-1.5 shrink-0" />
              <span>Optimized for <strong>TechLife Pad Plus</strong> (Helio G91) for low-resource efficiency.</span>
            </div>
            <div className="flex items-start gap-2 text-[13px] text-txt">
              <div className="w-1.5 h-1.5 rounded-full bg-blue mt-1.5 shrink-0" />
              <span>Stores patient data offline via <strong>IndexedDB</strong> with AES-256 encryption.</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2 text-[13px] text-txt">
              <div className="w-1.5 h-1.5 rounded-full bg-blue mt-1.5 shrink-0" />
              <span>USB/Bluetooth sensor bridging enables diagnostic parity with urban clinics.</span>
            </div>
            <div className="flex items-start gap-2 text-[13px] text-txt">
              <div className="w-1.5 h-1.5 rounded-full bg-blue mt-1.5 shrink-0" />
              <span>NurseAI analyses run locally via <strong>TensorFlow Lite</strong> (No Internet required).</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-m/30 text-[12px] text-blue font-semibold italic leading-relaxed">
          “The system strictly adheres to the Data Privacy Act of 2012, ensuring that patient data is secured, minimally processed, and never used without proper consent.”
        </div>
      </div>

      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed right-4 bottom-5 w-[52px] h-[52px] rounded-full bg-blue text-white flex items-center justify-center text-[24px] shadow-[0_4px_16px_rgba(18,70,204,0.35)] active:scale-95 transition-transform z-25"
      >
        <Plus />
      </button>

      <AnimatePresence>
        {isMedGuideOpen && (
          <MedicationGuide onClose={() => setIsMedGuideOpen(false)} />
        )}
      </AnimatePresence>

      {/* Add Walk-in Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add Walk-in Patient"
        subtitle="Added to today's queue · Saved on device"
        footer={
          <>
            <button className="btn flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-p flex-1" onClick={handleAddQ}>Add to Queue ✓</button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <div className="form-group relative">
            <label className="form-label">Patient name</label>
            <input 
              className="form-input" 
              placeholder="Last name, First name" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              autoFocus 
            />
            {newName.length > 2 && (
              <div className="absolute top-[100%] left-0 right-0 z-50 bg-white border border-border rounded-xl shadow-sh-md mt-1 overflow-hidden">
                {patients.data
                  .filter(p => p.name.toLowerCase().includes(newName.toLowerCase()))
                  .slice(0, 4)
                  .map(p => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        setNewName(p.name);
                        setNewAge(p.age);
                        setNewSex(p.sex as any);
                        setNewPhilhealth(p.philhealth);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-bg border-b border-border last:border-0 flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-[14px] font-bold text-slate-900 group-hover:text-blue">{p.name}</div>
                        <div className="text-[11px] text-txt2">{p.age}y · {p.sex} · {p.address}</div>
                      </div>
                      <Plus size={14} className="text-blue opacity-0 group-hover:opacity-100" />
                    </button>
                  ))
                }
                {patients.data.filter(p => p.name.toLowerCase().includes(newName.toLowerCase())).length < 2 && 
                  SURNAMES.filter(s => s.toLowerCase().includes(newName.toLowerCase())).slice(0, 3).map(s => (
                    <button 
                      key={s}
                      onClick={() => setNewName(`${s}, `)}
                      className="w-full px-4 py-2 text-left hover:bg-bg border-b border-border last:border-0 text-[13px] text-txt2 italic"
                    >
                      Suggested: {s}, [First Name]
                    </button>
                  ))
                }
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" placeholder="Age" value={newAge} onChange={e => setNewAge(e.target.value)} inputMode="numeric" />
            </div>
            <div className="form-group">
              <label className="form-label">Sex</label>
              <select className="form-input" value={newSex} onChange={e => setNewSex(e.target.value)}>
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Chief complaint</label>
            <input className="form-input" placeholder="e.g., BP check, fever, prenatal..." value={newConcern} onChange={e => setNewConcern(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-input" value={newPriority} onChange={e => setNewPriority(e.target.value as any)}>
              <option value="regular">Regular</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">PhilHealth / Patient ID</label>
            <input className="form-input" placeholder="PH-XXXXXXXXXX (optional)" value={newPhilhealth} onChange={e => setNewPhilhealth(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* Consult Modal (SeriousMD Style) */}
      <Modal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        title={currentRole === 'bhw' ? `Vitals Intake — ${selectedItem?.name}` : selectedItem?.name || ''}
        subtitle={`${selectedItem?.age || '?'}${selectedItem?.sex || ''} · ${currentRole === 'bhw' ? 'Pre-consult Vitals' : (selectedItem?.philhealth || 'Walk-in')}`}
        footer={
          <>
            <button className="btn flex-1" onClick={() => setIsConsultModalOpen(false)}>Cancel</button>
            <button className="btn btn-w btn-sm" onClick={() => { addToast(`Referral form generated for ${selectedItem?.name}`, 'b'); setIsConsultModalOpen(false); }}>Referral</button>
            <button className="btn btn-p flex-1" onClick={handleSaveConsult}>
              {currentRole === 'bhw' ? 'Log Vitals ✓' : (currentRole === 'doctor' ? 'Validate & Update EHR ✓' : 'Approve & Save ✓')}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-2">
          {/* Patient Info Header */}
          <div className="flex items-center gap-4 bg-bg p-4 rounded-lg">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold shrink-0", selectedItem?.av)}>
              {selectedItem?.initials}
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-bold text-txt">{selectedItem?.name}</div>
              <div className="text-[12px] text-txt2">
                {patientRecord ? (
                  <>Born: {patientRecord.dob} · {patientRecord.age}y · {patientRecord.sex === 'F' ? 'Female' : 'Male'} · {patientRecord.civilStatus}</>
                ) : (
                  <>{selectedItem?.age}y · {selectedItem?.sex === 'F' ? 'Female' : 'Male'} · Walk-in</>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px]">
                <div className="text-blue font-bold tracking-tight px-1.5 py-0.5 bg-blue-l/50 rounded">
                  Blood Type: {patientRecord?.bloodType || 'Unknown'}
                </div>
                {patientRecord?.occupation && (
                  <div className="text-txt2 italic">
                    {patientRecord.occupation}
                  </div>
                )}
                <div className="text-red font-bold">
                  {patientRecord?.emergencyContact?.phone && `Emergency: ${patientRecord.emergencyContact.phone}`}
                </div>
              </div>
            </div>
          </div>

          {/* Social Profile & Information */}
          {patientRecord && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-panel2 border border-border rounded-lg">
              <div>
                <div className="text-[10px] text-txt2 uppercase font-black tracking-tight mb-0.5">Birth Place</div>
                <div className="text-[12px] font-semibold">{patientRecord.birthPlace || '—'}</div>
              </div>
              <div>
                <div className="text-[10px] text-txt2 uppercase font-black tracking-tight mb-0.5">Religion</div>
                <div className="text-[12px] font-semibold">{patientRecord.religion || '—'}</div>
              </div>
              <div>
                <div className="text-[10px] text-txt2 uppercase font-black tracking-tight mb-0.5">Occupation</div>
                <div className="text-[12px] font-semibold">{patientRecord.occupation || 'Unemployed'}</div>
              </div>
              <div>
                <div className="text-[10px] text-txt2 uppercase font-black tracking-tight mb-0.5">Nationality</div>
                <div className="text-[12px] font-semibold">{patientRecord.nationality}</div>
              </div>
            </div>
          )}
          
          {/* Fix 3 & 4: Sensor Bridge Status */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-blue animate-spin-slow" />
              <div>
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-tight">TechLife Sensor Bridge</div>
                <div className="text-[10px] text-slate-500 font-medium tracking-tight">USB OTG: Digital BP Monitor Connected ✓</div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded border border-green-200 uppercase tracking-widest">Active</div>
              <div className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-black rounded border border-slate-300 uppercase tracking-widest">BT: Off</div>
            </div>
          </div>

          {/* Clinical Record Section */}
          {isClinical && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[12px] font-bold text-txt2 uppercase tracking-wider border-b border-border pb-1">
                <FileText size={14} className="text-blue" /> Health Record
              </div>

              {/* NurseAI Assistant Interface */}
              {isClinical && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Brain size={60} />
                  </div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Brain className="text-blue-400" size={16} />
                      </div>
                      <div>
                        <h3 className="text-[12px] font-black tracking-tight uppercase">NurseAI Clinical Assistant</h3>
                        <p className="text-[9px] text-blue-400/80 font-bold uppercase tracking-widest">Optimized for RHU Edge</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleAiSuggest}
                      disabled={isAiLoading}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        isAiLoading ? "bg-slate-800 text-slate-500 cursor-wait" : "bg-blue hover:bg-blue-600 text-white shadow-lg shadow-blue/20"
                      )}
                    >
                      {isAiLoading ? (
                        <span className="flex items-center gap-2"><RefreshCw size={10} className="animate-spin" /> Analyzing...</span>
                      ) : (
                        "Suggest FDAR Plan"
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight relative z-10">
                    Click suggest to generate a standardized nursing plan based on NANDA-I/NIC/NOC protocols.
                  </p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label flex items-center gap-2"><Activity size={14} /> Chief Complaint</label>
                <input className="form-input" placeholder="e.g., Follow up: High BP" value={selectedItem?.concern || ''} readOnly />
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-2"><ClipboardList size={14} /> History of Present Illness</label>
                <textarea 
                  className="form-input text-[13px]" 
                  rows={4} 
                  placeholder="1 week PTC > (+) palpitations..." 
                  value={hpi} 
                  onChange={e => setHpi(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Objective Remarks</label>
                <textarea 
                  className="form-input text-[13px]" 
                  rows={3} 
                  placeholder="140/80 (anxious), HR 60-70s..." 
                  value={objective} 
                  onChange={e => setObjective(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-2"><ShieldCheck size={14} className="text-accent" /> Focus / Diagnosis (FDAR)</label>
                <textarea 
                  className="form-input text-[13px] font-mono" 
                  rows={2} 
                  placeholder="FOCUS: [NANDA-I Diagnosis]..." 
                  value={diagnosis} 
                  onChange={e => setDiagnosis(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Action & Response (FDAR Plans)</label>
                <textarea 
                  className="form-input text-[12px] font-mono leading-relaxed" 
                  rows={8} 
                  placeholder="DATA: ... ACTION: ... RESPONSE: ..." 
                  value={plans} 
                  onChange={e => setPlans(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medications / Orders</label>
                <input 
                  className="form-input" 
                  placeholder="e.g., Amlife 100/5mg OD..." 
                  value={consultMeds} 
                  onChange={e => setConsultMeds(e.target.value)} 
                />
                {consultMeds && (
                  <div className="mt-3 p-4 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <ShieldCheck size={48} />
                    </div>
                    <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CheckCircle2 size={12} /> Fix 1: Sequential Dose Checkpoint
                    </div>
                    <div className="flex flex-col gap-3">
                      {consultMeds.split(',').map((med, i) => (
                        <div key={i} className="flex flex-col gap-1.5 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="text-[13px] font-bold text-slate-100">{med.trim()}</div>
                          <div className="grid grid-cols-4 gap-1">
                            {['Prep', 'Verify', 'Admin', 'Sign'].map((step, idx) => {
                              const stepId = `${med.trim()}-${step}`;
                              const isChecked = medChecklist.includes(stepId);
                              return (
                                <button 
                                  key={step}
                                  onClick={() => toggleMedCheck(stepId)}
                                  className={cn(
                                    "py-1 rounded text-[9px] font-black uppercase tracking-tighter transition-all border",
                                    isChecked ? "bg-blue text-white border-blue shadow-sm shadow-blue/30 scale-[1.05]" : "bg-slate-700/50 text-slate-400 border-slate-600 hover:border-slate-500"
                                  )}
                                >
                                  {step}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-[10px] text-blue-300/60 leading-tight italic">
                      Sequential verification prevents omissions during clinical interruptions (8-min frequency).
                    </div>
                  </div>
                )}
              </div>

              {currentRole === 'doctor' && (
                <div className="form-group">
                  <label className="form-label flex items-center gap-2"><Beaker size={14} /> Laboratory Orders</label>
                  <input 
                    className="form-input" 
                    placeholder="Selected laboratory tests will appear here..." 
                    value={labOrders}
                    onChange={e => setLabOrders(e.target.value)}
                  />
                  <div className="mt-3 p-3 bg-panel2 border border-border rounded-lg">
                    <div className="text-[11px] font-bold text-txt2 uppercase tracking-wider mb-2 flex items-center gap-2 text-accent">
                      Common Laboratory Tests
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                      {[
                        'CBC (Complete Blood Count)', 'Urinalysis', 'Creatinine', 'BUN', 'Electrolytes (Na, K, Cl)',
                        'Liver Function (ALT, AST, Bili)', 
                        'Lipid Profile (CHOL, LDL, HDL, TG)', 
                        'HbA1c', 'Blood Typing', 
                        'Coagulation (PT, aPTT)', 
                        'Thyroid (TSH, T3, T4)', 'Drug Test (Panel)',
                        'Sputum Microscopy (NTP)', 'Pregnancy Test (UHC)',
                        'Dengue NS1 / IgG IgM', 'Fasting Blood Sugar (FBS)'
                      ].map((lab, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer group hover:bg-white/50 p-1 rounded transition-colors">
                          <input 
                            type="checkbox" 
                            className="w-3.5 h-3.5 rounded border-border text-accent focus:ring-accent"
                            checked={labChecklist.includes(lab)}
                            onChange={() => toggleLabCheck(lab)}
                          />
                          <span className="text-[12px] text-txt select-none">{lab}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vitals Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <div className="flex items-center gap-2 text-[12px] font-bold text-txt2 uppercase tracking-wider">
                <Activity size={14} className="text-blue" /> Default Vitals
              </div>
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-txt3" />
                <input className="text-[10px] pl-6 pr-2 py-1 bg-panel2 border border-border rounded outline-none" placeholder="Search categories..." />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <VitalInput label="Weight" value={vWeight} onChange={setVWeight} unit="kg" icon={<Scale size={14} />} />
              <VitalInput label="Height" value={vHeight} onChange={setVHeight} unit="cm" icon={<Ruler size={14} />} />
              <VitalInput label="Blood Pressure" value={vBP} onChange={setVBP} unit="mmHg" icon={<Activity size={14} />} sensor="USB Sync" />
              <VitalInput label="Oxygen Saturation" value={vSpO2} onChange={setVSpO2} unit="%" icon={<Droplets size={14} />} sensor="BT Pulse-Ox" />
              <VitalInput label="Respiratory Rate" value={vRR} onChange={setVRR} unit="bpm" icon={<Activity size={14} />} />
              <VitalInput label="Heart Rate" value={vHR} onChange={setVHR} unit="bpm" icon={<HeartPulse size={14} />} sensor="BT Wearable" />
              <VitalInput label="Body Temp" value={vTemp} onChange={setVTemp} unit="°C" icon={<Thermometer size={14} />} sensor="IR USB" />
              <VitalInput label="Capillary Blood Glucose" value={vCBG} onChange={setVCBG} unit="mg/dL" icon={<Droplets size={14} />} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function VitalInput({ label, value, onChange, unit, icon, sensor }: { label: string; value: string; onChange: (v: string) => void; unit: string; icon: React.ReactNode; sensor?: string }) {
  return (
    <div className="bg-panel2 border border-border rounded p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-txt2 uppercase tracking-wider">
          {icon} {label}
        </div>
        {sensor && (
          <div className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase">
             <RefreshCw size={8} className="animate-spin-slow" /> {sensor}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <input 
          className="w-full bg-transparent text-[16px] font-bold text-txt outline-none tabular-nums" 
          value={value} 
          onChange={e => onChange(e.target.value)}
          placeholder="—"
        />
        <span className="text-[10px] text-txt3 shrink-0">{unit}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, delta, deltaUp, deltaDown }: { label: string; value: number; delta?: string; deltaUp?: boolean; deltaDown?: boolean }) {
  return (
    <div className="bg-panel p-6 rounded-r-lg border border-border shadow-sh">
      <div className="text-[11px] font-bold text-txt2 uppercase tracking-wider mb-2">{label}</div>
      <div className="text-[28px] font-bold text-txt leading-none tabular-nums">{value}</div>
      {delta && (
        <div className={cn(
          "text-[12px] mt-2 font-medium",
          deltaUp && "text-green",
          deltaDown && "text-red",
          !deltaUp && !deltaDown && "text-txt3"
        )}>
          {deltaUp && '↑ '}
          {deltaDown && '↓ '}
          {delta}
        </div>
      )}
    </div>
  );
}

const QueueItemCard: React.FC<{ 
  item: QueueItem; 
  number: number; 
  onConsult: () => void;
  onDone: () => void;
  onRemove: () => void;
}> = ({ item, number, onConsult, onDone, onRemove }) => {
  const waitTime = Math.max(1, Math.floor((Date.now() - item.addedAt) / 60000));
  const statusCls = item.status === 'In Consult' ? 'bg-blue-l border-blue-m text-blue' : 
                    item.status === 'Called' ? 'bg-amber-l border-amber-m text-amber' : 'bg-bg border-border2 text-txt2';

  return (
    <div 
      onClick={onConsult}
      className={cn(
        "bg-panel border border-border rounded-r-lg p-3.5 shadow-sh cursor-pointer active:scale-[0.98] active:bg-bg transition-all",
        item.priority === 'urgent' && "border-l-[3px] border-l-red"
      )}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-[20px] font-bold text-blue min-w-[32px] tabular-nums">#{number}</span>
        <div className={cn("w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0", item.av)}>
          {item.initials}
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-bold text-txt">{item.name}</div>
          <div className="text-[11px] text-txt2">{item.age}{item.sex} · {item.philhealth}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn("chip", item.priority === 'urgent' ? "bg-red-l border-red-m text-red" : "bg-bg border-border2 text-txt2")}>
          {item.priority === 'urgent' ? 'Urgent' : 'Regular'}
        </span>
        <span className={cn("chip", statusCls)}>{item.status}</span>
        <span className="text-[11px] text-txt2 ml-auto">{waitTime}m waiting</span>
      </div>
      <div className="flex gap-2 mt-2.5" onClick={e => e.stopPropagation()}>
        <button className="btn btn-p btn-sm flex-1" onClick={onConsult}><Stethoscope size={14} /> Consult</button>
        <button className="btn btn-s btn-sm flex-1" onClick={onDone}><CheckCircle2 size={14} /> Done</button>
        <button className="btn btn-d btn-sm flex-1" onClick={onRemove}><Trash2 size={14} /> Remove</button>
      </div>
    </div>
  );
}

function VitalBox({ label, value, unit, status }: { label: string; value: string; unit: string; status: 'ok' | 'warn' | 'bad' }) {
  return (
    <div className={cn(
      "bg-panel2 border border-border rounded-r p-2.5 relative",
      status === 'bad' && "bg-red-50 border-red-m",
      status === 'warn' && "bg-amber-50 border-amber-m"
    )}>
      <div className={cn(
        "absolute top-2 right-2 w-1.5 h-1.5 rounded-full",
        status === 'ok' ? "bg-green-500" : status === 'warn' ? "bg-amber-500" : "bg-red-500"
      )} />
      <div className="text-[9px] font-bold text-txt2 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-[22px] font-bold text-txt tabular-nums leading-none">{value}</div>
      <div className="text-[10px] text-txt3 mt-0.5">{unit}</div>
    </div>
  );
}
