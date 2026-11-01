import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alertService';
import { useLanguage } from '../context/LanguageContext';
import { SeverityBadge, CategoryBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Radio, AlertTriangle, MapPin, Clock, ShieldCheck, Search } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export const PublicAlerts = () => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [search, setSearch] = useState('');

  const loadAlerts = async () => {
    try {
      const res = await alertService.getActiveAlerts();
      setAlerts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const filtered = alerts.filter((alert) => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    if (search) {
      const query = search.toLowerCase();
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.affectedArea.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {t('alerts.pageTitle', 'Active Public Emergency Alerts')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('alerts.pageSubtitle', 'Real-time advisory warnings broadcasted by emergency coordination command.')}
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('common.search', 'Search alerts or area...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-red-500"
          >
            <option value="all">{t('common.all', 'All Severities')}</option>
            <option value="critical">{t('disasters.critical', 'Critical Only')}</option>
            <option value="high">{t('disasters.high', 'High Severity')}</option>
            <option value="medium">{t('disasters.medium', 'Medium Severity')}</option>
            <option value="low">{t('disasters.low', 'Low Severity')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text={t('common.loading', 'Fetching active broadcasts...')} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={t('alerts.noAlerts', 'No Active Emergency Alerts')}
          description={t('alerts.pageSubtitle', 'There are currently no active public disaster advisories published for your region.')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((alert) => (
            <div
              key={alert._id}
              className="glass-card p-6 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/30 via-slate-900 to-slate-900 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <CategoryBadge category={alert.category} />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {alert.alertId}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {alert.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {alert.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    <strong>{t('alerts.affectedArea', 'Affected Area')}:</strong> {alert.affectedArea}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t('alerts.issuedAt', 'Issued')}: {formatDate(alert.startTime)}
                  </span>
                  <span className="text-red-400 font-medium">
                    {t('alerts.expiresAt', 'Expires')}: {formatDate(alert.expiryTime)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
