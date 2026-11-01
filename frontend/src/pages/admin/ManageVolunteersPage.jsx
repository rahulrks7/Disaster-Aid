import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Award,
  Filter,
} from 'lucide-react';

export const ManageVolunteersPage = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  const { addToast } = useNotifications();

  const loadVolunteers = async () => {
    setLoading(true);
    try {
      const res = await volunteerService.getAllVolunteers({
        page,
        limit: 10,
        search,
        availability: availabilityFilter || undefined,
        status: statusFilter || undefined,
        skill: skillFilter || undefined,
      });
      setVolunteers(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers();
  }, [page, availabilityFilter, statusFilter, skillFilter]);

  const handleToggleStatus = async (vol) => {
    const nextStatus = vol.status === 'active' ? 'inactive' : 'active';
    try {
      await volunteerService.updateVolunteerStatus(vol._id, nextStatus);
      addToast('Status Updated', `Volunteer set to ${nextStatus}.`, 'system');
      loadVolunteers();
    } catch (err) {
      addToast('Error', 'Failed to toggle status', 'alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Users className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Volunteer Force Management
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review responder credentials, monitor field availability, and manage volunteer eligibility.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, skills, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadVolunteers()}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
        >
          <option value="">All Availability</option>
          <option value="available">🟢 Available for Duty</option>
          <option value="unavailable">🔴 Off-Duty</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
        >
          <option value="">All Account Status</option>
          <option value="active">Active Eligible</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Volunteers Table */}
      {loading ? (
        <LoadingSpinner text="Loading volunteer roster..." />
      ) : volunteers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Volunteers Found"
          description="No volunteer records match the active filter criteria."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Volunteer</th>
                  <th className="py-3 px-4">Skills &amp; Capabilities</th>
                  <th className="py-3 px-4">Service Area</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {volunteers.map((vol) => (
                  <tr key={vol._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{vol.user?.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{vol.user?.email}</p>
                      <p className="text-[10px] text-slate-400">{vol.user?.phone || vol.emergencyContact}</p>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {vol.skills?.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {vol.generalLocation}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-white">
                        {vol.experienceYears} yrs
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] border ${
                          vol.availability === 'available'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            vol.availability === 'available' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        {vol.availability?.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          vol.status === 'active'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {vol.status?.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant={vol.status === 'active' ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => handleToggleStatus(vol)}
                      >
                        {vol.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing page {page} of {totalPages} ({total} volunteers)
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
    </div>
  );
};
