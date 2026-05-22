/**
 * @file App.jsx
 *
 * Root application component. Owns all top-level state and acts as the single
 * orchestrator for authentication, routing, and shared data.
 *
 * Bugs fixed in this version vs the original monolith:
 *   1. Admin onSnapshot listeners stored and cleaned up on every auth-state
 *      change — prevents memory-leak compounding.
 *   2. addToast wrapped in useCallback for a stable reference so child
 *      useEffect dependency arrays don't fire on every render.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc, getDoc, getDocs, collection, query, where, onSnapshot,
} from 'firebase/firestore';
import { auth, db }                from './services/firebase';
import { getCachedUser, setCachedUser, clearUserCache } from './utils/device';
import GlobalStyles      from './components/ui/GlobalStyles';
import ToastContainer    from './components/ui/Toast';
import SkeletonDashboard from './components/dashboard/SkeletonDashboard';
import LandingPage       from './pages/LandingPage';
import AuthPage          from './components/auth/AuthPage';
import Dashboard         from './pages/Dashboard';

// ---------------------------------------------------------------------------
// Birthday balloon easter egg
// ---------------------------------------------------------------------------
const BALLOON_EMOJIS = ['🎈', '🎉', '🎊', '🎁', '✨'];

const BirthdayBalloons = () => (
  <div aria-hidden>
    {BALLOON_EMOJIS.map((emoji, i) => (
      <div
        key={i}
        className="balloon text-5xl select-none"
        style={{ left: `${10 + i * 18}%`, animationDelay: `${i * 0.8}s` }}
      >
        {emoji}
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [page,                setPage]                = useState('landing');
  const [userRole,            setUserRole]            = useState(null);
  const [currentUser,         setCurrentUser]         = useState(getCachedUser);
  const [activeTab,           setActiveTab]           = useState('overview');
  const [isSidebarOpen,       setSidebarOpen]         = useState(false);
  const [toasts,              setToasts]              = useState([]);
  const [isAuthChecking,      setIsAuthChecking]      = useState(true);
  const [showConfetti,        setShowConfetti]        = useState(false);
  const [schedule,            setSchedule]            = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Group CDS',
  });
  const [memberAlreadySigned, setMemberAlreadySigned] = useState(false);
  const [currentLog,          setCurrentLog]          = useState(null);
  const [stats,               setStats]               = useState({ total: 0, present: 0 });

  // Stable toast reference so child useEffects don't re-fire on every render
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback(
    (id) => setToasts(prev => prev.filter(t => t.id !== id)),
    [],
  );

  // ---------------------------------------------------------------------------
  // Firebase auth listener — single source of truth for session state
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let unsubUsers  = null;
    let unsubAttend = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cancel any running admin listeners before re-evaluating session
      if (unsubUsers)  { unsubUsers();  unsubUsers  = null; }
      if (unsubAttend) { unsubAttend(); unsubAttend = null; }

      setIsAuthChecking(true);

      try {
        if (firebaseUser) {
          const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (!docSnap.exists()) {
            await signOut(auth);
            clearUserCache();
            setPage('landing');
            return;
          }

          const userData = docSnap.data();
          setCachedUser(userData);
          setCurrentUser(userData);
          setUserRole(userData.role);
          setPage('dashboard');

          // Birthday easter egg — compare MM-DD portions
          const todayMMDD = new Date().toISOString().slice(5, 10);
          if (userData.dob && userData.dob.slice(5) === todayMMDD) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 8000);
          }

          // Determine whether member already signed in today
          const today = new Date().toISOString().split('T')[0];
          const logsSnap = await getDocs(query(
            collection(db, 'attendance_logs'),
            where('userId', '==', firebaseUser.uid),
            where('date',   '==', today),
          ));
          if (!logsSnap.empty) {
            setMemberAlreadySigned(true);
            setCurrentLog(logsSnap.docs[0].data());
          }

          // Admin real-time KPI listeners
          if (userData.role === 'lgi' || userData.role === 'superadmin') {
            unsubUsers = onSnapshot(
              query(collection(db, 'users'), where('role', '==', 'member'), where('status', '==', 'Active')),
              snap => setStats(s => ({ ...s, total: snap.size })),
            );
            unsubAttend = onSnapshot(
              query(collection(db, 'attendance_logs'), where('date', '==', today), where('status', '==', 'Present')),
              snap => setStats(s => ({ ...s, present: snap.size })),
            );
          }
        } else {
          setPage('landing');
          setUserRole(null);
          setCurrentUser(null);
          clearUserCache();
        }
      } catch (err) {
        console.error('[Auth] Session error:', err);
        setPage('landing');
      } finally {
        setIsAuthChecking(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUsers)  unsubUsers();
      if (unsubAttend) unsubAttend();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Callbacks
  // ---------------------------------------------------------------------------
  const handleLogin = useCallback((role, userData) => {
    setUserRole(role);
    setCurrentUser(userData);
    setPage('dashboard');
    setActiveTab('overview');
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    clearUserCache();
    setUserRole(null);
    setCurrentUser(null);
    setMemberAlreadySigned(false);
    setCurrentLog(null);
    setPage('landing');
    setActiveTab('overview');
    addToast('Signed out successfully.', 'info');
  }, [addToast]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (isAuthChecking) return <><GlobalStyles /><SkeletonDashboard /></>;

  return (
    <>
      <GlobalStyles />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {showConfetti && <BirthdayBalloons />}

      {page === 'landing' && (
        <LandingPage
          onGetStarted={() => setPage('auth-login')}
          onLogin={() => setPage('auth-login')}
        />
      )}

      {(page === 'auth-login' || page === 'auth-signup') && (
        <AuthPage
          onBack={() => setPage('landing')}
          onLogin={handleLogin}
          addToast={addToast}
          initialView={page === 'auth-signup' ? 'signup' : 'login'}
        />
      )}

      {page === 'dashboard' && (
        <Dashboard
          userRole={userRole}
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
          addToast={addToast}
          stats={stats}
          schedule={schedule}
          setSchedule={setSchedule}
          memberAlreadySigned={memberAlreadySigned}
          setMemberAlreadySigned={setMemberAlreadySigned}
          currentLog={currentLog}
        />
      )}
    </>
  );
}