import { SURNAMES, FIRST_NAMES } from '../lib/commonData';
import React, { useState, useEffect } from 'react';
import { Plus, User, Clock, CheckCircle2, Trash2, Stethoscope, ShieldCheck, Search, Activity, FileText, ClipboardList, Thermometer, HeartPulse, Droplets, Scale, Ruler, Brain, RefreshCw, Beaker, Calendar, ClipboardCheck, Smartphone, Users } from 'lucide-react';
import { QueueItem, Patient, Role, Appointment, Profile } from '../types';
import { cn, todayKey, uid, pst, fmtDate, fmtShort, fmtTime } from '../lib/utils';
import { getNandaNic } from '../lib/nandaNic';
import Modal from './Modal';
import MedicationGuide from './MedicationGuide';
import ConfirmModal from './ConfirmModal';
import { AnimatePresence, motion } from 'motion/react';

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
  profile: Profile;
}

export default function Dashboard({ queue, patients, appointments, addToast, refreshData, currentRole, profile }: DashboardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMedGuideOpen, setIsMedGuideOpen] = useState(false);
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
  const [medicalSummary, setMedicalSummary] = useState(() => localStorage.getItem('rhu_draft_summary') || '');
  const [consultMeds, setConsultMeds] = useState(() => localStorage.getItem('rhu_draft_meds') || '');
  const [labOrders, setLabOrders] = useState(() => localStorage.getItem('rhu_draft_labs') || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [medChecklist, setMedChecklist] = useState<string[]>(() => JSON.parse(localStorage.getItem('rhu_draft_med_checklist') || '[]'));
  const [labChecklist, setLabChecklist] = useState<string[]>(() => JSON.parse(localStorage.getItem('rhu_draft_lab_checklist') || '[]'));
  
  useEffect(() => {
    localStorage.setItem('rhu_draft_hpi', hpi);
    localStorage.setItem('rhu_draft_objective', objective);
    localStorage.setItem('rhu_draft_diagnosis', diagnosis);
    localStorage.setItem('rhu_draft_plans', plans);
    localStorage.setItem('rhu_draft_summary', medicalSummary);
    localStorage.setItem('rhu_draft_meds', consultMeds);
    localStorage.setItem('rhu_draft_labs', labOrders);
    localStorage.setItem('rhu_draft_med_checklist', JSON.stringify(medChecklist));
    localStorage.setItem('rhu_draft_lab_checklist', JSON.stringify(labChecklist));
  }, [hpi, objective, diagnosis, plans, medicalSummary, consultMeds, labOrders, medChecklist, labChecklist]);

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
  const waiting = queue.data
    .filter(i => i.status !== 'Done')
    .sort((a, b) => {
      // Priority first, then by time added
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return a.addedAt - b.addedAt;
    });
  
  const done = queue.data.filter(i => i.status === 'Done' && i.date === today);
  const urgent = waiting.filter(i => i.priority === 'urgent');

  const todayAppts = appointments.data.filter(a => a.date === today && a.status !== 'Cancelled' && a.status !== 'Done');

  // Initialize demo data if empty - one-time seed
  useEffect(() => {
    if (queue.loading || patients.loading) return;
    
    const isSeeded = localStorage.getItem('rhucare_seeded_v4');
    if (isSeeded) return;

    if (queue.data.length === 0) {
      const demoQ: QueueItem[] = [
        { id: uid(), name: 'Dela Cruz, Ricardo P.', age: '58', sex: 'M', concern: 'BP (160/100) / Dizziness', priority: 'urgent', status: 'Waiting', av: 'bg-blue-l text-blue', initials: 'RD', philhealth: '12-004567890-1', date: today, addedAt: Date.now() - 3600000, addedBy: 'System' },
        { id: uid(), name: 'Santos, Maria Theresa L.', age: '42', sex: 'F', concern: 'Heavy Uterine Bleeding / Pale', priority: 'urgent', status: 'Waiting', av: 'bg-purple-l text-purple', initials: 'MS', philhealth: '01-234567890-3', date: today, addedAt: Date.now() - 3000000, addedBy: 'System' },
        { id: uid(), name: 'Villanueva, Clara M.', age: '34', sex: 'F', concern: 'Prenatal / Elevated BP', priority: 'urgent', status: 'Waiting', av: 'bg-rose-l text-rose', initials: 'CV', philhealth: '56-789012345-7', date: today, addedAt: Date.now() - 2400000, addedBy: 'System' },
        { id: uid(), name: 'Garcia, Mateo S.', age: '8', sex: 'M', concern: 'Shortness of breath / Cough', priority: 'regular', status: 'In Consult', av: 'bg-teal-l text-teal', initials: 'MG', philhealth: '23-456789012-4', date: today, addedAt: Date.now() - 1800000, addedBy: 'System' },
        { id: uid(), name: 'Mendoza, Julian C.', age: '29', sex: 'M', concern: 'Diarrhea / Abdominal Pain', priority: 'regular', status: 'Waiting', av: 'bg-green-l text-green', initials: 'JM', philhealth: '45-678901234-6', date: today, addedAt: Date.now() - 1200000, addedBy: 'System' },
        { id: uid(), name: 'Lopez, Sofia V.', age: '15', sex: 'F', concern: 'Burning urination / UTI', priority: 'regular', status: 'Waiting', av: 'bg-indigo-l text-indigo', initials: 'SL', philhealth: '78-901234567-9', date: today, addedAt: Date.now() - 600000, addedBy: 'System' },
        { id: uid(), name: 'Reyes, Elena B.', age: '65', sex: 'F', concern: 'Joint Pain / Prescription Refill', priority: 'regular', status: 'Waiting', av: 'bg-amber-l text-amber', initials: 'ER', philhealth: '34-567890123-5', date: today, addedAt: Date.now() - 300000, addedBy: 'System' },
      ];
      demoQ.forEach(q => queue.addItem(q));
    }
    
    // REDUNDANT SEEDING REMOVED - Handled by App.tsx

    localStorage.setItem('rhucare_seeded_v4', 'true');
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
  const canRegister = isClinical || currentRole === 'bhw';

  const handleConsult = (item: QueueItem) => {
    setSelectedItem(item);
    if ((isClinical || currentRole === 'bhw') && item.status === 'Waiting') {
      queue.updateItem(item.id, { status: 'In Consult' });
    }
    setHpi(item.hpi || '');
    setObjective(item.objective || '');
    setDiagnosis(item.diagnosis || '');
    setPlans(item.plan || '');
    setMedicalSummary(item.medicalSummary || '');
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
      medicalSummary,
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

  const handleAiSummarize = () => {
    if (!hpi && !objective && !diagnosis) {
      addToast('Enter notes to summarize', 'a');
      return;
    }
    setIsSummarizing(true);
    setTimeout(() => {
      let summary = `CASE SUMMARY:\n`;
      summary += `• CC: ${selectedItem?.concern || 'N/A'}\n`;
      if (hpi) summary += `• Findings: ${hpi.slice(0, 50)}${hpi.length > 50 ? '...' : ''}\n`;
      if (objective) summary += `• Vitals: BP ${vBP || '--'}, Temp ${vTemp || '--'}\n`;
      if (diagnosis) summary += `• DX: ${diagnosis}\n`;
      summary += `• Assessment: Patient presents with clinical markers consistent with primary complaint. Interventions initiated.`;
      
      setMedicalSummary(summary);
      setIsSummarizing(false);
      addToast('Medical notes summarized ✓', 'b');
    }, 1200);
  };

  const handleAiSuggest = () => {
    if (!selectedItem) return;
    setIsAiLoading(true);
    
    // Process clinical detail from specialized Knowledge Engine
    setTimeout(() => {
      const profile = getNandaNic(selectedItem.concern, vBP, vCBG, vTemp);
      const isDoctor = currentRole === 'doctor';
      
      // Clinical Identity
      let clinicalTitle = isDoctor ? 'DoctorAI Diagnostics Engine' : 'NurseAI Clinical Co-Pilot';
      let diagnosisHeader = isDoctor ? `ICD-11: ${profile.icdCode} (${profile.icdTitle})` : `FOCUS: ${profile.icdCode} (${profile.icdTitle}) — ${profile.diagnosis}`;
      
      if (isDoctor) {
        setDiagnosis(`${profile.icdCode} ${profile.icdTitle}`);
      } else {
        setDiagnosis(diagnosisHeader);
      }

      // FDAR / SOAP Format Construction
      let clinicalPlan = `DATA:\n`;
      clinicalPlan += `• S: Patient reports "${selectedItem.concern}". ${selectedItem.name} describes onset as acute.\n`;
      clinicalPlan += `• O: BP ${vBP || '---'}, HR ${vHR || '---'}bpm, RR ${vRR || '---'}cpm, Temp ${vTemp || '---'}°C, SpO2 ${vSpO2 || '---'}%.\n`;
      if (selectedItem.concern.toLowerCase().includes('bleed')) {
        clinicalPlan += `• Physical: Observed active vaginal bleeding. Pale palpebral conjunctiva noted. Weak rapid pulse.\n`;
      }
      clinicalPlan += `• Assessment: ${profile.explanation}\n\n`;
      
      clinicalPlan += `ACTION (Interventions):\n`;
      clinicalPlan += profile.nic.map(n => `• ${n}`).join('\n');
      if (isDoctor) {
        clinicalPlan += `\n• Order stat diagnostic panel: ${profile.labOrders?.join(', ') || 'RBC/Hgb'}`;
        clinicalPlan += `\n• Initiate protocol for definitive management of ${profile.icdTitle}.`;
      }
      clinicalPlan += `\n\n`;
      
      clinicalPlan += `RESPONSE (Expected Outcomes):\n`;
      clinicalPlan += profile.noc.map(n => `• ${n}`).join('\n');

      if (profile.labOrders && profile.labOrders.length > 0) {
        setLabOrders(profile.labOrders.join(', '));
        setLabChecklist(profile.labOrders);
      }

      setPlans(clinicalPlan);
      setIsAiLoading(false);
      addToast(`${clinicalTitle}: ${profile.icdCode} analysis complete`, 'b');
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
    setConfirmModal({
      isOpen: true,
      title: 'Remove from Queue',
      message: `Are you sure you want to remove ${item.name} from the queue?`,
      onConfirm: () => {
        queue.removeItem(item.id);
        addToast(`${item.name} removed`, 'r');
      }
    });
  };

  const patientRecord = selectedItem ? patients.data.find(p => p.name.toLowerCase() === selectedItem.name.toLowerCase()) : null;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Dynamic Header with Status Indicator */}
      {/* Header - Softened & Wide */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div className="flex flex-col">
          <h2 className="text-[28px] font-black tracking-tight text-txt flex items-center gap-3 italic">
            Patient Hub
            <span className="text-[9px] bg-green-l text-green px-2.5 py-0.5 rounded-full border border-green-m/30 font-black uppercase tracking-widest animate-pulse shadow-sm">RHU Live</span>
          </h2>
          <p className="text-[13px] text-txt2 font-bold tracking-tight opacity-70">{profile.facility} · {fmtDate(pst())}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className={cn(
              "p-2.5 bg-panel border-2 border-border/40 rounded-xl shadow-sm hover:shadow-sh transition-all group",
              isRefreshing && "opacity-70 cursor-not-allowed"
            )}
            title="Refresh System State"
          >
            <RefreshCw className={cn("text-txt2 group-hover:text-blue transition-colors", isRefreshing && "animate-spin")} size={20} />
          </button>
          
          {canRegister && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
            >
              <Plus size={18} />
              <span>Register Intake</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Alerts Bar */}
      {(urgent.length > 0 || waiting.length > 8) && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-l border border-red-m rounded-2xl p-4 flex items-center gap-4 overflow-hidden"
        >
          <div className="w-10 h-10 bg-red rounded-xl flex items-center justify-center text-white shrink-0 animate-pulse">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-black text-red uppercase tracking-tight">Active Operation Alerts</div>
            <div className="text-[12px] text-red-800 font-medium">
              {urgent.length > 0 && `• ${urgent.length} urgent cases require triage `}
              {waiting.length > 8 && `• High patient volume (${waiting.length} in queue) `}
            </div>
          </div>
          <button className="text-[11px] font-black uppercase text-red border-b border-red/30 pb-0.5 hover:opacity-70 transition-opacity">
            Action Protocol
          </button>
        </motion.div>
      )}

      {/* High-Level Pulse Widgets */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Design Fix #1: Med Guide */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.95, y: 15 },
            visible: { opacity: 1, scale: 1, y: 0 }
          }}
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => setIsMedGuideOpen(true)}
          className="relative overflow-hidden bg-blue text-white rounded-[24px] p-6 shadow-xl shadow-blue/10 cursor-pointer group"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                <ClipboardCheck size={20} className="text-white" />
              </div>
              <h3 className="text-[12px] font-black tracking-tight uppercase">Medication Guide</h3>
            </div>
            <div>
              <p className="text-[12px] text-white/80 leading-snug mb-4 font-medium italic">
                Clinical safety protocols for safe environments.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-white/60 px-2 py-0.5 bg-white/10 rounded-full uppercase tracking-tighter">RA 10173</span>
                <span className="text-[10px] font-bold">Open →</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edge Node Health */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.95, y: 15 },
            visible: { opacity: 1, scale: 1, y: 0 }
          }}
          whileHover={{ y: -4 }}
          className="bg-white border border-border/40 rounded-[24px] p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-panel2 rounded-xl">
              <Smartphone size={20} className="text-blue" />
            </div>
            <h3 className="text-[12px] font-black text-txt tracking-tight uppercase">Network Node</h3>
          </div>
          <div className="space-y-3 font-bold">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-txt3 uppercase">Latency</span>
              <span className="text-green">12ms</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-txt3 uppercase">Battery</span>
              <div className="flex items-center gap-1.5 font-bold">
                <div className="w-8 h-3 bg-panel2 rounded-full overflow-hidden border border-border">
                  <div className="w-[84%] h-full bg-green rounded-full" />
                </div>
                <span className="text-txt text-[10px]">84%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Queue Throughput */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.95, y: 20 },
            visible: { opacity: 1, scale: 1, y: 0 }
          }}
          whileHover={{ y: -6 }}
          className="bg-green text-white rounded-[32px] p-8 shadow-2xl shadow-green/20 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-[14px] font-black tracking-tight uppercase mb-1">Queue Health</h3>
            <p className="text-[12px] opacity-80 font-medium">Flow optimized by AI</p>
          </div>
          <div className="flex flex-col relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-[36px] font-black tracking-tighter">183%</span>
              <span className="text-[11px] uppercase font-bold opacity-60">+12% gain</span>
            </div>
          </div>
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </motion.div>

        {/* Operational State */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.95, y: 15 },
            visible: { opacity: 1, scale: 1, y: 0 }
          }}
          whileHover={{ y: -4 }}
          className="bg-white border border-border/40 rounded-[24px] p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-l rounded-xl">
              <Thermometer size={20} className="text-amber" />
            </div>
            <h3 className="text-[12px] font-black text-txt tracking-tight uppercase">Operational State</h3>
          </div>
          <div className="mt-3">
            <div className="text-[24px] font-black text-txt tracking-tighter text-amber italic">Moderate</div>
            <div className="text-[10px] text-txt2 font-bold uppercase tracking-widest mt-0.5">Wait: 14 mins</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Queue Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-panel border border-border/60 shadow-sh rounded-[28px] overflow-hidden">
            <div className="p-6 border-b border-border/40 flex items-center justify-between bg-white/40 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-blue rounded-full animate-pulse shadow-[0_0_15px_rgba(14,165,233,0.8)]" />
                <h2 className="text-[18px] font-black text-txt tracking-tighter italic uppercase">Live Queue</h2>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] font-bold text-blue bg-blue-l/50 px-4 py-2 rounded-full border border-blue-m/20 uppercase tracking-widest leading-none">
                <Users size={16} />
                <span>{waiting.length} Waiting</span>
              </div>
            </div>
            
            <div className="divide-y divide-border/20">
              <AnimatePresence mode="popLayout">
                {waiting.map((item, idx) => (
                  <motion.div 
                    layout
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                      "p-5 flex items-center gap-5 group transition-all hover:bg-panel2 relative border-l-4 border-transparent",
                      item.priority === 'urgent' ? "border-l-red bg-red-l/5" : "hover:border-l-blue"
                    )}
                  >
                    <div className="hidden sm:flex flex-col items-center justify-center w-8 text-[11px] font-black text-txt3 bg-panel2 h-8 rounded-xl shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-[15px] font-black text-txt truncate group-hover:text-blue transition-colors tracking-tight uppercase">
                          {item.name}
                        </h4>
                        {item.priority === 'urgent' && (
                          <span className="flex items-center gap-1 text-[9px] font-black bg-red text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            <Activity size={10} strokeWidth={3} /> Triage A
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[12px] text-txt2 font-bold tracking-tight">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <User size={14} className="text-txt3" />
                          {item.age}y · {item.sex}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-0.5 bg-white border border-border/60 rounded-xl text-txt shadow-sm text-[11px]">
                          <Stethoscope size={14} className="text-blue" />
                          {item.concern}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="hidden xl:flex flex-col items-end mr-2 opacity-50">
                        <span className="text-[9px] font-black uppercase tracking-widest text-txt3">{fmtTime(new Date(item.addedAt))}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(isClinical || currentRole === 'bhw') && (
                          <button 
                            onClick={() => handleConsult(item)} 
                            className="w-10 h-10 bg-blue text-white hover:bg-blue-d rounded-xl transition-all shadow-md shadow-blue/10 flex items-center justify-center active:scale-90"
                            title={isClinical ? "Begin Consultation" : "Take Vitals"}
                          >
                            <Stethoscope size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleMarkDone(item)} 
                          className="w-10 h-10 bg-green text-white hover:bg-green-d rounded-xl transition-all shadow-md shadow-green/10 flex items-center justify-center active:scale-90"
                          title="Mark as Seen"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {waiting.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-16 flex flex-col items-center justify-center text-txt3"
                >
                  <div className="w-20 h-20 bg-panel2 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
                    <Users size={32} className="text-txt2 opacity-20" />
                  </div>
                  <div className="text-[20px] font-black text-txt mb-2 tracking-tighter uppercase italic">Station Clear</div>
                  <p className="text-[13px] text-txt2 text-center max-w-[220px] font-medium leading-relaxed">No pending patients.</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Recently Completed */}
          {done.length > 0 && (
            <div className="bg-panel border border-border rounded-2xl overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
              <div className="p-4 px-6 border-b border-border bg-slate-50 flex items-center justify-between">
                <span className="text-[13px] font-bold text-txt2 uppercase tracking-wider">Recently Completed</span>
                <span className="text-[11px] font-black text-green bg-green-l px-2 py-0.5 rounded-full">{done.length} Today</span>
              </div>
              <div className="divide-y divide-border/50">
                {done.slice(0, 3).map(item => (
                  <div key={item.id} className="p-4 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <div>
                        <div className="text-[14px] font-bold text-txt">{item.name}</div>
                        <div className="text-[11px] text-txt3">Processed at {fmtTime(new Date(item.doneAt!))}</div>
                      </div>
                    </div>
                    <button className="p-2 text-txt3 hover:text-blue transition-colors">
                      <FileText size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="flex flex-col gap-8">
          {/* Appointment Pulse */}
          <div className="bg-panel border border-border/60 rounded-[28px] overflow-hidden shadow-sh">
            <div className="p-6 border-b border-border/40 flex items-center justify-between bg-white">
              <h3 className="text-[15px] font-black text-txt tracking-tight uppercase italic">Appointments</h3>
              <div className="p-1.5 bg-blue-l rounded-xl">
                <Calendar size={18} className="text-blue" />
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {todayAppts.length > 0 ? (
                todayAppts.slice(0, 4).map(appt => (
                  <div key={appt.id} className="p-4 bg-panel2 border border-transparent rounded-[20px] flex items-center justify-between group hover:border-blue/10 hover:bg-white transition-all">
                    <div>
                      <div className="text-[10px] font-black text-blue uppercase mb-1 tracking-widest">{appt.time}</div>
                      <div className="text-[13px] font-black text-txt truncate w-[140px] tracking-tight uppercase">{appt.name}</div>
                    </div>
                    <button 
                      onClick={() => handleQuickAddToQueue(appt)}
                      className="w-9 h-9 bg-blue text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-blue/10 flex items-center justify-center active:scale-90"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-txt3 font-medium text-[13px] italic">
                  No appointments today.
                </div>
              )}
              {todayAppts.length > 4 && (
                <button className="w-full py-3 text-[11px] font-black text-blue hover:translate-x-1 transition-transform uppercase tracking-widest">
                  View Registry →
                </button>
              )}
            </div>
          </div>

          {/* System Integrity */}
          <div className="bg-slate-900 border border-white/5 rounded-[28px] p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[15px] font-black text-white mb-5 uppercase tracking-tight italic">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green rounded-full" />
                    <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Bridge</span>
                  </div>
                  <span className="text-[9px] font-black text-green px-2 py-0.5 bg-green/10 rounded-full">Encrypted</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                    <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest">NurseAI</span>
                  </div>
                  <span className="text-[9px] font-black text-blue px-2 py-0.5 bg-blue/10 rounded-full">Optimal</span>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-blue" />
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Audit Mode</span>
                </div>
                <div className="text-[9px] text-white/15 font-mono leading-relaxed break-all">
                  NODE_ID: {uid().slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>
            {/* Background flair */}
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue opacity-5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Floating Action for Mobile */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed right-6 bottom-6 w-[60px] h-[60px] rounded-full bg-sidebar text-white flex items-center justify-center text-[24px] shadow-2xl active:scale-95 transition-transform z-30 lg:hidden"
      >
        <Plus size={28} />
      </motion.button>

      {/* Clinical Consultation Modal */}
      <Modal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        title="Clinical Consultation"
        subtitle="Tier 2/3 Secure EHR Terminal"
      >
        <div className="flex flex-col gap-6">
          {selectedItem && (
            <div className="flex items-center gap-4 p-5 bg-panel border-2 border-blue/10 rounded-[28px] shadow-sm mb-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner", selectedItem.av)}>
                {selectedItem.initials}
              </div>
              <div className="flex-1">
                <div className="text-[20px] font-black text-txt tracking-tight leading-none uppercase italic">{selectedItem.name}</div>
                <div className="text-[12px] text-txt2 font-bold mt-1.5 uppercase tracking-widest">{selectedItem.age}y · {selectedItem.sex} · PhilHealth: {selectedItem.philhealth}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-[10px] text-txt3 uppercase font-black tracking-widest mb-1">Encounter ID</div>
                <div className="px-3 py-1 bg-panel2 rounded-xl text-[12px] font-mono font-bold text-blue border border-border">#{selectedItem.id.slice(0, 8)}</div>
              </div>
            </div>
          )}

          {/* Social Profile & Information */}
          {patientRecord && (
            <div className="grid grid-cols-2 gap-4 p-5 bg-panel border border-border rounded-[28px] shadow-sm">
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

              {/* AI Assistant Interface - Specialized by Role */}
              {isClinical && (
                <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 text-white shadow-2xl overflow-hidden relative group mb-2">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    {currentRole === 'doctor' ? <Activity size={80} /> : <Brain size={80} />}
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                        {currentRole === 'doctor' ? <Activity className="text-blue-400" size={24} /> : <Brain className="text-blue-400" size={24} />}
                      </div>
                      <div>
                        <h3 className="text-[14px] font-black tracking-tight uppercase">
                          {currentRole === 'doctor' ? 'DoctorAI Diagnostics Engine' : 'NurseAI Clinical Co-Pilot'}
                        </h3>
                        <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-[0.2em]">
                          {currentRole === 'doctor' ? 'ICD-11 / Clinical Analysis' : 'NANDA-I / NIC / NOC Analysis'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleAiSuggest}
                      disabled={isAiLoading}
                      className={cn(
                        "px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                        isAiLoading ? "bg-slate-800 text-slate-500 cursor-wait" : "bg-blue hover:bg-blue-400 text-white shadow-xl shadow-blue/20 hover:scale-105 active:scale-95"
                      )}
                    >
                      {isAiLoading ? (
                        <span className="flex items-center gap-2"><RefreshCw size={14} className="animate-spin" /> Deep Analysis...</span>
                      ) : (
                        currentRole === 'doctor' ? "Diagnostic Check" : "Generate FDAR Logic"
                      )}
                    </button>
                  </div>
                  <div className="flex gap-4 relative z-10 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex-1">
                      <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1">Knowledge Engine</div>
                      <div className="text-[11px] text-blue-100 font-medium leading-tight italic">
                        {currentRole === 'doctor' 
                          ? `Analyzing vitals & history for differential diagnosis (${selectedItem?.concern || 'General'})`
                          : `Analyzing current vitals vs ${selectedItem?.concern?.split('/')[0].trim() || 'clinical indicators'} for diagnostic indicators...`
                        }
                      </div>
                    </div>
                  </div>
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
                <label className="form-label flex items-center gap-2">
                  <ShieldCheck size={14} className="text-accent" /> 
                  {currentRole === 'doctor' ? 'Clinical Impression (ICD)' : 'Focus / Diagnosis (FDAR)'}
                </label>
                <textarea 
                  className="form-input text-[13px] font-mono" 
                  rows={2} 
                  placeholder={currentRole === 'doctor' ? "e.g., GA20 (Heavy uterine bleeding)..." : "FOCUS: [NANDA-I Diagnosis]..."} 
                  value={diagnosis} 
                  onChange={e => setDiagnosis(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">{currentRole === 'doctor' ? 'Clinical Plan / Orders' : 'Action & Response (FDAR Plans)'}</label>
                <textarea 
                  className="form-input text-[12px] font-mono leading-relaxed" 
                  rows={8} 
                  placeholder={currentRole === 'doctor' ? "SOAP / Plan details..." : "DATA: ... ACTION: ... RESPONSE: ..."} 
                  value={plans} 
                  onChange={e => setPlans(e.target.value)} 
                />
              </div>

              {/* AI Medical Summary Feature */}
              <div className="bg-blue/5 border border-blue/10 rounded-2xl p-4 mb-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue/20 rounded-lg">
                      <Brain size={16} className="text-blue" />
                    </div>
                    <span className="text-[12px] font-black uppercase tracking-tight text-blue">AI Medical Summary</span>
                  </div>
                  <button 
                    onClick={handleAiSummarize}
                    disabled={isSummarizing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-d transition-all disabled:opacity-50"
                  >
                    {isSummarizing ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    {isSummarizing ? 'Analyzing...' : 'Generate Notes'}
                  </button>
                </div>
                <textarea 
                  className="w-full bg-white/50 border-none p-3 rounded-xl text-[12px] font-mono leading-relaxed text-txt outline-none min-h-[100px]" 
                  placeholder="AI-generated medical notes will appear here..." 
                  value={medicalSummary} 
                  onChange={e => setMedicalSummary(e.target.value)} 
                />
                <p className="text-[9px] text-txt3 mt-2 italic">Summarizes HPI, Objective, and Diagnosis for rapid review.</p>
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
