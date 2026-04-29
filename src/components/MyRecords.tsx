import React, { useState } from 'react';
import { FileText, Calendar, Clock, Activity, ShieldCheck, Download, ExternalLink, User, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Patient, Appointment } from '../types';

interface MyRecordsProps {
  patient?: Patient;
  appointments?: {
    data: Appointment[];
  };
}

export default function MyRecords({ patient, appointments }: MyRecordsProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'lab' | 'meds'>('history');

  // Mock library of patient data for the portal demo
  const PATIENT_DATABASE: Record<string, any> = {
    'Dela Cruz, Ricardo P.': {
      name: 'Dela Cruz, Ricardo P.',
      age: '58',
      sex: 'Male',
      dob: '1968-04-12',
      philhealth: '12-004567890-1',
      condition: 'Hypertension Stage 2',
      bloodType: 'O+',
      weight: '78 kg',
      height: '172 cm',
      visits: [
        { date: '2026-04-20', type: 'Cardiology Follow-up', provider: 'Dr. Felipe', facility: 'Calauan RHU', bp: '160/100', weight: '78kg', diagnosis: 'Stage 2 Hypertension (Uncontrolled)', plan: 'Shift to Amlodipine + Losartan. Low sodium diet. Follow-up in 2 weeks.' },
        { date: '2026-03-12', type: 'Routine Screening', provider: 'Nurse Reyes', facility: 'Calauan RHU', bp: '145/95', weight: '79kg', diagnosis: 'Pre-hypertension monitoring', plan: 'Increased physical activity. BP monitoring at home.' }
      ],
      labs: [
        { name: 'Lipid Profile', date: '2026-03-22', result: 'High LDL', status: 'Final' }
      ],
      medications: [
        { name: 'Losartan', dosage: '50mg', frequency: 'Once Daily', duration: 'Maintenance', status: 'Active' },
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once Daily', duration: 'Maintenance', status: 'Active' }
      ]
    },
    'Santos, Maria Theresa L.': {
      name: 'Santos, Maria Theresa L.',
      age: '42',
      sex: 'Female',
      dob: '1984-08-22',
      philhealth: '01-234567890-3',
      condition: 'Diabetes Mellitus Type 2',
      bloodType: 'A+',
      weight: '68 kg',
      height: '158 cm',
      visits: [
        { date: '2026-04-18', type: 'Endocrine Consult', provider: 'Dr. Lopez', facility: 'Calauan RHU', bp: '130/80', weight: '68kg', diagnosis: 'Type 2 Diabetes (Poor Glycemic Control)', plan: 'Metformin 500mg BID. Nutritional counseling. Monitor CBG daily.' }
      ],
      labs: [
        { name: 'HbA1c', date: '2026-04-18', result: '8.5%', status: 'Final' }
      ],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice Daily', duration: 'Maintenance', status: 'Active' }
      ]
    },
    'Villanueva, Clara M.': {
      name: 'Villanueva, Clara M.',
      age: '34',
      sex: 'Female',
      dob: '1992-05-18',
      philhealth: '56-789012345-7',
      condition: 'G2P1 32w AOG',
      bloodType: 'B+',
      weight: '64 kg',
      height: '158 cm',
      visits: [
        { date: '2026-04-12', type: 'Prenatal Checkup', provider: 'Dr. Felipe', facility: 'Calauan RHU', bp: '135/85', weight: '64kg', diagnosis: 'Pregnancy 32 weeks, PIH monitoring', plan: 'Strict bed rest. Monitor BP BID. Watch for warning signs (headache, blur vision).' }
      ],
      labs: [],
      medications: [
        { name: 'Methyldopa', dosage: '250mg', frequency: 'TID', duration: 'Until delivery', status: 'Active' }
      ]
    },
    'Garcia, Mateo S.': {
      name: 'Garcia, Mateo S.',
      age: '8',
      sex: 'Male',
      dob: '2018-02-14',
      philhealth: '23-456789012-4',
      condition: 'Bronchial Asthma',
      bloodType: 'O+',
      weight: '24 kg',
      height: '125 cm',
      visits: [
        { date: '2026-04-05', type: 'Pediatric Acute Care', provider: 'Nurse Reyes', facility: 'Calauan RHU', bp: '95/60', weight: '24kg', diagnosis: 'Asthma in acute exacerbation', plan: 'Nebulization with Salbutamol. Prescribed Oral Steroids for 5 days.' }
      ],
      labs: [],
      medications: []
    },
    'Aurelia Lim': {
      name: 'Aurelia Lim',
      age: '72',
      sex: 'Female',
      dob: '1954-03-30',
      philhealth: '12-556677889-0',
      condition: 'Osteoarthritis',
      bloodType: 'O+',
      weight: '50 kg',
      height: '150 cm',
      visits: [
        { date: '2026-04-01', type: 'Geriatric Care', provider: 'Dr. Cruz', facility: 'Calauan RHU', bp: '135/85', weight: '50kg', diagnosis: 'Osteoarthritis', plan: 'Prescribed Celecoxib as needed. Recommended light stretching.' }
      ],
      labs: [],
      medications: [
        { name: 'Celecoxib', dosage: '200mg', frequency: 'As needed for pain', duration: 'Ongoing', status: 'Active' }
      ]
    }
  };

  const profileName = patient?.name;
  const mockPatient = PATIENT_DATABASE[profileName || ''] || {
    name: profileName || 'Guest User',
    age: 'N/A',
    sex: 'N/A',
    dob: 'N/A',
    philhealth: 'UNREGISTERED',
    condition: 'N/A',
    bloodType: 'N/A',
    weight: 'N/A',
    height: 'N/A',
    visits: [],
    labs: [],
    medications: []
  };

  const visits = mockPatient.visits;
  const labs = mockPatient.labs;
  const medications = mockPatient.medications;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-accent" size={28} />
            <h2 className="text-[24px] font-bold text-txt">My Patient Records</h2>
          </div>
          <p className="text-[14px] text-txt2">Secure, real-time access to your personal health history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-w flex items-center gap-2">
            <Download size={16} /> Export PDF
          </button>
          <button className="btn btn-accent flex items-center gap-2">
            <ExternalLink size={16} /> Share with Doctor
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient Info Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="card text-center p-8">
            <div className="w-24 h-24 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4 border-2 border-accent/20">
              <User size={48} />
            </div>
            <h3 className="text-[18px] font-extrabold text-txt">{mockPatient.name}</h3>
            <p className="text-[13px] text-txt2 mt-1">{mockPatient.age} years old • {mockPatient.sex}</p>
            <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3 text-left">
              <div className="flex justify-between text-[12px]">
                <span className="text-txt3">PhilHealth ID</span>
                <span className="font-mono font-bold text-txt">{mockPatient.philhealth}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-txt3">Birth Date</span>
                <span className="font-bold text-txt">{mockPatient.dob}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-txt3">Blood Type</span>
                <span className="font-bold text-txt">O+</span>
              </div>
            </div>
          </div>

          <div className="card bg-sidebar text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full -mr-12 -mt-12 blur-2xl" />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Activity className="text-accent" size={20} />
              <h4 className="text-[14px] font-bold">Health Summary</h4>
            </div>
            <div className="flex flex-col gap-4 relative z-10">
              <div>
                <label className="text-[10px] text-accent font-bold uppercase tracking-widest opacity-80">Primary Condition</label>
                <div className="text-[15px] font-bold">{mockPatient.condition}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest opacity-80">Last BP</label>
                  <div className="text-[15px] font-bold">130/80</div>
                </div>
                <div>
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest opacity-80">Weight</label>
                  <div className="text-[15px] font-bold">62 kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Records Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex items-center gap-1 bg-panel border border-border p-1 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-6 py-2 rounded-lg text-[13px] font-bold transition-all",
                activeTab === 'history' ? "bg-accent text-white shadow-sh" : "text-txt2 hover:bg-bg"
              )}
            >
              Consultation History
            </button>
            <button 
              onClick={() => setActiveTab('meds')}
              className={cn(
                "px-6 py-2 rounded-lg text-[13px] font-bold transition-all",
                activeTab === 'meds' ? "bg-accent text-white shadow-sh" : "text-txt2 hover:bg-bg"
              )}
            >
              Prescriptions
            </button>
            <button 
              onClick={() => setActiveTab('lab')}
              className={cn(
                "px-6 py-2 rounded-lg text-[13px] font-bold transition-all",
                activeTab === 'lab' ? "bg-accent text-white shadow-sh" : "text-txt2 hover:bg-bg"
              )}
            >
              Laboratory Results
            </button>
          </div>

          <div className="bg-panel border border-border rounded-xl overflow-hidden shadow-sh min-h-[400px]">
            {activeTab === 'history' && (
              <div className="flex flex-col divide-y divide-border">
                {visits.map((visit, idx) => {
                  const linkedApp = appointments?.data.find(a => 
                    a.date === visit.date && 
                    (a.name.toLowerCase() === mockPatient.name.toLowerCase() || 
                     a.name.toLowerCase().includes(mockPatient.name.toLowerCase()))
                  );

                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx} 
                      className="p-6 hover:bg-bg/50 transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex flex-col items-center justify-center border",
                            linkedApp ? "bg-accent/10 text-accent border-accent/20" : "bg-blue/10 text-blue border-blue/20"
                          )}>
                            <span className="text-[10px] font-bold uppercase leading-none">{visit.date.split('-')[1]}</span>
                            <span className="text-[16px] font-black leading-none">{visit.date.split('-')[2]}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-[16px] font-bold text-txt">{visit.type}</div>
                              {linkedApp && <Calendar size={14} className="text-accent" title="Verified Appointment" />}
                            </div>
                            <div className="text-[13px] text-txt2">
                              {visit.facility} • {visit.provider}
                              {linkedApp && <span className="ml-2 text-[11px] text-accent font-bold">(Slot: {linkedApp.time})</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[10px] text-txt3 font-bold uppercase tracking-widest">Entry ID</div>
                            <div className="text-[14px] font-mono font-bold text-txt">#REC-{idx + 1042}</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-bg rounded-lg border border-border">
                        <div>
                          <h5 className="text-[11px] font-bold text-txt3 uppercase tracking-wider mb-1">Diagnosis</h5>
                          <p className="text-[13px] text-txt font-medium">{visit.diagnosis}</p>
                        </div>
                        <div>
                          <h5 className="text-[11px] font-bold text-txt3 uppercase tracking-wider mb-1">Plan / Advise</h5>
                          <p className="text-[13px] text-txt leading-relaxed">{visit.plan}</p>
                          
                          <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-4">
                              <div className="flex items-center gap-2">
                                <Activity size={14} className="text-blue" />
                                <span className="text-[12px] text-txt2 font-medium">BP: <span className="font-bold text-txt">{visit.bp}</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Scale size={14} className="text-green" />
                                <span className="text-[12px] text-txt2 font-medium">Weight: <span className="font-bold text-txt">{visit.weight}</span></span>
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                // Simulation of securing appointment
                                const btn = document.activeElement as HTMLButtonElement;
                                if (btn) {
                                  const originalText = btn.innerHTML;
                                  btn.disabled = true;
                                  btn.innerHTML = `<span className="animate-spin inline-block">🔄</span> Securing Slot...`;
                                  setTimeout(() => {
                                    btn.innerHTML = `<span class="flex items-center gap-1">✓ Appointment Secured</span>`;
                                    btn.classList.add('bg-green', 'border-green');
                                    btn.classList.remove('bg-accent', 'border-accent');
                                  }, 1200);
                                }
                              }}
                              className="btn btn-accent btn-sm py-1.5 px-4 text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
                            >
                              <Calendar size={12} /> Secure Follow-up Appointment
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {activeTab === 'meds' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {medications.map((med, idx) => (
                  <div key={idx} className="p-5 border border-border rounded-xl bg-bg/30 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[17px] font-bold text-txt">{med.name}</h4>
                        <p className="text-[13px] text-txt2">{med.dosage}</p>
                      </div>
                      <span className="chip bg-green-l border-green-m text-green text-[10px]">{med.status}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-2 text-[12px] text-txt2">
                        <Clock size={14} className="text-accent" />
                        <span>Take {med.frequency}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-txt2">
                        <Calendar size={14} className="text-accent" />
                        <span>Duration: {med.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {medications.length === 0 && <div className="col-span-2 text-center py-20 text-txt3 italic">No active medications found.</div>}
              </div>
            )}

            {activeTab === 'lab' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-panel2 border-b border-border">
                      <th className="px-6 py-4 text-[11px] font-bold text-txt3 uppercase tracking-widest text-center">Date</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-txt3 uppercase tracking-widest">Test Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-txt3 uppercase tracking-widest">Result</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-txt3 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {labs.map((lab, idx) => (
                      <tr key={idx} className="hover:bg-bg/50 transition-colors">
                        <td className="px-6 py-4 text-[13px] text-txt font-mono text-center">{lab.date}</td>
                        <td className="px-6 py-4 text-[14px] font-bold text-txt">{lab.name}</td>
                        <td className="px-6 py-4 text-[14px] text-blue font-bold">{lab.result}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="chip bg-blue-l/50 border-blue-m/30 text-blue text-[10px] uppercase font-bold">{lab.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-txt3 hover:text-accent transition-colors">
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-6 bg-accent/5 border border-accent/20 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-txt">Medical Privacy Guarantee</h4>
              <p className="text-[13px] text-txt2">All your records are protected by AES-256 encryption. Only authorized medical staff at the RHU can access your sensitive data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
