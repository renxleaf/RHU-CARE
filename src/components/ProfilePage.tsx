import { useState } from 'react';
import { ShieldCheck, Trash2, Save, Key, Smartphone } from 'lucide-react';
import { Profile } from '../types';
import { saveObj } from '../lib/utils';

interface ProfilePageProps {
  profile: Profile;
  setProfile: (p: Profile) => void;
  addToast: (msg: string, type?: 'g' | 'r' | 'b' | 'a') => void;
  onHardReset?: () => void;
  isAdmin?: boolean;
}

export default function ProfilePage({ profile, setProfile, addToast, onHardReset, isAdmin }: ProfilePageProps) {
  const isPatient = profile.role.toLowerCase() === 'patient';
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [facility, setFacility] = useState(profile.facility);
  const [contact, setContact] = useState(profile.contact);
  const [pin, setPin] = useState('');
  
  const [inAppReminders, setInAppReminders] = useState(profile.reminderSettings?.inApp ?? true);
  const [smsReminders, setSmsReminders] = useState(profile.reminderSettings?.sms ?? false);
  const [reminderInterval, setReminderInterval] = useState(profile.reminderSettings?.interval ?? '1 hour before');

  const handleSaveProfile = () => {
    const newProfile: Profile = { 
      name, 
      role, 
      facility, 
      contact,
      reminderSettings: {
        inApp: inAppReminders,
        sms: smsReminders,
        interval: reminderInterval
      }
    };
    setProfile(newProfile);
    saveObj('profile', newProfile);
    addToast('Profile saved ✓', 'g');
  };

  const handleSavePin = () => {
    if (!/^\d{4}$/.test(pin)) {
      addToast('PIN must be exactly 4 digits', 'r');
      return;
    }
    localStorage.setItem('rhucare_pin', pin);
    setPin('');
    addToast('PIN updated ✓', 'g');
  };

  const handleWipe = async () => {
    if (confirm('⚠ Hard Reset: Delete ALL patient data, queue, appointments, and transport from cloud and local device?\n\nThis will reset the system to its initial state.')) {
      if (confirm('Final confirmation — wipe everything?')) {
        const keysToKeep = ['rhucare_pin', 'rhucare_profile'];
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('rhucare_') && !keysToKeep.includes(k)) {
            localStorage.removeItem(k);
          }
        });
        localStorage.removeItem('rhucare_seeded_v3');
        
        if (onHardReset) {
          await onHardReset();
        }
        
        addToast('System reset complete', 'r');
        window.location.reload();
      }
    }
  };

  const handleBackup = () => {
    const data: Record<string, any> = {};
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('rhucare_')) {
        try {
          data[k] = JSON.parse(localStorage.getItem(k) || '');
        } catch {
          data[k] = localStorage.getItem(k);
        }
      }
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rhucare_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Backup downloaded ✓', 'g');
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-[28px] font-black tracking-tight text-txt uppercase">Node Management</h2>
          <p className="text-[14px] text-txt2 font-medium">Instance: Calauan RHU · RA 10173 Audit Secure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-panel border border-border rounded-2xl shadow-sh-md overflow-hidden bg-white">
            <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-txt tracking-tight uppercase flex items-center gap-2">
                User Identity Profile
              </h3>
              <ShieldCheck className="text-blue" size={20} />
            </div>
            
            <div className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Operator Full Name</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Assigned Node Rank</label>
                  <input 
                    className="form-input bg-slate-50 font-bold" 
                    value={role} 
                    readOnly={!isAdmin} 
                    onChange={isAdmin ? e => setRole(e.target.value) : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Clinical Station Assignment</label>
                  <select className="form-input" value={facility} onChange={e => setFacility(e.target.value)} disabled={!isAdmin}>
                    <option>Calauan RHU, Laguna</option>
                    <option>Calauan BHS — Dayap</option>
                    <option>Calauan BHS — Lamot</option>
                    <option>Calauan BHS — Mabacan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">Direct Contact Bridge</label>
                  <input className="form-input" placeholder="09XXXXXXXXX" value={contact} onChange={e => setContact(e.target.value)} />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  className="px-8 py-3 bg-sidebar text-white rounded-xl font-bold hover:shadow-lg shadow-sidebar/20 transition-all flex items-center gap-2"
                  onClick={handleSaveProfile}
                >
                  <Save size={18} /> Update Registry
                </button>
              </div>
            </div>
          </div>

          <div className="bg-panel border border-border rounded-2xl shadow-sh-md overflow-hidden bg-white">
            <div className="p-6 border-b border-border bg-slate-50/50">
              <h3 className="text-[16px] font-black text-txt tracking-tight uppercase">Operational Parameters</h3>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-bold text-txt">In-app Telemetry Alerts</div>
                  <div className="text-[13px] text-txt2">Surface real-time operational shifts and queue changes</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={inAppReminders} 
                    onChange={e => setInAppReminders(e.target.checked)} 
                  />
                  <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue"></div>
                </label>
              </div>

              {!isPatient && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[15px] font-bold text-txt">Patient SMS Gateway</div>
                    <div className="text-[13px] text-txt2 text-blue">Automated schedule verification for confirmed bookings</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={smsReminders} 
                      onChange={e => setSmsReminders(e.target.checked)} 
                    />
                    <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue"></div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Hardware & Ecosystem Focus */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue/20 rounded-xl flex items-center justify-center text-blue shadow-glow">
                  <Smartphone size={20} />
                </div>
                <h4 className="text-[14px] font-black uppercase tracking-tight">Active Edge Station</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Device</span>
                  <span className="text-[12px] font-black tracking-tight">TechLife Pad Plus</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Bridge Status</span>
                  <span className="text-[12px] font-black tracking-tight text-blue">USB Bridge Connected</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase">Sync Loop</span>
                  <span className="text-[12px] font-black tracking-tight text-green">100% Accurate</span>
                </div>
              </div>

              <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Hardware UUID</div>
                <div className="text-[12px] font-mono opacity-60 truncate">RHU-CH-2026-LGU-4412-X</div>
              </div>
            </div>
            {/* Design flair */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity" />
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-txt3">
                <Key size={20} />
              </div>
              <h4 className="text-[15px] font-black uppercase tracking-tight">Access Guardian</h4>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="text-[11px] font-black text-txt3 uppercase tracking-widest mb-2 block">System Entrance PIN</label>
                <input 
                  className="form-input bg-slate-50" 
                  type="password" 
                  maxLength={4} 
                  placeholder="Update 4-digit PIN" 
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                />
              </div>
              <button 
                className="w-full py-3 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all"
                onClick={handleSavePin}
              >
                Secure Terminal
              </button>
            </div>
          </div>

          {!isPatient && (
            <div className="bg-panel border border-border rounded-2xl p-6 shadow-sh flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-l rounded-xl flex items-center justify-center text-amber shadow-sm">
                  <Save size={20} />
                </div>
                <h4 className="text-[15px] font-black uppercase tracking-tight text-txt">Persistence</h4>
              </div>
              <p className="text-[12px] text-txt2 leading-relaxed">
                Export and archive local database snapshots for off-grid auditing.
              </p>
              <button 
                className="w-full py-3 bg-panel2 border border-border rounded-xl text-[13px] font-black uppercase tracking-widest text-txt hover:bg-slate-200 transition-all"
                onClick={handleBackup}
              >
                Snapshot Database
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="bg-red-l/30 border border-red-m/20 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-l rounded-xl flex items-center justify-center text-red">
                  <Trash2 size={20} />
                </div>
                <h4 className="text-[15px] font-black uppercase tracking-tight text-red">Critical Purge</h4>
              </div>
              <p className="text-[12px] text-red-800 leading-relaxed opacity-70">
                Execute a total node reset. This wipes all encrypted local storage immediately.
              </p>
              <button 
                className="w-full py-3 bg-red text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-lg shadow-red/20 hover:opacity-90 active:scale-[0.98] transition-all"
                onClick={handleWipe}
              >
                Factory Node Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
