import React, { useState, useEffect } from 'react';
import { disasterService } from '../../services/disasterService';
import { useNotifications } from '../../context/NotificationContext';
import { SeverityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const ManageDisastersPage = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [responseFilter, setResponseFilter] = useState('');

  // Modal actions
  const [selectedReport, setSelectedReport] = useState(null);
  const [verifyingReport, setVerifyingReport] = useState(null);
  const [verificationDecision, setVerificationDecision] = useState('verified');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useNotifications();

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await disasterService.getAllReports({
        page,
        limit: 10,
        search,
        category: categoryFilter || undefined,
        severity: severityFilter || undefined,
        verificationStatus: verificationFilter || undefined,
        responseStatus: responseFilter || undefined,
      });
      setReports(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [page, categoryFilter, severityFilter, verificationFilter, responseFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadReports();
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyingReport) return;
    setActionLoading(true);

    try {
      await disasterService.verifyReport(verifyingReport._id, {
        verificationStatus: verificationDecision,
        adminNotes,
      });
      addToast(
        'Report Updated',
        `Report #${verifyingReport.reportId} marked as ${verificationDecision.toUpperCase()}.`,
        'system'
      );
      setVerifyingReport(null);
      setAdminNotes('');
      loadReports();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to update verification', 'alert');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResponseStatusChange = async (reportId, newStatus) => {
    try {
      await disasterService.updateReportStatus(reportId, { responseStatus: newStatus });
      addToast('Status Updated', `Incident status changed to ${newStatus}.`, 'system');
      loadReports();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to update response status', 'alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Disaster Incident Reports Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review citizen reports, authenticate incident severity, and manage live response lifecycles.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, location, or Report ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="">All Verification Status</option>
            <option value="pending">⏳ Pending Review</option>
            <option value="verified">✓ Verified Only</option>
            <option value="rejected">✕ Rejected Only</option>
          </select>

          <select
            value={responseFilter}
            onChange={(e) => {
              setResponseFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="">All Response Status</option>
            <option value="reported">Reported</option>
            <option value="response_in_progress">Response in Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Reports Table */}
      {loading ? (
        <LoadingSpinner text="Loading incident reports..." />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Incident Reports Found"
          description="No reports match your selected search criteria."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Title &amp; Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Response Status</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {report.reportId}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-white line-clamp-1">{report.title}</p>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {report.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {report.locationName}
                    </td>

                    <td className="py-3 px-4">
                      <SeverityBadge severity={report.severity} />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={report.verificationStatus} />
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={report.responseStatus}
                        onChange={(e) => handleResponseStatusChange(report._id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-red-500"
                      >
                        <option value="reported">Reported</option>
                        <option value="response_in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      <p className="text-white font-medium">{report.reporter?.name || 'Citizen'}</p>
                      <p className="text-[10px] text-slate-400">{report.reporter?.phone || report.reporter?.email}</p>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedReport(report)}
                      >
                        Inspect
                      </Button>

                      {report.verificationStatus === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setVerifyingReport(report);
                            setVerificationDecision('verified');
                            setAdminNotes(report.adminNotes || '');
                          }}
                        >
                          Verify / Reject
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing page {page} of {totalPages} ({total} reports)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inspect Report Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Incident Report ${selectedReport.reportId}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            {selectedReport.images && selectedReport.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                {selectedReport.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Disaster Incident"
                    className="w-full h-40 object-cover rounded-lg bg-slate-800"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <SeverityBadge severity={selectedReport.severity} />
              <CategoryBadge category={selectedReport.category} />
              <StatusBadge status={selectedReport.verificationStatus} />
              <StatusBadge status={selectedReport.responseStatus} />
            </div>

            <div>
              <h4 className="font-bold text-base text-white">{selectedReport.title}</h4>
              <p className="text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                {selectedReport.description}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs text-slate-300">
              <p>📍 <strong>Location:</strong> {selectedReport.locationName}</p>
              <p>👥 <strong>Estimated Affected:</strong> {selectedReport.affectedCount} individuals</p>
              <p>👤 <strong>Reporter:</strong> {selectedReport.reporter?.name} ({selectedReport.reporter?.email})</p>
              <p>🕒 <strong>Reported On:</strong> {formatDate(selectedReport.createdAt)}</p>
              {selectedReport.adminNotes && (
                <p className="mt-2 pt-2 border-t border-slate-700 text-amber-300">
                  <strong>Admin Remarks:</strong> {selectedReport.adminNotes}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {selectedReport.verificationStatus === 'pending' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setVerifyingReport(selectedReport);
                    setSelectedReport(null);
                    setVerificationDecision('verified');
                    setAdminNotes(selectedReport.adminNotes || '');
                  }}
                >
                  Verify or Reject Report
                </Button>
              ) : (
                <div />
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Verify / Reject Modal */}
      {verifyingReport && (
        <Modal
          isOpen={!!verifyingReport}
          onClose={() => setVerifyingReport(null)}
          title={`Verify Incident ${verifyingReport.reportId}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <p className="text-xs text-slate-300">
              Verified reports will immediately become visible on the public disaster telemetry map and allow response task dispatching.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Verification Decision *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVerificationDecision('verified')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    verificationDecision === 'verified'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify &amp; Publish on Map
                </button>

                <button
                  type="button"
                  onClick={() => setVerificationDecision('rejected')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    verificationDecision === 'rejected'
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Reject Incident
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Administrative Notes &amp; Action Directives
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Field teams deployed with water rescue units. Validated via civic hotline."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVerifyingReport(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={verificationDecision === 'verified' ? 'success' : 'danger'}
                size="sm"
                loading={actionLoading}
              >
                Confirm {verificationDecision.toUpperCase()}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
