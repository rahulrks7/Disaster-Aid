import React, { useState, useEffect } from 'react';
import { disasterService } from '../services/disasterService';
import { shelterService } from '../services/shelterService';
import { useLanguage } from '../context/LanguageContext';
import { InteractiveDisasterMap } from '../components/map/InteractiveDisasterMap';
import { SeverityBadge, StatusBadge, CategoryBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCategory, formatRelativeTime } from '../utils/helpers';
import { MapPin, Users, Layers, ShieldAlert, Building, Search } from 'lucide-react';

export const MapExplorer = () => {
  const { t } = useLanguage();
  const [disasters, setDisasters] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [disastersRes, sheltersRes] = await Promise.all([
          disasterService.getPublicMapReports(),
          shelterService.getAllShelters(),
        ]);
        setDisasters(disastersRes.data || []);
        setShelters(sheltersRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDisasters = disasters.filter((d) => {
    if (!searchQuery) return true;
    return (
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {t('home.mapSectionTitle', 'Interactive Disaster & Relief Map')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('home.mapSectionSubtitle', 'Explore verified incident reports, active emergency zones, and open relief shelters with real-time telemetry.')}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('common.search', 'Search location or disaster...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text={t('common.loading', 'Loading geographic coordinates...')} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Map */}
          <div className="lg:col-span-3">
            <InteractiveDisasterMap
              disasters={filteredDisasters}
              shelters={shelters}
              height="600px"
            />
          </div>

          {/* Incidents Sidebar List */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col h-[600px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                {t('home.statReports', 'Verified Incidents')} ({filteredDisasters.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 pr-1 space-y-1">
              {filteredDisasters.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">
                  {t('citizen.myReports.noReports', 'No matching incidents found.')}
                </p>
              ) : (
                filteredDisasters.map((incident) => (
                  <div
                    key={incident._id}
                    onClick={() => setSelectedIncident(incident)}
                    className="p-3 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <SeverityBadge severity={incident.severity} />
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatRelativeTime(incident.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {incident.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                        {incident.locationName}
                      </span>
                      <CategoryBadge category={incident.category} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Shelter Summary at bottom */}
            <div className="pt-3 border-t border-slate-800 flex-shrink-0 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                {shelters.length} {t('shelters.pageTitle', 'Shelters Monitored')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
