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
  Activity, Globe, FilePieChart
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

  // Seeding mockup patients (Staff only)
  useEffect(() => {
    if (patients.loading || patients.data.length > 0 || currentRole === 'patient') return;
    
    const seeded = localStorage.getItem('rhucare_patients_seeded_v1');
    if (seeded) return;

    const mockupPatients: Patient[] = [
      { id: 'p1', name: 'Dela Cruz, Maria', age: '45', sex: 'F', dob: '1981-05-12', address: 'Calauan, Laguna', philhealth: '12-345678901-2', condition: 'Hypertension', lastVisit: todayKey(), contact: '', av: '', initials: 'MD', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p2', name: 'Santos, Roberto', age: '62', sex: 'M', dob: '1964-08-22', address: 'Calauan, Laguna', philhealth: '01-234567890-3', condition: 'Diabetes Type 2', lastVisit: todayKey(), contact: '', av: '', initials: 'RS', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p3', name: 'Garcia, Juan', age: '28', sex: 'M', dob: '1998-02-14', address: 'Calauan, Laguna', philhealth: '23-456789012-4', condition: 'Acute Bronchitis', lastVisit: todayKey(), contact: '', av: '', initials: 'JG', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p4', name: 'Reyes, Elena', age: '54', sex: 'F', dob: '1972-11-30', address: 'Calauan, Laguna', philhealth: '34-567890123-5', condition: 'Asthma', lastVisit: todayKey(), contact: '', av: '', initials: 'ER', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p5', name: 'Ramos, Ricardo', age: '35', sex: 'M', dob: '1991-04-18', address: 'Calauan, Laguna', philhealth: '45-678901234-6', condition: 'Lower Back Pain', lastVisit: todayKey(), contact: '', av: '', initials: 'RR', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p6', name: 'Mendoza, Sofia', age: '22', sex: 'F', dob: '2004-09-05', address: 'Calauan, Laguna', philhealth: '56-789012345-7', condition: 'Urinary Tract Infection', lastVisit: todayKey(), contact: '', av: '', initials: 'SM', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p7', name: 'Bautista, Antonio', age: '48', sex: 'M', dob: '1978-03-27', address: 'Calauan, Laguna', philhealth: '67-890123456-8', condition: 'Gouty Arthritis', lastVisit: todayKey(), contact: '', av: '', initials: 'AB', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p8', name: 'Villanueva, Teresa', age: '67', sex: 'F', dob: '1959-12-11', address: 'Calauan, Laguna', philhealth: '78-901234567-9', condition: 'Chronic Kidney Disease', lastVisit: todayKey(), contact: '', av: '', initials: 'TV', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p9', name: 'Fernandez, Miguel', age: '31', sex: 'M', dob: '1995-07-19', address: 'Calauan, Laguna', philhealth: '89-012345678-0', condition: 'Skin Rash / Dermatitis', lastVisit: todayKey(), contact: '', av: '', initials: 'MF', registeredAt: new Date().toISOString(), registeredBy: 'System' },
      { id: 'p10', name: 'Aquino, Corazon', age: '73', sex: 'F', dob: '1953-01-25', address: 'Calauan, Laguna', philhealth: '90-123456789-1', condition: 'Congestive Heart Failure', lastVisit: todayKey(), contact: '', av: '', initials: 'CA', registeredAt: new Date().toISOString(), registeredBy: 'System' }
    ];

    mockupPatients.forEach(p => patients.addItem(p));
    localStorage.setItem('rhucare_patients_seeded_v1', 'true');
    addToast('10 patient records synchronized ✓', 'b');
  }, [patients.loading]);

  useEffect(() => {
    if (!currentRole) return;
    const allowed = ROLES[currentRole].pages;
    if (!allowed.includes(currentPage)) {
      setCurrentPage(allowed[0]);
    }
  }, [currentRole]);

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
          <p className="text-slate-400 text-[13px] font-medium mt-2 uppercase tracking-widest">Cloud Syncing...</p>
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
      <aside className="hidden lg:flex w-[260px] bg-sidebar text-sidebar-item flex-col shrink-0 z-40">
        <div className="p-[32px_32px_48px] flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-md shrink-0" />
          <span className="text-[24px] font-bold text-white tracking-tight">RHUCARE</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          { (isAllowed('dashboard') || isAllowed('appointments')) && (
            <SidebarSection title="Queue">
              {isAllowed('my_records') && (
                <SidebarItem 
                  icon={<FileText size={18} />} 
                  label="My Health Records" 
                  active={currentPage === 'my_records'} 
                  onClick={() => setCurrentPage('my_records')}
                />
              )}
              {isAllowed('dashboard') && (
                <SidebarItem 
                  icon={<LayoutDashboard size={18} />} 
                  label="EHR (Tier 1)" 
                  active={currentPage === 'dashboard'} 
                  onClick={() => setCurrentPage('dashboard')}
                  badge={queue.data.filter(i => i.status !== 'Done').length}
                />
              )}
              {isAllowed('appointments') && (
                <SidebarItem 
                  icon={<Calendar size={18} />} 
                  label="Appointments" 
                  active={currentPage === 'appointments'} 
                  onClick={() => setCurrentPage('appointments')}
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
                  onClick={() => setCurrentPage('patients')}
                />
              )}
              {isAllowed('outreach') && (
                <SidebarItem 
                  icon={<Activity size={18} />} 
                  label="DOH Outreach" 
                  active={currentPage === 'outreach'} 
                  onClick={() => setCurrentPage('outreach')}
                />
              )}
              {isAllowed('doh_programs') && (
                <SidebarItem 
                  icon={<ShieldCheck size={18} />} 
                  label="Barangay Health Programs" 
                  active={currentPage === 'doh_programs'} 
                  onClick={() => setCurrentPage('doh_programs')}
                />
              )}
              {isAllowed('dependents') && (
                <SidebarItem 
                  icon={<Heart size={18} />} 
                  label="Dependents" 
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
                  icon={<Truck size={18} />} 
                  label="Patient Transport" 
                  active={currentPage === 'transport'} 
                  onClick={() => setCurrentPage('transport')}
                  badge={transport.data.filter(t => t.status !== 'Arrived' && t.status !== 'Cancelled').length}
                  badgeColor="red"
                />
              )}
              {isAllowed('facilities') && (
                <SidebarItem 
                  icon={<Building2 size={18} />} 
                  label="Health Facilities" 
                  active={currentPage === 'facilities'} 
                  onClick={() => setCurrentPage('facilities')}
                />
              )}
              {isAllowed('brainsnack') && (
                <SidebarItem 
                  icon={<Brain size={18} />} 
                  label="Brain Snack (Tier 3)" 
                  active={currentPage === 'brainsnack'} 
                  onClick={() => setCurrentPage('brainsnack')}
                />
              )}
              {isAllowed('research') && (
                <SidebarItem 
                  icon={<FileText size={18} />} 
                  label="Formal Technical Report (Tier 3)" 
                  active={currentPage === 'research'} 
                  onClick={() => setCurrentPage('research')}
                />
              )}
              {isAllowed('fhsis') && (
                <SidebarItem 
                  icon={<FilePieChart size={18} />} 
                  label="FHSIS Analytics" 
                  active={currentPage === 'fhsis'} 
                  onClick={() => setCurrentPage('fhsis')}
                />
              )}
              {isAllowed('external') && (
                <SidebarItem 
                  icon={<Globe size={18} />} 
                  label="External Affairs" 
                  active={currentPage === 'external'} 
                  onClick={() => setCurrentPage('external')}
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
                onClick={() => setCurrentPage('profile')}
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
        </nav>
      </aside>

      {/* Main View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-10 shrink-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 text-txt2"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center bg-panel2 rounded-lg px-4 py-2.5 w-[320px] text-txt2 gap-3">
              <X size={18} className="opacity-0" /> {/* Spacer */}
              <span className="text-[14px]">Search patients, records, or logs...</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
              <Shield size={14} className="text-blue" />
              <span className="text-[11px] font-black text-blue-700 uppercase tracking-tighter">RA 10173 Secure</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-green-700 uppercase tracking-tighter">Cloud Synced ✓</span>
            </div>
            <div className="relative">
              <button className="p-2 text-txt2 hover:bg-panel2 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red rounded-full border-2 border-white" />
              </button>
            </div>
            <Clock />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-[14px] font-semibold text-txt leading-tight">{profile.name}</div>
                <div className="text-[12px] text-txt2 leading-tight">{profile.role}</div>
              </div>
              <button 
                onClick={() => setCurrentPage('profile')}
                className="w-9 h-9 rounded-full bg-border2 flex items-center justify-center text-[13px] font-bold text-txt overflow-hidden"
              >
                {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto"
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

              {currentPage === 'dashboard' && <Dashboard queue={queue} patients={patients} appointments={appointments} addToast={addToast} refreshData={refreshData} currentRole={currentRole} />}
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
      <div className="text-[11px] font-bold text-sidebar-item/50 uppercase tracking-[0.1em] px-8 py-3">{title}</div>
      {children}
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
        "flex items-center gap-3 w-full p-[12px_32px] text-[15px] font-medium text-sidebar-item transition-all border-l-4 border-transparent active:bg-sidebar-active",
        active && "bg-sidebar-active text-white border-accent"
      )}
    >
      <span className={cn("shrink-0", active ? "text-accent" : "opacity-60")}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "bg-accent text-sidebar text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center",
          badgeColor === 'red' && "bg-red text-white"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}
