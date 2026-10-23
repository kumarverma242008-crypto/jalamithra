import React from 'react';
import { OperatingMode } from '../types';
import { translations, Language } from '../locales/i18n';
import { AlertTriangle, Clock, PlayCircle, PowerOff } from 'lucide-react';

interface DemoModeBannerProps {
  operatingMode: OperatingMode;
  lang: Language;
  onExitDemo: () => void;
  onSelectPreset: (preset: 'normal' | 'dry_soil' | 'low_tank' | 'sensor_fault' | 'uncalibrated') => void;
  isStale: boolean;
  connectionState: string;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  operatingMode,
  lang,
  onExitDemo,
  onSelectPreset,
  isStale,
  connectionState,
}) => {
  const t = translations[lang];

  if (operatingMode === 'demo') {
    return (
      <div className="bg-amber-500 text-slate-950 px-4 py-3 border-b border-amber-600 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-slate-950" />
            <div>
              <span className="font-bold tracking-wide uppercase">
                DEMO MODE — SIMULATED DATA — NOT FROM REAL SENSORS
              </span>
              <p className="text-xs text-slate-900 font-normal mt-0.5">
                {t.demoModeDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-900 hidden sm:inline">
              Test Scenarios:
            </span>
            <button
              onClick={() => onSelectPreset('normal')}
              className="px-2 py-1 bg-white/80 hover:bg-white text-slate-900 text-xs font-medium rounded border border-amber-600 shadow-2xs"
            >
              Normal
            </button>
            <button
              onClick={() => onSelectPreset('dry_soil')}
              className="px-2 py-1 bg-white/80 hover:bg-white text-slate-900 text-xs font-medium rounded border border-amber-600 shadow-2xs"
            >
              Dry Soil
            </button>
            <button
              onClick={() => onSelectPreset('low_tank')}
              className="px-2 py-1 bg-white/80 hover:bg-white text-slate-900 text-xs font-medium rounded border border-amber-600 shadow-2xs"
            >
              Low Tank
            </button>
            <button
              onClick={() => onSelectPreset('sensor_fault')}
              className="px-2 py-1 bg-white/80 hover:bg-white text-slate-900 text-xs font-medium rounded border border-amber-600 shadow-2xs"
            >
              Sensor Fault
            </button>
            <button
              onClick={() => onSelectPreset('uncalibrated')}
              className="px-2 py-1 bg-white/80 hover:bg-white text-slate-900 text-xs font-medium rounded border border-amber-600 shadow-2xs"
            >
              Uncalibrated
            </button>
            <button
              onClick={onExitDemo}
              className="px-2.5 py-1 bg-slate-950 text-white hover:bg-slate-800 text-xs font-semibold rounded shadow-2xs ml-1"
            >
              Exit Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Live Mode: Show warning if disconnected or stale
  if (connectionState === 'disconnected' || connectionState === 'error') {
    return (
      <div className="bg-rose-50 text-rose-900 px-4 py-2.5 border-b border-rose-200 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PowerOff className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>ESP32 Hardware Disconnected:</strong> Live polling is not receiving data from the configured endpoint. No sensor telemetry is currently streaming.
            </span>
          </div>
          <span className="text-xs bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono">
            Awaiting Hardware
          </span>
        </div>
      </div>
    );
  }

  if (isStale) {
    return (
      <div className="bg-amber-50 text-amber-900 px-4 py-2 border-b border-amber-200 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Data Stale (&gt;30s):</strong> Last reading was received more than 30 seconds ago. Values shown may not represent real-time field state.
          </span>
        </div>
      </div>
    );
  }

  return null;
};
