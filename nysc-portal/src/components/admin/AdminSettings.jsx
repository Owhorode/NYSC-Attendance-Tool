/**
 * @file components/admin/AdminSettings.jsx
 * CDS session scheduling panel for LGI officials.
 * Persists schedule data to the admin/schedule Firestore document.
 */

import React from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AdminSettings = ({ schedule, setSchedule, addToast }) => {
  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'admin', 'schedule'), schedule);
      addToast('Schedule updated successfully!', 'success');
    } catch {
      addToast('Failed to save schedule.', 'error');
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto">
      <h3 className="font-black text-slate-900 mb-6">Schedule CDS Sessions</h3>
      <div className="space-y-4">
        <div className="p-4 border border-slate-100 rounded-2xl">
          <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
            Next CDS Date
          </label>
          <input
            type="date"
            value={schedule.date}
            onChange={e => setSchedule(prev => ({ ...prev, date: e.target.value }))}
            className="w-full bg-slate-50 p-3 rounded-xl outline-none focus:bg-white focus:border-[#006533] border border-transparent transition-all"
          />
        </div>
        <div className="p-4 border border-slate-100 rounded-2xl">
          <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
            CDS Type
          </label>
          <select
            value={schedule.type}
            onChange={e => setSchedule(prev => ({ ...prev, type: e.target.value }))}
            className="w-full bg-slate-50 p-3 rounded-xl outline-none"
          >
            <option>Group CDS</option>
            <option>General CDS</option>
            <option>Clearance</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          className="w-full py-4 bg-[#006533] text-white rounded-2xl font-black mt-4 shadow-xl shadow-green-900/10 hover:bg-[#005229] transition-all"
        >
          Update Schedule
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;