/**
 * @file components/admin/AdminOverview.jsx
 * KPI dashboard panel for LGI officials and super admins.
 * Displays real-time aggregate statistics passed down from App.jsx.
 *
 * FIX: Removed unused `role` prop from destructuring.
 */

import React from 'react';
import { Users, CheckCircle, ShieldCheck } from 'lucide-react';
import { APP_META } from '../../constants';

const StatCard = ({ icon: Icon, color, label, value }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value.toLocaleString()}</p>
    </div>
  </div>
);

const AdminOverview = ({ stats }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-black text-slate-900">
        Local Government: {APP_META.LGA_NAME}
      </h2>
      <p className="text-slate-500 text-sm mt-1">Real-time status of your CDS formation.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard icon={Users}       color="bg-blue-500"   label="Total Corpers"  value={stats.total}   />
      <StatCard icon={CheckCircle} color="bg-green-500"  label="Present Today"  value={stats.present} />
      <StatCard icon={ShieldCheck} color="bg-orange-500" label="CDS Groups"     value={6}             />
    </div>
  </div>
);

export default AdminOverview;