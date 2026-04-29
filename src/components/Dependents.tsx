import React, { useState } from 'react';
import { Plus, Trash2, Home, Link, Edit2 } from 'lucide-react';
import { Dependent } from '../types';
import { cn, uid, pst, fmtShort } from '../lib/utils';
import Modal from './Modal';

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
    if (confirm(`Remove ${name}?`)) {
      dependents.removeItem(id);
      addToast(`${name} removed`, 'r');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold">Household & Dependents</h2>
          <p className="text-[13px] text-txt2">Family mapping · Household health tracking</p>
        </div>
        <button className="btn btn-p btn-sm" onClick={handleOpenAdd} disabled={isPatient}>
          <Plus size={14} /> Add Dependent
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {dependents.data.map(d => (
          <div key={d.id} className="bg-panel border border-border rounded-lg p-3.5 shadow-sh flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Home size={14} className="text-accent" />
                  <span className="text-[11px] font-bold text-txt2 uppercase tracking-wider">Household: {d.head}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link size={14} className="text-secondary" />
                  <div className="text-[15px] font-bold text-txt leading-tight">{d.dependent}</div>
                </div>
                <div className="text-[11px] text-txt2 ml-5 mt-0.5">{d.relationship} · Age {d.age}</div>
              </div>
              <span className="chip bg-blue-l/50 border-blue-m/30 text-blue-d text-[10px] font-bold shadow-sm">{d.conditions}</span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="text-[10px] text-txt3 font-medium">Last Visit: {d.lastVisit}</div>
              <div className="flex items-center gap-1.5">
                <button 
                  className="btn btn-sm px-2.5 py-1.5 bg-bg text-txt2 hover:text-blue hover:border-blue-m disabled:hidden" 
                  onClick={() => handleOpenEdit(d)}
                  disabled={isPatient}
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  className="btn btn-sm btn-d px-2.5 py-1.5 disabled:hidden" 
                  onClick={() => handleDelete(d.id, d.dependent)}
                  disabled={isPatient}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {dependents.data.length === 0 && (
          <div className="p-7 text-center text-txt2 text-[13px]">
            <div className="text-[32px] mb-2">👨‍👩‍👧</div>
            No dependents yet.
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingId ? "Edit Household Link" : "Add Dependent"}
        subtitle={editingId ? "Update family relation details" : "Link a family member to a household head"}
        footer={
          <>
            <button className="btn flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-p flex-1" onClick={handleSave}>{editingId ? "Update ✓" : "Save ✓"}</button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <div className="form-group">
            <label className="form-label">Household head</label>
            <input className="form-input" placeholder="Head of household name" value={head} onChange={e => setHead(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Dependent name</label>
            <input className="form-input" placeholder="Dependent full name" value={dep} onChange={e => setDep(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="form-group">
              <label className="form-label">Relationship</label>
              <select className="form-input" value={rel} onChange={e => setRel(e.target.value)}>
                <option>Spouse</option><option>Child</option><option>Parent</option><option>Sibling</option><option>Grandchild</option><option>Fetus</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" value={age} onChange={e => setAge(e.target.value)} inputMode="numeric" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Known conditions</label>
            <input className="form-input" placeholder="e.g., Asthma, None" value={cond} onChange={e => setCond(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
