import React from 'react';
import { Globe, Shield, Radio, Server, MessageSquare, AlertTriangle, Cpu, Network } from 'lucide-react';

export default function ExternalWork() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1 italic">Sovereign Connectivity</div>
          <h1 className="text-[28px] font-black tracking-tighter text-slate-900 uppercase">External Infrastructure</h1>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 text-[11px] font-black uppercase">
            <Radio size={14} className="animate-pulse" /> Delta Sync Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatusCard 
          icon={<Server size={24} />} 
          label="Municipal Hub" 
          status="Operational" 
          detail="Calauan Central Server" 
          latency="12ms"
        />
        <StatusCard 
          icon={<Globe size={24} />} 
          label="DOH PHIE Bridge" 
          status="Standby" 
          detail="National Health Exchange" 
          latency="High"
          warning
        />
        <StatusCard 
          icon={<Shield size={24} />} 
          label="Security Vault" 
          status="Locked" 
          detail="AES-256 Hardware Key" 
          latency="0ms"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="card p-8 bg-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Network size={120} />
          </div>
          <h3 className="text-[18px] font-black uppercase tracking-tight mb-4 flex items-center gap-2">
            <Cpu size={20} className="text-blue-400" /> Distributed Node Status
          </h3>
          <div className="space-y-4 relative z-10">
            <NodeRow name="RHU Main (Laguna)" status="online" load={42} />
            <NodeRow name="BHS Dayap Satellite" status="online" load={18} />
            <NodeRow name="BHS Lamot Satellite" status="warning" load={85} />
            <NodeRow name="Mobile Health Unit 04" status="offline" load={0} />
          </div>
        </div>

        <div className="card p-8 bg-white shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-[18px] font-black uppercase tracking-tight mb-2 text-slate-900">Communication Alerts</h3>
            <p className="text-[13px] text-slate-500 mb-6">Critical messages from provincial health office.</p>
          </div>
          <div className="space-y-4 mb-6">
            <AlertItem 
              type="error" 
              title="Sync Conflict" 
              time="14 mins ago" 
              desc="Record ID #4492 has conflicting timestamps on PHIE Bridge." 
            />
            <AlertItem 
              type="info" 
              title="Protocol Update" 
              time="2 hours ago" 
              desc="New Zika screening protocols ready for deployment." 
            />
          </div>
          <button className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase text-[12px] tracking-widest rounded-2xl transition-all">
            Open Message Portal
          </button>
        </div>
      </div>

      <div className="bg-blue/5 border border-blue/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="p-6 bg-blue rounded-full shadow-2xl shadow-blue/30 text-white">
          <MessageSquare size={32} />
        </div>
        <div>
          <h4 className="text-[20px] font-black text-slate-900 uppercase tracking-tighter mb-1">PhilHealth Liaison Bridge</h4>
          <p className="text-[14px] text-slate-600 font-medium leading-relaxed max-w-xl">
            Automated submission of electronic claims and membership verification. High-speed tunnel active for verified LGUs under Region 4A.
          </p>
        </div>
        <button className="md:ml-auto btn btn-p bg-blue text-white whitespace-nowrap">Connect Tunnel</button>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, status, detail, latency, warning }: any) {
  return (
    <div className="card p-6 bg-white shadow-sm border border-slate-100">
      <div className={`p-3 rounded-2xl mb-4 w-fit ${warning ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
        {icon}
      </div>
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${status === 'Operational' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{status}</span>
      </div>
      <div className="text-[15px] font-black text-slate-900 mb-3">{detail}</div>
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
        <span className="opacity-60">LATENCY:</span> {latency}
      </div>
    </div>
  );
}

function NodeRow({ name, status, load }: any) {
  return (
    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : status === 'warning' ? 'bg-amber-400' : 'bg-slate-500'}`} />
        <span className="text-[13px] font-bold opacity-90">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400" style={{ width: `${load}%` }} />
        </div>
        <span className="text-[11px] font-black opacity-50">{load}%</span>
      </div>
    </div>
  );
}

function AlertItem({ type, title, time, desc }: any) {
  return (
    <div className={`p-4 rounded-xl border ${type === 'error' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
      <div className="flex justify-between items-start mb-1">
        <span className={`text-[12px] font-black uppercase tracking-tight ${type === 'error' ? 'text-red-700' : 'text-blue-700'}`}>{title}</span>
        <span className="text-[10px] font-medium text-slate-400">{time}</span>
      </div>
      <p className="text-[11px] text-slate-600 leading-tight">{desc}</p>
    </div>
  );
}
