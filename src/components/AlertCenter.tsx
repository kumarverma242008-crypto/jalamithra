import React, { useState } from 'react';
import { SystemAlert, OperatingMode } from '../types';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Filter,
  Wrench,
  Clock,
  Layers,
} from 'lucide-react';

interface AlertCenterProps {
  alerts: SystemAlert[];
  operatingMode: OperatingMode;
  lang: Language;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  operatingMode,
  lang,
}) => {
  const t = translations[lang];

  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;

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
              {t.alerts.title}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{t.alerts.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Active Count:</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {alerts.length} Active Events
            </span>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Severity:
          </span>

          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
              severityFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.alerts.filterAll} ({alerts.length})
          </button>

          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
              severityFilter === 'critical'
                ? 'bg-rose-700 text-white border-rose-700'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            {t.alerts.filterCritical} ({criticalCount})
          </button>

          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
              severityFilter === 'warning'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {t.alerts.filterWarning} ({warningCount})
          </button>

          <button
            onClick={() => setSeverityFilter('info')}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
              severityFilter === 'info'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {t.alerts.filterInfo} ({infoCount})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-900">
            {severityFilter === 'all' ? 'No Active Alerts' : `No Active ${severityFilter.toUpperCase()} Alerts`}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Current system readings are within configured parameters and no transducer communication faults are present.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-lg p-5 transition-shadow ${
                  isCritical
                    ? 'border-rose-300 shadow-xs'
                    : isWarning
                    ? 'border-amber-300 shadow-xs'
                    : 'border-blue-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5">
                    {isCritical ? (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{alert.title}</span>
                        <span className="text-[11px] font-mono text-slate-400">({alert.code})</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono tabular-nums">
                          {new Date(alert.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                        <span>·</span>
                        <span>Source: <strong className="font-mono capitalize">{alert.source}</strong></span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border self-start ${
                      isCritical
                        ? 'bg-rose-100 text-rose-900 border-rose-200'
                        : isWarning
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-blue-100 text-blue-900 border-blue-200'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-700 my-2.5 pl-7">{alert.description}</p>

                {/* Recommended Diagnostic Step */}
                <div className="ml-7 p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Wrench className="w-3.5 h-3.5 text-slate-600" />
                    <span>{t.alerts.diagnosticRecommendation}:</span>
                  </div>
                  <div className="text-slate-600 pl-5">{alert.diagnosticStep}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
