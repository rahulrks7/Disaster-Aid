import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { SeverityBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  CheckSquare,
  MapPin,
  Users,
  ShieldAlert,
  LifeBuoy,
  Check,
  Search,
  Eye,
} from 'lucide-react';

export const AvailableTasksPage = () => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [acceptingId, setAcceptingId] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  const { addToast } = useNotifications();

  const loadTasks = async () => {
    try {
      const res = await taskService.getAvailableTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAcceptTask = async (taskId) => {
    setAcceptingId(taskId);
    try {
      await taskService.acceptTask(taskId);
      addToast(
        t('volunteer.availableTasks.acceptSuccess', 'Task Accepted'),
        t('volunteer.availableTasks.acceptSuccess', 'You have accepted this response assignment.'),
        'task'
      );
      loadTasks();
      if (detailTask?._id === taskId) setDetailTask(null);
    } catch (err) {
      addToast(t('common.errorOccurred', 'Error'), err.response?.data?.message || 'Failed to accept task', 'alert');
    } finally {
      setAcceptingId(null);
    }
  };

  const filtered = tasks.filter((task) => {
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.locationName.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {t('volunteer.availableTasks.pageTitle', 'Open Response Tasks')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('volunteer.availableTasks.pageSubtitle', 'Browse unassigned or open emergency tasks requiring volunteer deployment.')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('volunteer.availableTasks.searchPlaceholder', 'Search tasks...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">{t('volunteer.availableTasks.filterAll', 'All Priorities')}</option>
            <option value="critical">{t('volunteer.availableTasks.filterCritical', 'Critical')}</option>
            <option value="high">{t('volunteer.availableTasks.filterHigh', 'High Priority')}</option>
            <option value="medium">{t('disasters.medium', 'Medium')}</option>
            <option value="low">{t('disasters.low', 'Low')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text={t('common.loading', 'Fetching open tasks...')} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={t('volunteer.availableTasks.noTasks', 'No Open Tasks Available')}
          description="All response assignments are currently covered by active responders. Check back shortly for new dispatches."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((task) => (
            <div
              key={task._id}
              className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      {task.taskId}
                    </span>
                    <SeverityBadge severity={task.priority} />
                  </div>
                  <StatusBadge status={task.status} />
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {task.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {task.description}
                </p>

                {/* Linked context info */}
                {task.disasterReport && (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="truncate">
                      <strong>{t('volunteer.availableTasks.disaster', 'Incident')}:</strong> {task.disasterReport.title}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  {task.locationName}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => setDetailTask(task)}
                  >
                    {t('common.viewDetails', 'Details')}
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    icon={Check}
                    loading={acceptingId === task._id}
                    onClick={() => handleAcceptTask(task._id)}
                  >
                    {t('volunteer.availableTasks.acceptBtn', 'Accept Task')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Details Modal */}
      {detailTask && (
        <Modal
          isOpen={!!detailTask}
          onClose={() => setDetailTask(null)}
          title={`${t('tasks.assigned', 'Task Assignment')} ${detailTask.taskId}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <SeverityBadge severity={detailTask.priority} />
              <StatusBadge status={detailTask.status} />
            </div>

            <div>
              <h4 className="font-bold text-base text-white">{detailTask.title}</h4>
              <p className="text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                {detailTask.description}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs text-slate-300">
              <p>📍 <strong>{t('volunteer.availableTasks.location', 'Target Location')}:</strong> {detailTask.locationName}</p>
              <p>🕒 <strong>{t('citizen.myReports.reportedOn', 'Created')}:</strong> {formatDate(detailTask.createdAt)}</p>
              {detailTask.disasterReport && (
                <p>🚨 <strong>{t('volunteer.availableTasks.disaster', 'Related Incident')}:</strong> {detailTask.disasterReport.title}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDetailTask(null)}>
                {t('common.close', 'Close')}
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={Check}
                loading={acceptingId === detailTask._id}
                onClick={() => handleAcceptTask(detailTask._id)}
              >
                {t('volunteer.availableTasks.acceptBtn', 'Accept This Assignment')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

