import React, { useState, useEffect } from 'react';
import { resourceService } from '../../services/resourceService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatCategory, formatDate } from '../../utils/helpers';
import {
  Boxes,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  History,
  AlertTriangle,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const ManageResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Add Resource modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    category: 'food_packages',
    availableQuantity: 100,
    unit: 'packs',
    storageLocation: 'Central Warehouse Depot Alpha',
    minStockLevel: 25,
  });
  const [addLoading, setAddLoading] = useState(false);

  // Transaction modal
  const [transactingResource, setTransactingResource] = useState(null);
  const [transType, setTransType] = useState('distribution'); // addition vs distribution
  const [transQuantity, setTransQuantity] = useState(10);
  const [transReason, setTransReason] = useState('');
  const [transDestination, setTransDestination] = useState('');
  const [transLoading, setTransLoading] = useState(false);

  // Transaction history modal
  const [historyResource, setHistoryResource] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { addToast } = useNotifications();

  const categories = [
    { value: 'food_packages', label: 'Food Packages' },
    { value: 'drinking_water', label: 'Drinking Water' },
    { value: 'medical_supplies', label: 'Medical Supplies' },
    { value: 'blankets', label: 'Blankets' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'rescue_equipment', label: 'Rescue Equipment' },
    { value: 'other', label: 'Other Relief Material' },
  ];

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await resourceService.getAllResources({
        search,
        category: categoryFilter || undefined,
        lowStockOnly: lowStockOnly ? 'true' : undefined,
      });
      setResources(res.data || []);
      setTotal(res.total || 0);
      setLowStockCount(res.lowStockCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [categoryFilter, lowStockOnly]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);

    try {
      await resourceService.createResource(newResource);
      addToast('Resource Added', `Relief resource "${newResource.name}" created.`, 'system');
      setAddModalOpen(false);
      setNewResource({
        name: '',
        category: 'food_packages',
        availableQuantity: 100,
        unit: 'packs',
        storageLocation: 'Central Warehouse Depot Alpha',
        minStockLevel: 25,
      });
      loadResources();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to create resource', 'alert');
    } finally {
      setAddLoading(false);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!transactingResource) return;
    setTransLoading(true);

    try {
      await resourceService.recordTransaction(transactingResource._id, {
        transactionType: transType,
        quantity: transQuantity,
        reason: transReason,
        destination: transDestination,
      });

      addToast(
        'Transaction Recorded',
        `Recorded ${transType} of ${transQuantity} ${transactingResource.unit}.`,
        'system'
      );
      setTransactingResource(null);
      setTransReason('');
      setTransDestination('');
      loadResources();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Transaction failed', 'alert');
    } finally {
      setTransLoading(false);
    }
  };

  const viewHistory = async (resource) => {
    setHistoryResource(resource);
    setHistoryLoading(true);
    try {
      const res = await resourceService.getResourceTransactions(resource._id);
      setHistoryLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Relief Resources &amp; Inventory Supply
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track emergency relief packages, record stock additions, and audit disaster site distributions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setAddModalOpen(true)}
        >
          Add Relief Resource
        </Button>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
            <span>
              <strong>Inventory Warning:</strong> {lowStockCount} resource item(s) are running below minimum emergency threshold.
            </span>
          </div>
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className="text-xs underline hover:text-white font-bold"
          >
            {lowStockOnly ? 'Show All Items' : 'Filter Low-Stock Items'}
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by resource name, ID, or storage location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadResources()}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Resources Table */}
      {loading ? (
        <LoadingSpinner text="Loading relief supply inventory..." />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No Resources Found"
          description="No inventory records matched your current query."
        />
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item ID</th>
                  <th className="py-3 px-4">Resource Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Stock</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Safety Reorder Min</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {resources.map((res) => {
                  const isLow = res.availableQuantity <= res.minStockLevel;

                  return (
                    <tr key={res._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {res.resourceId}
                      </td>

                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                        {res.name}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                          {formatCategory(res.category)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black font-mono ${
                              isLow ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {res.availableQuantity} {res.unit}
                          </span>
                          {isLow && (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold">
                              LOW STOCK
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">{res.storageLocation}</td>

                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {res.minStockLevel} {res.unit}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={ArrowDownRight}
                          onClick={() => {
                            setTransactingResource(res);
                            setTransType('addition');
                            setTransQuantity(50);
                            setTransReason('Restock Intake');
                            setTransDestination(res.storageLocation);
                          }}
                        >
                          Add Stock
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={ArrowUpRight}
                          onClick={() => {
                            setTransactingResource(res);
                            setTransType('distribution');
                            setTransQuantity(10);
                            setTransReason('Disaster Relief Dispatch');
                            setTransDestination('Affected Zone');
                          }}
                        >
                          Distribute
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={History}
                          onClick={() => viewHistory(res)}
                        >
                          Logs
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {addModalOpen && (
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Add New Relief Resource"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Resource Name *
              </label>
              <input
                type="text"
                required
                value={newResource.name}
                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                placeholder="e.g. Purified Potable Water Cans (20L)"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Category *
                </label>
                <select
                  value={newResource.category}
                  onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Unit of Measurement *
                </label>
                <input
                  type="text"
                  required
                  value={newResource.unit}
                  onChange={(e) => setNewResource({ ...newResource, unit: e.target.value })}
                  placeholder="e.g. packs, liters, kits, units"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Initial Available Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newResource.availableQuantity}
                  onChange={(e) =>
                    setNewResource({ ...newResource, availableQuantity: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Minimum Safety Stock Level *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newResource.minStockLevel}
                  onChange={(e) =>
                    setNewResource({ ...newResource, minStockLevel: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Storage Location Warehouse / Depot *
              </label>
              <input
                type="text"
                required
                value={newResource.storageLocation}
                onChange={(e) =>
                  setNewResource({ ...newResource, storageLocation: e.target.value })
                }
                placeholder="e.g. Central Depot, Bay 4"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={addLoading}
              >
                Create Resource
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Record Stock Transaction Modal */}
      {transactingResource && (
        <Modal
          isOpen={!!transactingResource}
          onClose={() => setTransactingResource(null)}
          title={`Record Stock ${transType === 'addition' ? 'Restock / Intake' : 'Distribution'}: ${
            transactingResource.name
          }`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <p>
                <strong>Current Available Stock:</strong> {transactingResource.availableQuantity}{' '}
                {transactingResource.unit}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transType}
                  onChange={(e) => setTransType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="distribution">📦 Distribution (Subtract)</option>
                  <option value="addition">📥 Stock Intake (Add)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Quantity ({transactingResource.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={transType === 'distribution' ? transactingResource.availableQuantity : 99999}
                  required
                  value={transQuantity}
                  onChange={(e) => setTransQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Destination / Target Camp / Sector *
              </label>
              <input
                type="text"
                required
                value={transDestination}
                onChange={(e) => setTransDestination(e.target.value)}
                placeholder="e.g. North District Community Shelter / Flood Sector 4"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Reason &amp; Authorization Rationale *
              </label>
              <textarea
                required
                rows={2}
                value={transReason}
                onChange={(e) => setTransReason(e.target.value)}
                placeholder="e.g. Emergency rations dispatch for 40 evacuated families..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTransactingResource(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={transType === 'addition' ? 'secondary' : 'primary'}
                size="sm"
                loading={transLoading}
              >
                Commit {transType.toUpperCase()}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Transaction History Modal */}
      {historyResource && (
        <Modal
          isOpen={!!historyResource}
          onClose={() => setHistoryResource(null)}
          title={`Transaction Audit Log: ${historyResource.name}`}
          maxWidth="max-w-2xl"
        >
          {historyLoading ? (
            <LoadingSpinner text="Fetching transaction logs..." />
          ) : historyLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No inventory transactions recorded yet for this resource.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {historyLogs.map((log) => {
                const isAdd = log.transactionType === 'addition';
                return (
                  <div
                    key={log._id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                            isAdd
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {isAdd ? '+ ADDITION' : '- DISTRIBUTION'}
                        </span>
                        <span className="font-bold text-white">
                          {log.quantity} {historyResource.unit}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1">
                        <strong>Reason:</strong> {log.reason}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        <strong>Destination:</strong> {log.destination} | Admin: {log.admin?.name || 'Admin'}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {formatDate(log.createdAt)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Balance after: {log.balanceAfter} {historyResource.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setHistoryResource(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
