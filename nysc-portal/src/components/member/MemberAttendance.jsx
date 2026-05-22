/**
 * @file components/member/MemberAttendance.jsx
 *
 * Bugs fixed in this file:
 *   1. submitAttendance declared with useCallback BEFORE the useEffect
 *      that calls it — arrow functions are not hoisted.
 *   2. Geofence useEffect lists all actual deps (submitAttendance, addToast).
 *   3. Live-feed cleanup was unsub() in original — corrected to unsubscribe().
 *   4. (NEW) geo-fail stage was unreachable — setStage('geo-fail') was
 *      never called. Now called when the user is outside the geofence,
 *      showing the proper failure UI. Removed unused MapPinOff import.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { MapPin, Users, Loader2, XCircle } from 'lucide-react';
import { auth, db }     from '../../services/firebase';
import { GEOFENCE }     from '../../constants';
import useGeofence      from '../../hooks/useGeofence';
import SuccessCard      from './SuccessCard';

const ITEMS_PER_PAGE = 10;

const MemberAttendance = ({
  user,
  setAlreadySigned,
  alreadySigned,
  addToast,
  currentLog,
}) => {
  const [stage,          setStage]          = useState(alreadySigned ? 'success' : 'ready');
  const [loading,        setLoading]        = useState(false);
  const [liveAttendance, setLiveAttendance] = useState([]);
  const [page,           setPage]           = useState(1);

  const {
    isInside,
    distance,
    loading: geoLoading,
    error:   geoError,
    verifyLocation,
  } = useGeofence(GEOFENCE.TARGET.lat, GEOFENCE.TARGET.lng, GEOFENCE.MAX_DISTANCE_METERS);

  // FIX 1 + 2: declared with useCallback BEFORE the useEffect that calls it
  const submitAttendance = useCallback(async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const time  = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const countSnap = await getDocs(
        query(collection(db, 'attendance_logs'), where('date', '==', today)),
      );
      const serial = (countSnap.size + 1).toString().padStart(3, '0');

      await addDoc(collection(db, 'attendance_logs'), {
        userId:    auth.currentUser.uid,
        name:      `${user.surname} ${user.firstName}`,
        stateCode: user.stateCode,
        date:      today,
        time,
        timestamp: serverTimestamp(),
        day:       new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        serial,
        status:    'Pending',
        method:    'gps',
      });

      setAlreadySigned(true);
      setStage('success');
      addToast('Attendance Signed Successfully!', 'success');
    } catch (e) {
      addToast('Failed to record attendance: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, setAlreadySigned, addToast]);

  // FIX 3: correct cleanup reference
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'attendance_logs'), where('date', '==', today));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let logs = snapshot.docs.map(d => d.data());
      logs.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
      logs = logs.map((log, i) => ({ ...log, serial: (i + 1).toString().padStart(3, '0') }));
      setLiveAttendance(logs);
    });
    return () => unsubscribe();
  }, []);

  // FIX 2 + 4: correct dep array; setStage('geo-fail') now actually called
  useEffect(() => {
    if (geoError) {
      addToast(geoError, 'error');
      return;
    }
    if (!geoLoading && distance !== null) {
      if (isInside) {
        submitAttendance();
      } else {
        // FIX 4: was only calling addToast — stage never changed
        addToast(
          `You are ${distance}m away. Must be within ${GEOFENCE.MAX_DISTANCE_METERS}m.`,
          'error',
        );
        setStage('geo-fail');
      }
    }
  }, [isInside, distance, geoLoading, geoError, submitAttendance, addToast]);

  const totalPages  = Math.ceil(liveAttendance.length / ITEMS_PER_PAGE);
  const visibleLogs = liveAttendance.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ── Success view ──────────────────────────────────────────────────────────
  if (stage === 'success') return (
    <div className="max-w-xl mx-auto space-y-8">
      <SuccessCard
        user={user}
        log={currentLog || {
          date:   new Date().toLocaleDateString(),
          time:   new Date().toLocaleTimeString(),
          serial: '---',
        }}
      />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <Users size={18} /> Live Feed
          </h3>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md">
            Live
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                {['S/N', 'Time', 'Name', 'Code'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleLogs.map((log, i) => (
                <tr
                  key={i}
                  className={`hover:bg-slate-50/50 ${
                    log.userId === auth.currentUser?.uid ? 'bg-green-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-xs font-bold text-slate-800">#{log.serial}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{log.time}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700">{log.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{log.stateCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between bg-slate-50">
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
    </div>
  );

  // ── Geo-fail view (FIX 4 — now reachable) ────────────────────────────────
  if (stage === 'geo-fail') return (
    <div className="max-w-md mx-auto">
      <div className="bg-red-50 border-2 border-red-100 p-8 rounded-3xl text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <XCircle size={32} />
        </div>
        <h3 className="text-xl font-black text-red-900 mb-2">Outside the CDS Zone</h3>
        <p className="text-red-700/70 text-sm mb-2 leading-relaxed">
          You are <strong>{distance}m</strong> from the venue.
          You must be within {GEOFENCE.MAX_DISTANCE_METERS}m to check in.
        </p>
        <p className="text-red-600/60 text-xs mb-8">
          Ensure your GPS is on and you are physically at the CDS venue, then try again.
        </p>
        <button
          onClick={() => setStage('ready')}
          className="w-full py-3 border border-red-200 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // ── Ready view ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-green-50 text-[#006533] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPin size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Check-in Available</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Ensure GPS is enabled. You must be within{' '}
          <strong>{GEOFENCE.MAX_DISTANCE_METERS}m</strong> of the designated CDS venue.
        </p>
        {distance !== null && (
          <p className="text-xs font-mono text-slate-400 mb-4">
            Distance to venue: {distance}m
          </p>
        )}
        <button
          disabled={geoLoading || loading}
          onClick={verifyLocation}
          className="w-full py-4 bg-[#006533] text-white rounded-2xl font-black shadow-xl shadow-green-900/20 flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:bg-[#005229]"
        >
          {(geoLoading || loading)
            ? <Loader2 className="animate-spin" size={20} />
            : 'Mark Attendance (GPS)'}
        </button>
      </div>
    </div>
  );
};

export default MemberAttendance;