import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { volunteerService } from '../../services/volunteerService';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { SeverityBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/helpers';
import {
  HeartHandshake,
  CheckSquare,
  ClipboardList,
  CheckCircle2,
  Radio,
  ArrowRight,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Award,
} from 'lucide-react';

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState('available');
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const loadDashboard = async () => {
    try {
      const res = await dashboardService.getVolunteerSummary();
      setData(res.data);
      if (res.data?.profile?.availability) {
        setAvailability(res.data.profile.availability);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleToggleAvailability = async () => {
    const nextStatus = availability === 'available' ? 'unavailable' : 'available';
    setUpdatingAvailability(true);
    try {
      await volunteerService.updateMyProfile({ availability: nextStatus });
      setAvailability(nextStatus);
      addToast(
        t('volunteer.dashboard.readinessStatus', 'Availability Updated'),
        `Your status is now ${nextStatus === 'available' ? t('volunteer.dashboard.statusAvailable', 'Available for Dispatch') : t('volunteer.dashboard.statusUnavailable', 'Off-Duty')}.`,
        'system'
      );
    } catch (err) {
      addToast('Error', 'Failed to update availability', 'alert');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  if (loading) return <LoadingSpinner text={t('common.loading', 'Loading volunteer command console...')} />;

  const isAvailable = availability === 'available';

  return (
    <div className="space-y-8">
      {/* Volunteer Operational Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isAvailable
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              {isAvailable ? t('volunteer.dashboard.statusAvailable', 'ACTIVE ON-CALL VOLUNTEER') : t('volunteer.dashboard.statusUnavailable', 'OFF-DUTY / UNAVAILABLE')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {t('volunteer.dashboard.title', 'Responder Console')}: {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            {t('volunteer.dashboard.subtitle', 'Discover active response tasks, coordinate with dispatchers, and record rescue milestones.')}
          </p>
        </div>

        {/* Availability Toggle Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={handleToggleAvailability}
            disabled={updatingAvailability}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
            }`}
          >
            {isAvailable ? <ToggleRight className="w-5 h-5 text-white" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
            <span>{isAvailable ? t('volunteer.dashboard.statusAvailable', 'Available for Dispatch') : t('volunteer.dashboard.toggleToAvailable', 'Mark Available')}</span>
          </button>

          <Link to="/volunteer/available-tasks">
            <Button variant="outline" size="md" icon={CheckSquare}>
              {t('volunteer.dashboard.availableMissionsTitle', 'Browse Open Tasks')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          title={t('volunteer.dashboard.statAvailableTasks', 'Open Available Tasks')}
          value={data?.availableTasksCount || 0}
          subtitle={t('volunteer.dashboard.availableMissionsSubtitle', 'Tasks needing volunteers')}
          icon={CheckSquare}
          color="amber"
        />
        <StatCard
          title={t('volunteer.dashboard.statAssignedTasks', 'Assigned to Me')}
          value={data?.myAssignedCount || 0}
          subtitle={t('volunteer.dashboard.myActiveTasksSubtitle', 'Tasks waiting acceptance')}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title={t('volunteer.dashboard.statInProgress', 'Tasks in Progress')}
          value={data?.inProgressCount || 0}
          subtitle={t('tasks.in_progress', 'Currently active response')}
          icon={HeartHandshake}
          color="emerald"
        />
        <StatCard
          title={t('volunteer.dashboard.statCompleted', 'Completed Operations')}
          value={data?.completedCount || data?.profile?.completedTasksCount || 0}
          subtitle={t('tasks.completed', 'Lifetime fulfilled missions')}
          icon={Award}
          color="purple"
        />
      </div>

      {/* 2-Column Section: My Active Tasks & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Response Tasks */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              {t('volunteer.dashboard.myActiveTasksTitle', 'My Current Response Assignments')}
            </h3>
            <Link
              to="/volunteer/my-tasks"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              {t('volunteer.dashboard.viewMyTasks', 'Manage Tasks')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data?.myCurrentTasks?.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-slate-400">
                {t('volunteer.dashboard.noActive', 'You currently have no active assigned tasks in progress.')}
              </p>
              <Link to="/volunteer/available-tasks">
                <Button variant="outline" size="sm">
                  {t('volunteer.dashboard.viewAllTasks', 'View Available Open Tasks')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.myCurrentTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">
                      {task.taskId}
                    </span>
                    <SeverityBadge severity={task.priority} />
                  </div>

                  <h4 className="text-sm font-bold text-white">{task.title}</h4>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {task.locationName}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Alerts Stream */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              {t('nav.alerts', 'Regional Alerts')}
            </h3>
            <Link to="/alerts" className="text-xs text-red-400 hover:text-red-300">
              {t('citizen.dashboard.viewAll', 'View All')}
            </Link>
          </div>

          <div className="space-y-3">
            {data?.activeAlerts?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                {t('alerts.noAlerts', 'No active disaster warnings.')}
              </p>
            ) : (
              data.activeAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {alert.affectedArea}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white line-clamp-1">{alert.title}</h5>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{alert.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

