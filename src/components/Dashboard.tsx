import React from 'react';
import {
  JalaMitraPayload,
  SoilCalibrationConfig,
  TankCalibrationConfig,
  SystemAlert,
  FarmerRecommendation,
  OperatingMode,
} from '../types';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import {
  Droplet,
  Waves,
  Wifi,
  WifiOff,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Activity,
  Layers,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface DashboardProps {
  payload: JalaMitraPayload | null;
  soilConfig: SoilCalibrationConfig;
  tankConfig: TankCalibrationConfig;
  alerts: SystemAlert[];
  recommendations: FarmerRecommendation[];
  isDeviceConnected: boolean;
  isStale: boolean;
  operatingMode: OperatingMode;
  lastUpdated: string | null;
  lang: Language;
  onNavigate: (tabId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  payload,
  soilConfig,
  tankConfig,
  alerts,
  recommendations,
  isDeviceConnected,
  isStale,
  operatingMode,
  lastUpdated,
  lang,
  onNavigate,
}) => {
  const t = translations[lang];

  // Helper for formatting timestamp
  const formatTime = (ts: string | null) => {
    if (!ts) return t.common.never;
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  // Determine system status
  let systemStatusText = t.common.unknown;
  let systemStatusIcon = <HelpCircle className="w-4 h-4 text-slate-500" />;
  let systemStatusBg = 'bg-slate-100 text-slate-800 border-slate-300';

  if (!isDeviceConnected) {
    systemStatusText = t.common.disconnected;
    systemStatusIcon = <WifiOff className="w-4 h-4 text-rose-600" />;
    systemStatusBg = 'bg-rose-50 text-rose-800 border-rose-300';
  } else if (payload?.system.sensorFault || alerts.some((a) => a.severity === 'critical')) {
    systemStatusText = t.common.fault;
    systemStatusIcon = <XCircle className="w-4 h-4 text-rose-600" />;
    systemStatusBg = 'bg-rose-50 text-rose-800 border-rose-300';
  } else if (isStale) {
    systemStatusText = t.common.stale;
    systemStatusIcon = <Clock className="w-4 h-4 text-amber-600" />;
    systemStatusBg = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (alerts.some((a) => a.severity === 'warning')) {
    systemStatusText = t.common.warning;
    systemStatusIcon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
    systemStatusBg = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (payload && payload.soil.valid && payload.tank.valid) {
    systemStatusText = t.common.healthy;
    systemStatusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    systemStatusBg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  }

  return (
    <div className="space-y-6">
      {/* Overview Kicker & System Status Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1">
              <span>{t.appSubtitle}</span>
              <span aria-hidden="true">·</span>
              <span>Major Project</span>
              <span aria-hidden="true">·</span>
              <FeatureStatusBadge state="Implemented and software-tested" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t.nav.dashboard}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* System Status Indicator */}
            <div
              className={`px-3 py-1.5 rounded border text-xs font-semibold flex items-center gap-2 ${systemStatusBg}`}
            >
              {systemStatusIcon}
              <span>{systemStatusText}</span>
            </div>

            {/* Data Source Provenance Indicator */}
            <div className="px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-center gap-2">
              <span className="font-semibold">{t.common.source}:</span>
              <span className="font-mono">
                {operatingMode === 'demo' ? t.common.simulatedData : t.common.liveData}
              </span>
            </div>

            {/* Last updated */}
            <div className="px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.common.lastUpdated}:</span>
              <span className="font-mono tabular-nums font-medium">{formatTime(lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Soil Moisture */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {t.dashboard.soilMoistureTitle}
                  </h2>
                  <p className="text-xs text-slate-500">{t.dashboard.soilMoistureDesc}</p>
                </div>
              </div>
              <FeatureStatusBadge
                state={soilConfig.isCalibrated ? 'Implemented and software-tested' : 'Awaiting calibration'}
              />
            </div>

            {/* Metric Display */}
            <div className="my-4">
              {!isDeviceConnected || !payload ? (
                <div className="text-2xl font-bold font-mono text-slate-400">--</div>
              ) : !payload.soil.valid ? (
                <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Transducer Invalid / Disconnected</span>
                </div>
              ) : payload.soil.moisturePercent !== null ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                      {payload.soil.moisturePercent.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Volumetric Water</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        payload.soil.moisturePercent < soilConfig.warningThresholdPercent
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, payload.soil.moisturePercent)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
                  <div className="font-semibold mb-1">Uncalibrated Soil Sensor</div>
                  <div>Showing raw 12-bit ADC count only. Physical calibration required.</div>
                </div>
              )}
            </div>

            {/* Secondary telemetry metrics */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Raw ADC Count:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {payload?.soil.rawAdc !== null && payload?.soil.rawAdc !== undefined
                  ? `${payload.soil.rawAdc} / 4095`
                  : 'N/A'}
              </span>
            </div>
            <div className="pt-1.5 flex items-center justify-between text-xs text-slate-600">
              <span>Warning Threshold:</span>
              <span className="font-mono tabular-nums text-slate-700">
                &lt; {soilConfig.warningThresholdPercent}%
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('soil')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-emerald-700 hover:text-emerald-900 flex items-center justify-between group"
          >
            <span>View Soil Calibration & Diagnostics</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Card 2: Water Tank Level */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {t.dashboard.waterTankTitle}
                  </h2>
                  <p className="text-xs text-slate-500">{t.dashboard.waterTankDesc}</p>
                </div>
              </div>
              <FeatureStatusBadge
                state={tankConfig.isCalibrated ? 'Implemented and software-tested' : 'Awaiting calibration'}
              />
            </div>

            {/* Metric Display */}
            <div className="my-4">
              {!isDeviceConnected || !payload ? (
                <div className="text-2xl font-bold font-mono text-slate-400">--</div>
              ) : !payload.tank.valid ? (
                <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Echo Timeout / Invalid Distance</span>
                </div>
              ) : payload.tank.levelPercent !== null ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                      {payload.tank.levelPercent.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Reservoir Fullness</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        payload.tank.levelPercent < tankConfig.lowWaterCutoffPercent
                          ? 'bg-rose-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, payload.tank.levelPercent)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
                  <div className="font-semibold mb-1">Unconfigured Tank Dimensions</div>
                  <div>Measured distance is available, but tank capacity % requires depth calibration.</div>
                </div>
              )}
            </div>

            {/* Secondary telemetry metrics */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Acoustic Distance:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {payload?.tank.distanceCm !== null && payload?.tank.distanceCm !== undefined
                  ? `${payload.tank.distanceCm.toFixed(1)} cm`
                  : 'N/A'}
              </span>
            </div>
            <div className="pt-1.5 flex items-center justify-between text-xs text-slate-600">
              <span>Low-Water Cutoff:</span>
              <span className="font-mono tabular-nums text-slate-700">
                &lt; {tankConfig.lowWaterCutoffPercent}%
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('tank')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-blue-700 hover:text-blue-900 flex items-center justify-between group"
          >
            <span>View Tank Geometry & Calibration</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Card 3: ESP32 Node & Pump Safety Status */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {t.dashboard.esp32StatusTitle}
                  </h2>
                  <p className="text-xs text-slate-500">{t.dashboard.esp32StatusDesc}</p>
                </div>
              </div>
              <FeatureStatusBadge state="Implemented and software-tested" />
            </div>

            {/* Connection Info */}
            <div className="my-3 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Node Identifier:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {payload?.deviceId || 'jalamitra-esp32-01'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Network Link:</span>
                <span className="font-medium text-slate-900 flex items-center gap-1.5">
                  {isDeviceConnected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>{t.common.online}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <span>{t.common.offline}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Pump State Lock Banner */}
            <div className="p-2.5 rounded bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">PUMP CONTROL: LOCKED</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Physical relay activation is disabled in this software build pending hardware electrical validation.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('pump')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center justify-between group"
          >
            <span>Review 7-Point Safety Interlocks</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Two-Column Section: Active Alerts and Farmer Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts Box */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-semibold text-slate-900">
                {t.dashboard.alertsTitle}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>{t.common.viewAll} ({alerts.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <span>{t.dashboard.noActiveAlerts}</span>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded border text-xs ${
                    alert.severity === 'critical'
                      ? 'border-rose-200 bg-rose-50 text-rose-950'
                      : alert.severity === 'warning'
                      ? 'border-amber-200 bg-amber-50 text-amber-950'
                      : 'border-blue-200 bg-blue-50 text-blue-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span>{alert.title}</span>
                    <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/70">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-1.5">{alert.description}</p>
                  <div className="text-[11px] font-medium text-slate-800">
                    <span className="font-semibold">Action:</span> {alert.diagnosticStep}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Farmer Advisory Box */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-semibold text-slate-900">
                {t.dashboard.recommendationsTitle}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('recommendations')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>{t.common.viewAll} ({recommendations.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
              <span>No current advisories. System telemetry nominal.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="p-3 rounded border border-slate-200 bg-slate-50 text-xs">
                  <div className="text-slate-900 font-semibold mb-1">
                    {rec.observation}
                  </div>
                  <div className="text-slate-600 mb-1">
                    <strong className="text-slate-800">Impact:</strong> {rec.impact}
                  </div>
                  <div className="text-emerald-800 font-medium">
                    <strong className="text-slate-800">Next Step:</strong> {rec.action}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Engineering Shortcuts */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          {t.dashboard.quickShortcuts}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('history')}
            className="p-3 text-left border border-slate-200 hover:border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <div className="text-xs font-semibold text-slate-900 mb-0.5">
              {t.dashboard.viewHistory}
            </div>
            <div className="text-[11px] text-slate-500">
              Time-series trend curves & CSV export
            </div>
          </button>

          <button
            onClick={() => onNavigate('diagnostics')}
            className="p-3 text-left border border-slate-200 hover:border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <div className="text-xs font-semibold text-slate-900 mb-0.5">
              {t.dashboard.openDiagnostics}
            </div>
            <div className="text-[11px] text-slate-500">
              Cirkit pinouts, logs & transducer tests
            </div>
          </button>

          <button
            onClick={() => onNavigate('about')}
            className="p-3 text-left border border-slate-200 hover:border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <div className="text-xs font-semibold text-slate-900 mb-0.5">
              Major Project Viva & Portfolio
            </div>
            <div className="text-[11px] text-slate-500">
              Architecture specs & evaluation checklist
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
