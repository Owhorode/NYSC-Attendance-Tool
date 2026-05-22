/**
 * @file components/dashboard/Sidebar.jsx
 * Responsive sidebar navigation for the authenticated dashboard.
 * Slides in as a mobile overlay; always visible on lg+ screens.
 * Menu items are role-aware; some are exclusive to super admins.
 */

import React from 'react';
import {
  LayoutDashboard, User, ClipboardCheck, History,
  Settings, Users, UserCog, Calendar, LogOut,
} from 'lucide-react';
import { APP_META } from '../../constants';

const MENU = {
  member: [
    { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
    { id: 'profile',    label: 'My Profile', icon: User            },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck  },
    { id: 'logs',       label: 'Logs',       icon: History         },
    { id: 'settings',   label: 'Settings',   icon: Settings        },
  ],
  admin: [
    { id: 'overview',   label: 'KPI Overview',     icon: LayoutDashboard            },
    { id: 'corpers',    label: 'Corper Directory', icon: Users                      },
    { id: 'attendance', label: 'Attendance',       icon: ClipboardCheck             },
    { id: 'users',      label: 'User Management',  icon: UserCog, exclusive: true   },
    { id: 'settings',   label: 'Schedule',         icon: Calendar                   },
  ],
};

const Sidebar = ({ role, activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const menuItems = (role === 'lgi' || role === 'superadmin') ? MENU.admin : MENU.member;

  const handleNav = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:transform-none
        `}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#006533] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              N
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight leading-none">NYSC Portal</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                {APP_META.LGA_NAME}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              if (item.exclusive && role !== 'superadmin') return null;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                    ${isActive
                      ? 'bg-[#006533] text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                  `}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="pt-6 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;