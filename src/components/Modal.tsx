import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ isOpen, onClose, title, subtitle, children, footer }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border/20"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 shrink-0 relative bg-gradient-to-br from-blue/5 via-transparent to-transparent">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h2 className="text-[24px] font-black text-txt tracking-tighter uppercase italic">{title}</h2>
                  {subtitle && <p className="text-[12px] text-txt2 font-bold mt-1 opacity-60 uppercase tracking-widest">{subtitle}</p>}
                </div>
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 rounded-xl bg-panel2 hover:bg-red-l hover:text-red transition-all flex items-center justify-center active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-8 pb-8 overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>

            {footer && (
              <div className="px-8 py-5 bg-slate-50 border-t border-border/20 shrink-0 flex gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
