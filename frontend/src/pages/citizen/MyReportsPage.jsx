import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { disasterService } from '../../services/disasterService';
import { SeverityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';
import { FileText, Plus, MapPin, Users, Info, Eye } from 'lucide-react';

export const MyReportsPage = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadReports = async () => {
    try {
      const res = await disasterService.getMyReports();
      setReports(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {t('citizen.myReports.pageTitle', 'My Disaster Reports')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('citizen.myReports.pageSubtitle', 'Track real-time admin verification progress and assigned response updates.')}
          </p>
        </div>

        <Link to="/citizen/report">
          <Button variant="primary" size="md" icon={Plus}>
            {t('citizen.dashboard.reportAction', 'New Incident Report')}
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner text={t('common.loading', 'Fetching your submitted reports...')} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('citizen.dashboard.noReports', 'No Incident Reports Submitted')}
          description={t('citizen.myReports.noReports', 'You have not submitted any disaster reports yet. If you witness an incident, report it immediately.')}
          actionText={t('citizen.dashboard.reportAction', 'Submit Disaster Report')}
          onAction={() => window.location.assign('/citizen/report')}
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    {report.reportId}
                  </span>
                  <SeverityBadge severity={report.severity} />
                  <CategoryBadge category={report.category} />
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {report.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {report.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {report.locationName}
                  </span>
                  {report.affectedCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Users className="w-3.5 h-3.5" /> {report.affectedCount} {t('citizen.sos.peopleCount', 'affected')}
                    </span>
                  )}
                  <span>{t('citizen.myReports.reportedOn', 'Submitted')}: {formatDate(report.createdAt)}</span>
                </div>
              </div>

              {/* Status & View Button */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[11px] text-slate-400">{t('citizen.myReports.verification', 'Verification')}:</span>
                    <StatusBadge status={report.verificationStatus} />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[11px] text-slate-400">{t('citizen.myReports.responseStatus', 'Response')}:</span>
                    <StatusBadge status={report.responseStatus} />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => setSelectedReport(report)}
                >
                  {t('common.viewDetails', 'View Details')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`${t('disasters.verified', 'Incident Report')} ${selectedReport.reportId}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            {selectedReport.images && selectedReport.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                {selectedReport.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Disaster"
                    className="w-full h-40 object-cover rounded-lg bg-slate-800"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <SeverityBadge severity={selectedReport.severity} />
              <CategoryBadge category={selectedReport.category} />
              <StatusBadge status={selectedReport.verificationStatus} />
            </div>

            <div>
              <h4 className="font-bold text-base text-white">{selectedReport.title}</h4>
              <p className="text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                {selectedReport.description}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs text-slate-300">
              <p>📍 <strong>{t('citizen.report.locationLabel', 'Location')}:</strong> {selectedReport.locationName}</p>
              <p>👥 <strong>{t('citizen.report.affectedCount', 'Affected Count')}:</strong> {selectedReport.affectedCount}</p>
              <p>🕒 <strong>{t('citizen.myReports.reportedOn', 'Reported On')}:</strong> {formatDate(selectedReport.createdAt)}</p>
              {selectedReport.adminNotes && (
                <div className="mt-2 pt-2 border-t border-slate-700 text-amber-300">
                  <strong>{t('citizen.myReports.adminNotes', 'Admin Remarks')}:</strong> {selectedReport.adminNotes}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                {t('common.close', 'Close')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

