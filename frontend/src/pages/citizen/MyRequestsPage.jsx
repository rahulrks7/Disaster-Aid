import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { helpRequestService } from '../../services/helpRequestService';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { SeverityBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import { LifeBuoy, Plus, MapPin, Users, Phone, XCircle } from 'lucide-react';

export const MyRequestsPage = () => {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useNotifications();

  const loadRequests = async () => {
    try {
      const res = await helpRequestService.getMyRequests();
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancelRequest = async () => {
    if (!cancellingId) return;
    setActionLoading(true);
    try {
      await helpRequestService.updateRequest(cancellingId, { status: 'cancelled' });
      addToast(t('requests.cancelled', 'Request Cancelled'), 'Your emergency request has been marked as cancelled.', 'system');
      loadRequests();
      setCancellingId(null);
    } catch (err) {
      addToast(t('common.errorOccurred', 'Error'), err.response?.data?.message || 'Failed to cancel request', 'alert');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {t('citizen.myRequests.pageTitle', 'My Emergency Help Requests')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('citizen.myRequests.pageSubtitle', 'Real-time status tracking and dispatch allocation for your SOS tickets.')}
          </p>
        </div>

        <Link to="/citizen/request-help">
          <Button variant="blue" size="md" icon={Plus}>
            {t('citizen.dashboard.sosAction', 'New SOS Request')}
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text={t('common.loading', 'Fetching your emergency help requests...')} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title={t('citizen.dashboard.noRequests', 'No Emergency Requests')}
          description={t('citizen.myRequests.noRequests', 'You currently have no active emergency assistance requests.')}
          actionText={t('citizen.dashboard.sosAction', 'Request Emergency Help')}
          onAction={() => window.location.assign('/citizen/request-help')}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    {req.requestId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase">
                    {t(`requests.${req.requestType}`, req.requestType)}
                  </span>
                  <SeverityBadge severity={req.priority} />
                </div>

                <p className="text-sm font-semibold text-white">
                  {req.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {req.locationName}
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <Users className="w-3.5 h-3.5" /> {req.affectedPeople} {t('citizen.sos.peopleCount', 'people needing aid')}
                  </span>
                  {req.contactPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> {req.contactPhone}
                    </span>
                  )}
                  <span>{t('citizen.myRequests.requestedOn', 'Submitted')}: {formatDate(req.createdAt)}</span>
                </div>

                {req.assignedTask && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200">
                    <strong>{t('citizen.myRequests.assignedTask', 'Response Task Dispatched')}:</strong> {req.assignedTask.title} ({t('tasks.' + req.assignedTask.status, req.assignedTask.status)})
                  </div>
                )}
              </div>

              {/* Status & Cancel Action */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <StatusBadge status={req.status} />

                {['pending', 'accepted'].includes(req.status) && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => setCancellingId(req._id)}
                  >
                    {t('citizen.myRequests.cancelRequest', 'Cancel Request')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!cancellingId}
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancelRequest}
        title={t('citizen.myRequests.confirmCancelTitle', 'Cancel Emergency Help Request')}
        message={t('citizen.myRequests.confirmCancelMsg', 'Are you sure you want to cancel this emergency request? Response teams will be notified to stand down.')}
        confirmText={t('citizen.myRequests.cancelRequest', 'Yes, Cancel Request')}
        loading={actionLoading}
      />
    </div>
  );
};

