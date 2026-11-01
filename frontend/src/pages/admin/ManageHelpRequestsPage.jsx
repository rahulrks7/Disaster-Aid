import React, { useState, useEffect } from 'react';
import { helpRequestService } from '../../services/helpRequestService';
import { taskService } from '../../services/taskService';
import { useNotifications } from '../../context/NotificationContext';
import { SeverityBadge, StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  LifeBuoy,
  Search,
  Users,
  MapPin,
  Phone,
  ArrowRight,
  ClipboardList,
  Edit,
  Eye,
} from 'lucide-react';

export const ManageHelpRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Triage modal
  const [triagingRequest, setTriagingRequest] = useState(null);
  const [triageStatus, setTriageStatus] = useState('accepted');
  const [triagePriority, setTriagePriority] = useState('high');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Direct task dispatch modal
  const [taskModalRequest, setTaskModalRequest] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('high');
  const [dispatchLoading, setDispatchLoading] = useState(false);

  const { addToast } = useNotifications();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await helpRequestService.getAllRequests({
        page,
        limit: 10,
        search,
        requestType: typeFilter || undefined,
        priority: priorityFilter || undefined,
        status: statusFilter || undefined,
      });
      setRequests(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [page, typeFilter, priorityFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadRequests();
  };

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!triagingRequest) return;
    setActionLoading(true);

    try {
      await helpRequestService.updateRequestStatus(triagingRequest._id, {
        status: triageStatus,
        priority: triagePriority,
        adminNotes,
      });
      addToast(
        'Request Triaged',
        `Help Request #${triagingRequest.requestId} updated to ${triageStatus.toUpperCase()}.`,
        'system'
      );
      setTriagingRequest(null);
      loadRequests();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to update request', 'alert');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTaskFromRequest = async (e) => {
    e.preventDefault();
    if (!taskModalRequest) return;
    setDispatchLoading(true);

    try {
      await taskService.createTask({
        title: taskTitle,
        description: taskDescription,
        helpRequest: taskModalRequest._id,
        priority: taskPriority,
        locationName: taskModalRequest.locationName,
        latitude: taskModalRequest.location?.coordinates?.[1] || 28.6139,
        longitude: taskModalRequest.location?.coordinates?.[0] || 77.209,
      });

      addToast('Task Dispatched', 'Response task created and attached to help request.', 'task');
      setTaskModalRequest(null);
      loadRequests();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to spawn task', 'alert');
    } finally {
      setDispatchLoading(false);
    }
  };

  const openTaskModal = (req) => {
    setTaskModalRequest(req);
    setTaskTitle(`Urgent ${req.requestType.toUpperCase()} Mission for ${req.affectedPeople} affected`);
    setTaskDescription(
      `Deliver ${req.requestType} aid to ${req.locationName}. Special instructions: ${req.description}`
    );
    setTaskPriority(req.priority);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <LifeBuoy className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Emergency Help Requests &amp; Triage
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review incoming citizen SOS requests, assign urgency priorities, and deploy volunteer response missions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Request ID, location, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Request Types</option>
            <option value="rescue">Rescue Evacuation</option>
            <option value="medical">Medical Assistance</option>
            <option value="food">Food Rations</option>
            <option value="water">Drinking Water</option>
            <option value="shelter">Shelter</option>
            <option value="medicine">Medicine</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingSpinner text="Loading help requests queue..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No Help Requests Found"
          description="There are currently no matching emergency assistance requests."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description &amp; Location</th>
                  <th className="py-3 px-4">Affected</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {req.requestId}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold uppercase">
                        {req.requestType}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-white line-clamp-1">{req.description}</p>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                        {req.locationName}
                      </p>
                    </td>

                    <td className="py-3 px-4 font-bold text-white">
                      {req.affectedPeople}
                    </td>

                    <td className="py-3 px-4">
                      <SeverityBadge severity={req.priority} />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      <p className="text-white font-medium">{req.requester?.name || 'Citizen'}</p>
                      <p className="text-[10px] text-slate-400">{req.contactPhone || req.requester?.phone}</p>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => {
                          setTriagingRequest(req);
                          setTriageStatus(req.status);
                          setTriagePriority(req.priority);
                          setAdminNotes(req.adminNotes || '');
                        }}
                      >
                        Triage
                      </Button>

                      {!req.assignedTask && req.status !== 'fulfilled' && req.status !== 'cancelled' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ClipboardList}
                          onClick={() => openTaskModal(req)}
                        >
                          Dispatch Task
                        </Button>
                      )}
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
                Showing page {page} of {totalPages} ({total} requests)
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

      {/* Triage Modal */}
      {triagingRequest && (
        <Modal
          isOpen={!!triagingRequest}
          onClose={() => setTriagingRequest(null)}
          title={`Triage SOS Request ${triagingRequest.requestId}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleTriageSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
              <p>👤 <strong>Requester:</strong> {triagingRequest.requester?.name} ({triagingRequest.contactPhone})</p>
              <p>📍 <strong>Location:</strong> {triagingRequest.locationName}</p>
              <p>👥 <strong>Affected:</strong> {triagingRequest.affectedPeople} individuals</p>
              <p>📝 <strong>Details:</strong> {triagingRequest.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Update Status
                </label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="fulfilled">Fulfilled / Resolved</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Urgency Priority
                </label>
                <select
                  value={triagePriority}
                  onChange={(e) => setTriagePriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Remarks, triage priority rationale, or assigned unit notes..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTriagingRequest(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="blue"
                size="sm"
                loading={actionLoading}
              >
                Save Triage Updates
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Dispatch Response Task Modal */}
      {taskModalRequest && (
        <Modal
          isOpen={!!taskModalRequest}
          onClose={() => setTaskModalRequest(null)}
          title="Create & Dispatch Response Task"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateTaskFromRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Mission Description &amp; Directives *
              </label>
              <textarea
                required
                rows={3}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Task Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTaskModalRequest(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={dispatchLoading}
              >
                Create &amp; Publish Task
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
