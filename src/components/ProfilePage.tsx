import { useState } from 'react';
import { ShieldCheck, Trash2, Save, Key } from 'lucide-react';
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h2 className="text-[18px] font-bold">Profile & Settings</h2>
        <p className="text-[13px] text-txt2">Saved to this device</p>
      </div>

      <div className="card">
        <div className="text-[10px] font-bold text-txt2 uppercase tracking-wider mb-3.5">Personal information</div>
        <div className="flex flex-col gap-3.5">
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Role / Position</label>
            <input className="form-input" value={role} onChange={e => setRole(e.target.value)} readOnly={!isAdmin} />
            {!isAdmin && <p className="text-[10px] text-txt3 mt-1 italic">Contact Admin to change role</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Assigned Facility</label>
            <select className="form-input" value={facility} onChange={e => setFacility(e.target.value)} disabled={!isAdmin}>
              <option>Calauan RHU, Laguna</option>
              <option>Calauan BHS — Dayap</option>
              <option>Calauan BHS — Lamot</option>
              <option>Calauan BHS — Mabacan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contact number</label>
            <input className="form-input" placeholder="09XXXXXXXXX" value={contact} onChange={e => setContact(e.target.value)} />
          </div>
          <button className="btn btn-p w-full py-3" onClick={handleSaveProfile}><Save size={16} /> Save Profile ✓</button>
        </div>
      </div>

      <div className="card">
        <div className="text-[10px] font-bold text-txt2 uppercase tracking-wider mb-3.5">Reminder Settings</div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold">In-app Notifications</div>
              <div className="text-[11px] text-txt2">Show alerts for upcoming appointments</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={inAppReminders} 
                onChange={e => setInAppReminders(e.target.checked)} 
              />
              <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
            </label>
          </div>
          {!isPatient && (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold">SMS Reminders</div>
                <div className="text-[11px] text-txt2">Send SMS to patients 24h before</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={smsReminders} 
                  onChange={e => setSmsReminders(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
              </label>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Reminder Interval</label>
            <select 
              className="form-input" 
              value={reminderInterval} 
              onChange={e => setReminderInterval(e.target.value)}
            >
              <option>30 minutes before</option>
              <option>1 hour before</option>
              <option>2 hours before</option>
              <option>24 hours before</option>
            </select>
          </div>
        </div>
      </div>

      {!isPatient && (
        <div className="card">
          <div className="text-[10px] font-bold text-txt2 uppercase tracking-wider mb-3.5">Data Management</div>
          <div className="flex flex-col gap-3.5">
            <button className="btn btn-w w-full py-3" onClick={handleBackup}>
              <Save size={16} className="mr-2" /> Download Manual Backup (.json)
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="text-[10px] font-bold text-txt2 uppercase tracking-wider mb-3.5">Change PIN</div>
        <div className="flex flex-col gap-3.5">
          <div className="form-group">
            <label className="form-label">New 4-digit PIN</label>
            <input 
              className="form-input" 
              type="password" 
              maxLength={4} 
              placeholder="4-digit PIN" 
              inputMode="numeric" 
              value={pin}
              onChange={e => setPin(e.target.value)}
            />
          </div>
          <button className="btn btn-p w-full py-3" onClick={handleSavePin}><Key size={16} /> Update PIN ✓</button>
        </div>
      </div>

      {!isPatient && (
        <div className="card">
          <div className="text-[10px] font-bold text-txt2 uppercase tracking-wider mb-3.5">Hardware Ecosystem: PHP 25,000 Station</div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold">TechLife Pad Plus</div>
                <div className="text-[11px] text-txt2 text-blue">8,000mAh · Helio G91 · GCM V4</div>
              </div>
              <span className="chip bg-blue-l border-blue-m text-blue font-bold">Primary ✓</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div>
                <div className="text-[13px] font-semibold">USB OTG Sensor Bridge</div>
                <div className="text-[11px] text-txt2">BP / Oximeter / Thermometer</div>
              </div>
              <span className="chip bg-green-l border-green-m text-green">Connected ✓</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div>
                <div className="text-[13px] font-semibold">Sensor Integrity Check</div>
                <div className="text-[11px] text-txt2">Automatic recalibration sync</div>
              </div>
              <span className="chip bg-slate-100 border-border text-txt3">Last: 3h ago</span>
            </div>
          </div>
        </div>
      )}

      {!isPatient && (
        <div className="card">
          <div className="text-[10px] font-bold text-txt2 uppercase tracking-wider mb-3.5">Security & Compliance — RA 10173</div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold">Edge-AES Encryption</div>
                <div className="text-[11px] text-txt2">Hardware-backed 256-bit AES</div>
              </div>
              <span className="chip bg-green-l border-green-m text-green">FIPS-140-2 ✓</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div>
                <div className="text-[13px] font-semibold">Lost Device Protocol</div>
                <div className="text-[11px] text-txt2">Remote wipe + MicroSD Recovery</div>
              </div>
              <span className="chip bg-blue-l border-blue-m text-blue">Armed ✓</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div>
                <div className="text-[13px] font-semibold">Privacy by Default</div>
                <div className="text-[11px] text-txt2">LGU Local-First Data Sovereignty</div>
              </div>
              <ShieldCheck className="text-blue" size={20} />
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="card border-red/20 bg-red/5">
          <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-3.5 italic">Danger Zone — Admin Only</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-red-700">System Hard Reset</div>
              <div className="text-[11px] text-red-500">Purge all local records immediately</div>
            </div>
            <button className="btn btn-sm btn-d py-1.5 px-3 bg-red hover:bg-red-700" onClick={handleWipe}><Trash2 size={14} /> Wipe Data</button>
          </div>
        </div>
      )}
    </div>
  );
}
