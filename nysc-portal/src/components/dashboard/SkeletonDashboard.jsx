/**
 * @file components/dashboard/SkeletonDashboard.jsx
 * Loading state shown while the Firebase auth listener resolves.
 * Mirrors the authenticated dashboard layout to prevent layout shift.
 */

import React from 'react';

const SkeletonDashboard = () => (
  <div className="min-h-screen bg-slate-50 flex animate-pulse">
    {/* Sidebar skeleton */}
    <div className="hidden lg:block w-64 bg-slate-900/90 h-screen p-6 space-y-8 shrink-0">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-slate-800 rounded-xl" />
        <div className="h-10 w-32 bg-slate-800 rounded-xl" />
      </div>
      <div className="space-y-3 pt-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>

    {/* Main content skeleton */}
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-8 bg-slate-200 rounded-lg lg:hidden" />
        <div className="flex gap-4 items-center ml-auto">
          <div className="hidden sm:block text-right space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded ml-auto" />
            <div className="h-3 w-20 bg-slate-200 rounded ml-auto" />
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white h-32 rounded-2xl border border-slate-200 shadow-sm" />
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="bg-white rounded-3xl h-64 border border-slate-200 shadow-sm" />
    </div>
  </div>
);

export default SkeletonDashboard;