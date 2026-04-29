import { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, ShieldCheck, Fingerprint } from 'lucide-react';
import { Role } from '../types';
import { cn } from '../lib/utils';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [role, setRole] = useState<Role>('nurse');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin(role);
    } catch (error: any) {
      setError(error.message || 'Google Sign-In failed');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinPress = (n: string | number) => {
    if (n === '⌫') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const newPin = pin + n;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          const saved = localStorage.getItem('rhucare_pin') || '1234';
          if (newPin === saved) {
            // If they use PIN, we still want them to be authed for cloud sync
            // For this demo, if they are already authed via Firebase, onLogin works.
            // If not, we prompt for Google.
            if (auth.currentUser) {
              onLogin(role);
            } else {
              setPin('');
              setError('Please Sign in with Google first to enable Cloud Sync');
              setTimeout(() => setError(''), 3000);
            }
          } else {
            setPin('');
            setError('Incorrect PIN');
            setTimeout(() => setError(''), 2000);
          }
        }, 120);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 z-10 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] flex flex-col gap-6"
      >
        {/* Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue rounded-2xl shadow-lg mb-4">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">RHUCARE</h1>
          <p className="text-[14px] text-slate-500 mt-2 font-medium">Cloud EHR & Real-time Sync for Calauan, Laguna</p>
        </div>

        <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block text-center">Access Level</label>
            <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <RoleIcon active={role === 'nurse'} icon="👩‍⚕️" label="Nurse" onClick={() => setRole('nurse')} />
              <RoleIcon active={role === 'doctor'} icon="👨‍⚕️" label="Doctor" onClick={() => setRole('doctor')} />
              <RoleIcon active={role === 'bhw'} icon="🏘️" label="BHW" onClick={() => setRole('bhw')} />
              <RoleIcon active={role === 'admin'} icon="🖥️" label="Admin" onClick={() => setRole('admin')} />
              <RoleIcon active={role === 'patient'} icon="👤" label="Patient" onClick={() => setRole('patient')} />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-[13px] font-medium mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Primary Action: Google Login or Patient Portal */}
          <div className="space-y-4">
            {role === 'patient' ? (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Patient Full Name</label>
                    <input 
                      type="text"
                      id="patient-name-input"
                      placeholder="e.g. Maria Dela Cruz"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-bold focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all outline-none"
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Security PIN</label>
                    <input 
                      type="password"
                      id="patient-pin-input"
                      maxLength={4}
                      placeholder="••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[18px] font-bold tracking-[0.5em] focus:ring-2 focus:ring-blue/20 focus:border-blue transition-all outline-none text-center"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest w-full">Available Demo Patients</div>
                  {[
                    { name: 'Maria Dela Cruz', pin: '1234' },
                    { name: 'Roberto Santos', pin: '5678' },
                    { name: 'Elena Reyes', pin: '1122' },
                    { name: 'Ricardo Gomez', pin: '3344' },
                    { name: 'Aurelia Lim', pin: '5566' }
                  ].map(p => (
                    <button 
                      key={p.name}
                      onClick={() => {
                        const inputName = document.getElementById('patient-name-input') as HTMLInputElement;
                        const inputPin = document.getElementById('patient-pin-input') as HTMLInputElement;
                        if (inputName) inputName.value = p.name;
                        if (inputPin) inputPin.value = p.pin;
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue/10 hover:text-blue border border-slate-200 rounded-xl text-[10px] font-black transition-all"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => {
                    const inputName = document.getElementById('patient-name-input') as HTMLInputElement;
                    const inputPin = document.getElementById('patient-pin-input') as HTMLInputElement;
                    const name = inputName?.value || 'Guest Patient';
                    const pin = inputPin?.value || '';

                    // Mock validation
                    const patients = [
                      { name: 'Maria Dela Cruz', pin: '1234' },
                      { name: 'Roberto Santos', pin: '5678' },
                      { name: 'Elena Reyes', pin: '1122' },
                      { name: 'Ricardo Gomez', pin: '3344' },
                      { name: 'Aurelia Lim', pin: '5566' }
                    ];

                    const found = patients.find(p => p.name === name);
                    if (found && found.pin !== pin) {
                      const btn = document.activeElement as HTMLButtonElement;
                      btn.innerText = "Invalid PIN!";
                      btn.classList.add('bg-red', 'border-red-700');
                      setTimeout(() => {
                        btn.innerText = "Access My Records";
                        btn.classList.remove('bg-red', 'border-red-700');
                      }, 2000);
                      return;
                    }

                    localStorage.setItem('demo_patient_name', name);
                    onLogin('patient');
                  }}
                  className="w-full bg-blue hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-[16px] flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98] shadow-xl shadow-blue/20 border-b-4 border-blue-700"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={22} className="text-white/80" />
                    Access My Records
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Digital Health Node</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center font-medium px-4">
                  Access your appointments, health records, and medical directory instantly.
                </p>
              </div>
            ) : (
              <button 
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-slate-200"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Globe size={20} className="text-blue-400" />
                )}
                {isLoading ? 'Connecting...' : 'Sign in with Google Cloud'}
              </button>
            )}

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                {role === 'patient' ? 'Staff & Admin Only' : 'or quick access'}
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Quick Access: PIN (Hidden for patients if they just want to enter) */}
            <div className={cn("flex flex-col items-center", role === 'patient' && "opacity-40 pointer-events-none grayscale")}>
              <div className="flex gap-4 mb-6">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-3 h-3 rounded-full border-2 transition-all duration-300",
                      i < pin.length ? "bg-blue border-blue scale-125 shadow-sm shadow-blue/50" : "bg-slate-100 border-slate-200"
                    )} 
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((n, i) => (
                  <button 
                    key={i} 
                    onClick={() => n !== '' && handlePinPress(n)}
                    className={cn(
                      "h-14 rounded-xl text-[20px] font-bold transition-all active:scale-90 flex items-center justify-center",
                      n === '' ? "invisible" : 
                      n === '⌫' ? "text-slate-400 hover:text-red-500" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Fingerprint size={14} className="text-green-500" />
            RA 10173 Secure · Calauan Laguna
          </div>
          <p className="text-[10px] text-slate-400 text-center max-w-[280px]">
            By signing in, you agree to the clinical data processing protocols of the Rural Health Unit.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function RoleIcon({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 min-w-[70px] p-2 rounded-2xl transition-all",
        active ? "bg-blue-50 scale-110" : "opacity-50 hover:opacity-100"
      )}
    >
      <div className="text-[24px]">{icon}</div>
      <span className={cn("text-[10px] font-bold uppercase tracking-tighter", active ? "text-blue" : "text-slate-500")}>
        {label}
      </span>
    </button>
  );
}
