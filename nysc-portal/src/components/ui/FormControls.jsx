/**
 * @file components/ui/FormControls.jsx
 * Reusable form input primitives used across auth and data-entry flows.
 */

import React from 'react';

/**
 * Styled text input with optional leading icon and error state.
 *
 * @param {React.ElementType} icon        - Lucide icon component
 * @param {boolean}           error       - Applies error ring when true
 * @param {string}            type        - HTML input type (default: "text")
 * @param {string}            placeholder
 * @param {*}                 value
 * @param {Function}          onChange
 */
export const InputField = ({
  icon: Icon,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  ...rest
}) => (
  <div
    className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-slate-50 transition-all focus-within:bg-white focus-within:border-[#006533] ${
      error ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'
    }`}
  >
    {Icon && <Icon size={18} className="text-slate-400 shrink-0" />}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="bg-transparent w-full outline-none text-sm text-slate-800 placeholder:text-slate-400 font-medium"
      {...rest}
    />
  </div>
);

/**
 * Labelled wrapper for form fields in multi-step registration.
 *
 * @param {string}          label    - Field label text
 * @param {boolean}         required - Renders a red asterisk when true
 * @param {React.ReactNode} children - The input element to wrap
 */
export const InputGroup = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);