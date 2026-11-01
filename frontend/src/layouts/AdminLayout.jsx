import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShieldAlert,
  LifeBuoy,
  ClipboardList,
  Users,
  Boxes,
  Building,
  Radio,
  UserCog,
  FileText,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Disaster Reports', path: '/admin/disasters', icon: ShieldAlert },
    { label: 'Help Requests Queue', path: '/admin/help-requests', icon: LifeBuoy },
    { label: 'Response Tasks', path: '/admin/tasks', icon: ClipboardList },
    { label: 'Volunteers Roster', path: '/admin/volunteers', icon: Users },
    { label: 'Relief Inventory', path: '/admin/resources', icon: Boxes },
    { label: 'Relief Shelters', path: '/admin/shelters', icon: Building },
    { label: 'Emergency Alerts', path: '/admin/alerts', icon: Radio },
    { label: 'User Directory', path: '/admin/users', icon: UserCog },
    { label: 'System Audit Logs', path: '/admin/audit-logs', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#060913] text-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0b1120] border-r border-slate-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-red-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black text-white font-display">
                Disaster<span className="text-red-500">Aid</span>
              </span>
              <span className="text-[10px] text-red-400 block font-semibold uppercase tracking-wider">
                Admin Command
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 border border-red-500'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Portal Switcher */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ChevronLeft className="w-3.5 h-3.5" /> Public Platform
            </span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 px-1">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-red-400 font-semibold uppercase">Administrator</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for mobile trigger */}
        <header className="h-16 md:hidden px-4 bg-[#0b1120] border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-white">Admin Command Center</span>
          <div className="w-7 h-7 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center text-xs font-bold text-red-300">
            A
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#060913]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
