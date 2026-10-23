import React, { useState } from 'react';
import {
  TankTelemetry,
  TankCalibrationConfig,
  OperatingMode,
} from '../types';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import { CalibrationEngine } from '../services/calibrationEngine';
import {
  Waves,
  Sliders,
  AlertTriangle,
  Info,
  Wrench,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface TankMonitoringProps {
  tank: TankTelemetry | null;
  config: TankCalibrationConfig;
  onSaveConfig: (config: TankCalibrationConfig) => void;
  lang: Language;
  operatingMode: OperatingMode;
  lastUpdated: string | null;
}

export const TankMonitoring: React.FC<TankMonitoringProps> = ({
  tank,
  config,
  onSaveConfig,
  lang,
  operatingMode,
  lastUpdated,
}) => {
  const t = translations[lang];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tankDepth, setTankDepth] = useState<number>(config.tankTotalDepthCm);
  const [blindZone, setBlindZone] = useState<number>(config.sensorBlindZoneCm);
  const [cutoff, setCutoff] = useState<number>(config.lowWaterCutoffPercent);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenModal = () => {
    setTankDepth(config.tankTotalDepthCm);
    setBlindZone(config.sensorBlindZoneCm);
    setCutoff(config.lowWaterCutoffPercent);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveConfig = () => {
    const newConfig: TankCalibrationConfig = {
      isCalibrated: true,
      tankTotalDepthCm: Number(tankDepth),
      sensorBlindZoneCm: Number(blindZone),
      lowWaterCutoffPercent: Number(cutoff),
      lastCalibratedAt: new Date().toISOString(),
    };

    const validation = CalibrationEngine.validateTankConfig(newConfig);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
      return;
    }

    onSaveConfig(newConfig);
    setIsModalOpen(false);
  };

  const handleResetConfig = () => {
    const resetConfig: TankCalibrationConfig = {
      isCalibrated: false,
      tankTotalDepthCm: 100,
      sensorBlindZoneCm: 5,
      lowWaterCutoffPercent: 20,
      lastCalibratedAt: null,
    };
    onSaveConfig(resetConfig);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{t.appSubtitle}</span>
              <span aria-hidden="true">·</span>
              <FeatureStatusBadge
                state={config.isCalibrated ? 'Implemented and software-tested' : 'Awaiting calibration'}
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t.tank.title}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{t.tank.subtitle}</p>
          </div>

          <button
            onClick={handleOpenModal}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <Sliders className="w-4 h-4" />
            <span>Configure Tank Dimensions</span>
          </button>
        </div>
      </div>

      {/* Unconfigured Notice Banner */}
      {!config.isCalibrated && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Tank Geometry Not Configured</span>
            <p>{t.tank.uncalibratedNotice}</p>
            <p className="text-[11px] text-amber-800">
              Measured acoustic distance (cm) is shown directly from the sensor. Fill percentage remains unverified until tank height is configured.
            </p>
          </div>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Measured Acoustic Distance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">{t.tank.distanceTitle}</span>
            <span className="text-[11px] font-mono text-slate-400">Time-of-Flight</span>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 my-2">
            {tank?.distanceCm !== null && tank?.distanceCm !== undefined ? (
              `${tank.distanceCm.toFixed(1)} cm`
            ) : (
              <span className="text-rose-600 text-lg">Echo Loss</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">{t.tank.distanceDesc}</p>
          <div className="text-xs border-t border-slate-100 pt-2 flex items-center justify-between text-slate-600">
            <span>Acoustic Validity:</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                tank?.valid ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {tank?.valid ? 'Valid Echo' : 'Invalid / Timeout'}
            </span>
          </div>
        </div>

        {/* Metric 2: Estimated Water Level % */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">{t.tank.levelPercentTitle}</span>
            <span className="text-[11px] font-mono text-slate-400">Fill Capacity</span>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 my-2">
            {tank?.levelPercent !== null && tank?.levelPercent !== undefined ? (
              `${tank.levelPercent.toFixed(1)}%`
            ) : (
              <span className="text-sm font-sans font-medium text-amber-700">Unconfigured</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">
            {config.isCalibrated
              ? `Calculated based on configured tank depth of ${config.tankTotalDepthCm} cm.`
              : 'Requires total tank height and mounting clearance.'}
          </p>
          <div className="text-xs border-t border-slate-100 pt-2 flex items-center justify-between text-slate-600">
            <span>Geometry Status:</span>
            <span className="font-semibold text-slate-800">
              {config.isCalibrated ? t.common.calibrated : t.common.uncalibrated}
            </span>
          </div>
        </div>

        {/* Metric 3: Low-Water Cutoff Limit */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">{t.tank.lowWaterThresholdTitle}</span>
            <span className="text-[11px] font-mono text-slate-400">Safety Limit</span>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 my-2">
            &lt; {config.lowWaterCutoffPercent}%
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Future pump interlock will strictly lockout motor if tank falls below this point to prevent dry-running.
          </p>
          <div className="text-xs border-t border-slate-100 pt-2 flex items-center justify-between text-slate-600">
            <span>Last Configured:</span>
            <span className="font-mono text-slate-700">
              {config.lastCalibratedAt ? new Date(config.lastCalibratedAt).toLocaleDateString() : t.common.never}
            </span>
          </div>
        </div>
      </div>

      {/* Engineering Reference & Troubleshooting Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-4 h-4 text-slate-700" />
          <h2 className="text-base font-semibold text-slate-900">
            {t.tank.troubleshootHeader}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">1. Ultrasonic Echo Loss & Timeouts</div>
            <p className="text-slate-600">{t.tank.tips.echoFail}</p>
            <p className="text-slate-500">
              If Trig pin does not generate a 10µs pulse or Echo pin wire is loose, pulseIn() on ESP32 times out and returns 0 / null.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">2. HC-SR04 Acoustic Blind Zone (&lt; 2 cm)</div>
            <p className="text-slate-600">{t.tank.tips.blindZone}</p>
            <p className="text-slate-500">
              The transducer requires ~115µs for acoustic ringing to settle. If water touches the sensor face, echo reflections bounce erratically.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">3. Surface Ripples, Foam & Stilling Wells</div>
            <p className="text-slate-600">{t.tank.tips.surfaceWaves}</p>
            <p className="text-slate-500">
              In agricultural water sumps, incoming pipe water churns foam. Installing an open PVC stilling pipe dampens waves and guides acoustic reflections cleanly.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">4. Voltage Level Shifting (5V Echo to 3.3V GPIO)</div>
            <p className="text-slate-600">{t.tank.tips.powerBounce}</p>
            <p className="text-slate-500">
              HC-SR04 runs on 5V VCC and outputs a 5V logic signal on Echo. Connect Echo through a voltage divider (1kΩ and 2kΩ resistors) to feed safe 3.3V logic to the ESP32 GPIO.
            </p>
          </div>
        </div>
      </div>

      {/* Geometry Calibration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="bg-white rounded-lg border border-slate-300 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {t.tank.calibrationModalTitle}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none font-bold"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900">
                <strong>Error:</strong> {errorMsg}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t.tank.tankDepthCm}
                </label>
                <input
                  type="number"
                  min="15"
                  max="2000"
                  value={tankDepth}
                  onChange={(e) => setTankDepth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-slate-500 mt-1">{t.tank.tankDepthCmHelp}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t.tank.sensorBlindZoneCm}
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={blindZone}
                  onChange={(e) => setBlindZone(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-slate-500 mt-1">{t.tank.sensorBlindZoneCmHelp}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t.tank.lowWaterThresholdInput}
                </label>
                <input
                  type="number"
                  min="5"
                  max="80"
                  value={cutoff}
                  onChange={(e) => setCutoff(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-slate-500 mt-1">Recommended for pump motor dry-run protection: 20%.</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                onClick={handleResetConfig}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors"
              >
                Reset Geometry
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded"
                >
                  Save Tank Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
