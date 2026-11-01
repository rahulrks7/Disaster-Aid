import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import { volunteerService } from '../../services/volunteerService';
import { disasterService } from '../../services/disasterService';
import { useNotifications } from '../../context/NotificationContext';
import { SeverityBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  ClipboardList,
  Plus,
  Users,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  History,
  UserPlus,
} from 'lucide-react';

export const ManageTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Create Task Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    disasterReport: '',
    assignedVolunteers: [],
    priority: 'medium',
    locationName: '',
    latitude: 28.6139,
    longitude: 77.209,
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Assign Volunteers Modal
  const [assigningTask, setAssigningTask] = useState(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  // History timeline modal
  const [historyTask, setHistoryTask] = useState(null);

  const { addToast } = useNotifications();

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await taskService.getAllTasks({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setTasks(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [volRes, disRes] = await Promise.all([
        volunteerService.getAllVolunteers({ limit: 50 }),
        disasterService.getAllReports({ limit: 50 }),
      ]);
      setVolunteers(volRes.data || []);
      setDisasters(disRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [page, statusFilter, priorityFilter]);

  useEffect(() => {
    loadDependencies();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await taskService.createTask(newTaskData);
      addToast('Task Created', 'Response task created and assigned volunteers notified.', 'task');
      setCreateModalOpen(false);
      setNewTaskData({
        title: '',
        description: '',
        disasterReport: '',
        assignedVolunteers: [],
        priority: 'medium',
        locationName: '',
        latitude: 28.6139,
        longitude: 77.209,
      });
      loadTasks();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to create task', 'alert');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningTask) return;
    setAssignLoading(true);

    try {
      await taskService.assignVolunteers(assigningTask._id, selectedVolunteers);
      addToast('Volunteers Assigned', 'Task assignment updated.', 'task');
      setAssigningTask(null);
      loadTasks();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to assign volunteers', 'alert');
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleVolunteerSelection = (volId) => {
    if (selectedVolunteers.includes(volId)) {
      setSelectedVolunteers(selectedVolunteers.filter((id) => id !== volId));
    } else {
      setSelectedVolunteers([...selectedVolunteers, volId]);
    }
  };

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
              Response Tasks &amp; Volunteer Coordination
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dispatch response missions, match skilled volunteers, and oversee live mission status.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
        >
          Create New Task
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search task title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadTasks()}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="open">Open (Unassigned)</option>
          <option value="assigned">Assigned</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Task List Table */}
      {loading ? (
        <LoadingSpinner text="Loading response tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Response Tasks Found"
          description="Create a new emergency task or change search filter options."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Task ID</th>
                  <th className="py-3 px-4">Title &amp; Mission</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Volunteers</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {task.taskId}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-white line-clamp-1">{task.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{task.description}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-300">{task.locationName}</td>

                    <td className="py-3 px-4">
                      <SeverityBadge severity={task.priority} />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="py-3 px-4">
                      {task.assignedVolunteers?.length === 0 ? (
                        <span className="text-[11px] text-amber-400 font-medium">Unassigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {task.assignedVolunteers.map((v) => (
                            <span
                              key={v._id}
                              className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]"
                            >
                              {v.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={UserPlus}
                        onClick={() => {
                          setAssigningTask(task);
                          setSelectedVolunteers(
                            task.assignedVolunteers ? task.assignedVolunteers.map((v) => v._id) : []
                          );
                        }}
                      >
                        Assign
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={History}
                        onClick={() => setHistoryTask(task)}
                      >
                        Audit Trail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing page {page} of {totalPages} ({total} tasks)
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

      {/* Create Task Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Response Task"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                placeholder="e.g. Deploy boat rescue team for flooded sector"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Link Related Incident Report (Optional)
                </label>
                <select
                  value={newTaskData.disasterReport}
                  onChange={(e) => setNewTaskData({ ...newTaskData, disasterReport: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">None / Independent Task</option>
                  {disasters.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.reportId} — {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Urgency Priority
                </label>
                <select
                  value={newTaskData.priority}
                  onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Deployment Location / Address *
              </label>
              <input
                type="text"
                required
                value={newTaskData.locationName}
                onChange={(e) => setNewTaskData({ ...newTaskData, locationName: e.target.value })}
                placeholder="e.g. River Road, Green Valley Sector 4"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Operational Directives &amp; Mission Details *
              </label>
              <textarea
                required
                rows={3}
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                placeholder="Explain the objectives, required equipment, safety guidelines..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
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
              >
                Dispatch Task
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Volunteers Modal */}
      {assigningTask && (
        <Modal
          isOpen={!!assigningTask}
          onClose={() => setAssigningTask(null)}
          title={`Assign Volunteers to Task ${assigningTask.taskId}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <p className="text-xs text-slate-300">
              Select available volunteer responders matching required skills. Selected volunteers will receive instant alerts.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-800/80 pr-1">
              {volunteers.map((vol) => {
                const volUserId = vol.user?._id;
                const isSelected = selectedVolunteers.includes(volUserId);
                const isAvailable = vol.availability === 'available';

                return (
                  <div
                    key={vol._id}
                    onClick={() => toggleVolunteerSelection(volUserId)}
                    className={`p-3 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/60 border border-emerald-500/50 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{vol.user?.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            isAvailable
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {vol.availability}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Skills: {vol.skills?.slice(0, 3).join(', ')} | Area: {vol.generalLocation}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAssigningTask(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="sm"
                loading={assignLoading}
              >
                Update Assignments ({selectedVolunteers.length})
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Task Audit Trail Modal */}
      {historyTask && (
        <Modal
          isOpen={!!historyTask}
          onClose={() => setHistoryTask(null)}
          title={`Status Audit Trail for Task ${historyTask.taskId}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-sm text-white">{historyTask.title}</h4>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {historyTask.statusHistory?.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white uppercase">{step.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(step.timestamp)}
                      </span>
                    </div>
                    {step.note && <p className="text-slate-300 text-[11px]">{step.note}</p>}
                    {step.changedBy && (
                      <p className="text-[10px] text-slate-400">By: {step.changedBy.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setHistoryTask(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
