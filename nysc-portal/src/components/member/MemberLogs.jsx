/**
 * @file components/member/MemberLogs.jsx
 * Paginated table of a corps member's personal attendance history.
 * Sourced in real-time from Firestore via onSnapshot.
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { History } from 'lucide-react';
import { db } from '../../services/firebase';

const ITEMS_PER_PAGE = 10;

const STATUS_STYLES = {
  Present:   'bg-green-100 text-green-700',
  Absent:    'bg-red-100 text-red-700',
  Travelled: 'bg-blue-100 text-blue-700',
  Leave:     'bg-purple-100 text-purple-700',
  Pending:   'bg-yellow-100 text-yellow-700',
};

const MemberLogs = ({ user }) => {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'attendance_logs'),
      where('userId', '==', user.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const totalPages  = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const visibleLogs = logs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-slate-100">
        <h3 className="font-black text-slate-900 flex items-center gap-2">
          <History size={20} /> My Attendance History
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Date', 'Time', 'Method', 'Status'].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visibleLogs.map((log, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-800">{log.date}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.time}</td>
                <td className="px-6 py-4 text-xs text-slate-500 capitalize">{log.method || 'gps'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      STATUS_STYLES[log.status] || STATUS_STYLES.Pending
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white border rounded-xl text-xs font-bold disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white border rounded-xl text-xs font-bold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberLogs;