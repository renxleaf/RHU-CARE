import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Outreach from './components/Outreach';
import ExternalWork from './components/ExternalWork';
import FhsisPage from './components/FhsisPage';
import DohPrograms from './components/DohPrograms';
import { 
  Menu, Bell, Lock, User, LogOut, Moon, Sun, Plus, 
  LayoutDashboard, Calendar, Users, Heart, Truck, Building2, 
  ShieldCheck, Shield, FileText, Smartphone, Pause, ChevronRight, X, Brain,
  Activity, Globe, FilePieChart, Search, RefreshCw
} from 'lucide-react';
import { Role, Profile, QueueItem, Patient, Appointment, Dependent, TransportTicket } from './types';
import { load, save, loadObj, saveObj, KEYS, pst, fmtTime, fmtDate, todayKey, uid, cn } from './lib/utils';
import { useStorage } from './hooks/useStorage';
import { ROLES } from './constants';
import { auth, onAuthStateChanged, signOut, signInAnonymously } from './lib/firebase';

// Components
import LoginScreen from './components/LoginScreen';
import LockScreen from './components/LockScreen';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import PatientRecords from './components/PatientRecords';
import Dependents from './components/Dependents';
import Transport from './components/Transport';
import Facilities from './components/Facilities';
import ProfilePage from './components/ProfilePage';
import BrainSnack from './components/BrainSnack';
import ResearchPaper from './components/ResearchPaper';
import Modal from './components/Modal';
import Toast from './components/Toast';
import MyRecords from './components/MyRecords';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type?: 'g' | 'r' | 'b' | 'a' }[]>([]);
  const [isResumeBarVisible, setIsResumeBarVisible] = useState(false);

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = loadObj<Profile>('profile');
    if (saved) return saved;
    return { name: 'Nurse Reyes', role: 'Staff Nurse — RHU', facility: 'Calauan RHU, Laguna', contact: '' };
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    return (localStorage.getItem('rhucare_last_role') as Role) || 'nurse';
  });

  const isAllowed = (page: string) => {
    return ROLES[currentRole].pages.includes(page);
  };

  const refreshData = () => {
    queue.reload();
    appointments.reload();
    patients.reload();
    transport.reload();
    dependents.reload();
    addToast('Data refreshed ✓', 'b');
  };

  // Storage hooks - only enable clinical data when specifically logged in as staff/doctor
  const queue = useStorage<QueueItem>('queue', { enabled: isLoggedIn && isAllowed('dashboard') });
  const patients = useStorage<Patient>('patients', { enabled: isLoggedIn && isAllowed('patients') });
  const transport = useStorage<TransportTicket>('transport', { enabled: isLoggedIn && isAllowed('transport') });
  const dependents = useStorage<Dependent>('dependents', { enabled: isLoggedIn && isAllowed('dependents') });
  const appointments = useStorage<Appointment>('appointments', { enabled: isAllowed('appointments') });

  // Agregate sync status
  const statuses = [queue.syncStatus, patients.syncStatus, transport.syncStatus, dependents.syncStatus, appointments.syncStatus];
  let globalSyncStatus = 'Sync Healthy';
  let syncColor = 'text-green';
  let syncBg = 'bg-green-l';
  let syncIcon = <ShieldCheck size={20} />;

  if (statuses.includes('error')) {
    globalSyncStatus = 'Sync Error';
    syncColor = 'text-red';
    syncBg = 'bg-red-l';
    syncIcon = <X size={20} />;
  } else if (statuses.includes('conflict')) {
    globalSyncStatus = 'Conflict detected';
    syncColor = 'text-amber';
    syncBg = 'bg-amber-l';
    syncIcon = <Pause size={20} />;
  } else if (statuses.includes('uploading')) {
    globalSyncStatus = 'Uploading...';
    syncColor = 'text-blue';
    syncBg = 'bg-blue-l';
    syncIcon = <Smartphone size={20} className="animate-bounce" />;
  } else if (statuses.includes('verifying')) {
    globalSyncStatus = 'Verifying...';
    syncColor = 'text-purple';
    syncBg = 'bg-purple-l';
    syncIcon = <Shield size={20} className="animate-pulse" />;
  } else if (statuses.includes('syncing')) {
    globalSyncStatus = 'Syncing...';
    syncColor = 'text-blue';
    syncBg = 'bg-blue-l';
    syncIcon = <RefreshCw size={20} className="animate-spin" />;
  }

  // Seeding mockup patients (Staff only)
  useEffect(() => {
    if (patients.loading || patients.data.length > 0 || currentRole === 'patient') return;
    
    const seeded = localStorage.getItem('rhucare_patients_seeded_v2');
    if (seeded) return;

    const mockupPatients: Patient[] = [
      { id: 'p1', name: 'Dela Cruz, Ricardo P.', age: '58', sex: 'M', dob: '1968-04-12', address: 'Brgy. Dayap, Calauan, Laguna', philhealth: '12-004567890-1', condition: 'Hypertension Stage 2', lastVisit: todayKey(), contact: '0917-555-0123', av: 'bg-blue-l text-blue', initials: 'RD', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p2', name: 'Santos, Maria Theresa L.', age: '42', sex: 'F', dob: '1984-08-22', address: 'Brgy. Malinao, Calauan, Laguna', philhealth: '01-234567890-3', condition: 'Diabetes Mellitus Type 2', lastVisit: todayKey(), contact: '0918-444-0456', av: 'bg-purple-l text-purple', initials: 'MS', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p3', name: 'Garcia, Mateo S.', age: '8', sex: 'M', dob: '2018-02-14', address: 'Brgy. Prinza, Calauan, Laguna', philhealth: '23-456789012-4', condition: 'Bronchial Asthma (Acute)', lastVisit: todayKey(), contact: '0919-333-0789', av: 'bg-teal-l text-teal', initials: 'MG', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p4', name: 'Reyes, Elena B.', age: '65', sex: 'F', dob: '1961-11-30', address: 'Brgy. Bangyas, Calauan, Laguna', philhealth: '34-567890123-5', condition: 'Osteoarthritis (Knees)', lastVisit: todayKey(), contact: '0920-222-0112', av: 'bg-amber-l text-amber', initials: 'ER', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p5', name: 'Mendoza, Julian C.', age: '29', sex: 'M', dob: '1997-09-05', address: 'Brgy. Lamot, Calauan, Laguna', philhealth: '45-678901234-6', condition: 'Acute Gastroenteritis', lastVisit: todayKey(), contact: '0921-111-0334', av: 'bg-green-l text-green', initials: 'JM', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p6', name: 'Villanueva, Clara M.', age: '34', sex: 'F', dob: '1992-05-18', address: 'Brgy. Dayap, Calauan, Laguna', philhealth: '56-789012345-7', condition: 'G2P1 32w AOG (Monitoring)', lastVisit: todayKey(), contact: '0922-000-0556', av: 'bg-rose-l text-rose', initials: 'CV', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p7', name: 'Bautista, Antonio R.', age: '51', sex: 'M', dob: '1975-03-27', address: 'Brgy. Imok, Calauan, Laguna', philhealth: '67-890123456-8', condition: 'Hyperuricemia (Gout)', lastVisit: todayKey(), contact: '0923-999-0778', av: 'bg-orange-l text-orange', initials: 'AB', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p8', name: 'Lopez, Sofia V.', age: '15', sex: 'F', dob: '2011-06-15', address: 'Brgy. Kanluran, Calauan, Laguna', philhealth: '78-901234567-9', condition: 'Recurrent UTI', lastVisit: todayKey(), contact: '0924-888-0990', av: 'bg-indigo-l text-indigo', initials: 'SL', registeredAt: new Date().toISOString(), registeredBy: 'System' }
    ];

    mockupPatients.forEach(p => patients.addItem(p));
    localStorage.setItem('rhucare_patients_seeded_v2', 'true');
    addToast('8 detailed patient records synchronized ✓', 'b');
  }, [patients.loading]);

  useEffect(() => {
    if (!currentRole) return;
    const allowed = ROLES[currentRole].pages;
    if (!allowed.includes(currentPage)) {
      setCurrentPage(allowed[0]);
    }
  }, [currentRole, currentPage]);

  const updateProfile = async (newProfile: Profile) => {
    setProfile(newProfile);
    saveObj('profile', newProfile);
  };

  // Auto-lock logic
  const lockApp = useCallback(() => {
    if (isLoggedIn && !isLocked && !isGuest) {
      setIsLocked(true);
    }
  }, [isLoggedIn, isLocked, isGuest]);

  useEffect(() => {
    let lockTimer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(lockTimer);
      lockTimer = setTimeout(lockApp, 5 * 60 * 1000); // 5 minutes
    };

    if (isLoggedIn && !isLocked && !isGuest) {
      window.addEventListener('mousedown', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('touchstart', resetTimer);
      window.addEventListener('scroll', resetTimer, true);
      resetTimer();
    }

    return () => {
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('scroll', resetTimer, true);
      clearTimeout(lockTimer);
    };
  }, [isLoggedIn, isLocked, lockApp]);

  const addToast = (msg: string, type?: 'g' | 'r' | 'b' | 'a') => {
    const id = uid();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        if (user.isAnonymous) {
          setIsGuest(true);
          setCurrentRole('patient');
          const demoName = localStorage.getItem('demo_patient_name');
          setProfile(prev => ({ 
            ...prev, 
            name: demoName || 'Guest Patient', 
            role: 'Patient' 
          }));
        } else {
          setIsGuest(false);
          // If we have a display name from Google, use it if profile name is still default
          if (user.displayName && profile.name === 'Nurse Reyes') {
            const newProfile = { ...profile, name: user.displayName };
            setProfile(newProfile);
            saveObj('profile', newProfile);
          }
        }
      } else {
        setIsLoggedIn(false);
        setIsGuest(false);
        // Reset to default staff when logged out
        setProfile({ name: 'Nurse Reyes', role: 'Staff Nurse — RHU', facility: 'Calauan RHU, Laguna', contact: '' });
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (role: Role) => {
    localStorage.setItem('rhucare_last_role', role);
    if (role === 'patient') {
      try {
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          await signOut(auth);
        }
        
        try {
          await signInAnonymously(auth);
        } catch (authError: any) {
          if (authError.code === 'auth/admin-restricted-operation' || authError.code === 'auth/operation-not-allowed') {
            setIsGuest(true);
            setCurrentRole('patient');
            const demoName = localStorage.getItem('demo_patient_name');
            setProfile({ name: demoName || 'Guest (Offline)', role: 'Patient', facility: 'Calauan RHU, Laguna', contact: '' });
            addToast('Demo Mode: Sync disabled (Enable Anon Auth)', 'a');
            return;
          }
          throw authError;
        }

        setIsGuest(true);
        setCurrentRole('patient');
        const demoName = localStorage.getItem('demo_patient_name');
        setProfile({ name: demoName || 'Guest Patient', role: 'Patient', facility: 'Calauan RHU, Laguna', contact: '' });
      } catch (error: any) {
        console.error("Portal error:", error);
        addToast('Failed to enter portal', 'r');
        return;
      }
    } else {
      setCurrentRole(role);
      // For Demo: if signing in as role, set default name if not already set
      if (profile.name === 'Nurse Reyes' || profile.name.includes('Guest')) {
        const defaultNames: Record<string, string> = {
          nurse: 'Nurse Reyes',
          doctor: 'Dr. Felipe',
          bhw: 'BHW Anita',
          admin: 'Admin Jojo'
        };
        const newProfile = { ...profile, name: defaultNames[role] || 'Staff User', role: role.toUpperCase() };
        setProfile(newProfile);
        saveObj('profile', newProfile);
      }
    }
    
    // Guided Onboarding message
    setTimeout(() => {
      if (role === 'patient') {
        addToast('Welcome to your Health Portal. You can view records and secure appointments here.', 'b');
      } else {
        addToast('System Ready. Check the Queue to begin patient consultations.', 'b');
      }
    }, 1000);

    const allowed = ROLES[role].pages;
    if (!allowed.includes(currentPage)) {
      setCurrentPage(allowed[0]);
    }
    addToast(`Welcome back, ${profile.name} 👋`, 'g');
  };

  const handleHardReset = async () => {
    await Promise.all([
      queue.clearAll(),
      appointments.clearAll(),
      patients.clearAll(),
      transport.clearAll(),
      dependents.clearAll()
    ]);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('demo_patient_id');
      localStorage.removeItem('demo_patient_name');
      await signOut(auth);
      setIsLoggedIn(false);
      setIsGuest(false);
      addToast('Logged out successfully', 'b');
    } catch (error) {
      addToast('Logout failed', 'r');
    }
  };

  const handleUnlock = () => {
    setIsLocked(false);
    setIsResumeBarVisible(true);
    setTimeout(() => setIsResumeBarVisible(false), 5000);
    addToast('Session resumed ✓', 'g');
  };

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
    addToast(isNightMode ? 'Night mode off' : 'Night mode ON — SEIPS Fix #2', 'b');
  };

  // Reminder Logic
  useEffect(() => {
    if (!profile.reminderSettings?.inApp) return;

    const checkReminders = () => {
      const now = pst();
      const today = todayKey();
      
      appointments.data.forEach(appt => {
        if (appt.status !== 'Scheduled' && appt.status !== 'Confirmed') return;
        
        // Simple check: if appt is today and within the next hour (default)
        // For a real app, we'd track which reminders have already been sent
        if (appt.date === today) {
          const [timeStr, ampm] = appt.time.split(' ');
          const [hours, minutes] = timeStr.split(':').map(Number);
          let apptHours = hours;
          if (ampm === 'PM' && hours !== 12) apptHours += 12;
          if (ampm === 'AM' && hours === 12) apptHours = 0;
          
          const apptDate = new Date(now);
          apptDate.setHours(apptHours, minutes, 0, 0);
          
          const diffMs = apptDate.getTime() - now.getTime();
          const oneHourMs = 60 * 60 * 1000;
          
          // If appt is in the next hour and we haven't notified yet in this session
          // (Using a simple session-based set to avoid spamming)
          if (diffMs > 0 && diffMs < oneHourMs) {
            const reminderKey = `reminder_${appt.id}`;
            if (!sessionStorage.getItem(reminderKey)) {
              addToast(`Reminder: ${appt.name} has an appointment at ${appt.time}`, 'a');
              sessionStorage.setItem(reminderKey, 'sent');
            }
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Initial check
    
    return () => clearInterval(interval);
  }, [appointments.data, profile.reminderSettings, addToast]);


  if (!isAuthReady) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-blue rounded-2xl shadow-lg flex items-center justify-center mb-6 animate-pulse">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" />
            <div className="text-slate-900 font-black text-xl tracking-tight">RHUCARE</div>
          </div>
          <p className={cn("text-[13px] font-medium mt-2 uppercase tracking-widest transition-colors", syncColor)}>{globalSyncStatus}</p>
        </motion.div>
      </div>
    );
  }
  if (!isLoggedIn && !isGuest) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toast toasts={toasts} />
      </>
    );
  }

  if (isLocked) {
    return (
      <>
        <LockScreen onUnlock={handleUnlock} />
        <Toast toasts={toasts} />
      </>
    );
  }

  return (
    <div className={cn("min-h-screen flex bg-bg relative overflow-hidden", isNightMode && "night-mode")}>
      {isNightMode && <div className="fixed inset-0 bg-[rgba(28,12,0,0.24)] pointer-events-none z-[55]" />}
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[240px] bg-sidebar text-sidebar-item flex-col shrink-0 z-40 relative m-3 rounded-[32px] shadow-2xl overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="p-8 pb-6 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-blue rounded-xl shadow-glow flex items-center justify-center text-white border-2 border-white/10">
            <Shield size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-black text-white tracking-tighter leading-none italic uppercase">RHU</span>
            <span className="text-[9px] font-black text-blue uppercase tracking-[0.2em] mt-1 ml-0.5 opacity-70">Care v4.0</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-2 relative z-10 custom-scrollbar">
          { (isAllowed('dashboard') || isAllowed('appointments')) && (
            <SidebarSection title="Clinical Operations">
              {isAllowed('my_records') && (
                <SidebarItem 
                  icon={<FileText size={20} />} 
                  label="Health Registry" 
                  active={currentPage === 'my_records'} 
                  onClick={() => setCurrentPage('my_records')}
                />
              )}
              {isAllowed('dashboard') && (
                <SidebarItem 
                  icon={<LayoutDashboard size={20} />} 
                  label="Clinical EHR" 
                  active={currentPage === 'dashboard'} 
                  onClick={() => setCurrentPage('dashboard')}
                  badge={queue.data.filter(i => i.status !== 'Done').length}
                />
              )}
              {isAllowed('appointments') && (
                <SidebarItem 
                  icon={<Calendar size={20} />} 
                  label="Scheduler" 
                  active={currentPage === 'appointments'} 
                  onClick={() => setCurrentPage('appointments')}
                  badge={appointments.data.filter(a => a.date === todayKey()).length}
                />
              )}
            </SidebarSection>
          )}

          { (isAllowed('patients') || isAllowed('dependents') || isAllowed('outreach')) && (
            <SidebarSection title="Community Health">
              {isAllowed('patients') && (
                <SidebarItem 
                  icon={<Users size={20} />} 
                  label="Patient Index" 
                  active={currentPage === 'patients'} 
                  onClick={() => setCurrentPage('patients')}
                />
              )}
              {isAllowed('outreach') && (
                <SidebarItem 
                  icon={<Globe size={20} />} 
                  label="Field Outreach" 
                  active={currentPage === 'outreach'} 
                  onClick={() => setCurrentPage('outreach')}
                />
              )}
              {isAllowed('doh_programs') && (
                <SidebarItem 
                  icon={<Activity size={20} />} 
                  label="DOH Programs" 
                  active={currentPage === 'doh_programs'} 
                  onClick={() => setCurrentPage('doh_programs')}
                />
              )}
              {isAllowed('dependents') && (
                <SidebarItem 
                  icon={<Heart size={20} />} 
                  label="Kinship Map" 
                  active={currentPage === 'dependents'} 
                  onClick={() => setCurrentPage('dependents')}
                />
              )}
            </SidebarSection>
          )}

          { (isAllowed('transport') || isAllowed('facilities') || isAllowed('brainsnack') || isAllowed('fhsis') || isAllowed('external')) && (
            <SidebarSection title="Infrastructure">
              {isAllowed('transport') && (
                <SidebarItem 
                  icon={<Truck size={20} />} 
                  label="Logistics Hub" 
                  active={currentPage === 'transport'} 
                  onClick={() => setCurrentPage('transport')}
                  badge={transport.data.filter(t => t.status !== 'Arrived' && t.status !== 'Cancelled').length}
                  badgeColor="red"
                />
              )}
              {isAllowed('facilities') && (
                <SidebarItem 
                  icon={<Building2 size={20} />} 
                  label="Health Network" 
                  active={currentPage === 'facilities'} 
                  onClick={() => setCurrentPage('facilities')}
                />
              )}
              {isAllowed('brainsnack') && (
                <SidebarItem 
                  icon={<Brain size={20} />} 
                  label="AI Intelligence" 
                  active={currentPage === 'brainsnack'} 
                  onClick={() => setCurrentPage('brainsnack')}
                />
              )}
              {isAllowed('fhsis') && (
                <SidebarItem 
                  icon={<FilePieChart size={20} />} 
                  label="FHSIS Terminal" 
                  active={currentPage === 'fhsis'} 
                  onClick={() => setCurrentPage('fhsis')}
                />
              )}
              {isAllowed('external') && (
                <SidebarItem 
                  icon={<Globe size={20} />} 
                  label="External Loop" 
                  active={currentPage === 'external'} 
                  onClick={() => setCurrentPage('external')}
                />
              )}
            </SidebarSection>
          )}

          <div className="mt-10 mb-10 space-y-1">
            {isAllowed('profile') && (
              <SidebarItem 
                icon={<User size={20} />} 
                label="Command Center" 
                active={currentPage === 'profile'} 
                onClick={() => setCurrentPage('profile')}
              />
            )}
            <SidebarItem 
              icon={isNightMode ? <Sun size={20} /> : <Moon size={20} />} 
              label="Ocular Comfort" 
              onClick={toggleNightMode}
              active={isNightMode}
            />
            <div className="h-px bg-white/5 my-4 mx-4" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-8 py-3.5 text-[14px] font-black uppercase tracking-widest text-sidebar-item hover:text-white hover:bg-white/5 transition-all rounded-xl"
            >
              <LogOut size={20} /> Terminate
            </button>
            {!isGuest && (
              <button 
                onClick={lockApp}
                className="flex items-center gap-4 w-full px-8 py-3.5 text-[14px] font-black uppercase tracking-widest text-sidebar-item hover:text-white hover:bg-white/5 transition-all rounded-xl"
              >
                <Lock size={20} /> Secure Node
              </button>
            )}
          </div>
        </nav>
      </aside>

      {/* Main View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[80px] flex items-center justify-between px-6 shrink-0 z-20 relative">
          <div className="absolute inset-x-6 top-3 bottom-0 bg-white/70 backdrop-blur-xl border border-border/40 rounded-2xl shadow-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-txt2 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Menu size={22} />
              </button>
              <div className="hidden md:flex items-center bg-panel2 border border-border/30 rounded-xl px-4 py-2.5 w-[380px] text-txt3 gap-3 group focus-within:ring-4 focus-within:ring-blue/5 transition-all">
                <Search size={18} className="group-focus-within:text-blue transition-colors opacity-40 group-focus-within:opacity-100" />
                <input 
                  type="text" 
                  placeholder="Analyze telemetry, records..." 
                  className="bg-transparent border-none outline-none w-full text-[14px] font-bold text-txt placeholder:text-txt3/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden xl:flex items-center gap-3 group cursor-help">
                <div className="flex flex-col items-end">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest leading-none transition-colors", syncColor)}>{globalSyncStatus}</span>
                </div>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border transition-all", syncBg, syncColor, syncColor.replace('text-', 'border-').replace('text-red', 'border-red-m/20'))}>
                  {syncIcon}
                </div>
              </div>
              
              <div className="h-8 w-px bg-slate-100 hidden md:block" />

              <div className="flex items-center gap-4">
                <button className="w-10 h-10 flex items-center justify-center text-txt2 hover:bg-slate-50 rounded-xl transition-all relative group">
                  <Bell size={22} className="group-hover:scale-105 transition-transform" />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red rounded-full border-2 border-white shadow-sm" />
                </button>
                
                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border/40">
                  <div className="text-right">
                    <div className="text-[14px] font-black text-txt tracking-tighter leading-none uppercase italic">{profile.name}</div>
                    <div className="text-[10px] font-black text-blue uppercase tracking-widest mt-1 opacity-60">Admin Node</div>
                  </div>
                  <button 
                    onClick={() => isAllowed('profile') && setCurrentPage('profile')}
                    className={cn(
                      "w-11 h-11 rounded-xl bg-slate-900 shadow-xl shadow-slate-900/40 flex items-center justify-center text-[15px] font-black text-white hover:scale-105 transition-all active:scale-90 overflow-hidden border border-white/10",
                      !isAllowed('profile') && "cursor-default hover:scale-100"
                    )}
                  >
                    {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-6 pb-6 mt-1 custom-scrollbar relative z-10">
          <div className="min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.99 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="max-w-7xl mx-auto"
              >
              {isResumeBarVisible && (
                <div className="bg-amber-l border border-amber-m rounded-lg p-4 flex items-center gap-3 mb-8 shadow-sh">
                  <Pause size={20} className="text-amber" />
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold text-amber">Session resumed</div>
                    <div className="text-[12px] text-txt2">Welcome back! All data auto-saved to device.</div>
                  </div>
                </div>
              )}

              {currentPage === 'dashboard' && <Dashboard queue={queue} patients={patients} appointments={appointments} addToast={addToast} refreshData={refreshData} currentRole={currentRole} profile={profile} />}
              {currentPage === 'appointments' && <Appointments appointments={appointments} patients={patients} addToast={addToast} currentRole={currentRole} profile={profile} isGuest={isGuest} />}
              {currentPage === 'book' && <Appointments appointments={appointments} patients={patients} addToast={addToast} isBookingOnly isGuest={isGuest} />}
              {currentPage === 'patients' && <PatientRecords patients={patients} addToast={addToast} currentRole={currentRole} />}
              {currentPage === 'outreach' && <Outreach />}
              {currentPage === 'doh_programs' && <DohPrograms />}
              {currentPage === 'fhsis' && <FhsisPage queueItems={queue.data} patients={patients.data} />}
              {currentPage === 'external' && <ExternalWork />}
              {currentPage === 'dependents' && <Dependents dependents={dependents} addToast={addToast} currentRole={currentRole} />}
              {currentPage === 'transport' && <Transport transport={transport} addToast={addToast} profile={profile} currentRole={currentRole} />}
              {currentPage === 'facilities' && <Facilities currentRole={currentRole} />}
              {currentPage === 'research' && <ResearchPaper />}
              {currentPage === 'brainsnack' && <BrainSnack />}
              {currentPage === 'my_records' && (
                <MyRecords 
                  patient={patients.data.find(p => p.name === profile.name) || ({ name: profile.name } as any)} 
                  appointments={appointments}
                />
              )}
              {currentPage === 'profile' && <ProfilePage profile={profile} setProfile={updateProfile} addToast={addToast} onHardReset={handleHardReset} isAdmin={currentRole === 'admin'} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      </div>

      {/* Mobile Drawer (Same as Sidebar but as a drawer) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/45 z-[60] lg:hidden"
            />
            <motion.nav 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar z-[70] flex flex-col shadow-sh-md lg:hidden"
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent rounded-md" />
                  <span className="text-[20px] font-bold text-white">RHUCARE</span>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-sidebar-item"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                { (isAllowed('my_records') || isAllowed('dashboard') || isAllowed('appointments')) && (
                  <SidebarSection title="Queue">
                    {isAllowed('my_records') && (
                      <SidebarItem 
                        icon={<FileText size={18} />} 
                        label="My Health Records" 
                        active={currentPage === 'my_records'} 
                        onClick={() => { setCurrentPage('my_records'); setIsDrawerOpen(false); }}
                      />
                    )}
                    {isAllowed('dashboard') && (
                      <SidebarItem 
                        icon={<LayoutDashboard size={18} />} 
                        label="EHR (Tier 1)" 
                        active={currentPage === 'dashboard'} 
                        onClick={() => { setCurrentPage('dashboard'); setIsDrawerOpen(false); }}
                        badge={queue.data.filter(i => i.status !== 'Done').length}
                      />
                    )}
                    {isAllowed('appointments') && (
                      <SidebarItem 
                        icon={<Calendar size={18} />} 
                        label="Appointments" 
                        active={currentPage === 'appointments'} 
                        onClick={() => { setCurrentPage('appointments'); setIsDrawerOpen(false); }}
                        badge={appointments.data.filter(a => a.date === todayKey()).length}
                      />
                    )}
                  </SidebarSection>
                )}

                { (isAllowed('patients') || isAllowed('dependents') || isAllowed('outreach')) && (
                  <SidebarSection title="Field & Community">
                    {isAllowed('patients') && (
                      <SidebarItem 
                        icon={<Users size={18} />} 
                        label="Patient Records" 
                        active={currentPage === 'patients'} 
                        onClick={() => { setCurrentPage('patients'); setIsDrawerOpen(false); }}
                      />
                    )}
                    {isAllowed('outreach') && (
                      <SidebarItem 
                        icon={<Activity size={18} />} 
                        label="DOH Outreach" 
                        active={currentPage === 'outreach'} 
                        onClick={() => { setCurrentPage('outreach'); setIsDrawerOpen(false); }}
                      />
                    )}
                    {isAllowed('doh_programs') && (
                      <SidebarItem 
                        icon={<ShieldCheck size={18} />} 
                        label="Barangay Health Programs" 
                        active={currentPage === 'doh_programs'} 
                        onClick={() => { setCurrentPage('doh_programs'); setIsDrawerOpen(false); }}
                      />
                    )}
                    {isAllowed('dependents') && (
                      <SidebarItem 
                        icon={<Heart size={18} />} 
                        label="Dependents" 
                        active={currentPage === 'dependents'} 
                        onClick={() => { setCurrentPage('dependents'); setIsDrawerOpen(false); }}
                      />
                    )}
                  </SidebarSection>
                )}

                { (isAllowed('transport') || isAllowed('facilities') || isAllowed('brainsnack') || isAllowed('fhsis') || isAllowed('external')) && (
                  <SidebarSection title="Infrastructure">
                    {isAllowed('transport') && (
                      <SidebarItem 
                        icon={<Truck size={18} />} 
                        label="Patient Transport" 
                        active={currentPage === 'transport'} 
                        onClick={() => { setCurrentPage('transport'); setIsDrawerOpen(false); }}
                        badge={transport.data.filter(t => t.status !== 'Arrived' && t.status !== 'Cancelled').length}
                        badgeColor="red"
                      />
                    )}
                    {isAllowed('facilities') && (
                      <SidebarItem 
                        icon={<Building2 size={18} />} 
                        label="Health Facilities" 
                        active={currentPage === 'facilities'} 
                        onClick={() => { setCurrentPage('facilities'); setIsDrawerOpen(false); }}
                      />
                    )}
                    {isAllowed('brainsnack') && (
                      <SidebarItem 
                        icon={<Brain size={18} />} 
                        label="Brain Snack (Tier 3)" 
                        active={currentPage === 'brainsnack'} 
                        onClick={() => { setCurrentPage('brainsnack'); setIsDrawerOpen(false); }}
                      />
                    )}
                    {isAllowed('research') && (
                      <SidebarItem 
                        icon={<FileText size={18} />} 
                        label="Formal Technical Report (Tier 3)" 
                        active={currentPage === 'research'} 
                        onClick={() => { setCurrentPage('research'); setIsDrawerOpen(false); }}
                      />
                    )}
                    {isAllowed('fhsis') && (
                      <SidebarItem 
                        icon={<FilePieChart size={18} />} 
                        label="FHSIS Analytics" 
                        active={currentPage === 'fhsis'} 
                        onClick={() => { setCurrentPage('fhsis'); setIsDrawerOpen(false); }}
                      />
                    )}
                    {isAllowed('external') && (
                      <SidebarItem 
                        icon={<Globe size={18} />} 
                        label="External Affairs" 
                        active={currentPage === 'external'} 
                        onClick={() => { setCurrentPage('external'); setIsDrawerOpen(false); }}
                      />
                    )}
                  </SidebarSection>
                )}

                <div className="mt-auto pt-8">
                  {isAllowed('profile') && (
                    <SidebarItem 
                      icon={<User size={18} />} 
                      label="Profile & Settings" 
                      active={currentPage === 'profile'} 
                      onClick={() => { setCurrentPage('profile'); setIsDrawerOpen(false); }}
                    />
                  )}
                  <SidebarItem 
                    icon={isNightMode ? <Sun size={18} /> : <Moon size={18} />} 
                    label="Night Mode" 
                    onClick={toggleNightMode}
                    active={isNightMode}
                  />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-[12px_32px] text-[15px] font-medium text-sidebar-item hover:text-white transition-colors"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                  {!isGuest && (
                    <button 
                      onClick={lockApp}
                      className="flex items-center gap-3 w-full p-[12px_32px] text-[15px] font-medium text-sidebar-item hover:text-white transition-colors"
                    >
                      <Lock size={18} /> Lock Session
                    </button>
                  )}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <Toast toasts={toasts} />
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(fmtTime(pst()));
  useEffect(() => {
    const timer = setInterval(() => setTime(fmtTime(pst())), 1000);
    return () => clearInterval(timer);
  }, []);
  return <div className="text-[12px] font-bold text-accent bg-sidebar px-3 py-1 rounded-full whitespace-nowrap">{time}</div>;
}

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[9px] font-black text-sidebar-item/20 uppercase tracking-[0.2em] px-8 py-3">{title}</div>
      <div className="px-2 space-y-0.5">
        {children}
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, badge, badgeColor }: { 
  icon: ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void;
  badge?: number;
  badgeColor?: 'red' | 'blue';
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 w-full p-[10px_16px] text-[13px] font-bold text-sidebar-item transition-all rounded-xl hover:bg-white/5 hover:text-white active:scale-95",
        active && "bg-white/10 text-white shadow-lg shadow-black/10"
      )}
    >
      <span className={cn("shrink-0 transition-transform group-hover:scale-105", active ? "text-blue" : "opacity-30")}>{icon}</span>
      <span className="flex-1 text-left tracking-tight">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "bg-blue text-white text-[9px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center shadow-md",
          badgeColor === 'red' && "bg-red"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}
