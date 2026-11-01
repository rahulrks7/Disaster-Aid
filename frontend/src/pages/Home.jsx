import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { disasterService } from '../services/disasterService';
import { alertService } from '../services/alertService';
import { shelterService } from '../services/shelterService';
import { InteractiveDisasterMap } from '../components/map/InteractiveDisasterMap';
import { SeverityBadge, StatusBadge, CategoryBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatRelativeTime } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  LifeBuoy,
  MapPin,
  Building,
  Users,
  Radio,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
} from 'lucide-react';

export const Home = () => {
  const { t } = useLanguage();
  const [disasters, setDisasters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [disastersRes, alertsRes, sheltersRes] = await Promise.all([
          disasterService.getPublicMapReports(),
          alertService.getActiveAlerts(),
          shelterService.getAllShelters({ limit: 6 }),
        ]);

        setDisasters(disastersRes.data || []);
        setAlerts(alertsRes.data || []);
        setShelters(sheltersRes.data || []);
        setStats(sheltersRes.stats);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800 bg-gradient-to-b from-[#0e172a] via-[#0b1120] to-[#0b1120]">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {t('home.heroBadge', 'Live Emergency Coordination Platform')}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-display tracking-tight max-w-4xl mx-auto leading-tight">
            {t('home.heroTitle', 'Rapid Disaster Response &')}{' '}
            <span className="text-gradient-red">{t('home.heroTitleHighlight', 'Citizen Relief Network')}</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('home.heroSubtitle', 'Report local emergencies, request urgent rescue assistance, locate nearby relief shelters, and coordinate volunteer response units in real time.')}
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/citizen/report">
              <Button
                variant="primary"
                size="lg"
                icon={ShieldAlert}
                className="shadow-xl shadow-red-600/30 text-base"
              >
                {t('home.reportBtn', 'Report a Disaster')}
              </Button>
            </Link>

            <Link to="/citizen/request-help">
              <Button
                variant="blue"
                size="lg"
                icon={LifeBuoy}
                className="shadow-xl shadow-blue-600/30 text-base"
              >
                {t('home.sosBtn', 'Request SOS Assistance')}
              </Button>
            </Link>

            <Link to="/map">
              <Button variant="outline" size="lg" icon={Compass}>
                {t('home.exploreMapBtn', 'Explore Live Map')}
              </Button>
            </Link>
          </div>

          {/* Metric Highlights Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-2xl font-black text-white font-display">
                {disasters.length}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {t('home.statReports', 'Verified Active Incidents')}
              </p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-2xl font-black text-red-400 font-display">
                {alerts.length}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {t('home.activeAlertsTitle', 'Active Public Alerts')}
              </p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-2xl font-black text-emerald-400 font-display">
                {stats?.totalShelters || shelters.length}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {t('home.statShelters', 'Active Relief Shelters')}
              </p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-2xl font-black text-blue-400 font-display">
                {stats?.availableSlots || '300+'}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {t('home.statCapacity', 'Shelter Beds Available')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Interactive Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Live GIS Telemetry
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
              {t('home.mapSectionTitle', 'Active Disaster & Shelter Map')}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t('home.mapSectionSubtitle', 'Real-time spatial visualization of verified emergency incidents and open relief facilities.')}
            </p>
          </div>
          <Link to="/map">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              {t('home.viewFullMap', 'Open Fullscreen Explorer')}
            </Button>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text={t('common.loading', 'Loading geographic data...')} />
        ) : (
          <InteractiveDisasterMap
            disasters={disasters}
            shelters={shelters}
            height="460px"
          />
        )}
      </section>

      {/* 3. Active Emergency Alerts */}
      {alerts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                {t('alerts.activeBadge', 'Critical Advisories')}
              </span>
              <h2 className="text-2xl font-bold text-white font-display mt-1">
                {t('home.activeAlertsTitle', 'Active Emergency Warnings')}
              </h2>
            </div>
            <Link to="/alerts">
              <Button variant="outline" size="sm">
                {t('common.viewDetails', 'View All Alerts')}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert._id}
                className="glass-card p-5 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {t('alerts.expiresAt', 'Expires')}: {new Date(alert.expiryTime).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white leading-snug">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {alert.affectedArea}
                  </span>
                  <Link
                    to="/alerts"
                    className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                  >
                    {t('common.viewDetails', 'Details')} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Verified Incidents Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {t('disasters.verified', 'Verified Incidents')}
            </span>
            <h2 className="text-2xl font-bold text-white font-display mt-1">
              {t('citizen.dashboard.recentReports', 'Recent Disaster Reports')}
            </h2>
          </div>
          <Link to="/map">
            <Button variant="outline" size="sm">
              {t('home.exploreMapBtn', 'Explore on Map')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disasters.slice(0, 3).map((report) => (
            <div
              key={report._id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col"
            >
              {report.images && report.images.length > 0 ? (
                <div className="h-44 w-full overflow-hidden bg-slate-800 relative">
                  <img
                    src={report.images[0]}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <SeverityBadge severity={report.severity} />
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <CategoryBadge category={report.category} />
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-slate-800/80 p-4 flex items-start justify-between border-b border-slate-800">
                  <SeverityBadge severity={report.severity} />
                  <CategoryBadge category={report.category} />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                    <span>{report.reportId}</span>
                    <span>{formatRelativeTime(report.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-base text-white line-clamp-2">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">
                    {report.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    {report.locationName}
                  </span>
                  <StatusBadge status={report.responseStatus} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Relief Shelters Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {t('shelters.pageTitle', 'Safe Havens')}
            </span>
            <h2 className="text-2xl font-bold text-white font-display mt-1">
              {t('home.sheltersTitle', 'Active Relief Shelters')}
            </h2>
          </div>
          <Link to="/shelters">
            <Button variant="outline" size="sm">
              {t('home.viewAllShelters', 'All Shelters Directory')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {shelters.slice(0, 4).map((shelter) => {
            const isFull = shelter.currentOccupancy >= shelter.totalCapacity;
            const available = Math.max(0, shelter.totalCapacity - shelter.currentOccupancy);
            const percentage = Math.min(
              100,
              Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100)
            );

            return (
              <div
                key={shelter._id}
                className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isFull
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isFull ? t('shelters.statusFull', 'FULL') : t('shelters.statusOpen', 'OPEN')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {shelter.shelterId}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{shelter.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {shelter.address}
                  </p>

                  {/* Occupancy bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{t('shelters.totalCapacity', 'Capacity')}:</span>
                      <span className="font-bold text-white">
                        {shelter.currentOccupancy} / {shelter.totalCapacity} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? 'bg-red-500'
                            : percentage > 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-400 font-semibold text-right">
                      {available} {t('shelters.availableBeds', 'beds available')}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span>📞 {shelter.contactPhone}</span>
                  <Link
                    to="/shelters"
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {t('common.viewDetails', 'View')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t('home.howItWorksTitle', 'Platform Workflow')}
          </span>
          <h2 className="text-3xl font-bold text-white font-display mt-1">
            {t('home.howItWorksSubtitle', 'How DisasterAid Coordinates Emergency Response')}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            An integrated 4-step pipeline bridging citizens with rapid relief and field volunteer response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h4 className="font-bold text-base text-white">{t('home.step1Title', '1. Incident Reporting & SOS')}</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {t('home.step1Desc', 'Citizens submit geo-tagged incident reports or request emergency supplies with victim headcounts.')}
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h4 className="font-bold text-base text-white">{t('home.step2Title', '2. Admin Verification')}</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {t('home.step2Desc', 'Emergency coordinators verify severity, authenticate reports, and dispatch response missions.')}
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h4 className="font-bold text-base text-white">{t('home.step3Title', '3. Rapid Volunteer Dispatch')}</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {t('home.step3Desc', 'Available volunteer teams accept local tasks, deliver aid, and update rescue progress live.')}
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
              4
            </div>
            <h4 className="font-bold text-base text-white">{t('home.step4Title', '4. Live Resource & Shelter Tracking')}</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {t('home.step4Desc', 'Relief inventory and shelter bed capacities are dynamically tracked with zero stock gaps.')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

