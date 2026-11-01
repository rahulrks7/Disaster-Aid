import React, { useState, useEffect } from 'react';
import { alertService } from '../../services/alertService';
import { useNotifications } from '../../context/NotificationContext';
import { SeverityBadge, CategoryBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import {
  Radio,
  Plus,
  Trash2,
  PowerOff,
  AlertTriangle,
  Clock,
  MapPin,
  Search,
} from 'lucide-react';

export const ManageAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create alert modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    category: 'flood',
    severity: 'high',
    affectedArea: '',
    durationHours: 24,
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Delete modal
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { addToast } = useNotifications();

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertService.getAllAlerts({ search });
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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const expiry = new Date(Date.now() + Number(newAlert.durationHours) * 3600 * 1000);
      await alertService.createAlert({
        title: newAlert.title,
        description: newAlert.description,
        category: newAlert.category,
        severity: newAlert.severity,
        affectedArea: newAlert.affectedArea,
        startTime: new Date(),
        expiryTime: expiry,
      });

      addToast('Alert Published', `Broadcasted alert "${newAlert.title}" in real time.`, 'system');
      setCreateModalOpen(false);
      setNewAlert({
        title: '',
        description: '',
        category: 'flood',
        severity: 'high',
        affectedArea: '',
        durationHours: 24,
      });
      loadAlerts();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to publish alert', 'alert');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeactivate = async (alertId) => {
    try {
      await alertService.deactivateAlert(alertId);
      addToast('Alert Deactivated', 'Emergency alert was marked inactive.', 'system');
      loadAlerts();
    } catch (err) {
      addToast('Error', 'Failed to deactivate alert', 'alert');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);

    try {
      await alertService.deleteAlert(deletingId);
      addToast('Alert Deleted', 'Emergency alert removed.', 'system');
      setDeletingId(null);
      loadAlerts();
    } catch (err) {
      addToast('Error', 'Failed to delete alert', 'alert');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Emergency Alerts &amp; Broadcasts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Issue regional warnings, broadcast severe hazard advisories, and manage active expiry schedules.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
        >
          Publish New Warning
        </Button>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <LoadingSpinner text="Loading broadcast alerts..." />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No Alerts Found"
          description="There are currently no active or historical emergency warnings in the system."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map((alert) => {
            const isExpired = new Date(alert.expiryTime) < new Date();
            const isLive = alert.isActive && !isExpired;

            return (
              <div
                key={alert._id}
                className={`glass-card p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isLive
                    ? 'border-red-500/40 bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 shadow-xl'
                    : 'border-slate-800 opacity-70 bg-slate-900/60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={alert.severity} />
                      <CategoryBadge category={alert.category} />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isLive
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isLive ? '🔴 LIVE BROADCAST' : 'INACTIVE / EXPIRED'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="text-xs text-slate-300 pt-1 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <strong>Area:</strong> {alert.affectedArea}
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Published: {formatDate(alert.startTime)} | Expires: {formatDate(alert.expiryTime)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {alert.alertId}
                  </span>

                  <div className="flex items-center gap-2">
                    {alert.isActive && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={PowerOff}
                        onClick={() => handleDeactivate(alert._id)}
                      >
                        Deactivate
                      </Button>
                    )}
                    <button
                      onClick={() => setDeletingId(alert._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Alert Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Broadcast New Emergency Alert"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Alert Headline / Warning Title *
              </label>
              <input
                type="text"
                required
                value={newAlert.title}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                placeholder="e.g. FLASH FLOOD EMERGENCY: Low-Lying Sector Inundation Warning"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Hazard Category *
                </label>
                <select
                  value={newAlert.category}
                  onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="flood">Flood</option>
                  <option value="fire">Fire</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="cyclone">Cyclone</option>
                  <option value="landslide">Landslide</option>
                  <option value="weather_warning">Severe Weather Warning</option>
                  <option value="general_emergency">General Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Severity Warning Level *
                </label>
                <select
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-bold"
                >
                  <option value="critical">Critical Warning</option>
                  <option value="high">High Severity</option>
                  <option value="medium">Medium Advisory</option>
                  <option value="low">Low Watch</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Affected Zone / Region *
                </label>
                <input
                  type="text"
                  required
                  value={newAlert.affectedArea}
                  onChange={(e) => setNewAlert({ ...newAlert, affectedArea: e.target.value })}
                  placeholder="e.g. North District Sectors 1-6"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Broadcast Duration (Hours) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  required
                  value={newAlert.durationHours}
                  onChange={(e) => setNewAlert({ ...newAlert, durationHours: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Detailed Emergency Instructions &amp; Safety Advisories *
              </label>
              <textarea
                required
                rows={3}
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                placeholder="Evacuation advice, safe shelter locations, helpline contact numbers..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={createLoading}
                icon={Radio}
              >
                Broadcast Alert
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Emergency Alert"
        message="Are you sure you want to permanently delete this alert broadcast?"
        confirmText="Yes, Delete Alert"
        loading={deleteLoading}
      />
    </div>
  );
};
