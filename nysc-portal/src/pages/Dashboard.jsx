/**
 * @file pages/Dashboard.jsx
 * Authenticated dashboard shell. Composes Sidebar with content panels
 * based on user role and active tab. Layout/routing only — no data fetching.
 *
 * FIX: Merged two separate lucide-react import statements into one.
 *      Removed unused LogOut import (Sidebar handles sign-out internally).
 */

import React from 'react';
import { Menu, BarChart3, Users, Shield } from 'lucide-react';

import Sidebar              from '../components/dashboard/Sidebar';
import AdminOverview        from '../components/admin/AdminOverview';
import AdminCorpers         from '../components/admin/AdminCorpers';
import AdminAttendanceSheet from '../components/admin/AdminAttendanceSheet';
import AdminSettings        from '../components/admin/AdminSettings';
import MemberAttendance     from '../components/member/MemberAttendance';
import MemberLogs           from '../components/member/MemberLogs';

// ---------------------------------------------------------------------------
// Inline member sub-views (too small to warrant separate files)
// ---------------------------------------------------------------------------
const MemberProfile = ({ user }) => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
    <div className="h-32 bg-[#006533] relative">
      <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-3xl bg-white p-1 shadow-lg">
        <div className="w-full h-full rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-300">
          {user.surname?.[0]}
        </div>
      </div>
    </div>
    <div className="p-8 pt-16">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900">
            {user.surname} {user.firstName} {user.otherNames}
          </h3>
          <p className="text-slate-500 font-mono">{user.stateCode}</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
          {user.status}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
            Personal Details
          </h4>
          <div className="space-y-3">
            {[
              ['Gender',       user.gender],
              ['Date of Birth',user.dob],
              ['Phone',        user.phone],
              ['Email',        user.email],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-sm text-slate-500">{k}</span>
                <span className="text-sm font-bold text-slate-800">{v}</span>
              </div>
            ))}
            <div>
              <span className="text-sm text-slate-500 block mb-1">Address</span>
              <span className="text-sm font-bold text-slate-800">
                {user.address}, {user.lgaCurrent}, {user.stateCurrent}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
            Official Details
          </h4>
          <div className="space-y-3">
            {[
              ['State Code',  user.stateCode],
              ['CDS Group',   user.cdsGroup],
              ['File Number', user.fileNo],
              ['Camp Date',   user.campDate],
              ['PPA',         user.ppa],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-sm text-slate-500">{k}</span>
                <span className="text-sm font-bold text-slate-800">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MemberSettings = () => (
  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto">
    <h3 className="font-black text-slate-900 mb-6">Device & Security</h3>
    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <Shield size={20} className="text-[#006533]" />
        <span className="text-sm font-bold text-[#006533]">Authenticated Device</span>
      </div>
      <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-700 font-bold uppercase">
        Active
      </span>
    </div>
    <p className="text-sm text-slate-500">
      To change your password, use the <strong>Forgot Password</strong> flow on the login screen.
      To reset your device binding, contact your LGI official.
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Dashboard shell
// ---------------------------------------------------------------------------
const Dashboard = ({
  userRole,
  currentUser,
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setSidebarOpen,
  onLogout,
  addToast,
  stats,
  schedule,
  setSchedule,
  memberAlreadySigned,
  setMemberAlreadySigned,
  currentLog,
}) => {
  const isAdmin = userRole === 'lgi' || userRole === 'superadmin';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        role={userRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="lg:hidden w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center"
          >
            <Menu size={20} className="text-slate-600" />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900">
                {currentUser?.firstName} {currentUser?.surname}
              </p>
              <p className="text-xs text-slate-400 font-medium capitalize">{userRole}</p>
            </div>
            <div className="w-9 h-9 bg-[#006533] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm">
              {currentUser?.surname?.[0] || '?'}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">

          {/* ── MEMBER VIEWS ─────────────────────────────────────── */}
          {userRole === 'member' && currentUser && (
            <div className="animate-in fade-in duration-500">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#006533] to-emerald-600 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-green-900/10">
                    <div>
                      <h2 className="text-3xl font-black mb-2">
                        Welcome, {currentUser.firstName}!
                      </h2>
                      <p className="text-white/80 font-medium">
                        You are currently in good standing.
                      </p>
                    </div>
                    <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                      <p className="text-xs font-bold uppercase opacity-60 mb-1">Status</p>
                      <p className="text-lg font-black tracking-widest">
                        {currentUser.status || 'Active'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">CDS Group</p>
                        <p className="font-black text-slate-900">{currentUser.cdsGroup}</p>
                        <p className="text-xs text-slate-500 font-medium">{currentUser.cdsDay}s</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                        <BarChart3 size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Attendance Score</p>
                        <p className="font-black text-slate-900">
                          {currentUser.attendanceScore ?? 100}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'profile'    && <MemberProfile user={currentUser} />}
              {activeTab === 'attendance' && (
                <MemberAttendance
                  user={currentUser}
                  setAlreadySigned={setMemberAlreadySigned}
                  alreadySigned={memberAlreadySigned}
                  currentLog={currentLog}
                  addToast={addToast}
                />
              )}
              {activeTab === 'logs'     && <MemberLogs user={currentUser} />}
              {activeTab === 'settings' && <MemberSettings />}
            </div>
          )}

          {/* ── ADMIN VIEWS ──────────────────────────────────────── */}
          {isAdmin && (
            <div className="animate-in fade-in duration-500">
              {activeTab === 'overview'   && <AdminOverview stats={stats} />}
              {activeTab === 'corpers'    && <AdminCorpers addToast={addToast} isSuper={false} />}
              {activeTab === 'attendance' && <AdminAttendanceSheet addToast={addToast} />}
              {activeTab === 'users'      && <AdminCorpers addToast={addToast} isSuper={true} />}
              {activeTab === 'settings'   && (
                <AdminSettings
                  schedule={schedule}
                  setSchedule={setSchedule}
                  addToast={addToast}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;