import React, { useState, useEffect } from 'react';
import { shelterService } from '../services/shelterService';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Building, MapPin, Phone, Mail, Users, CheckCircle, Search, Filter } from 'lucide-react';

export const PublicShelters = () => {
  const { t } = useLanguage();
  const [shelters, setShelters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const loadShelters = async () => {
    try {
      const res = await shelterService.getAllShelters();
      setShelters(res.data || []);
      setStats(res.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const filtered = shelters.filter((shelter) => {
    if (availableOnly && shelter.currentOccupancy >= shelter.totalCapacity) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        shelter.name.toLowerCase().includes(q) ||
        shelter.address.toLowerCase().includes(q) ||
        shelter.shelterId.toLowerCase().includes(q)
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
            <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Building className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {t('shelters.pageTitle', 'Relief Shelters & Safe Havens')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('shelters.pageSubtitle', 'Real-time occupancy tracking and facility amenities for emergency evacuation centers.')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('shelters.searchPlaceholder', 'Search shelter or city...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              availableOnly
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {t('shelters.filterOpen', 'Available Beds Only')}
          </button>
        </div>
      </div>

      {/* Aggregate Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">{t('home.statShelters', 'Total Shelters')}</p>
            <h3 className="text-2xl font-bold text-white mt-1 font-display">
              {stats.totalShelters}
            </h3>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">{t('shelters.totalCapacity', 'Total Capacity')}</p>
            <h3 className="text-2xl font-bold text-white mt-1 font-display">
              {stats.totalCapacity} {t('shelters.availableBeds', 'beds')}
            </h3>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">{t('shelters.currentOccupancy', 'Current Occupancy')}</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1 font-display">
              {stats.totalOccupancy}
            </h3>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">{t('shelters.availableBeds', 'Available Open Slots')}</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-display">
              {stats.availableSlots} {t('shelters.availableBeds', 'available')}
            </h3>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text={t('common.loading', 'Locating relief shelters...')} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building}
          title={t('shelters.noShelters', 'No Shelters Match Filters')}
          description={t('shelters.searchPlaceholder', 'Try broadening your search query or toggling available slots filter.')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((shelter) => {
            const isFull = shelter.currentOccupancy >= shelter.totalCapacity;
            const available = Math.max(0, shelter.totalCapacity - shelter.currentOccupancy);
            const percentage = Math.min(
              100,
              Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100)
            );

            return (
              <div
                key={shelter._id}
                className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isFull
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isFull ? t('shelters.statusFull', 'FULL CAPACITY') : t('shelters.statusOpen', 'OPERATIONAL')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {shelter.shelterId}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{shelter.name}</h3>

                  <p className="text-xs text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{shelter.address}</span>
                  </p>

                  {/* Occupancy progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">{t('shelters.currentOccupancy', 'Occupancy')}:</span>
                      <span className="text-white font-bold">
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
                    <p className="text-[11px] text-emerald-400 font-bold text-right">
                      {available} {t('shelters.availableBeds', 'beds available')}
                    </p>
                  </div>

                  {/* Facilities list */}
                  {shelter.facilities && shelter.facilities.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                        {t('shelters.facilitiesTitle', 'Available Facilities')}:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {shelter.facilities.map((fac, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300"
                          >
                            ✓ {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <strong>{t('shelters.contact', 'Phone')}:</strong> {shelter.contactPhone}
                    </span>
                    <a
                      href={`tel:${shelter.contactPhone}`}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold"
                    >
                      {t('hotlines.callNow', 'Call')}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
