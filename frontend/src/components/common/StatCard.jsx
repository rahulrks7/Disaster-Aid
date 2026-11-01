import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  className = '',
}) => {
  const colorMap = {
    red: {
      border: 'hover:border-red-500/50',
      bg: 'bg-red-500/10 text-red-400',
      glow: 'group-hover:shadow-glow-red',
    },
    blue: {
      border: 'hover:border-blue-500/50',
      bg: 'bg-blue-500/10 text-blue-400',
      glow: 'group-hover:shadow-glow-blue',
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      bg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'group-hover:shadow-glow-emerald',
    },
    amber: {
      border: 'hover:border-amber-500/50',
      bg: 'bg-amber-500/10 text-amber-400',
      glow: '',
    },
    purple: {
      border: 'hover:border-purple-500/50',
      bg: 'bg-purple-500/10 text-purple-400',
      glow: '',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`group relative glass-card p-5 rounded-xl border border-slate-800 transition-all duration-300 hover:-translate-y-0.5 ${scheme.border} ${scheme.glow} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-white mt-1 font-display tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
