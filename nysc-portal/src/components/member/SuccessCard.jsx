/**
 * @file components/member/SuccessCard.jsx
 * Receipt-style confirmation card displayed after a successful GPS check-in.
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessCard = ({ user, log }) => (
  <div className="bg-white border-2 border-green-500 rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-transparent to-transparent opacity-50 pointer-events-none" />

    <div className="flex flex-col items-center text-center relative z-10">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <CheckCircle size={48} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Check-in Verified!</h2>
      <p className="text-slate-500 text-sm mb-8 italic">
        Attendance recorded successfully for today's CDS.
      </p>

      <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 grid grid-cols-2 gap-4 text-left border-b border-slate-200">
          {[
            ['Surname',     user.surname],
            ['First Name',  user.firstName],
            ['Other Names', user.otherNames],
            ['State Code',  user.stateCode],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
              <p className="font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 grid grid-cols-2 gap-4 text-left">
          {[
            ['Date',       log?.date],
            ['Time',       log?.time],
            ['CDS Group',  user.cdsGroup],
            ['Serial No.', `#${log?.serial}`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
              <p className="font-bold text-slate-900 font-mono">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SuccessCard;