/**
 * @file components/auth/AuthPage.jsx
 * Full-screen authentication layout. Renders the illustration panel alongside
 * either the login form or the signup wizard.
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield, CheckCircle, MapPin, Users } from 'lucide-react';
import LoginForm  from './LoginForm';
import SignupFlow from './SignupFlow/SignupFlow';
import { APP_META } from '../../constants';

// ---------------------------------------------------------------------------
// Decorative illustration panel (right side, desktop only)
// ---------------------------------------------------------------------------
const AuthIllustration = () => (
  <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 via-[#003d1f] to-[#006533] p-12 flex-col justify-between relative overflow-hidden">
    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
    <div className="absolute -bottom-32 -left-16 w-64 h-64 bg-white/5 rounded-full" />

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-16">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          N
        </div>
        <span className="text-white font-bold text-lg tracking-tight">NYSC Portal</span>
      </div>
      <h2 className="text-4xl font-black text-white leading-tight mb-6">
        Attendance,<br />Simplified.
      </h2>
      <p className="text-white/60 text-sm leading-relaxed max-w-xs">
        A secure, GPS-verified attendance and clearance system for {APP_META.LGA_NAME} corps members.
      </p>
    </div>

    <div className="relative z-10 space-y-4">
      {[
        { icon: MapPin,      text: 'GPS-verified check-in within the CDS venue radius' },
        { icon: Shield,      text: 'Device-bound security — one account, one device'   },
        { icon: CheckCircle, text: 'Real-time attendance sheet for LGI officials'      },
        { icon: Users,       text: 'Full corper directory with CDS group management'   },
      ].map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
            <Icon size={16} className="text-white/80" />
          </div>
          <p className="text-white/70 text-xs font-medium">{text}</p>
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// AuthPage
// ---------------------------------------------------------------------------
const AuthPage = ({ onBack, onLogin, addToast, initialView = 'login' }) => {
  const [view, setView] = useState(initialView);

  useEffect(() => setView(initialView), [initialView]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 selection:bg-green-200">
      <div className="bg-white w-full max-w-6xl min-h-[600px] rounded-3xl shadow-2xl flex overflow-hidden border border-slate-100">

        {/* Form Panel */}
        <div
          className={`w-full ${view === 'login' ? 'lg:w-1/2' : 'w-full'} p-6 md:p-12 flex flex-col relative transition-all duration-500 overflow-y-auto max-h-[90vh]`}
        >
          <div className="flex flex-col items-start gap-4 mb-6 lg:absolute lg:top-8 lg:left-8 lg:z-20 lg:mb-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-[#006533] transition-colors group font-medium text-sm"
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-green-50 group-hover:border-green-100 transition-all">
                <ChevronLeft size={16} />
              </div>
              Back to Home
            </button>
            {view === 'login' && (
              <div className="flex items-center gap-2 opacity-90 pl-1">
                <div className="w-8 h-8 bg-[#006533] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">N</div>
                <span className="font-bold text-lg text-slate-800 tracking-tight">NYSC {APP_META.LGA_NAME}</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto lg:mt-24">
            {view === 'login' ? (
              <LoginForm
                switchToSignup={() => setView('signup')}
                onLogin={onLogin}
                addToast={addToast}
              />
            ) : (
              <SignupFlow
                switchToLogin={() => setView('login')}
                addToast={addToast}
                onSignupComplete={(user) => onLogin('member', user)}
              />
            )}
          </div>
        </div>

        {/* Illustration — login view only */}
        {view === 'login' && <AuthIllustration />}
      </div>
    </div>
  );
};

export default AuthPage;