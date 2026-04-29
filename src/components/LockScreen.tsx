import { useState } from 'react';
import { cn } from '../lib/utils';

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
            setError('Incorrect PIN. Try again.');
            setTimeout(() => setError(''), 3000);
          }
        }, 120);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-blue flex flex-col items-center justify-center p-6 z-[60]">
      <div className="bg-white rounded-xl p-8 w-full max-w-[380px] shadow-sh-md">
        <div className="text-[26px] font-bold text-blue tracking-tight mb-1">RHUCARE</div>
        <div className="text-[13px] text-txt2 mb-6 leading-tight">Session locked · Enter PIN to continue</div>
        
        <div className="flex gap-3 justify-center my-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={cn("w-3.5 h-3.5 rounded-full border-2 border-border2 transition-all", i < pin.length && "bg-blue border-blue")} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5 mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((n, i) => (
            <button 
              key={i} 
              onClick={() => n !== '' && handlePinPress(n)}
              className={cn(
                "p-4 rounded-r border-[1.5px] border-border bg-panel text-[18px] font-semibold text-txt transition-all active:bg-blue-l active:border-blue-m active:scale-95",
                n === '' && "invisible"
              )}
            >
              {n}
            </button>
          ))}
        </div>

        {error && <div className="text-red text-[13px] font-semibold text-center mt-4">{error}</div>}
      </div>
    </div>
  );
}
