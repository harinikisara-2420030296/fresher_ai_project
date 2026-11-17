import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Map,
  Star,
  Plus,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddCoinsModal from './AddCoinsModal';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCoinsModal, setShowCoinsModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Builder', path: '/resume-builder', icon: FileText },
    { name: 'Roadmap Builder', path: '/roadmap', icon: Map },
    { name: 'Resume Scorer', path: '/scorer', icon: Star },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'H';

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-5 bg-white border-r border-gray-200/80 transition-all duration-300">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6 pb-2">
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#121216] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" />
              </svg>
            </div>
            {!collapsed && (
              <span className="text-lg font-extrabold tracking-tight text-[#121216]">Fresher.AI</span>
            )}
          </div>

          {/* Collapse button for desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Create Interview Action Button */}
        <button
          onClick={() => {
            navigate('/interview/new');
            setMobileOpen(false);
          }}
          className={`w-full flex items-center justify-center gap-2 bg-[#18181B] hover:bg-black text-white font-semibold text-sm rounded-xl py-3 px-4 shadow-md hover:shadow-lg transition-all mb-6 ${collapsed ? 'px-2' : ''
            }`}
          title="Create Interview"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>+ Create Interview</span>}
        </button>

        {/* AGENTS Section */}
        {!collapsed && (
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Agents
          </p>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                    ? 'bg-gray-100 text-[#121216] font-semibold shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#121216]' : 'text-gray-400'}`} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Coins Card + User Row */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        {/* INTERVIEW COINS Card */}
        <div className="bg-[#0F0F14] border border-white/5 rounded-2xl p-3.5 text-white shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-purple-400">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              {!collapsed && (
                <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                  Interview Coins
                </span>
              )}
            </div>
            <button
              onClick={() => setShowCoinsModal(true)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors group-hover:scale-110"
              title="Add coins"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline justify-between">
            <span className={`font-extrabold text-white tracking-tight ${collapsed ? 'text-xs text-center w-full' : 'text-xl'}`}>
              {user?.coins ?? 1000}
            </span>
            {!collapsed && (
              <span className="text-[10px] text-gray-400">50 / mock</span>
            )}
          </div>
        </div>

        {/* User row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {userInitial}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 truncate">
                <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
                  {user?.name || 'Fresher Student'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.email || 'student@fresher.ai'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AddCoinsModal
        isOpen={showCoinsModal}
        onClose={() => setShowCoinsModal(false)}
      />
    </div>
  );

  return (
    <>
      {/* Mobile Top Header Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#121216] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 2 8.5 2 15.5 12 22 22 15.5 22 8.5 12 2" />
            </svg>
          </div>
          <span className="font-extrabold text-[#121216]">Fresher.AI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 h-screen sticky top-0 ${collapsed ? 'w-20' : 'w-64'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

