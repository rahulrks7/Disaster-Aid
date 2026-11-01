import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs mt-auto">
      {/* Important Academic & Emergency Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center">
        <p className="text-amber-300 text-xs font-medium max-w-5xl mx-auto">
          ⚠️ <strong>{t('common.academicDisclaimer', 'Academic Project Notice: DisasterAid is an MCA academic research prototype for disaster coordination demonstration. For real emergencies, call official services (112 / 108 / 101).')}</strong>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white font-display">
                Disaster<span className="text-red-500">Aid</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t('home.heroSubtitle', 'Report local emergencies, request urgent rescue assistance, locate nearby relief shelters, and coordinate volunteer response units in real time.')}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                MERN Stack
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                Leaflet GIS
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                Multi-Language (i18n)
              </span>
            </div>
          </div>

          {/* Col 2: Fast Portals */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              {t('nav.systemName', 'Emergency Modules')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/map" className="hover:text-white transition-colors">
                  {t('nav.map', 'Disaster Map')}
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-white transition-colors">
                  {t('nav.alerts', 'Alerts')}
                </Link>
              </li>
              <li>
                <Link to="/shelters" className="hover:text-white transition-colors">
                  {t('nav.shelters', 'Shelters')}
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="hover:text-white transition-colors">
                  {t('nav.hotlines', 'Hotlines')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Role Portals */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              {t('nav.citizenPortal', 'Portals')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/citizen/dashboard" className="hover:text-white transition-colors">
                  {t('nav.citizenPortal', 'Citizen Portal')}
                </Link>
              </li>
              <li>
                <Link to="/volunteer/dashboard" className="hover:text-white transition-colors">
                  {t('nav.volunteerPortal', 'Volunteer Portal')}
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition-colors">
                  {t('nav.adminPortal', 'Admin Command')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  {t('auth.registerTitle', 'Create an Account')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: National Hotlines */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              {t('hotlines.pageTitle', 'National Emergency Hotlines')}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex justify-between py-1 border-b border-slate-900">
                <span>{t('hotlines.generalTitle', 'National Emergency')}:</span>
                <strong className="text-red-400">112</strong>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-900">
                <span>{t('hotlines.medicalTitle', 'Ambulance & Medical')}:</span>
                <strong className="text-emerald-400">108</strong>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-900">
                <span>{t('hotlines.fireTitle', 'Fire Response')}:</span>
                <strong className="text-orange-400">101</strong>
              </li>
              <li className="flex justify-between py-1">
                <span>{t('hotlines.disasterTitle', 'NDRF Helpline')}:</span>
                <strong className="text-blue-400">1078</strong>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <p>© {new Date().getFullYear()} DisasterAid. MCA Academic Capstone Project.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for community safety &amp; relief
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

