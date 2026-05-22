/**
 * @file components/admin/AdminAttendanceSheet.jsx
 * Today's attendance sheet for LGI officials.
 * Supports real-time updates, status approval/rejection,
 * manual member addition (rate-limited to 3/session), and deletion.
 */

import React, { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, getDocs, doc, serverTimestamp,
} from 'firebase/firestore';
import { Search, Plus, CheckCircle, XCircle, Clock, Trash2, X } from 'lucide-react';
import { db } from '../../services/firebase';

const STATUS_STYLES = {
  Present:   'bg-green-100 text-green-700',
  Pending:   'bg-orange-100 text-orange-700',
  Absent:    'bg-red-100 text-red-700',
  Travelled: 'bg-blue-100 text-blue-700',
  Leave:     'bg-purple-100 text-purple-700',
};

const ITEMS_PER_PAGE = 10;

const AdminAttendanceSheet = ({ addToast }) => {
  const [logs,         setLogs]         = useState([]);
  const [filter,       setFilter]       = useState({ name: '', code: '', status: '' });
  const [page,         setPage]         = useState(1);
  const [showManual,   setShowManual]   = useState(false);
  const [manualCode,   setManualCode]   = useState('');
  const [manualStatus, setManualStatus] = useState('Present');
  const [addCount,     setAddCount]     = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'attendance_logs'), where('date', '==', today));
    const unsubscribe = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => setPage(1), [filter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'attendance_logs', id), { status: newStatus });
      addToast('Status updated.', 'success');
    } catch {
      addToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    await deleteDoc(doc(db, 'attendance_logs', id));
    addToast('Record deleted.', 'info');
  };

  const handleManualAdd = async () => {
    if (addCount >= 3) {
      addToast('Session limit reached: maximum 3 manual additions per session.', 'error');
      return;
    }
    const normalizedCode = manualCode.trim().toUpperCase();
    try {
      const snap = await getDocs(
        query(collection(db, 'users'), where('stateCode', '==', normalizedCode)),
      );
      if (snap.empty) { addToast('State Code not found.', 'error'); return; }

      const user   = snap.docs[0].data();
      const userId = snap.docs[0].id;
      const today  = new Date().toISOString().split('T')[0];
      const time   = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      await addDoc(collection(db, 'attendance_logs'), {
        userId,
        name:      `${user.surname} ${user.firstName}`,
        stateCode: user.stateCode,
        date:      today,
        time,
        timestamp: serverTimestamp(),
        day:       new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        serial:    'MAN',
        status:    manualStatus,
        method:    'manual',
      });

      setAddCount(prev => prev + 1);
      addToast('Member added successfully.', 'success');
      setShowManual(false);
      setManualCode('');
    } catch {
      addToast('Error adding member.', 'error');
    }
  };

  const filtered = logs.filter(l => (
    (!filter.name   || l.name.toLowerCase().includes(filter.name.toLowerCase())) &&
    (!filter.code   || l.stateCode.toLowerCase().includes(filter.code.toLowerCase())) &&
    (!filter.status || l.status === filter.status)
  ));

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const visibleLogs = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-900">Attendance Sheet — Today</h3>
          <div className="flex gap-2">
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1.5 rounded">
              {logs.length} logged
            </span>
            <button
              onClick={() => setShowManual(true)}
              className="bg-slate-900 text-white p-1.5 rounded-lg"
              title="Add manually"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search name…"
              className="w-full pl-10 p-2 bg-slate-50 rounded-xl text-sm outline-none"
              onChange={e => setFilter(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <input
            placeholder="Code…"
            className="w-32 p-2 bg-slate-50 rounded-xl text-sm outline-none"
            onChange={e => setFilter(f => ({ ...f, code: e.target.value }))}
          />
          <select
            className="p-2 bg-slate-50 rounded-xl text-sm outline-none"
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Status</option>
            {['Present', 'Travelled', 'Leave', 'Pending', 'Absent'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Name', 'Time', 'Code', 'Status', 'Action'].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visibleLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-800">{log.name}</td>
                <td className="px-6 py-4 font-mono text-xs">{log.time}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{log.stateCode}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                      STATUS_STYLES[log.status] || STATUS_STYLES.Pending
                    }`}
                  >
                    {log.status === 'Present' && <CheckCircle size={12} />}
                    {log.status === 'Pending' && <Clock       size={12} />}
                    {log.status === 'Absent'  && <XCircle     size={12} />}
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {log.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(log.id, 'Present')}
                        className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(log.id, 'Absent')}
                        className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      {/* Manual Add Modal */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Add Attendee Manually</h3>
              <button onClick={() => setShowManual(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <input
              placeholder="State Code (LA/24B/…)"
              className="w-full p-3 border rounded-xl mb-3 outline-none uppercase font-mono tracking-wide"
              value={manualCode}
              onChange={e => setManualCode(e.target.value.toUpperCase())}
            />
            <select
              className="w-full p-3 border rounded-xl mb-4 outline-none"
              value={manualStatus}
              onChange={e => setManualStatus(e.target.value)}
            >
              <option>Present</option>
              <option>Travelled</option>
              <option>Leave</option>
            </select>
            <button
              onClick={handleManualAdd}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
            >
              Add to List
            </button>
            <p className="text-xs text-center mt-2 text-slate-400">
              Session limit: {3 - addCount} remaining
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendanceSheet;