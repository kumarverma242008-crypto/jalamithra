import React, { useState, useMemo } from 'react';
import { HistoricalReading, OperatingMode } from '../types';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import { StorageService } from '../services/storageService';
import {
  Download,
  Trash2,
  Calendar,
  Layers,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Database,
  CheckCircle,
} from 'lucide-react';

interface SensorHistoryProps {
  history: HistoricalReading[];
  onClearHistory: () => void;
  lang: Language;
  operatingMode: OperatingMode;
}

export const SensorHistory: React.FC<SensorHistoryProps> = ({
  history,
  onClearHistory,
  lang,
  operatingMode,
}) => {
  const t = translations[lang];

  const [timeFilter, setTimeFilter] = useState<'1h' | '6h' | '24h' | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'live' | 'simulated'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter history based on time and source
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    return history.filter((item) => {
      // Source filter
      if (sourceFilter !== 'all' && item.source !== sourceFilter) {
        return false;
      }

      // Time filter
      if (timeFilter === 'all') return true;
      const itemTime = new Date(item.timestamp).getTime();
      const diffHours = (now - itemTime) / (1000 * 3600);

      if (timeFilter === '1h') return diffHours <= 1;
      if (timeFilter === '6h') return diffHours <= 6;
      if (timeFilter === '24h') return diffHours <= 24;
      return true;
    });
  }, [history, timeFilter, sourceFilter]);

  // Compute analytics / Min, Max, Average
  const stats = useMemo(() => {
    const validSoil = filteredHistory
      .map((h) => h.soilPercent)
      .filter((v): v is number => v !== null && !isNaN(v));

    const validTank = filteredHistory
      .map((h) => h.tankLevelPercent)
      .filter((v): v is number => v !== null && !isNaN(v));

    return {
      soilMin: validSoil.length > 0 ? Math.min(...validSoil) : null,
      soilMax: validSoil.length > 0 ? Math.max(...validSoil) : null,
      soilAvg:
        validSoil.length > 0
          ? validSoil.reduce((a, b) => a + b, 0) / validSoil.length
          : null,
      tankMin: validTank.length > 0 ? Math.min(...validTank) : null,
      tankMax: validTank.length > 0 ? Math.max(...validTank) : null,
      tankAvg:
        validTank.length > 0
          ? validTank.reduce((a, b) => a + b, 0) / validTank.length
          : null,
    };
  }, [filteredHistory]);

  const handleExportCsv = () => {
    const csvContent = StorageService.exportHistoryToCsv(filteredHistory);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jalamitra-telemetry-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Helper
  const renderSvgChart = (
    data: (number | null)[],
    labels: string[],
    color: string,
    unit: string,
    title: string
  ) => {
    const height = 180;
    const width = 640;
    const padding = 32;

    const validValues = data.filter((v): v is number => v !== null);

    if (validValues.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded">
          Insufficient data points to plot curve (minimum 2 readings required)
        </div>
      );
    }

    const min = 0;
    const max = 100;

    const points = data
      .map((val, idx) => {
        if (val === null) return null;
        const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((val - min) / (max - min)) * (height - 2 * padding);
        return { x, y, val };
      })
      .filter((p): p is { x: number; y: number; val: number } => p !== null);

    const pathD = points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    return (
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 text-xs font-mono select-none"
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          <text x={padding - 6} y={padding + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
            100%
          </text>

          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          <text x={padding - 6} y={height / 2 + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
            50%
          </text>

          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#cbd5e1"
          />
          <text x={padding - 6} y={height - padding + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
            0%
          </text>

          {/* Plotted Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#ffffff"
              stroke={color}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    );
  };

  const soilData = filteredHistory.map((h) => h.soilPercent);
  const tankData = filteredHistory.map((h) => h.tankLevelPercent);
  const timeLabels = filteredHistory.map((h) =>
    new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

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
              {t.nav.sensorHistory} & Telemetry Logs
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Historical sensor analytics, time-series curves, and CSV data export
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={filteredHistory.length === 0}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.common.exportCsv}</span>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={history.length === 0}
              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.common.clearData}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Time Range:</span>
            <div className="inline-flex rounded-md shadow-2xs">
              {(['1h', '6h', '24h', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1 text-xs font-medium border border-slate-200 first:rounded-l-md last:rounded-r-md -ml-px ${
                    timeFilter === filter
                      ? 'bg-slate-900 text-white border-slate-900 z-10'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {filter.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Source:</span>
            <div className="inline-flex rounded-md shadow-2xs">
              {(['all', 'live', 'simulated'] as const).map((source) => (
                <button
                  key={source}
                  onClick={() => setSourceFilter(source)}
                  className={`px-3 py-1 text-xs font-medium border border-slate-200 first:rounded-l-md last:rounded-r-md -ml-px capitalize ${
                    sourceFilter === source
                      ? 'bg-slate-900 text-white border-slate-900 z-10'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-500 text-[11px] font-mono tabular-nums">
            Showing {filteredHistory.length} of {history.length} stored records ({StorageService.getStorageUsageEstimateKb()} KB used)
          </div>
        </div>
      </div>

      {/* Analytics KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-500">Soil Moisture Range</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
            {stats.soilMin !== null ? `${stats.soilMin.toFixed(0)}%` : '--'} -{' '}
            {stats.soilMax !== null ? `${stats.soilMax.toFixed(0)}%` : '--'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Avg: {stats.soilAvg !== null ? `${stats.soilAvg.toFixed(1)}%` : 'N/A'}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-500">Water Tank Level Range</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
            {stats.tankMin !== null ? `${stats.tankMin.toFixed(0)}%` : '--'} -{' '}
            {stats.tankMax !== null ? `${stats.tankMax.toFixed(0)}%` : '--'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Avg: {stats.tankAvg !== null ? `${stats.tankAvg.toFixed(1)}%` : 'N/A'}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-500">Uncalibrated Readings</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
            {filteredHistory.filter((h) => h.soilPercent === null || h.tankLevelPercent === null).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Raw ADC / distance only</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-[11px] font-semibold text-slate-500">Hardware Fault Events</div>
          <div className="text-lg font-bold font-mono tabular-nums text-rose-600 mt-1">
            {filteredHistory.filter((h) => h.systemFault).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Transducer failure flags</div>
        </div>
      </div>

      {/* Time-Series Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Moisture Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Soil Moisture Trend (% Volumetric Water)
              </h2>
              <p className="text-xs text-slate-500">Calibrated probe readings over selected time</p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-emerald-700">0 - 100%</span>
          </div>

          {renderSvgChart(soilData, timeLabels, '#059669', '%', 'Soil Moisture')}
        </div>

        {/* Tank Level Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Water Tank Level Trend (% Fill Capacity)
              </h2>
              <p className="text-xs text-slate-500">Ultrasonic acoustic capacity tracking</p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-blue-700">0 - 100%</span>
          </div>

          {renderSvgChart(tankData, timeLabels, '#2563eb', '%', 'Water Tank Level')}
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          Detailed Telemetry Audit Records
        </h2>

        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded">
            No telemetry records match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Source</th>
                  <th className="py-2 px-3 text-right">Raw Soil ADC</th>
                  <th className="py-2 px-3 text-right">Soil Moisture</th>
                  <th className="py-2 px-3 text-right">Distance (cm)</th>
                  <th className="py-2 px-3 text-right">Tank Level</th>
                  <th className="py-2 px-3 text-center">Fault</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredHistory
                  .slice()
                  .reverse()
                  .map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-700">
                        {new Date(row.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            row.source === 'live'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {row.source}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-800">
                        {row.rawSoilAdc !== null ? row.rawSoilAdc : '--'}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-800">
                        {row.soilPercent !== null ? `${row.soilPercent.toFixed(1)}%` : 'Uncalibrated'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-800">
                        {row.tankDistanceCm !== null ? `${row.tankDistanceCm.toFixed(1)} cm` : '--'}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-800">
                        {row.tankLevelPercent !== null ? `${row.tankLevelPercent.toFixed(1)}%` : 'Unconfigured'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {row.systemFault ? (
                          <span className="text-rose-600 font-bold">FAULT</span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="bg-white rounded-lg border border-slate-300 max-w-sm w-full p-5 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              Clear All Stored Telemetry?
            </h2>
            <p className="text-xs text-slate-600">
              This will remove all {history.length} stored sensor records and telemetry logs from your browser's local storage. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
