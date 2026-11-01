import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import {
  ShieldAlert,
  MapPin,
  Bell,
  Radio,
  Home as HomeIcon,
  Building,
  PhoneCall,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isVolunteer, isCitizen } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isVolunteer) return '/volunteer/dashboard';
    return '/citizen/dashboard';
  };

  const navLinks = [
    { label: t('nav.home', 'Home'), path: '/', icon: HomeIcon },
    { label: t('nav.map', 'Disaster Map'), path: '/map', icon: MapPin },
    { label: t('nav.alerts', 'Alerts'), path: '/alerts', icon: Radio },
    { label: t('nav.shelters', 'Shelters'), path: '/shelters', icon: Building },
    { label: t('nav.hotlines', 'Hotlines'), path: '/contacts', icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white font-display flex items-center gap-1.5">
                Disaster<span className="text-red-500">Aid</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 tracking-wider uppercase font-medium">
                {t('nav.systemName', 'Emergency Response System')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle (Dark / Light Mode) */}
            <ThemeToggle variant="icon" />

            {/* Language Selector Dropdown */}
            <LanguageSelector variant="compact" />

            {/* Quick Emergency Action Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to={isAuthenticated ? '/citizen/report' : '/login'}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {t('nav.reportIncident', 'Report Incident')}
              </Link>
              <Link
                to={isAuthenticated ? '/citizen/request-help' : '/login'}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 hover:text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {t('nav.sosRequest', 'SOS Request')}
              </Link>
            </div>

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{t('nav.notifications', 'Notifications')}</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> {t('nav.markAllRead', 'Mark all read')}
                        </button>
                      )}
                    </div>

                    <div className="mt-2 max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-800/50">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">{t('nav.noNotifications', 'No notifications yet')}</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                              n.isRead ? 'opacity-70 hover:bg-slate-800/40' : 'bg-slate-800/80 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="text-xs font-semibold text-white">{n.title}</h5>
                              <span className="text-[10px] text-slate-400 flex-shrink-0">
                                {formatRelativeTime(n.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Auth Buttons or Profile Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden sm:inline">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="p-3 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 uppercase font-semibold border border-slate-700">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-400" />
                        {t('nav.dashboard', 'Dashboard')}
                      </Link>
                      <Link
                        to={isVolunteer ? '/volunteer/profile' : '/citizen/profile'}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                      >
                        <User className="w-4 h-4 text-emerald-400" />
                        {t('nav.profile', 'My Profile')}
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.signOut', 'Sign Out')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  {t('nav.login', 'Log In')}
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-md shadow-red-600/20 transition-colors"
                >
                  {t('nav.register', 'Sign Up')}
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <div className="flex-1">
                <ThemeToggle variant="full" />
              </div>
              <div className="flex-1">
                <LanguageSelector variant="full" />
              </div>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Icon className="w-4 h-4 text-red-400" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <Link
                to={isAuthenticated ? '/citizen/report' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg text-sm font-semibold"
              >
                <ShieldAlert className="w-4 h-4" />
                {t('nav.reportIncident', 'Report Incident')}
              </Link>
              <Link
                to={isAuthenticated ? '/citizen/request-help' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-lg text-sm font-semibold"
              >
                {t('nav.sosRequest', 'SOS Request')}
              </Link>
            </div>

            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-800">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-blue-400 hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t('nav.dashboard', 'Dashboard')} ({user?.role?.toUpperCase()})
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

