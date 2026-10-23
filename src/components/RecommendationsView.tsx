import React from 'react';
import { FarmerRecommendation, OperatingMode } from '../types';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import {
  ShieldCheck,
  AlertTriangle,
  Info,
  Droplet,
  Waves,
  Cpu,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface RecommendationsViewProps {
  recommendations: FarmerRecommendation[];
  operatingMode: OperatingMode;
  lang: Language;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  operatingMode,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{t.appSubtitle}</span>
              <span aria-hidden="true">·</span>
              <FeatureStatusBadge state="Implemented and software-tested" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t.recommendations.title}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{t.recommendations.subtitle}</p>
          </div>

          <div className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded">
            <strong>Advisory Engine:</strong> Transparent Rule-Based Logic
          </div>
        </div>
      </div>

      {/* Philosophy Callout Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs text-emerald-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Transparent Engineering Advisory Standards</span>
          <p>
            JalaMitra provides explainable root-zone soil and reservoir observations without automated speculative agronomic diagnoses. All recommendations require physical field verification by the farmer and will never actuate pump motors automatically.
          </p>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {recommendations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-900">No Action Items Required</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Current soil moisture is balanced and water tank storage is adequate. Continue routine monitoring.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => {
            const isAlert = rec.severity === 'alert';
            const isWarning = rec.severity === 'warning';

            return (
              <div
                key={rec.id}
                className={`bg-white border rounded-lg p-5 flex flex-col justify-between ${
                  isAlert
                    ? 'border-rose-300'
                    : isWarning
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {rec.category === 'soil' ? (
                        <Droplet className="w-4 h-4 text-emerald-600" />
                      ) : rec.category === 'tank' ? (
                        <Waves className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Cpu className="w-4 h-4 text-slate-600" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {rec.category} Observation
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                          isAlert
                            ? 'bg-rose-100 text-rose-800'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rec.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">
                        ({rec.source})
                      </span>
                    </div>
                  </div>

                  {/* 3-Step Explainable Advisory */}
                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <div className="font-semibold text-slate-900 mb-0.5">
                        {t.recommendations.observationLabel}
                      </div>
                      <div className="text-slate-700">{rec.observation}</div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <div className="font-semibold text-slate-900 mb-0.5">
                        {t.recommendations.impactLabel}
                      </div>
                      <div className="text-slate-700">{rec.impact}</div>
                    </div>

                    <div className="p-2.5 rounded bg-emerald-50/70 border border-emerald-200">
                      <div className="font-semibold text-emerald-950 mb-0.5">
                        {t.recommendations.actionLabel}
                      </div>
                      <div className="text-emerald-900 font-medium">{rec.action}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Source: {rec.source === 'live' ? 'Live Telemetry' : 'Demo Simulation'}</span>
                  <span className="font-mono tabular-nums">
                    {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
