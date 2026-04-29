import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ToastProps {
  toasts: { id: string; msg: string; type?: 'g' | 'r' | 'b' | 'a' }[];
}

export default function Toast({ toasts }: ToastProps) {
  return (
    <div className="fixed top-[32px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[999] pointer-events-none w-[92vw] max-w-[400px]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={cn(
              "px-8 py-3.5 rounded-full text-[14px] font-black shadow-2xl backdrop-blur-md w-full text-center border-2 border-white/20 uppercase tracking-tight italic",
              t.type === 'g' ? "bg-green text-white shadow-green/20" : 
              t.type === 'r' ? "bg-red text-white shadow-red/20" : 
              t.type === 'b' ? "bg-blue text-white shadow-blue/20" : 
              t.type === 'a' ? "bg-amber text-white shadow-amber/20" : "bg-slate-900/90 text-white shadow-slate-900/20"
            )}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
