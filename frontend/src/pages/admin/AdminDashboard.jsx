import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/common/StatCard';
import { SeverityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  DisastersByCategoryChart,
  SeverityDonutChart,
  IncidentTrendsChart,
  HelpRequestsChart,
} from '../../components/charts/AnalyticsCharts';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import {
  ShieldAlert,
  LifeBuoy,
  ClipboardList,
  Users,
  Boxes,
  Building,
  Radio,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Plus,
  Flame,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [sumRes, anaRes] = await Promise.all([
          dashboardService.getAdminSummary(),
          dashboardService.getAdminAnalytics(),
        ]);
        setSummaryData(sumRes.data);
        setAnalyticsData(anaRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Connecting to Central Operations database..." />;

  const sum = summaryData?.summary;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Incident Command Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time emergency response telemetry, incident triage queues, and relief logistics overview.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/alerts">
            <Button variant="primary" size="sm" icon={Radio}>
              Publish Alert
            </Button>
          </Link>
          <Link to="/admin/disasters">
            <Button variant="outline" size="sm" icon={ShieldAlert}>
              Verification Queue ({sum?.pendingReports || 0})
            </Button>
          </Link>
          <Link to="/admin/tasks">
            <Button variant="blue" size="sm" icon={Plus}>
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* 8 Operational Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports"
          value={sum?.totalReports || 0}
          subtitle={`${sum?.pendingReports || 0} pending verification`}
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Active Incidents"
          value={sum?.verifiedActiveReports || 0}
          subtitle={`${sum?.resolvedReports || 0} marked resolved`}
          icon={Flame}
          color="amber"
        />
        <StatCard
          title="SOS Help Requests"
          value={sum?.totalHelpRequests || 0}
          subtitle={`${sum?.pendingHelpRequests || 0} triage pending`}
          icon={LifeBuoy}
          color="blue"
        />
        <StatCard
          title="Active Tasks"
          value={sum?.activeTasks || 0}
          subtitle="Field response missions"
          icon={ClipboardList}
          color="emerald"
        />
        <StatCard
          title="Registered Volunteers"
          value={sum?.totalVolunteers || 0}
          subtitle={`${sum?.availableVolunteers || 0} available for dispatch`}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Relief Inventory"
          value={sum?.totalResources || 0}
          subtitle={`${sum?.lowStockCount || 0} low stock warnings`}
          icon={Boxes}
          color={sum?.lowStockCount > 0 ? 'red' : 'blue'}
        />
        <StatCard
          title="Relief Shelters"
          value={sum?.totalShelters || 0}
          subtitle="Monitored evacuation centers"
          icon={Building}
          color="emerald"
        />
        <StatCard
          title="Active Warnings"
          value={sum?.activeAlerts || 0}
          subtitle="Live public advisories"
          icon={Radio}
          color="amber"
        />
      </div>

      {/* Low Stock Warning Banner if any */}
      {summaryData?.lowStockResources && summaryData.lowStockResources.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />
            <div className="text-xs">
              <strong>Low Inventory Threshold Warning:</strong>{' '}
              {summaryData.lowStockResources.map((r) => r.name).join(', ')} are at or below safety reorder levels!
            </div>
          </div>
          <Link to="/admin/resources">
            <Button variant="danger" size="sm">
              Restock Now
            </Button>
          </Link>
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DisastersByCategoryChart data={analyticsData?.disastersByCategory || []} />
        <SeverityDonutChart data={analyticsData?.incidentsBySeverity || []} />
        <IncidentTrendsChart data={analyticsData?.monthlyTrends || []} />
        <HelpRequestsChart data={analyticsData?.helpRequestsByType || []} />
      </div>

      {/* Pending Incident Verification Queue Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">
              Pending Citizen Verification Queue ({summaryData?.pendingQueue?.length || 0})
            </h3>
          </div>
          <Link
            to="/admin/disasters"
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            Review All Reports <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {summaryData?.pendingQueue?.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            Verification queue clear. No pending unreviewed reports.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Title &amp; Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {summaryData.pendingQueue.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {item.reportId}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{item.title}</p>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.locationName}</td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={item.severity} />
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.reporter?.name || 'Citizen'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to="/admin/disasters">
                        <Button variant="outline" size="sm">
                          Verify
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
