import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ variant = 'icon', className = '' }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const titleText = isDark
    ? t('common.lightMode', 'Switch to Light Mode')
    : t('common.darkMode', 'Switch to Dark Mode');

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-amber-300 hover:bg-slate-800 hover:border-slate-600'
            : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
        } ${className}`}
        aria-label={titleText}
      >
        <span className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>{isDark ? t('common.darkMode', 'Dark Mode') : t('common.lightMode', 'Light Mode')}</span>
        </span>

        <span
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            isDark ? 'bg-indigo-600' : 'bg-amber-400'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isDark ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={titleText}
      aria-label={titleText}
      className={`p-2 rounded-xl border transition-all duration-300 relative group flex items-center justify-center ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 text-amber-400 hover:bg-slate-800 hover:border-amber-500/40 hover:text-amber-300 shadow-sm'
          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          className={`w-4 h-4 transition-all duration-300 absolute ${
            isDark
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100 text-amber-500'
          }`}
        />
        <Moon
          className={`w-4 h-4 transition-all duration-300 absolute ${
            isDark
              ? 'rotate-0 scale-100 opacity-100 text-indigo-300'
              : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
    </button>
  );
};
