/**
 * @file components/admin/AdminCorpers.jsx
 * Corper directory for LGI officials.
 * Supports search/filter, paginated listing, modal profile view,
 * attendance history, device reset, and president promotion.
 *
 * FIX: Removed unused imports — Smartphone, History, CheckCircle.
 */

import React, { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, getDocs,
} from 'firebase/firestore';
import {
  Search, X, Users, Shield, RefreshCw, Gift,
} from 'lucide-react';
import { db }               from '../../services/firebase';
import { CDS_GROUPS, MONTHS } from '../../constants';

const ITEMS_PER_PAGE = 10;
const LOGS_PER_PAGE  = 5;

const STATUS_BADGE = {
  Active:    'bg-green-100 text-green-700',
  Suspended: 'bg-red-100 text-red-700',
  Cleared:   'bg-blue-100 text-blue-700',
};

const AdminCorpers = ({ addToast, isSuper }) => {
  const [corpers,        setCorpers]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [selected,       setSelected]       = useState(null);
  const [modalTab,       setModalTab]       = useState('profile');
  const [userLogs,       setUserLogs]       = useState([]);
  const [logFilterMonth, setLogFilterMonth] = useState('All Months');
  const [logPage,        setLogPage]        = useState(1);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [filter,         setFilter]         = useState({ name: '', code: '', group: '', status: '' });

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'member'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) =>
        `${a.surname}${a.firstName}`.localeCompare(`${b.surname}${b.firstName}`),
      );
      setCorpers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelect = async (corper) => {
    setSelected(corper);
    setModalTab('profile');
    setLogPage(1);
    const snap = await getDocs(
      query(collection(db, 'attendance_logs'), where('userId', '==', corper.id)),
    );
    const logs = snap.docs.map(d => d.data());
    logs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    setUserLogs(logs);
  };

  const handleResetDevice = async (corperId) => {
    if (!window.confirm('Reset device binding? The corper can then log in from any device.')) return;
    try {
      await updateDoc(doc(db, 'users', corperId), { deviceToken: null });
      addToast('Device binding cleared.', 'success');
      setSelected(prev => prev ? { ...prev, deviceToken: null } : null);
    } catch {
      addToast('Failed to reset device.', 'error');
    }
  };

  const handleToggleStatus = async (corperId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateDoc(doc(db, 'users', corperId), { status: newStatus });
      addToast(`Status updated to ${newStatus}.`, 'success');
      setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    } catch {
      addToast('Failed to update status.', 'error');
    }
  };

  const handleTogglePresident = async (corperId, isPresident) => {
    try {
      await updateDoc(doc(db, 'users', corperId), { isPresident: !isPresident });
      addToast(isPresident ? 'President role revoked.' : 'Promoted to CDS President!', 'success');
    } catch {
      addToast('Failed to update role.', 'error');
    }
  };

  // Filtering
  const filtered = corpers.filter(c => (
    (!filter.name   || `${c.surname} ${c.firstName}`.toLowerCase().includes(filter.name.toLowerCase())) &&
    (!filter.code   || (c.stateCode || '').toLowerCase().includes(filter.code.toLowerCase())) &&
    (!filter.group  || c.cdsGroup === filter.group) &&
    (!filter.status || c.status === filter.status)
  ));

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const visible    = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Log filtering for modal
  const filteredLogs = logFilterMonth === 'All Months'
    ? userLogs
    : userLogs.filter(l =>
        l.date?.includes(`-${MONTHS.indexOf(logFilterMonth).toString().padStart(2, '0')}-`),
      );
  const totalLogPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const visibleLogs   = filteredLogs.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header + Filters */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <Users size={20} /> Corper Directory
          </h3>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
            {filtered.length} records
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search name…"
              className="w-full pl-10 p-2 bg-slate-50 rounded-xl text-sm outline-none"
              onChange={e => { setFilter(f => ({ ...f, name: e.target.value })); setCurrentPage(1); }}
            />
          </div>
          <input
            placeholder="State code…"
            className="w-36 p-2 bg-slate-50 rounded-xl text-sm outline-none"
            onChange={e => { setFilter(f => ({ ...f, code: e.target.value })); setCurrentPage(1); }}
          />
          <select
            className="p-2 bg-slate-50 rounded-xl text-sm outline-none"
            onChange={e => { setFilter(f => ({ ...f, group: e.target.value })); setCurrentPage(1); }}
          >
            <option value="">All Groups</option>
            {CDS_GROUPS.map(g => <option key={g}>{g}</option>)}
          </select>
          <select
            className="p-2 bg-slate-50 rounded-xl text-sm outline-none"
            onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setCurrentPage(1); }}
          >
            <option value="">All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Cleared</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Name', 'State Code', 'CDS Group', 'Status', 'Score'].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visible.map(corper => (
              <tr
                key={corper.id}
                onClick={() => handleSelect(corper)}
                className="hover:bg-green-50/40 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                      {corper.surname?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {corper.surname} {corper.firstName}
                      </p>
                      {corper.isPresident && (
                        <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                          President
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{corper.stateCode}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{corper.cdsGroup}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      STATUS_BADGE[corper.status] || STATUS_BADGE.Active
                    }`}
                  >
                    {corper.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                  {corper.attendanceScore ?? 100}%
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">No corpers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 bg-white border rounded-xl text-xs font-bold disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs font-bold text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 bg-white border rounded-xl text-xs font-bold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-400">
                  {selected.surname?.[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {selected.surname} {selected.firstName}
                  </h3>
                  <p className="font-mono text-sm text-slate-500">{selected.stateCode}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50">
              {['profile', 'logs'].map(t => (
                <button
                  key={t}
                  onClick={() => setModalTab(t)}
                  className={`flex-1 py-3 text-sm font-bold capitalize transition-all ${
                    modalTab === t
                      ? 'border-b-2 border-[#006533] text-[#006533] bg-white'
                      : 'text-slate-400'
                  }`}
                >
                  {t === 'profile' ? '👤 Profile' : '📋 Attendance Logs'}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ['Gender',      selected.gender],
                      ['Date of Birth', selected.dob],
                      ['Phone',       selected.phone],
                      ['Email',       selected.email],
                      ['CDS Group',   selected.cdsGroup],
                      ['CDS Day',     selected.cdsDay],
                      ['File Number', selected.fileNo],
                      ['Camp Date',   selected.campDate],
                      ['PPA',         selected.ppa],
                      ['Status',      selected.status],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{k}</p>
                        <p className="text-sm font-bold text-slate-800">{v || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Admin actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleResetDevice(selected.id)}
                      className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-2xl text-sm font-bold hover:bg-blue-100 transition-all"
                    >
                      <RefreshCw size={18} /> Reset Device Binding
                    </button>
                    <button
                      onClick={() => handleToggleStatus(selected.id, selected.status)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all ${
                        selected.status === 'Active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <Shield size={18} />
                      {selected.status === 'Active' ? 'Suspend Account' : 'Re-activate Account'}
                    </button>
                    {isSuper && (
                      <button
                        onClick={() => handleTogglePresident(selected.id, selected.isPresident)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all ${
                          selected.isPresident
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        }`}
                      >
                        <Gift size={18} />
                        {selected.isPresident ? 'Revoke President Role' : 'Promote to President'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {modalTab === 'logs' && (
                <div className="space-y-4">
                  <select
                    className="w-full p-2 bg-slate-50 rounded-xl text-sm outline-none"
                    value={logFilterMonth}
                    onChange={e => { setLogFilterMonth(e.target.value); setLogPage(1); }}
                  >
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>

                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Date', 'Time', 'Status', 'Method'].map(h => (
                          <th key={h} className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {visibleLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-xs font-bold text-slate-800">{log.date}</td>
                          <td className="px-3 py-2 text-xs font-mono text-slate-500">{log.time}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                log.status === 'Present'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-400 capitalize">
                            {log.method || 'gps'}
                          </td>
                        </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400 text-xs">
                            No records for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {totalLogPages > 1 && (
                    <div className="flex items-center justify-between">
                      <button
                        disabled={logPage === 1}
                        onClick={() => setLogPage(p => p - 1)}
                        className="px-3 py-1.5 bg-white border rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="text-xs font-bold text-slate-500">
                        Page {logPage} of {totalLogPages}
                      </span>
                      <button
                        disabled={logPage === totalLogPages}
                        onClick={() => setLogPage(p => p + 1)}
                        className="px-3 py-1.5 bg-white border rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCorpers;