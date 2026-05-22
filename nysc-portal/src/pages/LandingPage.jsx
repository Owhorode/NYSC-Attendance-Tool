/**
 * @file pages/LandingPage.jsx
 * Public-facing home page. The first screen any visitor sees.
 */

import React from 'react';
import {
  MapPin, Shield, CheckCircle, Users,
  ArrowRight, ShieldCheck, BarChart3,
} from 'lucide-react';
import { APP_META } from '../constants';

const FEATURES = [
  {
    icon:  MapPin,
    title: 'GPS-Verified Check-in',
    desc:  'Corpers must be physically present at the CDS venue. Location is verified against a geofence radius before attendance is accepted.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon:  Shield,
    title: 'Device-Bound Security',
    desc:  'Each account is cryptographically bound to a single device on first login, making credential sharing impossible.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon:  CheckCircle,
    title: 'Real-Time Sheet',
    desc:  'LGI officials see a live, filterable attendance sheet. Approve or reject pending entries and add manual records in seconds.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon:  BarChart3,
    title: 'KPI Dashboard',
    desc:  "Instant visibility into total corpers, today's attendance count, CDS group distribution, and historical trends.",
    color: 'bg-orange-50 text-orange-600',
  },
];

const ROLES = [
  {
    emoji: '🎓',
    role:  'Corps Members',
    perks: [
      'GPS check-in from your phone',
      'View full attendance history',
      'Download clearance status',
      'Get birthday surprises 🎈',
    ],
  },
  {
    emoji: '🏛️',
    role:  'LGI Officials',
    perks: [
      'Real-time attendance sheet',
      'Approve / reject entries',
      'Manage corper directory',
      'Schedule CDS sessions',
    ],
  },
  {
    emoji: '⚙️',
    role:  'Super Admins',
    perks: [
      'Full user management',
      'Promote CDS presidents',
      'Audit all records',
      'Override device bindings',
    ],
  },
];

const LandingPage = ({ onGetStarted, onLogin }) => (
  <div className="min-h-screen bg-white font-sans selection:bg-green-200">

    {/* ── Nav ───────────────────────────────────────────────────── */}
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#006533] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
            N
          </div>
          <div>
            <p className="font-black text-sm text-slate-900 leading-none">NYSC Portal</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {APP_META.LGA_NAME}
            </p>
          </div>
        </div>
        <button
          onClick={onLogin}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all"
        >
          Sign In
        </button>
      </div>
    </nav>

    {/* ── Hero ──────────────────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
      <span className="inline-block px-4 py-1.5 bg-green-100 text-[#006533] text-xs font-black uppercase tracking-widest rounded-full mb-8">
        {APP_META.LGA_NAME} Local Government · {APP_META.STATE_NAME} State
      </span>
      <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
        NYSC Attendance,<br />
        <span className="text-[#006533]">Done Right.</span>
      </h1>
      <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
        A GPS-verified, device-secured attendance and clearance portal for corps members,
        LGI officials, and administrators. No more paper sheets.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-[#006533] text-white text-lg font-black rounded-2xl shadow-xl shadow-green-900/20 hover:bg-[#005229] transition-all flex items-center justify-center gap-2"
        >
          Get Started <ArrowRight size={20} />
        </button>
        <button
          onClick={onLogin}
          className="px-8 py-4 border-2 border-slate-200 text-slate-700 text-lg font-black rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all"
        >
          I Have an Account
        </button>
      </div>
    </section>

    {/* ── Stats Bar ─────────────────────────────────────────────── */}
    <section className="bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
        {[
          ['GPS-Verified',  'Check-ins'],
          ['Real-Time',     'Attendance Sheet'],
          ['Zero-Paper',    'Process'],
        ].map(([n, l]) => (
          <div key={n}>
            <p className="text-2xl md:text-3xl font-black text-white">{n}</p>
            <p className="text-slate-400 text-sm font-medium mt-1">{l}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── Features ──────────────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-black text-slate-900 mb-4">Built for the Field</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Every feature was designed around real NYSC operations — from remote GPS checks
          to admin override controls.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div
            key={title}
            className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-5`}>
              <Icon size={24} />
            </div>
            <h3 className="font-black text-slate-900 text-lg mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── Role Cards ────────────────────────────────────────────── */}
    <section className="bg-slate-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            For Everyone in the Formation
          </h2>
          <p className="text-slate-500">Tailored dashboards and tools for each user type.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROLES.map(({ emoji, role, perks }) => (
            <div key={role} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-4xl mb-4">{emoji}</div>
              <h3 className="font-black text-slate-900 text-lg mb-5">{role}</h3>
              <ul className="space-y-3">
                {perks.map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-[#006533] shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ───────────────────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-6 py-24 text-center">
      <div className="bg-gradient-to-br from-[#006533] to-emerald-600 rounded-3xl p-12 text-white">
        <ShieldCheck size={48} className="mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl font-black mb-4">Ready to serve smarter?</h2>
        <p className="text-white/70 mb-8 max-w-md mx-auto">
          Join your fellow corps members on the most secure, GPS-verified attendance
          portal in {APP_META.LGA_NAME}.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-4 bg-white text-[#006533] font-black rounded-2xl hover:bg-slate-50 transition-all shadow-xl"
        >
          Create Your Account →
        </button>
      </div>
    </section>

    {/* ── Footer ────────────────────────────────────────────────── */}
    <footer className="border-t border-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#006533] rounded-lg flex items-center justify-center text-white font-black text-sm">N</div>
          <span className="font-bold text-sm text-slate-700">
            NYSC Portal · {APP_META.LGA_NAME}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Open-source attendance system · Built with React &amp; Firebase
        </p>
      </div>
    </footer>
  </div>
);

export default LandingPage;