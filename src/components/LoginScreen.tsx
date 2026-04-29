import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
            if (auth.currentUser) {
              onLogin(role);
            } else {
              setPin('');
              setError('Connect with Google first for Cloud Sync');
              setTimeout(() => setError(''), 3000);
            }
          } else {
            setPin('');
            setError('Incorrect Security PIN');
            setTimeout(() => setError(''), 2000);
          }
        }, 120);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center p-8 z-10 overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.05),transparent_50%)] pointer-events-none" />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="w-full max-w-[440px] flex flex-col gap-8 relative z-10"
      >
        {/* Branding */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="text-center"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-blue rounded-[32px] shadow-2xl shadow-blue/20 mb-6 border-4 border-white"
          >
            <ShieldCheck className="text-white" size={40} />
          </motion.div>
          <h1 className="text-[42px] font-black text-slate-900 tracking-tighter leading-none italic uppercase">RHU<span className="text-blue">CARE</span></h1>
          <p className="text-[15px] text-slate-500 mt-4 font-bold tracking-tight px-4 opacity-70">Healthcare that feels like family. Secure & Modern.</p>
        </motion.div>

        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 }
          }}
          className="bg-white rounded-[48px] p-10 shadow-2xl shadow-slate-200/40 border-2 border-slate-50"
        >
          {/* Role Selection */}
          <div className="mb-10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block text-center">Identity Node</label>
    <div className="flex justify-center gap-1.5 px-2">
      <RoleIcon active={role === 'nurse'} icon="👩‍⚕️" label="Nurse" onClick={() => setRole('nurse')} />
      <RoleIcon active={role === 'doctor'} icon="👨‍⚕️" label="Doctor" onClick={() => setRole('doctor')} />
      <RoleIcon active={role === 'bhw'} icon="🏠" label="BHW" onClick={() => setRole('bhw')} />
      <RoleIcon active={role === 'admin'} icon="🖥️" label="Admin" onClick={() => setRole('admin')} />
      <RoleIcon active={role === 'patient'} icon="👤" label="Patient" onClick={() => setRole('patient')} />
    </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-l border border-red-m text-red rounded-2xl p-4 text-[13px] font-bold mb-8 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {role === 'patient' ? (
              <motion.div 
                key="patient-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
                    <input 
                      type="text"
                      id="patient-name-input"
                      placeholder="e.g. Maria Dela Cruz"
                      className="w-full bg-bg border-2 border-border/40 rounded-2xl px-6 py-4 text-[15px] font-bold focus:ring-4 focus:ring-blue/10 focus:border-blue transition-all outline-none"
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Personal PIN</label>
                    <input 
                      type="password"
                      id="patient-pin-input"
                      maxLength={4}
                      placeholder="••••"
                      className="w-full bg-bg border-2 border-border/40 rounded-2xl px-6 py-4 text-[24px] font-bold tracking-[0.8em] focus:ring-4 focus:ring-blue/10 focus:border-blue transition-all outline-none text-center"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {['Dela Cruz, Ricardo P.', 'Santos, Maria Theresa L.', 'Villanueva, Clara M.'].map(name => (
                    <button 
                      key={name}
                      onClick={() => {
                        const inputName = document.getElementById('patient-name-input') as HTMLInputElement;
                        if (inputName) inputName.value = name;
                        const inputPin = document.getElementById('patient-pin-input') as HTMLInputElement;
                        if (inputPin) inputPin.value = '1234';
                      }}
                      className="px-4 py-2 bg-slate-50 hover:bg-blue-l text-txt2 hover:text-blue border-2 border-border/20 rounded-full text-[11px] font-bold transition-all active:scale-95"
                    >
                      {name}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => {
                    const inputName = document.getElementById('patient-name-input') as HTMLInputElement;
                    const inputPin = document.getElementById('patient-pin-input') as HTMLInputElement;
                    const name = inputName?.value || 'Guest Patient';
                    const pin = inputPin?.value || '';

                    const patients = [
                      { name: 'Dela Cruz, Ricardo P.', pin: '1234' },
                      { name: 'Santos, Maria Theresa L.', pin: '5678' },
                      { name: 'Villanueva, Clara M.', pin: '1122' }
                    ];

                    const found = patients.find(p => p.name === name);
                    if (found && found.pin !== pin) {
                      setError("Invalid Security PIN");
                      setTimeout(() => setError(""), 2000);
                      return;
                    }

                    localStorage.setItem('demo_patient_name', name);
                    onLogin('patient');
                  }}
                  className="w-full bg-blue text-white py-5 rounded-[24px] font-black text-[18px] flex flex-col items-center justify-center transition-all active:scale-95 shadow-2xl shadow-blue/20 uppercase tracking-tight italic"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={24} className="opacity-80" />
                    Enter My Clinic
                  </div>
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="staff-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <button 
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
                  className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-[16px] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-70 shadow-2xl uppercase tracking-widest italic"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Globe size={24} className="text-blue" />
                  )}
                  {isLoading ? 'Syncing...' : 'Secure Login'}
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t-2 border-slate-50"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Quick Entry</span>
                  <div className="flex-grow border-t-2 border-slate-50"></div>
                </div>

                {/* PIN Grid */}
                <div className="flex flex-col items-center">
                  <div className="flex gap-4 mb-8">
                    {[0, 1, 2, 3].map(i => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-4 h-4 rounded-full border-2 transition-all duration-300",
                          i < pin.length ? "bg-blue border-blue scale-125 shadow-glow" : "bg-slate-50 border-slate-100"
                        )} 
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 w-full max-w-[300px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((n, i) => (
                      <button 
                        key={i} 
                        onClick={() => n !== '' && handlePinPress(n)}
                        className={cn(
                          "h-16 rounded-[24px] text-[22px] font-black transition-all active:scale-90 flex items-center justify-center",
                          n === '' ? "invisible" : 
                          n === '⌫' ? "text-slate-300 hover:text-red transition-colors" : "bg-slate-50 hover:bg-panel2 text-slate-700 border-2 border-transparent hover:border-blue/10"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          className="flex flex-col items-center gap-4 py-4"
        >
          <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <Fingerprint size={16} className="text-green" />
            Node-to-Cloud Encryption Active
          </div>
          <p className="text-[11px] text-slate-400 text-center font-medium opacity-60 leading-relaxed px-10">
            Rural Health Unit · Calauan, Laguna
            <br />
            Station 0{Math.floor(Math.random() * 5) + 1}-A · v4.0.1
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function RoleIcon({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 flex-1 p-4 rounded-[28px] transition-all border-2",
        active ? "bg-blue-l/50 border-blue-m/30 scale-105 shadow-sh" : "border-transparent opacity-40 hover:opacity-100"
      )}
    >
      <div className="text-[32px]">{icon}</div>
      <span className={cn("text-[11px] font-black uppercase tracking-tighter", active ? "text-blue" : "text-slate-500")}>
        {label}
      </span>
    </button>
  );
}
