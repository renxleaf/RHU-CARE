import { SURNAMES, FIRST_NAMES, BARANGAYS } from '../lib/commonData';
import { useState } from 'react';
import { Plus, Search, User, Edit2, Trash2, ShieldCheck, History, ClipboardList, PenTool, Activity } from 'lucide-react';
import { Patient, Role } from '../types';
import { cn, uid, pst, fmtShort, todayKey } from '../lib/utils';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';

interface PatientRecordsProps {
  patients: {
    data: Patient[];
    addItem: (item: Patient) => void;
    updateItem: (id: string, updates: Partial<Patient>) => void;
    removeItem: (id: string) => void;
    loading: boolean;
  };
  addToast: (msg: string, type?: 'g' | 'r' | 'b' | 'a') => void;
  currentRole: Role;
}

export default function PatientRecords({ patients, addToast, currentRole }: PatientRecordsProps) {
  const isBhw = currentRole === 'bhw';
  const isClinical = currentRole === 'doctor' || currentRole === 'nurse' || currentRole === 'admin';
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEhrModalOpen, setIsEhrModalOpen] = useState(false);
  const [selectedPt, setSelectedPt] = useState<Patient | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
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

  if (patients.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-[14px] text-txt2 font-medium">Syncing with RHU Cloud...</p>
      </div>
    );
  }

  // Form states
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('F');
  const [dob, setDob] = useState('');
  const [addr, setAddr] = useState('');
  const [ph, setPh] = useState('');
  const [cond, setCond] = useState('');
  const [ct, setCt] = useState('');
  
  // Extra fields
  const [civilStatus, setCivilStatus] = useState('Single');
  const [birthPlace, setBirthPlace] = useState('');
  const [occupation, setOccupation] = useState('');
  const [religion, setReligion] = useState('');
  const [nationality, setNationality] = useState('Filipino');
  const [bloodType, setBloodType] = useState('Unknown');
  const [education, setEducation] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  const filtered = patients.data
    .filter(p => {
      const s = search.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(s) || 
        (p.philhealth || '').toLowerCase().includes(s) ||
        (p.condition || '').toLowerCase().includes(s) ||
        (p.address || '').toLowerCase().includes(s) ||
        (p.contact || '').toLowerCase().includes(s);
      
      if (filter === 'followup') return matchesSearch && p.followUp === true;
      if (filter === 'vaccination') return matchesSearch && p.type === 'vaccination';
      if (filter === 'today') return matchesSearch && p.registeredAt?.startsWith(todayKey());
      return matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleRegister = async () => {
    if (!lastName || !firstName) {
      addToast('Enter full patient name', 'r');
      return;
    }
    if (!dob) {
      addToast('Date of birth is required', 'r');
      return;
    }
    if (!addr || addr.length < 5) {
      addToast('Complete address is required', 'r');
      return;
    }
    if (ph && ph !== '—' && !/^\d{2}-\d{9}-\d{1}$/.test(ph) && !/^PH-\d+$/.test(ph)) {
      addToast('Invalid PhilHealth ID format (XX-XXXXXXXXX-X)', 'a');
      // We continue but warn, or we could block. Let's warn for now as people might use internal IDs.
    }
    const name = `${lastName}, ${firstName}`;
    const avs = ['bg-red-l text-red', 'bg-blue-l text-blue', 'bg-green-l text-green', 'bg-amber-l text-amber', 'bg-teal-l text-teal', 'bg-purple-l text-purple'];
    const initials = (lastName[0] || '?').toUpperCase() + (firstName[0] || '?').toUpperCase();
    
    try {
      await patients.addItem({
        id: uid(),
        name,
        age: age || '?',
        sex,
        dob,
        address: addr || '—',
        philhealth: ph || '—',
        condition: cond || 'None',
        contact: ct || '',
        lastVisit: fmtShort(pst()),
        av: avs[Math.floor(Math.random() * avs.length)],
        initials,
        registeredAt: new Date().toISOString(),
        registeredBy: 'Nurse Reyes',
        civilStatus,
        birthPlace,
        occupation,
        religion,
        nationality,
        bloodType,
        education,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation
        }
      });

      setLastName(''); setFirstName(''); setAge(''); setSex('F'); setDob(''); setAddr(''); setPh(''); setCond(''); setCt('');
      setCivilStatus('Single'); setBirthPlace(''); setOccupation(''); setReligion(''); setNationality('Filipino'); setBloodType('Unknown'); setEducation('');
      setEmergencyName(''); setEmergencyPhone(''); setEmergencyRelation('');
      setIsNewModalOpen(false);
      addToast(`${name} registered ✓`, 'g');
    } catch (err: any) {
      addToast('Failed to register patient', 'r');
    }
  };

  const handleUpdate = () => {
    if (!selectedPt) return;
    patients.updateItem(selectedPt.id, {
      condition: (document.getElementById('up-cond') as HTMLInputElement).value,
      contact: (document.getElementById('up-ct') as HTMLInputElement).value,
      address: (document.getElementById('up-addr') as HTMLInputElement).value,
      civilStatus: (document.getElementById('up-civil') as HTMLSelectElement).value,
      occupation: (document.getElementById('up-occ') as HTMLInputElement).value,
      bloodType: (document.getElementById('up-blood') as HTMLSelectElement).value,
      religion: (document.getElementById('up-rel') as HTMLInputElement).value,
      nationality: (document.getElementById('up-nat') as HTMLInputElement).value,
      lastVisit: fmtShort(pst())
    });
    setIsEhrModalOpen(false);
    addToast('Record updated ✓', 'g');
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Patient Record',
      message: `Are you sure you want to permanently delete the records for ${name}? This action cannot be undone.`,
      onConfirm: () => {
        patients.removeItem(id);
        setIsEhrModalOpen(false);
        addToast(`${name} deleted`, 'r');
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-[28px] font-black tracking-tight text-txt">Patient Index</h2>
          <p className="text-[14px] text-txt2 font-medium">Calauan RHU Centralized Registry · RA 10173 Audit Active</p>
        </div>
        <div className="flex items-center gap-3">
          {isClinical && (
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-sidebar text-white rounded-xl font-bold shadow-lg shadow-sidebar/20 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Plus size={18} />
              <span>Register Patient</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-panel border border-border rounded-2xl shadow-sh-md overflow-hidden bg-white">
        <div className="p-6 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-1 gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt3" size={20} />
              <input 
                className="w-full pl-12 pr-4 py-3 bg-panel2 border border-border rounded-xl outline-none focus:border-blue transition-all text-[15px] font-medium"
                placeholder="Search patient registry by name, PH-ID, or condition..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="bg-panel2 border border-border rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:border-blue cursor-pointer"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">Database: All Records</option>
              <option value="today">Filter: Registered Today</option>
              <option value="followup">Filter: Follow-up</option>
              <option value="vaccination">Filter: Vaccination</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-x divide-y divide-border border-t border-border">
          {filtered.map((pt) => (
            <div 
              key={pt.id} 
              className="p-6 hover:bg-slate-50 transition-all group flex flex-col justify-between h-[200px]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-[16px] font-black shrink-0 shadow-sm", pt.av)}>
                    {pt.initials}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-txt group-hover:text-blue transition-colors line-clamp-1">{pt.name}</h3>
                    <div className="text-[12px] text-txt2 font-medium">{pt.age}y · {pt.sex === 'F' ? 'Female' : 'Male'} · {pt.philhealth}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setSelectedPt(pt); setIsEhrModalOpen(true); }} 
                    className="p-2.5 text-txt2 hover:bg-blue-l hover:text-blue rounded-xl transition-all"
                    title="View Comprehensive EHR"
                  >
                    <ClipboardList size={18} />
                  </button>
                  {isClinical && (
                    <button 
                      onClick={() => handleDelete(pt.id, pt.name)} 
                      className="p-2.5 text-txt3 hover:bg-red-l hover:text-red rounded-xl transition-all"
                      title="Purge Record"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 text-[13px] font-medium text-txt">
                  <Activity size={14} className="text-blue" />
                  <span className="line-clamp-1">{pt.condition}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-txt2">
                  <History size={14} />
                  <span>Last Visit: {pt.lastVisit}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-txt3 tracking-widest">RA 10173 Audit Log: Active</span>
                <button 
                  onClick={() => { setSelectedPt(pt); setIsEhrModalOpen(true); }}
                  className="text-[12px] font-bold text-blue hover:underline"
                >
                  Manage EHR →
                </button>
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="col-span-full p-20 flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <User size={32} />
              </div>
              <div className="text-[18px] font-bold mb-1">No Matching Records</div>
              <p className="text-[14px]">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Register New Patient"
        footer={
          <>
            <button className="btn flex-1" onClick={() => setIsNewModalOpen(false)}>Cancel</button>
            <button className="btn btn-p flex-1" onClick={handleRegister}>Register ✓</button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          {/* Basic Identity */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] font-bold text-txt2 uppercase tracking-wider border-b border-border pb-1">
              Personal Information
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input 
                  className="form-input" 
                  placeholder="Apelyido" 
                  list="suggested-surnames"
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                />
                <datalist id="suggested-surnames">
                  {SURNAMES.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">First name</label>
                <input 
                  className="form-input" 
                  placeholder="Pangalan" 
                  list="suggested-firstnames"
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                />
                <datalist id="suggested-firstnames">
                  {FIRST_NAMES.map(f => <option key={f} value={f} />)}
                </datalist>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" value={age} onChange={e => setAge(e.target.value)} inputMode="numeric" />
              </div>
              <div className="form-group">
                <label className="form-label">Sex</label>
                <select className="form-input" value={sex} onChange={e => setSex(e.target.value)}>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="form-group">
                <label className="form-label">Date of birth</label>
                <input className="form-input" type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Place of Birth</label>
                <input className="form-input" placeholder="City/Municipality" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="form-group">
                <label className="form-label">Civil Status</label>
                <select className="form-input" value={civilStatus} onChange={e => setCivilStatus(e.target.value)}>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nationality</label>
                <input className="form-input" value={nationality} onChange={e => setNationality(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Social/Economic */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] font-bold text-txt2 uppercase tracking-wider border-b border-border pb-1">
              Social & Economic Profile
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="form-group">
                <label className="form-label">Occupation</label>
                <input className="form-input" placeholder="Trabaho" value={occupation} onChange={e => setOccupation(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Education</label>
                <select className="form-input" value={education} onChange={e => setEducation(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Elementary">Elementary</option>
                  <option value="High School">High School</option>
                  <option value="College">College</option>
                  <option value="Vocational">Vocational</option>
                  <option value="None">No formal education</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="form-group">
                <label className="form-label">Religion</label>
                <input className="form-input" placeholder="e.g. Roman Catholic" value={religion} onChange={e => setReligion(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Type</label>
                <select className="form-input" value={bloodType} onChange={e => setBloodType(e.target.value)}>
                  <option value="Unknown">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact & Address */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] font-bold text-txt2 uppercase tracking-wider border-b border-border pb-1">
              Contact & Address
            </div>
            <div className="form-group">
              <label className="form-label">Address / Barangay (Calauan, Laguna)</label>
              <input 
                className="form-input" 
                placeholder="Brgy., Municipality, Province" 
                list="suggested-barangays"
                value={addr} 
                onChange={e => setAddr(e.target.value)} 
              />
              <datalist id="suggested-barangays">
                {BARANGAYS.map(b => (
                  <option key={b} value={`Brgy. ${b}, Calauan, Laguna`} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="form-group">
                <label className="form-label">PhilHealth / ID</label>
                <input className="form-input" placeholder="PH-XXXXXXXXXX" value={ph} onChange={e => setPh(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact number</label>
                <input className="form-input" placeholder="09XXXXXXXXX" value={ct} onChange={e => setCt(e.target.value)} inputMode="numeric" />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] font-bold text-txt2 uppercase tracking-wider border-b border-border pb-1">
              Emergency Contact
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person Name</label>
              <input className="form-input" placeholder="Full Name" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <input className="form-input" placeholder="e.g. Spouse, Mother" value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="09XXXXXXXXX" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} inputMode="numeric" />
              </div>
            </div>
          </div>

          {/* Initial Medical */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] font-bold text-txt2 uppercase tracking-wider border-b border-border pb-1">
              Initial Medical Data
            </div>
            <div className="form-group">
              <label className="form-label">Known conditions / Allergies</label>
              <textarea className="form-input min-h-[80px]" placeholder="e.g., Hypertension, DM Type 2, Penicillin Allergy" value={cond} onChange={e => setCond(e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>

      {/* EHR Modal */}
      <Modal
        isOpen={isEhrModalOpen}
        onClose={() => setIsEhrModalOpen(false)}
        title={selectedPt?.name || ''}
        subtitle={`${selectedPt?.age || '?'}${selectedPt?.sex || ''} · ${selectedPt?.philhealth || '—'}`}
        footer={
          <>
            {isClinical && (
              <button className="btn btn-d btn-sm" onClick={() => selectedPt && handleDelete(selectedPt.id, selectedPt.name)}>Delete</button>
            )}
            <button className="btn flex-1" onClick={() => setIsEhrModalOpen(false)}>Close</button>
            <button className="btn btn-p flex-1" onClick={() => { addToast('Booking functionality coming soon', 'b'); setIsEhrModalOpen(false); }}>Book Appointment</button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <div className="flex gap-3 mb-1">
            <div className={cn("w-[42px] h-[42px] rounded-full flex items-center justify-center text-[14px] font-bold shrink-0", selectedPt?.av)}>
              {selectedPt?.initials}
            </div>
            <div>
              <div className="text-[17px] font-bold text-txt">{selectedPt?.name}</div>
              <div className="text-[13px] text-txt2">{selectedPt?.age}{selectedPt?.sex} · {selectedPt?.philhealth}</div>
            </div>
          </div>

          <div className="card">
            <div className="text-[10px] font-bold text-txt2 uppercase tracking-wider mb-2.5">Demographics & Profile</div>
            <table className="w-full text-[13px]">
              <tbody className="divide-y divide-border/30">
                <tr><td className="text-txt2 py-2 min-w-[120px]">Address</td><td className="font-semibold py-2">{selectedPt?.address}</td></tr>
                <tr><td className="text-txt2 py-2">Birth Info</td><td className="font-semibold py-2">{selectedPt?.dob} · {selectedPt?.birthPlace || 'Not Specified'}</td></tr>
                <tr><td className="text-txt2 py-2">Status</td><td className="font-semibold py-2">{selectedPt?.civilStatus} · {selectedPt?.nationality}</td></tr>
                <tr><td className="text-txt2 py-2">Occupation</td><td className="font-semibold py-2">{selectedPt?.occupation} · {selectedPt?.education || '—'}</td></tr>
                <tr><td className="text-txt2 py-2">Beliefs</td><td className="font-semibold py-2">{selectedPt?.religion || '—'}</td></tr>
                <tr><td className="text-txt2 py-2">Blood Type</td><td className="font-semibold py-2 text-red-600 font-bold">{selectedPt?.bloodType}</td></tr>
                <tr><td className="text-txt2 py-2">Contact</td><td className="font-semibold py-2">{selectedPt?.contact}</td></tr>
                <tr><td className="text-txt2 py-2">Condition</td><td className="font-semibold py-2">{selectedPt?.condition}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="card border-l-4 border-l-red">
            <div className="text-[10px] font-bold text-red uppercase tracking-wider mb-2.5">Emergency Contact</div>
            <div className="text-[14px] font-bold">{selectedPt?.emergencyContact?.name || 'No contact specified'}</div>
            <div className="text-[12px] text-txt2">{selectedPt?.emergencyContact?.relation} · {selectedPt?.emergencyContact?.phone}</div>
          </div>

          {isClinical && (
            <div className="card">
              <div className="text-[10px] font-bold text-txt2 uppercase tracking-wider mb-2.5">Update demographics & clinical record</div>
              
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="form-group">
                  <label className="form-label">Contact</label>
                  <input className="form-input" id="up-ct" defaultValue={selectedPt?.contact} inputMode="numeric" />
                </div>
                <div className="form-group">
                  <label className="form-label">Civil Status</label>
                  <select className="form-input" id="up-civil" defaultValue={selectedPt?.civilStatus}>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="form-group">
                  <label className="form-label">Blood Type</label>
                  <select className="form-input" id="up-blood" defaultValue={selectedPt?.bloodType}>
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input className="form-input" id="up-nat" defaultValue={selectedPt?.nationality} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input className="form-input" id="up-occ" defaultValue={selectedPt?.occupation} />
                </div>
                <div className="form-group">
                  <label className="form-label">Religion</label>
                  <input className="form-input" id="up-rel" defaultValue={selectedPt?.religion} />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Address</label>
                <input className="form-input" id="up-addr" defaultValue={selectedPt?.address} />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Condition / Diagnosis</label>
                <textarea className="form-input min-h-[60px]" id="up-cond" defaultValue={selectedPt?.condition} />
              </div>

              <button className="btn btn-s btn-sm w-full" onClick={handleUpdate}>Update Record ✓</button>
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
