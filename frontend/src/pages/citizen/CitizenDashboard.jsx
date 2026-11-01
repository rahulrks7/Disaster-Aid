import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/common/StatCard';
import { SeverityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatRelativeTime } from '../../utils/helpers';
import {
  ShieldAlert,
  LifeBuoy,
  FileText,
  Activity,
  Plus,
  ArrowRight,
  Radio,
  MapPin,
  Clock,
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await dashboardService.getCitizenSummary();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner text={t('common.loading', 'Loading citizen dashboard...')} />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <span>{t('citizen.dashboard.title', 'Citizen Emergency Portal')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {t('auth.loginTitle', 'Welcome back')}, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            {t('citizen.dashboard.subtitle', 'Submit disaster reports, request urgent rescue help, and track relief progress in real time.')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/citizen/report">
            <Button variant="primary" size="md" icon={ShieldAlert}>
              {t('nav.reportIncident', 'Report Incident')}
            </Button>
          </Link>
          <Link to="/citizen/request-help">
            <Button variant="blue" size="md" icon={LifeBuoy}>
              {t('nav.sosRequest', 'Request Help (SOS)')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title={t('citizen.dashboard.statReports', 'My Incident Reports')}
          value={data?.myReportsCount || 0}
          subtitle={t('citizen.dashboard.recentReports', 'Submitted incident logs')}
          icon={FileText}
          color="red"
        />
        <StatCard
          title={t('citizen.dashboard.statRequests', 'My Help Requests')}
          value={data?.myHelpRequestsCount || 0}
          subtitle={t('citizen.dashboard.recentRequests', 'Active & fulfilled SOS tickets')}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title={t('citizen.dashboard.statActiveAlerts', 'Active Warnings')}
          value={data?.activeAlerts?.length || 0}
          subtitle={t('alerts.pageTitle', 'Broadcast advisories')}
          icon={Radio}
          color="amber"
        />
      </div>

      {/* Active Alerts Feed if any */}
      {data?.activeAlerts && data.activeAlerts.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-red-500/30 bg-red-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              {t('home.activeAlertsTitle', 'Active Emergency Warnings')}
            </h3>
            <Link to="/alerts" className="text-xs text-red-400 hover:text-red-300 font-semibold">
              {t('citizen.dashboard.viewAll', 'View All')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.activeAlerts.map((alert) => (
              <div
                key={alert._id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-[10px] text-slate-400 font-mono">
                    {alert.affectedArea}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Grid: Recent Reports & Recent Help Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-400" /> {t('citizen.dashboard.recentReports', 'My Recent Disaster Reports')}
            </h3>
            <Link
              to="/citizen/my-reports"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              {t('citizen.dashboard.viewAll', 'View All')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data?.recentMyReports?.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              {t('citizen.dashboard.noReports', 'You have not submitted any disaster reports yet.')}
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentMyReports.map((report) => (
                <div
                  key={report._id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{report.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatRelativeTime(report.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-red-400" /> {report.locationName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={report.verificationStatus} />
                      <StatusBadge status={report.responseStatus} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Help Requests */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-blue-400" /> {t('citizen.dashboard.recentRequests', 'My Emergency Help Requests')}
            </h3>
            <Link
              to="/citizen/my-requests"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              {t('citizen.dashboard.viewAll', 'View All')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data?.recentMyRequests?.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              {t('citizen.dashboard.noRequests', 'You have not requested emergency assistance yet.')}
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentMyRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {t(`requests.${req.requestType}`, req.requestType)}
                    </span>
                    <SeverityBadge severity={req.priority} />
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1">{req.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{t('citizen.sos.peopleCount', 'People Affected')}: {req.affectedPeople}</span>
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

