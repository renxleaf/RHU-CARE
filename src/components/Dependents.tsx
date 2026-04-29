import React, { useState } from 'react';
import { Plus, Trash2, Home, Link, Edit2, User, Clock, Heart } from 'lucide-react';
import { Dependent } from '../types';
import { cn, uid, pst, fmtShort } from '../lib/utils';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';

interface DependentsProps {
  dependents: {
    data: Dependent[];
    addItem: (item: Dependent) => void;
    updateItem: (id: string, updates: Partial<Dependent>) => void;
    removeItem: (id: string) => void;
    loading: boolean;
  };
  addToast: (msg: string, type?: 'g' | 'r' | 'b' | 'a') => void;
  currentRole: string;
}

export default function Dependents({ dependents, addToast, currentRole }: DependentsProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [head, setHead] = useState('');
  const [dep, setDep] = useState('');
  const [rel, setRel] = useState('Spouse');
  const [age, setAge] = useState('');
  const [cond, setCond] = useState('');

  // Restricted Access
  const isPatient = currentRole === 'patient';
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

  if (dependents.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-[14px] text-txt2 font-medium">Syncing with RHU Cloud...</p>
      </div>
    );
  }

  // Initialize demo data if empty (Staff only)
  React.useEffect(() => {
    if (dependents.loading || isPatient) return;
    if (dependents.data.length === 0) {
      const demoDeps: Dependent[] = [
        { id: uid(), head: 'Morales, Lourdes', dependent: 'Morales, Ricardo', relationship: 'Spouse', age: '66', conditions: 'Hypertension', lastVisit: 'Apr 10, 2026', addedBy: 'System' },
        { id: uid(), head: 'Morales, Lourdes', dependent: 'Morales, Ana', relationship: 'Child', age: '32', conditions: 'None', lastVisit: 'Mar 15, 2026', addedBy: 'System' },
        { id: uid(), head: 'Dela Cruz, Reynaldo', dependent: 'Dela Cruz, Maria', relationship: 'Spouse', age: '48', conditions: 'Diabetes', lastVisit: 'Apr 5, 2026', addedBy: 'System' },
        { id: uid(), head: 'Dela Cruz, Reynaldo', dependent: 'Dela Cruz, Juan', relationship: 'Child', age: '15', conditions: 'Asthma', lastVisit: 'Apr 12, 2026', addedBy: 'System' },
      ];
      demoDeps.forEach(d => dependents.addItem(d));
    }
  }, [dependents.loading, isPatient]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setHead(''); setDep(''); setAge(''); setCond(''); setRel('Spouse');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (d: Dependent) => {
    setEditingId(d.id);
    setHead(d.head);
    setDep(d.dependent);
    setAge(d.age);
    setCond(d.conditions);
    setRel(d.relationship);
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!head || !dep) {
      addToast('Fill in both names', 'r');
      return;
    }

    const payload = {
      head,
      dependent: dep,
      relationship: rel,
      age: age || '—',
      conditions: cond || 'None',
      lastVisit: editingId ? dependents.data.find(d => d.id === editingId)?.lastVisit : fmtShort(pst()),
      addedBy: 'Nurse Reyes'
    };

    if (editingId) {
      dependents.updateItem(editingId, payload);
      addToast(`Household link updated ✓`, 'b');
    } else {
      dependents.addItem({
        ...payload,
        id: uid(),
      });
      addToast(`Household link created ✓`, 'g');
    }

    setEditingId(null);
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Household Link',
      message: `Are you sure you want to remove the household link for ${name}?`,
      onConfirm: () => {
        dependents.removeItem(id);
        addToast(`${name} removed`, 'r');
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-[28px] font-black tracking-tight text-txt uppercase italic">Household & Family Hub</h2>
          <p className="text-[14px] text-txt2 font-medium">Kinship Mapping · Calauan Resident Demographic Loop</p>
        </div>
        {!isPatient && (
          <button 
            onClick={handleOpenAdd} 
            className="px-6 py-3 bg-sidebar text-white rounded-xl font-bold hover:shadow-lg shadow-sidebar/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Add Household Relation
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {dependents.data.map(d => (
          <div key={d.id} className="card group hover:shadow-2xl transition-all border-none bg-white p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-txt3 border border-slate-100 group-hover:bg-blue-l group-hover:text-blue transition-colors">
                  <Home size={24} />
                </div>
                <span className="chip px-3 py-1 bg-slate-100 border-slate-200 text-txt2 text-[9px] font-black uppercase">
                  Relation Verified
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-[18px] font-black text-txt tracking-tight group-hover:text-blue transition-colors leading-tight">
                  {d.dependent}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-[12px] font-bold text-blue uppercase tracking-tighter bg-blue-l/50 px-2 rounded">
                    {d.relationship}
                  </div>
                  <div className="text-[12px] font-bold text-txt3 uppercase tracking-tighter italic">
                    Age {d.age}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-txt3 group-hover:text-blue transition-colors">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-txt3 uppercase tracking-widest leading-none mb-1">Household Head</div>
                    <div className="text-[13px] font-bold text-txt">{d.head}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-l/30 flex items-center justify-center text-red group-hover:bg-red group-hover:text-white transition-all">
                    <Heart size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-txt3 uppercase tracking-widest leading-none mb-1">Risk Factors</div>
                    <div className="text-[13px] font-black text-red tracking-tight truncate">{d.conditions}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="text-[11px] font-bold text-txt3 flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all uppercase tracking-tighter">
                <Clock size={12} /> Seen: {d.lastVisit}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2.5 text-txt3 hover:text-blue hover:bg-blue/5 rounded-xl border border-transparent hover:border-blue/10 transition-all shadow-sm" 
                  onClick={() => handleOpenEdit(d)}
                  disabled={isPatient}
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="p-2.5 text-txt3 hover:text-red hover:bg-red/5 rounded-xl border border-transparent hover:border-red/10 transition-all" 
                  onClick={() => handleDelete(d.id, d.dependent)}
                  disabled={isPatient}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {dependents.data.length === 0 && (
          <div className="xl:col-span-3 p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl opacity-30">
            <div className="text-[64px] mb-4">👨‍👩‍👧‍👦</div>
            <p className="text-[18px] font-black uppercase tracking-widest">No kinship mappings detected</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingId ? "Modify Household Relation" : "New Household Link"}
        footer={
          <div className="flex gap-4 w-full">
            <button className="flex-1 px-6 py-3 border border-border rounded-xl font-bold text-txt hover:bg-slate-50 transition-all" onClick={() => setIsAddModalOpen(false)}>Abort</button>
            <button className="flex-1 px-6 py-3 bg-sidebar text-white rounded-xl font-bold hover:shadow-lg shadow-sidebar/20 active:scale-95 transition-all" onClick={handleSave}>{editingId ? "Update Registry ✓" : "Commit Link ✓"}</button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 p-2">
          <div className="form-group">
            <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Household Principal Name</label>
            <input className="form-input" placeholder="Primary head of household" value={head} onChange={e => setHead(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Dependent Full Identity</label>
            <input className="form-input" placeholder="Family member to link" value={dep} onChange={e => setDep(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Kinship Type</label>
              <select className="form-input" value={rel} onChange={e => setRel(e.target.value)}>
                <option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Grandchild</option><option>Fetus</option>
              </select>
            </div>
            <div className="form-group">
              <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Chronological Age</label>
              <input className="form-input" type="number" value={age} onChange={e => setAge(e.target.value)} inputMode="numeric" />
            </div>
          </div>
          <div className="form-group">
            <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Pre-existing Pathology</label>
            <input className="form-input" placeholder="e.g., Asthma, Hypertension, Co-morbidities" value={cond} onChange={e => setCond(e.target.value)} />
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
