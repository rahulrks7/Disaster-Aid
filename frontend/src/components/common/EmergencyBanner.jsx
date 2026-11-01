import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertService } from '../../services/alertService';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronRight, X } from 'lucide-react';

export const EmergencyBanner = () => {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const { socket } = useSocket();
  const { t } = useLanguage();

  const loadAlerts = async () => {
    try {
      const res = await alertService.getActiveAlerts();
      setActiveAlerts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNewAlert = () => {
      loadAlerts();
      setDismissed(false);
    };
    socket.on('alert:new', handleNewAlert);
    socket.on('alert:deactivated', loadAlerts);
    return () => {
      socket.off('alert:new', handleNewAlert);
      socket.off('alert:deactivated', loadAlerts);
    };
  }, [socket]);

  useEffect(() => {
    if (activeAlerts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAlerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeAlerts.length]);

  if (dismissed || activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[currentIndex] || activeAlerts[0];

  return (
    <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-700/50 text-red-100 px-4 py-2.5 shadow-lg relative z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs md:text-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="font-bold uppercase tracking-wider bg-red-800/80 px-2 py-0.5 rounded text-[10px] border border-red-600/50 flex-shrink-0">
            {t('alerts.activeBadge', 'Active Warning')}
          </span>
          <p className="font-medium truncate text-red-100">
            <strong className="font-semibold">{currentAlert.title}</strong> —{' '}
            <span className="opacity-90">{currentAlert.affectedArea}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1 font-semibold text-white bg-red-700/60 hover:bg-red-700 px-3 py-1 rounded-md border border-red-500/50 transition-colors"
          >
            {t('common.viewDetails', 'Details')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-red-300 hover:text-white p-1 rounded transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

