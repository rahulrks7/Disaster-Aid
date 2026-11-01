import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { helpRequestService } from '../../services/helpRequestService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { LocationPickerModal } from '../../components/map/LocationPickerModal';
import {
  LifeBuoy,
  Phone,
  MapPin,
  Users,
  AlertTriangle,
  Heart,
  Droplet,
  Utensils,
  Home,
  Pill,
  Compass,
} from 'lucide-react';

export const RequestHelpPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    requestType: 'rescue',
    description: '',
    locationName: user?.address || '',
    latitude: 28.6139,
    longitude: 77.209,
    affectedPeople: 1,
    priority: 'high',
    contactPhone: user?.phone || '',
  });

  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const requestTypes = [
    { value: 'rescue', label: t('requests.rescue', 'Rescue Evacuation'), icon: LifeBuoy, color: 'text-red-400' },
    { value: 'medical', label: t('requests.medical', 'Medical Assistance'), icon: Heart, color: 'text-emerald-400' },
    { value: 'food', label: t('requests.food', 'Emergency Food Rations'), icon: Utensils, color: 'text-amber-400' },
    { value: 'water', label: t('requests.water', 'Clean Drinking Water'), icon: Droplet, color: 'text-blue-400' },
    { value: 'shelter', label: t('requests.shelter', 'Shelter Placement'), icon: Home, color: 'text-purple-400' },
    { value: 'medicine', label: t('requests.medicine', 'Critical Medication'), icon: Pill, color: 'text-pink-400' },
  ];

  const priorities = [
    { value: 'low', label: t('requests.low', 'Low Priority') },
    { value: 'medium', label: t('requests.medium', 'Medium Priority') },
    { value: 'high', label: t('requests.high', 'High Priority') },
    { value: 'critical', label: t('requests.critical', 'Critical (Life Threat)') },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Please provide a description of the assistance needed.');
      return;
    }
    if (!formData.locationName.trim()) {
      setError('Location address is required.');
      return;
    }

    setLoading(true);

    try {
      await helpRequestService.createRequest(formData);
      addToast(
        t('citizen.sos.sosSuccess', 'Help Request Broadcasted'),
        t('citizen.sos.sosSuccessMsg', 'Your emergency request was logged. Response teams have been notified.'),
        'task'
      );
      navigate('/citizen/my-requests');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit help request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <LifeBuoy className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {t('citizen.sos.pageTitle', 'Request Emergency Assistance (SOS)')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t('citizen.sos.pageSubtitle', 'Submit an urgent assistance request for yourself, family, or stranded community members.')}
        </p>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong>{t('common.warning', 'Emergency Dispatch Notice')}:</strong> {t('citizen.report.academicNotice', 'DisasterAid provides community coordination. In immediate life-threatening situations, also contact 112 or 108 directly.')}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        {/* Request Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            {t('citizen.sos.typeLabel', 'Type of Assistance Required')} *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {requestTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.requestType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, requestType: type.value })}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-500'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${type.color}`} />
                  <span className="text-xs font-bold">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority & Affected Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              {t('citizen.sos.priorityLabel', 'Priority Urgency Level')} *
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              {t('citizen.sos.peopleCount', 'Number of People Requiring Aid')} *
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                required
                name="affectedPeople"
                value={formData.affectedPeople}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location & Coordinates */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                {t('citizen.sos.locationLabel', 'Exact Location / Address')} *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleChange}
                  placeholder={t('citizen.sos.locationPlaceholder', 'e.g. House 44B, Riverside Colony, Sector 4')}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                {t('citizen.profile.phone', 'Emergency Contact Phone')} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 font-mono text-slate-300">
              <span>Lat: <strong>{formData.latitude?.toFixed(5)}</strong></span>
              <span>Lng: <strong>{formData.longitude?.toFixed(5)}</strong></span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={MapPin}
              onClick={() => setIsMapPickerOpen(true)}
            >
              {t('citizen.report.pickOnMap', 'Adjust Pin on Map')}
            </Button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
            {t('citizen.sos.descLabel', 'Urgent Situation Details & Specific Needs')} *
          </label>
          <textarea
            required
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t('citizen.sos.descPlaceholder', 'Please detail the situation: age of people, medical conditions, water/food shortage, physical entrapment, special assistance needed...')}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {t('citizen.sos.pageSubtitle', 'Request will be prioritized based on severity and victim vulnerability.')}
          </p>
          <Button
            type="submit"
            variant="blue"
            size="lg"
            loading={loading}
            icon={LifeBuoy}
          >
            {loading ? t('citizen.sos.submitting', 'Transmitting...') : t('citizen.sos.submitSos', 'Dispatch Help Request')}
          </Button>
        </div>
      </form>

      {/* Map Location Picker Modal */}
      <LocationPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialCoords={[formData.latitude, formData.longitude]}
        onSelectLocation={(coords) => {
          setFormData({
            ...formData,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        }}
      />
    </div>
  );
};

