import React, { useState, useEffect } from 'react';
import { volunteerService } from '../../services/volunteerService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { UserCheck, HeartHandshake, Phone, MapPin, Award, CheckCircle2 } from 'lucide-react';

export const VolunteerProfilePage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useNotifications();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    skills: [],
    experienceYears: 1,
    generalLocation: '',
    emergencyContact: '',
    bio: '',
    availability: 'available',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const allSkills = [
    'First Aid',
    'Search & Rescue',
    'Medical Assistance',
    'Driving/Logistics',
    'Food Distribution',
    'Firefighting Support',
    'Water Rescue',
    'Counselling',
    'Triage',
    'Heavy Equipment Support',
  ];

  const loadProfile = async () => {
    try {
      const res = await volunteerService.getMyProfile();
      setProfile(res.data);
      if (res.data) {
        setFormData({
          skills: res.data.skills || [],
          experienceYears: res.data.experienceYears || 0,
          generalLocation: res.data.generalLocation || '',
          emergencyContact: res.data.emergencyContact || '',
          bio: res.data.bio || '',
          availability: res.data.availability || 'available',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSkillToggle = (skill) => {
    if (formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: formData.skills.filter((s) => s !== skill),
      });
    } else {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setSaving(true);

    try {
      await volunteerService.updateMyProfile(formData);
      setSuccess('Volunteer operational profile updated successfully.');
      addToast('Profile Saved', 'Your skills and availability settings have been updated.', 'system');
      loadProfile();
    } catch (err) {
      addToast('Error', err.response?.data?.message || 'Failed to save profile', 'alert');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text={t('common.loading', 'Loading volunteer credentials...')} />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <UserCheck className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {t('volunteer.profile.pageTitle', 'Volunteer Responder Profile')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t('volunteer.profile.pageSubtitle', 'Maintain your responder skillset, operational readiness, and dispatch coverage area.')}
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xl font-bold font-display">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  {t('nav.volunteerPortal', 'Verified Volunteer')}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  {profile?.completedTasksCount || 0} {t('volunteer.dashboard.statCompleted', 'missions completed')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {t('volunteer.dashboard.readinessStatus', 'Readiness Status')}
            </label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="available">🟢 {t('volunteer.dashboard.statusAvailable', 'Available for Dispatch')}</option>
              <option value="unavailable">🔴 {t('volunteer.dashboard.statusUnavailable', 'Off-Duty / Unavailable')}</option>
            </select>
          </div>
        </div>

        {/* Skills Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            {t('volunteer.profile.skillsTitle', 'My Skills & Qualifications *')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {allSkills.map((skill) => {
              const isSelected = formData.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-600/10'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('volunteer.profile.experienceYears', 'Field Experience (Years)')}
            </label>
            <input
              type="number"
              min="0"
              max="40"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('volunteer.profile.serviceArea', 'General Service / Deployment Area')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.generalLocation}
                onChange={(e) => setFormData({ ...formData, generalLocation: e.target.value })}
                placeholder={t('volunteer.profile.serviceAreaPlaceholder', 'e.g. North District / Sector 4')}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {t('citizen.profile.emergencyPhone', 'Emergency Standby Contact Phone')}
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {t('volunteer.profile.skillsDesc', 'Responder Biography & Certifications')}
          </label>
          <textarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="List any certifications (EMT, BLS, Wilderness First Aid, Disaster Management)..."
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <Button
            type="submit"
            variant="success"
            size="md"
            loading={saving}
          >
            {t('volunteer.profile.saveChanges', 'Update Volunteer Profile')}
          </Button>
        </div>
      </form>
    </div>
  );
};
