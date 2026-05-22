/**
 * @file components/auth/LoginForm.jsx
 * Login form for Corps Members (email/password) and LGI Officials (master key).
 * Includes forgot-password modal and device-binding security check.
 */

import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, Lock, Key, Eye, EyeOff, Loader2, X } from 'lucide-react';

import { auth, db }                                   from '../../services/firebase';
import { MASTER_KEYS }                                from '../../constants';
import { getOrGenerateDeviceToken, setCachedUser }    from '../../utils/device';
import { InputField }                                 from '../ui/FormControls';

// ---------------------------------------------------------------------------
// Forgot Password Modal
// ---------------------------------------------------------------------------
const ForgotPasswordModal = ({ email, onClose, addToast }) => {
  const handleReset = async () => {
    if (!email) {
      addToast('Please enter your email address first.', 'error');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      addToast('Password reset email sent!', 'success');
      onClose();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-900">Reset Password</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          A reset link will be sent to:{' '}
          <strong className="text-slate-800">{email || 'your email'}</strong>
        </p>
        <button
          onClick={handleReset}
          className="w-full py-3 bg-[#006533] text-white rounded-2xl font-black"
        >
          Send Reset Link
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// LoginForm
// ---------------------------------------------------------------------------
const LoginForm = ({ switchToSignup, onLogin, addToast }) => {
  const [loginTab,        setLoginTab]        = useState('corper');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [masterKey,       setMasterKey]       = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [shake,           setShake]           = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let role           = 'member';
      let targetEmail    = email;
      let targetPassword = password;

      // LGI / Super Admin path — resolve credentials from master key
      if (loginTab === 'lgi') {
        if (masterKey === MASTER_KEYS.SUPER_ADMIN) {
          role           = 'superadmin';
          targetEmail    = MASTER_KEYS.SUPER_EMAIL;
          targetPassword = MASTER_KEYS.SUPER_ADMIN;
        } else if (masterKey === MASTER_KEYS.LGI) {
          role           = 'lgi';
          targetEmail    = MASTER_KEYS.LGI_EMAIL;
          targetPassword = MASTER_KEYS.LGI;
        } else {
          throw new Error('Invalid Master Secret Key.');
        }
      }

      // Firebase Auth sign-in
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
      } catch (authError) {
        // Auto-provision LGI / Super Admin accounts on first run
        const isInvalidCred = [
          'auth/invalid-credential',
          'auth/user-not-found',
          'auth/wrong-password',
        ].includes(authError.code);

        if (isInvalidCred && loginTab === 'lgi') {
          userCredential = await createUserWithEmailAndPassword(auth, targetEmail, targetPassword);
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            role,
            email:       targetEmail,
            deviceToken: getOrGenerateDeviceToken(),
            createdAt:   serverTimestamp(),
            status:      'Active',
            surname:     role === 'superadmin' ? 'Super' : 'LGI',
            firstName:   role === 'superadmin' ? 'Admin' : 'Official',
          });
          addToast(
            `${role === 'superadmin' ? 'Super Admin' : 'LGI'} account initialized!`,
            'success',
          );
        } else {
          throw authError;
        }
      }

      const { user }     = userCredential;
      const currentToken = getOrGenerateDeviceToken();
      const userDocRef   = doc(db, 'users', user.uid);
      const userDoc      = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Enforce device binding for corps members
        if (role === 'member') {
          if (userData.deviceToken && userData.deviceToken !== currentToken) {
            await signOut(auth);
            throw new Error(
              'ACCESS DENIED: This account is bound to a different device. ' +
              'Contact your LGI to reset your device token.',
            );
          }
          // Bind device on first login
          if (!userData.deviceToken) {
            await updateDoc(userDocRef, { deviceToken: currentToken });
          }
        }

        setCachedUser(userData);
        onLogin(role, userData);
      }

      addToast('Welcome back!', 'success');
    } catch (error) {
      triggerShake();
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`animate-in fade-in slide-in-from-left-8 duration-500 ${shake ? 'animate-shake' : ''}`}>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500 mb-8 font-medium">Please login to continue.</p>

        {/* Tab Toggle */}
        <div className="flex p-1.5 bg-slate-100 rounded-xl mb-8">
          {['corper', 'lgi'].map(tab => (
            <button
              key={tab}
              onClick={() => setLoginTab(tab)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                loginTab === tab
                  ? 'bg-white text-[#006533] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'corper' ? 'Corps Member' : 'LGI Official'}
            </button>
          ))}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {loginTab === 'corper' ? (
            <>
              <InputField
                error={shake}
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <div className="relative">
                <InputField
                  error={shake}
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-[#006533]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-slate-500 hover:text-[#006533]"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                <p className="text-xs text-yellow-800 font-bold flex items-center gap-2">
                  <Key size={14} /> Secure Access
                </p>
                <p className="text-[10px] text-yellow-700 mt-1">
                  Enter your assigned Master Key to log in directly.
                </p>
              </div>
              <InputField
                error={shake}
                icon={Key}
                type="password"
                placeholder="Enter Master Secret Key"
                value={masterKey}
                onChange={e => setMasterKey(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#006533] text-white rounded-2xl font-black shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 hover:bg-[#005229] transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        {loginTab === 'corper' && (
          <p className="mt-6 text-center text-slate-400 text-xs font-medium">
            New corps member?{' '}
            <button onClick={switchToSignup} className="text-[#006533] font-bold hover:underline">
              Create Account
            </button>
          </p>
        )}
      </div>

      {showForgotModal && (
        <ForgotPasswordModal
          email={email}
          onClose={() => setShowForgotModal(false)}
          addToast={addToast}
        />
      )}
    </>
  );
};

export default LoginForm;