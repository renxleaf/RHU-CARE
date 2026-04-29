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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-panel rounded-t-xl sm:rounded-xl shadow-sh-md overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-5 overflow-y-auto flex-1">
              <div className="w-9 h-1 bg-border2 rounded-full mx-auto mb-4 sm:hidden" />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-[17px] font-bold text-txt">{title}</h2>
                  {subtitle && <p className="text-[13px] text-txt2">{subtitle}</p>}
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-bg sm:block hidden">
                  <X size={20} className="text-txt2" />
                </button>
              </div>
              {children}
            </div>
            {footer && (
              <div className="p-5 pt-3 border-t border-border bg-panel shrink-0 flex gap-2">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
