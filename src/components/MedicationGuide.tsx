import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, X, Play, ChevronRight, Clock } from 'lucide-react';

interface MedicationGuideProps {
  onClose: () => void;
}

export default function MedicationGuide({ onClose }: MedicationGuideProps) {
  const [steps, setSteps] = useState([
    { id: 1, text: 'VERIFY PATIENT IDENTITY', done: true },
    { id: 2, text: 'CHECK MEDICATION ORDER', done: true },
    { id: 3, text: 'CONFIRM 10 RIGHTS OF MEDICATION', done: true },
    { id: 4, text: 'ADMINISTER DRUG', done: false },
    { id: 5, text: 'DOCUMENT ADMINISTRATION', done: false },
  ]);

  const toggleStep = (id: number) => {
    setSteps(steps.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const completedCount = steps.filter(s => s.done).length;
  const isComplete = completedCount === steps.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • LIVE CHECKLIST
                </span>
              </div>
              <h2 className="text-[18px] font-black tracking-tight leading-tight uppercase">Medication Guide Checklist</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Active Task</label>
            <div className="text-[14px] font-bold tracking-tight">ADMINISTERING PARACETAMOL IV (1G)</div>
          </div>
        </div>

        <div className="p-6 space-y-3 bg-slate-50">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                step.done 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {step.done ? (
                <CheckCircle2 size={22} className="text-green-600 shrink-0" />
              ) : (
                <Circle size={22} className="text-slate-300 shrink-0" />
              )}
              <div className="flex flex-col items-start">
                <span className={`text-[12px] font-black tracking-wide ${step.done ? 'line-through opacity-60' : ''}`}>
                  {step.text}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">
                  {step.done ? 'DONE' : 'NOT YET DONE'}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[13px] font-bold text-slate-500">
              <span className="text-slate-900 font-black">{completedCount}/{steps.length}</span> Steps Completed
            </div>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${(completedCount / steps.length) * 100}%` }}
              />
            </div>
          </div>
          
          <button 
            disabled={isComplete}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-[15px] font-black transition-all ${
              isComplete
                ? 'bg-green-100 text-green-600'
                : 'bg-blue text-white hover:bg-blue-700 shadow-lg shadow-blue/20'
            }`}
          >
            {isComplete ? (
              <>COMPLETED <CheckCircle2 size={18}/></>
            ) : (
              <>NEXT STEP <ChevronRight size={18}/></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
