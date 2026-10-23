import React, { useState } from 'react';
import {
  SoilTelemetry,
  SoilCalibrationConfig,
  OperatingMode,
} from '../types';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import { CalibrationEngine } from '../services/calibrationEngine';
import {
  Droplet,
  Sliders,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SoilMonitoringProps {
  soil: SoilTelemetry | null;
  config: SoilCalibrationConfig;
  onSaveConfig: (config: SoilCalibrationConfig) => void;
  lang: Language;
  operatingMode: OperatingMode;
  lastUpdated: string | null;
}

export const SoilMonitoring: React.FC<SoilMonitoringProps> = ({
  soil,
  config,
  onSaveConfig,
  lang,
  operatingMode,
  lastUpdated,
}) => {
  const t = translations[lang];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [airAdc, setAirAdc] = useState<number>(config.airAdcDry);
  const [waterAdc, setWaterAdc] = useState<number>(config.waterAdcWet);
  const [threshold, setThreshold] = useState<number>(config.warningThresholdPercent);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenModal = () => {
    setAirAdc(config.airAdcDry);
    setWaterAdc(config.waterAdcWet);
    setThreshold(config.warningThresholdPercent);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveCalibration = () => {
    const newConfig: SoilCalibrationConfig = {
      isCalibrated: true,
      airAdcDry: Number(airAdc),
      waterAdcWet: Number(waterAdc),
      warningThresholdPercent: Number(threshold),
      lastCalibratedAt: new Date().toISOString(),
    };

    const validation = CalibrationEngine.validateSoilConfig(newConfig);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
      return;
    }

    onSaveConfig(newConfig);
    setIsModalOpen(false);
  };

  const handleResetCalibration = () => {
    const resetConfig: SoilCalibrationConfig = {
      isCalibrated: false,
      airAdcDry: 3200,
      waterAdcWet: 1400,
      warningThresholdPercent: 30,
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
              {t.soil.title}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{t.soil.subtitle}</p>
          </div>

          <button
            onClick={handleOpenModal}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <Sliders className="w-4 h-4" />
            <span>{t.common.calibrate}</span>
          </button>
        </div>
      </div>

      {/* Uncalibrated Notice Banner if applicable */}
      {!config.isCalibrated && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Calibration Incomplete</span>
            <p>{t.soil.uncalibratedNotice}</p>
            <p className="text-[11px] text-amber-800">
              Raw ADC counts are shown directly below. Calculated percentage remains unverified until you perform 2-point reference calibration.
            </p>
          </div>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Raw ADC Output */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">{t.soil.rawAdcTitle}</span>
            <span className="text-[11px] font-mono text-slate-400">12-Bit SAR</span>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 my-2">
            {soil?.rawAdc !== null && soil?.rawAdc !== undefined ? soil.rawAdc : '--'}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1.5">/ 4095 counts</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">{t.soil.rawAdcDescription}</p>
          <div className="text-xs border-t border-slate-100 pt-2 flex items-center justify-between text-slate-600">
            <span>Transducer Validity:</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                soil?.valid ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {soil?.valid ? 'Valid Range' : 'Invalid / Short'}
            </span>
          </div>
        </div>

        {/* Metric 2: Calculated Soil Moisture % */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">{t.soil.calibratedPercentTitle}</span>
            <span className="text-[11px] font-mono text-slate-400">Volumetric %</span>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 my-2">
            {soil?.moisturePercent !== null && soil?.moisturePercent !== undefined ? (
              `${soil.moisturePercent.toFixed(1)}%`
            ) : (
              <span className="text-sm font-sans font-medium text-amber-700">Uncalibrated</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">
            {config.isCalibrated
              ? 'Derived via linear interpolation between calibrated Air & Water reference counts.'
              : 'Requires Air ADC (dry) and Water ADC (wet) points.'}
          </p>
          <div className="text-xs border-t border-slate-100 pt-2 flex items-center justify-between text-slate-600">
            <span>Calibration Status:</span>
            <span className="font-semibold text-slate-800">
              {config.isCalibrated ? t.common.calibrated : t.common.uncalibrated}
            </span>
          </div>
        </div>

        {/* Metric 3: Warning Threshold */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">{t.soil.warningThresholdTitle}</span>
            <span className="text-[11px] font-mono text-slate-400">Trigger Limit</span>
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 my-2">
            &lt; {config.warningThresholdPercent}%
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Alert is triggered when moisture falls below this level. Pump control is disabled.
          </p>
          <div className="text-xs border-t border-slate-100 pt-2 flex items-center justify-between text-slate-600">
            <span>Last Calibrated:</span>
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
            {t.soil.troubleshootHeader}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">1. Reading Fluctuation & Air Gaps</div>
            <p className="text-slate-600">{t.soil.tips.fluctuation}</p>
            <p className="text-slate-500">{t.soil.tips.airGap}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">2. ESP32 ADC1 vs ADC2 & Non-Linearity</div>
            <p className="text-slate-600">{t.soil.tips.adcRange}</p>
            <p className="text-slate-500">
              Always use ADC1 channels (GPIO 32 - 39). ADC2 channels (GPIO 0, 2, 4, 12-15, 25-27) are shared with the Wi-Fi subsystem and cannot be sampled while Wi-Fi is active.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">3. Capacitive vs Resistive Probes</div>
            <p className="text-slate-600">
              Resistive probes experience rapid copper trace electrolysis and corrosion within weeks of DC excitation. JalaMitra specifies capacitive probes (e.g. v1.2 / v2.0) with conformal coating on probe edges.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">4. Soil Salinity & Temperature Drift</div>
            <p className="text-slate-600">{t.soil.tips.salinity}</p>
            <p className="text-slate-500">
              Black cotton soils and red loam have distinct dielectric constants; perform 2-point calibration in the actual field soil type for optimal accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* Calibration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="bg-white rounded-lg border border-slate-300 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {t.soil.calibrationModalTitle}
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
                  {t.soil.dryAirAdc}
                </label>
                <input
                  type="number"
                  min="0"
                  max="4095"
                  value={airAdc}
                  onChange={(e) => setAirAdc(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-slate-500 mt-1">{t.soil.dryAirAdcHelp}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t.soil.wetWaterAdc}
                </label>
                <input
                  type="number"
                  min="0"
                  max="4095"
                  value={waterAdc}
                  onChange={(e) => setWaterAdc(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-slate-500 mt-1">{t.soil.wetWaterAdcHelp}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  {t.soil.thresholdInput}
                </label>
                <input
                  type="number"
                  min="5"
                  max="95"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-slate-500 mt-1">Recommended for vegetable/horticulture crops: 30%.</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                onClick={handleResetCalibration}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors"
              >
                Reset Calibration
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleSaveCalibration}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded"
                >
                  {t.soil.saveCalibration}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
