import React, { useState } from 'react';
import {
  Esp32ConnectionConfig,
  OperatingMode,
  JalaMitraPayload,
} from '../types';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import {
  DATA_CONTRACT_SPEC,
  validateJalaMitraPayload,
  SAMPLE_PAYLOADS,
  ValidationResult,
} from '../services/dataContract';
import { Esp32Service } from '../services/esp32Service';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code2,
  Shield,
  Clock,
  Terminal,
  Send,
  HelpCircle,
} from 'lucide-react';

interface Esp32ConnectivityProps {
  config: Esp32ConnectionConfig;
  onSaveConfig: (config: Esp32ConnectionConfig) => void;
  connectionState: string;
  isStale: boolean;
  lastUpdated: string | null;
  errorCount: number;
  lastErrorMessage: string | null;
  operatingMode: OperatingMode;
  lang: Language;
}

export const Esp32Connectivity: React.FC<Esp32ConnectivityProps> = ({
  config,
  onSaveConfig,
  connectionState,
  isStale,
  lastUpdated,
  errorCount,
  lastErrorMessage,
  operatingMode,
  lang,
}) => {
  const t = translations[lang];

  const [endpointUrl, setEndpointUrl] = useState(config.endpointUrl);
  const [deviceId, setDeviceId] = useState(config.deviceId);
  const [pollingInterval, setPollingInterval] = useState(config.pollingIntervalSeconds);
  const [timeoutMs, setTimeoutMs] = useState(config.timeoutMs);
  const [isSaved, setIsSaved] = useState(false);

  // Payload Testing Sandbox
  const [testPayloadJson, setTestPayloadJson] = useState<string>(
    JSON.stringify(SAMPLE_PAYLOADS.validCalibrated, null, 2)
  );
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Esp32ConnectionConfig = {
      ...config,
      endpointUrl,
      deviceId,
      pollingIntervalSeconds: Number(pollingInterval),
      timeoutMs: Number(timeoutMs),
    };
    onSaveConfig(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleManualPoll = async () => {
    const service = Esp32Service.getInstance();
    await service.fetchFromLiveEndpoint({
      endpointUrl,
      deviceId,
      pollingIntervalSeconds: Number(pollingInterval),
      timeoutMs: Number(timeoutMs),
      autoReconnect: false,
    });
  };

  const handleRunValidation = () => {
    try {
      const parsed = JSON.parse(testPayloadJson);
      const res = validateJalaMitraPayload(parsed);
      setValidationResult(res);
      if (res.isValid && res.sanitizedPayload) {
        // Also feed into service for interactive simulation
        Esp32Service.getInstance().ingestPayload(res.sanitizedPayload, res.sanitizedPayload.source);
      }
    } catch (err: any) {
      setValidationResult({
        isValid: false,
        errors: [`JSON Syntax Error: ${err.message}`],
        warnings: [],
        sanitizedPayload: null,
      });
    }
  };

  const handleLoadSample = (sampleKey: keyof typeof SAMPLE_PAYLOADS) => {
    const sample = SAMPLE_PAYLOADS[sampleKey];
    setTestPayloadJson(JSON.stringify(sample, null, 2));
    setValidationResult(null);
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
              <FeatureStatusBadge state="Implemented and software-tested" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t.nav.liveMonitoring} (ESP32 Ingress)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              REST HTTP endpoint configuration, telemetry contract validator, and network status
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualPoll}
              disabled={operatingMode === 'demo'}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.common.refreshNow}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Network Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-semibold text-slate-500">Connection State</div>
          <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            {connectionState === 'connected' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">{t.common.connected}</span>
              </>
            ) : connectionState === 'connecting' ? (
              <>
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-blue-700">Connecting...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-600" />
                <span className="text-rose-700">{t.common.disconnected}</span>
              </>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-semibold text-slate-500">Data Freshness</div>
          <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            {isStale ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700">Stale (&gt;30s)</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Fresh Telemetry</span>
              </>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-semibold text-slate-500">Communication Errors</div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-1">
            {errorCount}
            <span className="text-xs font-sans text-slate-500 ml-1 font-normal">dropped packets</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-semibold text-slate-500">Active Data Mode</div>
          <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
            {operatingMode === 'demo' ? 'SIMULATED' : 'LIVE REST'}
          </div>
        </div>
      </div>

      {lastErrorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-950 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div>
            <strong>Network Error:</strong> {lastErrorMessage}
          </div>
        </div>
      )}

      {/* Two Columns: Settings Form & Interactive Contract Validator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form: Endpoint Configuration */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            ESP32 Network Endpoint Configuration
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Configure target HTTP REST address for future local Wi-Fi communication with the ESP32 node.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                ESP32 HTTP Telemetry URL
              </label>
              <input
                type="text"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="http://192.168.4.1/api/telemetry"
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Default SoftAP IP is 192.168.4.1, or assign a local DHCP static IP in your farm router.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Device Identifier
                </label>
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Polling Interval (Seconds)
                </label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={pollingInterval}
                  onChange={(e) => setPollingInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Request Timeout (ms)
              </label>
              <input
                type="number"
                min="1000"
                max="10000"
                step="500"
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isSaved ? (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Settings saved successfully!
                </span>
              ) : <span />}
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs transition-colors"
              >
                Save Network Config
              </button>
            </div>
          </form>

          {/* Network Notes */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800">Browser Security & CORS Requirements:</div>
            <p>
              When running in a web browser, polling an ESP32 on a local network requires the ESP32 firmware to serve CORS headers: <code>Access-Control-Allow-Origin: *</code> and handle <code>OPTIONS</code> preflight requests.
            </p>
            <p>
              If your web app is hosted over HTTPS, modern browsers enforce Mixed Content blocking on plain HTTP local IPs. In that case, use the payload ingress tester below or run a secure local gateway.
            </p>
          </div>
        </div>

        {/* Interactive Contract Validator & Test Sandbox */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Data Contract Inspector & Ingress Tester
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                JSON Schema v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Test real payloads from ESP32 Serial/HTTP or evaluate system responses against edge cases.
            </p>

            {/* Quick Test Sample Loaders */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
              <span className="text-slate-500 font-medium">Load Preset:</span>
              <button
                onClick={() => handleLoadSample('validCalibrated')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700"
              >
                Valid
              </button>
              <button
                onClick={() => handleLoadSample('uncalibratedRaw')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700"
              >
                Raw ADC
              </button>
              <button
                onClick={() => handleLoadSample('hardwareFault')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700"
              >
                Sensor Fault
              </button>
              <button
                onClick={() => handleLoadSample('malformedInvalid')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-rose-700"
              >
                Malformed
              </button>
            </div>

            {/* Code Editor Area */}
            <textarea
              rows={9}
              value={testPayloadJson}
              onChange={(e) => setTestPayloadJson(e.target.value)}
              className="w-full p-2.5 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              spellCheck={false}
            />

            {/* Validation Outcome Output */}
            {validationResult && (
              <div
                className={`mt-3 p-3 rounded text-xs border ${
                  validationResult.isValid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {validationResult.isValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Payload Accepted & Ingested Successfully!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-700" />
                      <span>Validation Rejected ({validationResult.errors.length} errors)</span>
                    </>
                  )}
                </div>

                {validationResult.errors.length > 0 && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {validationResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}

                {validationResult.warnings.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-amber-900 text-[11px]">
                    <strong>Warnings:</strong> {validationResult.warnings.join(' | ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleRunValidation}
            className="mt-4 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Validate Payload & Update Telemetry</span>
          </button>
        </div>
      </div>

      {/* Documented Schema Specifications Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Sensor Data Contract Field Dictionary & Units
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          All fields exchanged between ESP32 firmware and web client adhere to this schema.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Field Path</th>
                <th className="py-2.5 px-3">Type & Range</th>
                <th className="py-2.5 px-3">Engineering Unit</th>
                <th className="py-2.5 px-3">Description & Requirements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {DATA_CONTRACT_SPEC.fields.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{f.name}</td>
                  <td className="py-2.5 px-3 text-slate-700">{f.type}</td>
                  <td className="py-2.5 px-3 text-slate-600">{f.unit || '—'}</td>
                  <td className="py-2.5 px-3 font-sans text-xs text-slate-600">{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
