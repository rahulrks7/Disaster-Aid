import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { EmergencyBanner } from '../components/common/EmergencyBanner';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, ShieldAlert, LifeBuoy, FileText, Activity, User } from 'lucide-react';

export const CitizenLayout = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { label: t('nav.overview', 'Overview'), path: '/citizen/dashboard', icon: LayoutDashboard },
    { label: t('nav.reportIncident', 'Report Disaster'), path: '/citizen/report', icon: ShieldAlert, highlight: 'red' },
    { label: t('nav.sosRequest', 'Request Help (SOS)'), path: '/citizen/request-help', icon: LifeBuoy, highlight: 'amber' },
    { label: t('nav.myReports', 'My Reports'), path: '/citizen/my-reports', icon: FileText },
    { label: t('nav.myHelpRequests', 'My Help Requests'), path: '/citizen/my-requests', icon: Activity },
    { label: t('nav.profile', 'Profile'), path: '/citizen/profile', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1120] text-slate-100">
      <EmergencyBanner />
      <Navbar />

      {/* Citizen Subheader Navigation */}
      <div className="bg-slate-900/90 border-b border-slate-800 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 mr-2 flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                {t('nav.citizenPortal', 'Citizen Portal')}
              </span>
              <nav className="flex items-center gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = location.pathname === tab.path;
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

