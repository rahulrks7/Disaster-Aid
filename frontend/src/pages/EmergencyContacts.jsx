import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PhoneCall, ShieldAlert, Heart, Flame, Shield, Users, Radio, AlertTriangle } from 'lucide-react';

export const EmergencyContacts = () => {
  const { t } = useLanguage();

  const hotlines = [
    {
      title: t('hotlines.generalTitle', 'National Universal Emergency'),
      number: '112',
      description: 'Single national emergency response number for Police, Fire, and Ambulance dispatch.',
      category: 'Unified Hotline',
      color: 'red',
      icon: ShieldAlert,
    },
    {
      title: t('hotlines.medicalTitle', 'Medical Emergency & Ambulance'),
      number: '108',
      description: '24/7 free medical ambulance emergency response and paramedics dispatch.',
      category: 'Medical',
      color: 'emerald',
      icon: Heart,
    },
    {
      title: t('hotlines.fireTitle', 'Fire & Rescue Services'),
      number: '101',
      description: 'Rapid fire control, building evacuation, and hazardous chemical rescue.',
      category: 'Fire Safety',
      color: 'orange',
      icon: Flame,
    },
    {
      title: t('hotlines.policeTitle', 'Police Emergency Response'),
      number: '100',
      description: 'Law enforcement, perimeter security, and civil emergency assistance.',
      category: 'Police',
      color: 'blue',
      icon: Shield,
    },
    {
      title: t('hotlines.disasterTitle', 'National Disaster Response Force (NDRF)'),
      number: '1078',
      description: 'Specialized disaster response force for major floods, earthquakes, and landslides.',
      category: 'Disaster Force',
      color: 'purple',
      icon: Radio,
    },
    {
      title: t('hotlines.womenTitle', 'Women Emergency Helpline'),
      number: '1091',
      description: '24/7 round-the-clock safety and crisis helpline for women.',
      category: 'Support',
      color: 'pink',
      icon: Users,
    },
    {
      title: t('hotlines.childTitle', 'Child Helpline Emergency'),
      number: '1098',
      description: 'Free, emergency phone outreach service for children in need of care and protection.',
      category: 'Child Care',
      color: 'indigo',
      icon: Heart,
    },
    {
      title: 'Central Flood & Weather Control',
      number: '1070',
      description: 'State disaster authority helpline for meteorological bulletins and flood warnings.',
      category: 'Weather Control',
      color: 'cyan',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <PhoneCall className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {t('hotlines.pageTitle', 'Emergency Hotlines Directory')}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t('hotlines.pageSubtitle', 'Direct national and state emergency helpline numbers with 24/7 dispatch services.')}
        </p>
      </div>

      {/* Critical Note */}
      <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-red-200">
          <strong className="font-bold">Immediate Life Threat Advisory:</strong> If you or someone around you is in immediate physical danger, dial <strong>112</strong> immediately. DisasterAid web coordination operates alongside official state emergency channels.
        </div>
      </div>

      {/* Hotline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {hotlines.map((hotline, idx) => {
          const Icon = hotline.icon;
          return (
            <div
              key={idx}
              className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {hotline.category}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">{hotline.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {hotline.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    {t('hotlines.tollFree', 'Toll-Free Hotline')}
                  </span>
                  <span className="text-2xl font-black text-white font-mono tracking-tight">
                    {hotline.number}
                  </span>
                </div>

                <a
                  href={`tel:${hotline.number}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 flex items-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> {t('hotlines.callNow', 'Call Now')}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
