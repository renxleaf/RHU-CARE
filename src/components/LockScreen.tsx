import { useState } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Lock } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

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
            onUnlock();
          } else {
            setPin('');
            setError('Incorrect Security PIN');
            setTimeout(() => setError(''), 3000);
          }
        }, 120);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-blue/10 backdrop-blur-xl flex flex-col items-center justify-center p-8 z-[100]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2),transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md rounded-[48px] p-12 w-full max-w-[420px] shadow-2xl border-4 border-white flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-blue rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue/20 mb-8 border-4 border-white">
          <Lock size={32} />
        </div>
        
        <div className="text-[32px] font-black text-slate-900 tracking-tighter mb-2 italic uppercase">RHU<span className="text-blue">CARE</span></div>
        <div className="text-[14px] text-slate-500 font-bold mb-10 tracking-tight uppercase opacity-60">Locked Node · Enter PIN</div>
        
        <div className="flex gap-4 justify-center mb-10">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-300", 
                i < pin.length ? "bg-blue border-blue scale-125 shadow-glow" : "border-slate-200"
              )} 
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((n, i) => (
            <button 
              key={i} 
              onClick={() => n !== '' && handlePinPress(n)}
              className={cn(
                "h-16 rounded-[24px] bg-slate-50 border-2 border-transparent hover:border-blue/10 hover:bg-white text-[22px] font-black text-slate-700 transition-all active:scale-90 flex items-center justify-center",
                n === '' && "invisible",
                n === '⌫' && "text-slate-300 hover:text-red transition-colors"
              )}
            >
              {n}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red text-[13px] font-black uppercase tracking-widest text-center mt-8 px-6 py-2 bg-red-l rounded-full"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
