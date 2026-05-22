/**
 * @file components/ui/GlobalStyles.jsx
 * Injects global CSS animations and the Google Sans font family.
 * Rendered once at the root of the application inside App.jsx.
 *
 * FIX: Added React import for consistency across the project.
 */

import React from 'react';

const GlobalStyles = () => (
  <style>{`
    /* --- Google Sans Font Import --- */
    @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Display:wght@700;900&family=Google+Sans+Mono&display=swap');

    /* --- Base Reset & Font Application --- */
    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body, #root {
      font-family: 'Google Sans', 'Inter', system-ui, -apple-system, sans-serif;
    }

    .font-mono {
      font-family: 'Google Sans Mono', 'Roboto Mono', ui-monospace, monospace;
    }

    h1, h2, h3, h4 {
      font-family: 'Google Sans Display', 'Google Sans', sans-serif;
    }

    /* --- Shake Animation (login error feedback) --- */
    @keyframes shake {
      0%,  100% { transform: translateX(0); }
      25%        { transform: translateX(-5px); }
      75%        { transform: translateX(5px); }
    }
    .animate-shake {
      animation: shake 0.3s ease-in-out 2;
    }

    /* --- Progress Bar Animation (toast countdown) --- */
    @keyframes progress {
      from { width: 100%; }
      to   { width: 0%; }
    }
    .animate-progress {
      animation: progress 4s linear forwards;
    }

    /* --- Birthday Balloon Animation --- */
    @keyframes float-up {
      0%   { transform: translateY(100vh) scale(0.5); opacity: 0; }
      20%  { opacity: 1; }
      100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
    }
    .balloon {
      position: fixed;
      bottom: -100px;
      animation: float-up 8s ease-in forwards;
      z-index: 200;
    }

    /* --- Custom Scrollbar --- */
    ::-webkit-scrollbar       { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

    /* --- Text Selection Colour --- */
    ::selection { background-color: #bbf7d0; }
  `}</style>
);

export default GlobalStyles;