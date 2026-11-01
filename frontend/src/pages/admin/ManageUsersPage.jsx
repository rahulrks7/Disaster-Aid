import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/helpers';
import {
  UserCog,
  Search,
  Shield,
  HeartHandshake,
  User,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ManageUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { addToast } = useNotifications();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers({
        page,
        limit: 10,
        search,
        role: roleFilter || undefined,
      });
      setUsers(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUser(userId, { role: newRole });
      addToast('Role Updated', `User account role changed to ${newRole.toUpperCase()}.`, 'system');
      loadUsers();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to update role', 'alert');
    }
  };

  const handleStatusToggle = async (targetUser) => {
    if (targetUser._id === currentUser.id && targetUser.isActive) {
      addToast('Action Prohibited', 'You cannot deactivate your own administrative account.', 'alert');
      return;
    }

    try {
      const nextActive = !targetUser.isActive;
      await userService.updateUser(targetUser._id, { isActive: nextActive });
      addToast(
        'Status Updated',
        `User ${targetUser.name} is now ${nextActive ? 'Active' : 'Deactivated'}.`,
        'system'
      );
      loadUsers();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to update user status', 'alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <UserCog className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            User Accounts &amp; Access Control
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Oversee citizen and responder credentials, configure role access permissions, and manage account statuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Roles</option>
          <option value="citizen">Citizens</option>
          <option value="volunteer">Volunteers</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Loading user accounts..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No Users Found"
          description="No user records match your search criteria."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-mono">{u.email}</td>

                    <td className="py-3 px-4 text-slate-400">{u.phone || 'N/A'}</td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u._id === currentUser.id}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {u._id !== currentUser.id && (
                        <Button
                          variant={u.isActive ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => handleStatusToggle(u)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing page {page} of {totalPages} ({total} users)
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
