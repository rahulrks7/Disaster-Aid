import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { disasterService } from '../../services/disasterService';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { LocationPickerModal } from '../../components/map/LocationPickerModal';
import {
  ShieldAlert,
  MapPin,
  Upload,
  AlertTriangle,
  Users,
  Compass,
  CheckCircle2,
  X,
} from 'lucide-react';

export const ReportDisasterPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    category: 'flood',
    severity: 'medium',
    locationName: '',
    latitude: 28.6139,
    longitude: 77.209,
    affectedCount: 0,
    description: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const categories = [
    { value: 'flood', label: t('disasters.flood', 'Flood') },
    { value: 'fire', label: t('disasters.fire', 'Fire Outbreak') },
    { value: 'earthquake', label: t('disasters.earthquake', 'Earthquake / Tremors') },
    { value: 'cyclone', label: t('disasters.cyclone', 'Cyclone / Storm') },
    { value: 'landslide', label: t('disasters.landslide', 'Landslide') },
    { value: 'road_accident', label: t('disasters.road_accident', 'Major Road Accident') },
    { value: 'building_collapse', label: t('disasters.building_collapse', 'Building / Structure Collapse') },
    { value: 'other', label: t('disasters.other', 'Other Emergency') },
  ];

  const severities = [
    { value: 'low', label: t('disasters.low', 'Low') },
    { value: 'medium', label: t('disasters.medium', 'Medium') },
    { value: 'high', label: t('disasters.high', 'High') },
    { value: 'critical', label: t('disasters.critical', 'Critical') },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const handleGetDeviceLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          addToast(t('citizen.report.gpsSuccess', 'Location Updated'), t('citizen.report.gpsSuccess', 'Fetched your current GPS coordinates.'), 'system');
        },
        (err) => {
          setError('Could not access device location. Please drop a pin on the map instead.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Incident title is required');
      return;
    }
    if (!formData.locationName.trim()) {
      setError('Location address or area name is required');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('severity', formData.severity);
      data.append('locationName', formData.locationName);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      data.append('affectedCount', formData.affectedCount);
      data.append('description', formData.description);

      for (const file of selectedFiles) {
        data.append('images', file);
      }

      await disasterService.createReport(data);
      addToast(
        t('citizen.report.reportSuccess', 'Report Submitted'),
        t('citizen.report.reportSuccessMsg', 'Your disaster incident report was submitted and queued for verification.'),
        'system'
      );
      navigate('/citizen/my-reports');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit report. Please check all fields.'
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
          <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {t('citizen.report.pageTitle', 'Submit Disaster Incident Report')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t('citizen.report.pageSubtitle', 'Provide accurate details and photographs of the emergency incident to alert command triage and volunteer response teams.')}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
            {t('citizen.report.titleLabel', 'Incident Title')} *
          </label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={t('citizen.report.titlePlaceholder', 'e.g. Flash flooding cutting off Sector 4 road access')}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Category & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              {t('citizen.report.categoryLabel', 'Disaster Category')} *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              {t('citizen.report.severityLabel', 'Estimated Severity Level')} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {severities.map((sev) => {
                const isSelected = formData.severity === sev.value;
                return (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: sev.value })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {sev.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location & Coordinates */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              {t('citizen.report.locationLabel', 'Incident Location Address / Landmark')} *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
                placeholder={t('citizen.report.locationPlaceholder', 'e.g. Near Old Bridge, Green Valley Sector 4, North District')}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Coordinate picker buttons */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 font-mono text-slate-300">
              <span>Lat: <strong>{formData.latitude?.toFixed(5)}</strong></span>
              <span>Lng: <strong>{formData.longitude?.toFixed(5)}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Compass}
                onClick={handleGetDeviceLocation}
              >
                {t('citizen.report.useGps', 'Use GPS Location')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={MapPin}
                onClick={() => setIsMapPickerOpen(true)}
              >
                {t('citizen.report.pickOnMap', 'Pick on Map Pin')}
              </Button>
            </div>
          </div>
        </div>

        {/* Affected people count & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              {t('citizen.report.affectedCount', 'People Affected (Est.)')}
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="0"
                name="affectedCount"
                value={formData.affectedCount}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              {t('citizen.report.descriptionLabel', 'Detailed Description & Hazards')} *
            </label>
            <textarea
              required
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('citizen.report.descriptionPlaceholder', 'Describe what happened, current hazard severity, trapped individuals, and access conditions...')}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
        </div>

        {/* Photos Upload with Live Previews */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
            {t('citizen.report.uploadPhotos', 'Incident Photographs (Up to 5)')}
          </label>

          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-slate-500 transition-colors bg-slate-900/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-300">
              {t('citizen.report.dropPhotos', 'Drag & drop photos here, or click to browse files')}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              {t('citizen.report.maxPhotosHint', 'Supports JPG, PNG, WEBP up to 5MB each.')}
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="disaster-photo-upload"
            />
            <label
              htmlFor="disaster-photo-upload"
              className="mt-3 inline-block px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors"
            >
              {t('common.search', 'Choose Images')}
            </label>
          </div>

          {/* Previews */}
          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 group">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {t('citizen.report.academicNotice', 'Reports enter verification queue immediately upon submission.')}
          </p>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={ShieldAlert}
          >
            {loading ? t('citizen.report.submitting', 'Submitting...') : t('citizen.report.submitReport', 'Submit Disaster Report')}
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

