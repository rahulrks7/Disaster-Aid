import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSelector = ({ variant = 'dropdown', className = '' }) => {
  const { currentLanguage, changeLanguage, languages, activeLangMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'compact') {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          aria-expanded={isOpen}
          title="Change Language"
        >
          <span className="text-base leading-none">{activeLangMeta.flag}</span>
          <span className="uppercase text-[11px] font-bold text-slate-300">{activeLangMeta.code}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
            <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex items-center gap-1.5 mb-1">
              <Globe className="w-3 h-3 text-blue-400" /> Select Language
            </div>
            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
              {languages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors text-left ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <div>
                        <span className="block leading-tight">{lang.nativeName}</span>
                        <span className={`text-[10px] block leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {lang.name}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Dropdown variant
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-base leading-none">{activeLangMeta.flag}</span>
        <span className="hidden sm:inline font-medium text-slate-200">{activeLangMeta.nativeName}</span>
        <span className="sm:hidden uppercase text-[11px] font-bold">{activeLangMeta.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex items-center gap-1.5 mb-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Select Language / भाषा चुनें</span>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar">
            {languages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors text-left ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <div>
                      <span className="block font-semibold leading-tight">{lang.nativeName}</span>
                      <span className={`text-[10px] block leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default LanguageSelector;
