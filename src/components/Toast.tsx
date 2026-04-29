import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ToastProps {
  toasts: { id: string; msg: string; type?: 'g' | 'r' | 'b' | 'a' }[];
}

export default function Toast({ toasts }: ToastProps) {
  return (
    <div className="fixed top-[60px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-[99] pointer-events-none w-[92vw] max-w-[380px]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              "px-4 py-2.5 rounded-r text-[13px] font-semibold shadow-sh-md w-full text-center text-white",
              t.type === 'g' ? "bg-green" : 
              t.type === 'r' ? "bg-red" : 
              t.type === 'b' ? "bg-blue" : 
              t.type === 'a' ? "bg-amber" : "bg-[#18180E]"
            )}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
