/**
 * @file components/ui/Toast.jsx
 * Self-dismissing toast notification system.
 * Renders a stack of notifications in the top-right corner.
 * Each toast auto-dismisses after ~4s with a visual countdown bar.
 */

import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  error:   <AlertCircle size={18} className="text-red-500 shrink-0"   />,
  info:    <Info        size={18} className="text-blue-500 shrink-0"  />,
};

const BORDERS = {
  success: 'border-green-200',
  error:   'border-red-200',
  info:    'border-blue-200',
};

const BARS = {
  success: 'bg-green-400',
  error:   'bg-red-400',
  info:    'bg-blue-400',
};

const Toast = ({ toast, onDismiss }) => (
  <div className={`flex items-start gap-3 bg-white border ${BORDERS[toast.type] || BORDERS.info} rounded-2xl p-4 shadow-lg w-full max-w-sm relative overflow-hidden`}>
    {ICONS[toast.type] || ICONS.info}
    <p className="text-sm font-medium text-slate-700 flex-1 leading-snug">{toast.msg}</p>
    <button
      onClick={() => onDismiss(toast.id)}
      className="text-slate-300 hover:text-slate-500 transition-colors"
    >
      <X size={16} />
    </button>
    <div className={`absolute bottom-0 left-0 h-0.5 ${BARS[toast.type] || BARS.info} animate-progress`} />
  </div>
);

/**
 * @param {Array}    toasts    - Array of { id, msg, type }
 * @param {Function} onDismiss - Called with a toast id to remove it early
 */
const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
    {toasts.map((toast) => (
      <div key={toast.id} className="pointer-events-auto animate-in slide-in-from-right-8 duration-300">
        <Toast toast={toast} onDismiss={onDismiss} />
      </div>
    ))}
  </div>
);

export default ToastContainer;