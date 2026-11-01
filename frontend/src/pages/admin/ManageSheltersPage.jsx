import React, { useState, useEffect } from 'react';
import { shelterService } from '../../services/shelterService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';

export const ManageSheltersPage = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: 28.6139,
    longitude: 77.209,
    totalCapacity: 100,
    currentOccupancy: 0,
    facilities: 'Food, Drinking Water, Medical, Sleeping Arrangements',
    contactPhone: '',
    contactEmail: '',
    operationalStatus: 'active',
    notes: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete modal
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { addToast } = useNotifications();

  const loadShelters = async () => {
    setLoading(true);
    try {
      const res = await shelterService.getAllShelters({
        search,
        operationalStatus: statusFilter || undefined,
      });
      setShelters(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, [statusFilter]);

  const handleOpenAdd = () => {
    setEditingShelter(null);
    setFormData({
      name: '',
      address: '',
      latitude: 28.6139,
      longitude: 77.209,
      totalCapacity: 100,
      currentOccupancy: 0,
      facilities: 'Food, Drinking Water, Medical, Sleeping Arrangements',
      contactPhone: '',
      contactEmail: '',
      operationalStatus: 'active',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (shelter) => {
    setEditingShelter(shelter);
    setFormData({
      name: shelter.name,
      address: shelter.address,
      latitude: shelter.location?.coordinates?.[1] || 28.6139,
      longitude: shelter.location?.coordinates?.[0] || 77.209,
      totalCapacity: shelter.totalCapacity,
      currentOccupancy: shelter.currentOccupancy,
      facilities: shelter.facilities ? shelter.facilities.join(', ') : '',
      contactPhone: shelter.contactPhone,
      contactEmail: shelter.contactEmail || '',
      operationalStatus: shelter.operationalStatus,
      notes: shelter.notes || '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const payload = {
        ...formData,
        totalCapacity: Number(formData.totalCapacity),
        currentOccupancy: Number(formData.currentOccupancy),
        facilities: formData.facilities.split(',').map((f) => f.trim()),
      };

      if (editingShelter) {
        await shelterService.updateShelter(editingShelter._id, payload);
        addToast('Shelter Updated', `"${formData.name}" updated successfully.`, 'system');
      } else {
        await shelterService.createShelter(payload);
        addToast('Shelter Created', `"${formData.name}" added to system.`, 'system');
      }
      setModalOpen(false);
      loadShelters();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to save shelter', 'alert');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);

    try {
      await shelterService.deleteShelter(deletingId);
      addToast('Shelter Deleted', 'Relief shelter was removed.', 'system');
      setDeletingId(null);
      loadShelters();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to delete shelter', 'alert');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Building className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Relief Shelter Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure relief centers, monitor capacity headcounts, and manage emergency facility amenities.
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Add Relief Shelter
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by shelter name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadShelters()}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Operational Statuses</option>
          <option value="active">Active Open</option>
          <option value="full">At Full Capacity</option>
          <option value="closed">Closed</option>
          <option value="maintenance">Under Maintenance</option>
        </select>
      </div>

      {/* Shelters Grid */}
      {loading ? (
        <LoadingSpinner text="Loading relief shelters..." />
      ) : shelters.length === 0 ? (
        <EmptyState
          icon={Building}
          title="No Shelters Found"
          description="Click Add Relief Shelter to configure a new evacuation center."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shelters.map((shelter) => {
            const isFull = shelter.currentOccupancy >= shelter.totalCapacity;
            const available = Math.max(0, shelter.totalCapacity - shelter.currentOccupancy);
            const percentage = Math.min(
              100,
              Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100)
            );

            return (
              <div
                key={shelter._id}
                className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isFull
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {shelter.operationalStatus.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {shelter.shelterId}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{shelter.name}</h3>

                  <p className="text-xs text-slate-300 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{shelter.address}</span>
                  </p>

                  {/* Occupancy bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">Occupancy:</span>
                      <span className="text-white font-bold">
                        {shelter.currentOccupancy} / {shelter.totalCapacity} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? 'bg-red-500'
                            : percentage > 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-400 font-bold text-right">
                      {available} beds available
                    </p>
                  </div>

                  {shelter.facilities && (
                    <p className="text-[11px] text-slate-400 pt-1">
                      <strong>Facilities:</strong> {shelter.facilities.slice(0, 3).join(', ')}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>📞 {shelter.contactPhone}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleOpenEdit(shelter)}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => setDeletingId(shelter._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingShelter ? `Edit Shelter ${editingShelter.shelterId}` : 'Add New Relief Shelter'}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Shelter Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. North District Community Shelter"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Address / Street Location *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Sector 7 Community Complex, North Avenue"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Total Capacity (Beds) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.totalCapacity}
                  onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Current Occupancy (Live) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.totalCapacity}
                  required
                  value={formData.currentOccupancy}
                  onChange={(e) => setFormData({ ...formData, currentOccupancy: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+91 98111 88899"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Operational Status
                </label>
                <select
                  value={formData.operationalStatus}
                  onChange={(e) => setFormData({ ...formData, operationalStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="active">Active Open</option>
                  <option value="full">Full Capacity</option>
                  <option value="closed">Closed</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Available Facilities (comma separated)
              </label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                placeholder="Food, Drinking Water, Medical Unit, Sleeping Cots, Generators"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={saveLoading}
              >
                {editingShelter ? 'Update Shelter' : 'Save Shelter'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Relief Shelter"
        message="Are you sure you want to permanently delete this shelter from the registry?"
        confirmText="Yes, Delete Shelter"
        loading={deleteLoading}
      />
    </div>
  );
};
