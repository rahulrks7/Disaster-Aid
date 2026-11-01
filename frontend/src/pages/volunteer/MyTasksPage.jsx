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
  ClipboardList,
  MapPin,
  Users,
  CheckCircle2,
  Play,
  Check,
  Phone,
  FileCheck,
  Clock,
  CheckCheck,
} from 'lucide-react';

export const MyTasksPage = () => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active'); // active vs completed vs all
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Completion modal state
  const [completingTask, setCompletingTask] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);

  const { addToast } = useNotifications();

  const loadTasks = async () => {
    try {
      const res = await taskService.getMyTasks();
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

  const handleUpdateStatus = async (taskId, newStatus, note = '') => {
    setUpdatingTaskId(taskId);
    try {
      await taskService.updateTaskStatus(taskId, { status: newStatus, note });
      addToast('Status Updated', `Task status updated to ${newStatus.toUpperCase()}`, 'task');
      loadTasks();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to update status', 'alert');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingTask) return;
    setCompleteLoading(true);

    try {
      await taskService.updateTaskStatus(completingTask._id, {
        status: 'completed',
        completionNotes,
      });
      addToast('Mission Completed!', 'Task completion notes submitted. Great work!', 'task');
      setCompletingTask(null);
      setCompletionNotes('');
      loadTasks();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to complete task', 'alert');
    } finally {
      setCompleteLoading(false);
    }
  };

  const filtered = tasks.filter((t) => {
    if (statusFilter === 'active') return ['assigned', 'accepted', 'in_progress'].includes(t.status);
    if (statusFilter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              {t('volunteer.myTasks.pageTitle', 'My Assigned Tasks & Missions')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('volunteer.myTasks.pageSubtitle', 'Update operational progress milestones and record task completion notes.')}
          </p>
        </div>

        {/* Tab filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('volunteer.myTasks.tabInProgress', 'Active Missions')}
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('volunteer.myTasks.tabCompleted', 'Completed History')}
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('volunteer.myTasks.tabAll', 'All Tasks')}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text={t('common.loading', 'Fetching your assigned tasks...')} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={statusFilter === 'completed' ? t('volunteer.myTasks.noTasks', 'No Completed Tasks Yet') : t('volunteer.dashboard.noActive', 'No Active Tasks Assigned')}
          description={t('volunteer.availableTasks.pageSubtitle', 'Browse the Available Tasks tab to claim open relief response missions.')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => (
            <div
              key={task._id}
              className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    {task.taskId}
                  </span>
                  <SeverityBadge severity={task.priority} />
                  <StatusBadge status={task.status} />
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {task.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {task.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {task.locationName}
                  </span>
                  {task.helpRequest?.contactPhone && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Phone className="w-3.5 h-3.5" /> Victim: {task.helpRequest.contactPhone}
                    </span>
                  )}
                  <span>{t('disasters.reported', 'Assigned')}: {formatDate(task.createdAt)}</span>
                </div>

                {task.completionNotes && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
                    <strong>{t('citizen.myReports.adminNotes', 'Completion Remarks')}:</strong> {task.completionNotes}
                  </div>
                )}
              </div>

              {/* Action Transitions */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                {task.status === 'assigned' && (
                  <Button
                    variant="blue"
                    size="sm"
                    icon={Check}
                    loading={updatingTaskId === task._id}
                    onClick={() => handleUpdateStatus(task._id, 'accepted', 'Accepted by volunteer')}
                  >
                    {t('volunteer.availableTasks.acceptBtn', 'Accept Assignment')}
                  </Button>
                )}

                {task.status === 'accepted' && (
                  <Button
                    variant="amber"
                    size="sm"
                    icon={Play}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold"
                    loading={updatingTaskId === task._id}
                    onClick={() => handleUpdateStatus(task._id, 'in_progress', 'Field operation initiated')}
                  >
                    {t('volunteer.myTasks.startMission', 'Start Operation')}
                  </Button>
                )}

                {task.status === 'in_progress' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCheck}
                    onClick={() => {
                      setCompletingTask(task);
                      setCompletionNotes('');
                    }}
                  >
                    {t('volunteer.myTasks.completeMission', 'Mark Mission Completed')}
                  </Button>
                )}

                {task.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> {t('requests.fulfilled', 'Fulfilled')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion Modal */}
      {completingTask && (
        <Modal
          isOpen={!!completingTask}
          onClose={() => setCompletingTask(null)}
          title={`${t('volunteer.myTasks.completionModalTitle', 'Complete Response Task')} ${completingTask.taskId}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCompleteSubmit} className="space-y-4">
            <p className="text-xs text-slate-300">
              {t('volunteer.myTasks.completionModalSubtitle', 'Please provide detailed notes on the actions taken to conclude this mission.')}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                {t('volunteer.myTasks.completionNotesLabel', 'Completion Notes & Outcome Report *')}
              </label>
              <textarea
                required
                rows={4}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder={t('volunteer.myTasks.completionNotesPlaceholder', 'Describe actions taken, relief materials distributed, and victim status...')}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCompletingTask(null)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                variant="success"
                size="sm"
                loading={completeLoading}
                icon={CheckCheck}
              >
                {t('volunteer.myTasks.submitCompletion', 'Submit & Mark Completed')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
