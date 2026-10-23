import React from 'react';
import { translations, Language } from '../locales/i18n';
import { OperatingMode } from '../types';
import { Globe, Radio, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onToggleLang: () => void;
  operatingMode: OperatingMode;
  onToggleDemoMode: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  operatingMode,
  onToggleDemoMode,
  activeAlertCount,
}) => {
  const t = translations[lang];

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'soil', label: t.nav.soil },
    { id: 'tank', label: t.nav.tank },
    { id: 'connectivity', label: t.nav.liveMonitoring },
    { id: 'history', label: t.nav.sensorHistory },
    { id: 'alerts', label: t.nav.alerts, badgeCount: activeAlertCount },
    { id: 'diagnostics', label: t.nav.diagnostics },
    { id: 'recommendations', label: t.nav.recommendations },
    { id: 'pump', label: t.nav.pumpSafety },
    { id: 'about', label: t.nav.about },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="text-xl font-bold tracking-tight text-slate-900 hover:text-emerald-700 transition-colors whitespace-nowrap text-left"
            >
              <span className="text-emerald-600">Jala</span>Mitra
              <span className="hidden sm:inline text-xs font-normal text-slate-500 ml-2">
                IoT Irrigation
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Scrollable on small screens, clean text with active indicator) */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-2 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                        isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions - Language toggle & Mode selector */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              title="Switch language between English and Telugu"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Mode Switcher */}
            <button
              onClick={onToggleDemoMode}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                operatingMode === 'demo'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{operatingMode === 'demo' ? 'Demo Mode' : 'Live Mode'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 text-xs no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{item.label}</span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="text-[10px] bg-amber-400 text-slate-900 font-mono px-1 rounded-full">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
