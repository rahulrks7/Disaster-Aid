import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getSeverityColor, getStatusColor, formatCategory } from '../../utils/helpers';

export const SeverityBadge = ({ severity, className = '' }) => {
  const { t } = useLanguage();
  const color = getSeverityColor(severity);
  const label = severity ? t(`disasters.${severity}`, severity.toUpperCase()) : 'UNKNOWN';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color.bg} ${color.text} ${color.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${color.dot} animate-pulse`} />
      {label}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  const { t } = useLanguage();
  const colorClass = getStatusColor(status);
  const fallback = formatCategory(status);
  const label = status ? t(`tasks.${status}`, t(`requests.${status}`, t(`disasters.${status}`, fallback))) : fallback;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
};

export const CategoryBadge = ({ category, className = '' }) => {
  const { t } = useLanguage();
  const fallback = formatCategory(category);
  const label = category ? t(`disasters.${category}`, t(`requests.${category}`, fallback)) : fallback;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 ${className}`}
    >
      {label}
    </span>
  );
};
