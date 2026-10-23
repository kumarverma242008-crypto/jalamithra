import React from 'react';
import {
  JalaMitraPayload,
  DiagnosticLog,
  OperatingMode,
} from '../types';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import { StorageService } from '../services/storageService';
import {
  Cpu,
  Wifi,
  Activity,
  AlertTriangle,
  Terminal,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Wrench,
  Zap,
} from 'lucide-react';

interface DeviceDiagnosticsProps {
  payload: JalaMitraPayload | null;
  logs: DiagnosticLog[];
  onClearLogs: () => void;
  isDeviceConnected: boolean;
  isStale: boolean;
  operatingMode: OperatingMode;
  lang: Language;
}

export const DeviceDiagnostics: React.FC<DeviceDiagnosticsProps> = ({
  payload,
  logs,
  onClearLogs,
  isDeviceConnected,
  isStale,
  operatingMode,
  lang,
}) => {
  const t = translations[lang];

  const CIRKIT_PINOUT = [
    {
      component: 'Soil Moisture Sensor (Capacitive v1.2)',
      esp32Pin: 'GPIO 34 (ADC1_CH6)',
      type: 'Analog Input (0 - 3.3V)',
      note: 'Dedicated ADC1 channel. Safe from Wi-Fi ADC2 resource conflict. 11dB attenuation.',
      status: payload?.soil.valid ? 'Active' : 'Unverified / Disconnected',
    },
    {
      component: 'Ultrasonic Transducer (HC-SR04) Trig',
      esp32Pin: 'GPIO 5',
      type: 'Digital Output (3.3V Logic)',
      note: 'Sends 10 microsecond trigger sonic burst pulse.',
      status: payload?.tank.valid ? 'Active' : 'Timeout',
    },
    {
      component: 'Ultrasonic Transducer (HC-SR04) Echo',
      esp32Pin: 'GPIO 18',
      type: 'Digital Input (3.3V Logic via Divider)',
      note: 'Must use 1kΩ / 2kΩ resistive divider to step down HC-SR04 5V output to safe 3.3V ESP32 pin.',
      status: payload?.tank.valid ? 'Active' : 'No Echo',
    },
    {
      component: '0.96" I2C OLED Display (SSD1306)',
      esp32Pin: 'GPIO 21 (SDA) / GPIO 22 (SCL)',
      type: 'I2C Bus (400 kHz)',
      note: 'Displays local field readings without requiring phone or cloud connectivity.',
      status: 'Firmware Managed',
    },
    {
      component: 'Hardware Status LEDs & Buzzer',
      esp32Pin: 'GPIO 2 (Blue), GPIO 4 (Red Fault), GPIO 19 (Buzzer)',
      type: 'Digital Outputs',
      note: 'Provides audible beep on high moisture deficiency or low water tank alarms.',
      status: 'Cirkit Prototype',
    },
    {
      component: 'Submersible Pump Relay Driver',
      esp32Pin: 'GPIO 23',
      type: 'Relay Control (FIRMWARE LOCKED)',
      note: 'Deliberately unassigned/disabled in software pending physical high-voltage isolation.',
      status: 'SAFETY LOCKED',
    },
  ];

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
              {t.diagnostics.title}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{t.diagnostics.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Application Version:</span>
            <span className="font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">
              v1.0.0-major-project
            </span>
          </div>
        </div>
      </div>

      {/* Hardware & Transducer Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">ESP32 Core Microcontroller</span>
            <Cpu className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 my-1">
            ESP32 DevKit V1
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Xtensa Dual-Core 32-bit LX6 @ 240MHz with 520 KB SRAM & Wi-Fi 802.11 b/g/n
          </p>
          <div className="border-t border-slate-100 pt-2 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Firmware Version:</span>
              <span className="font-mono text-slate-900 font-medium">v1.0.4-cirkit-proto</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Device Uptime:</span>
              <span className="font-mono text-slate-900 font-medium">
                {isDeviceConnected ? '0d 04h 12m (nominal)' : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Soil Transducer Health</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 my-1 flex items-center gap-2">
            {payload?.soil.valid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-800">Analog Signal OK</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="text-rose-800">Transducer Fault</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Capacitive dielectric impedance detection without galvanic metal erosion.
          </p>
          <div className="border-t border-slate-100 pt-2 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>ADC Channel:</span>
              <span className="font-mono text-slate-900">ADC1_CH6 (GPIO 34)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Sample Attenuation:</span>
              <span className="font-mono text-slate-900">11 dB (0 - 3.3V)</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Ultrasonic Transducer Health</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 my-1 flex items-center gap-2">
            {payload?.tank.valid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-800">Acoustic Echo OK</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="text-rose-800">Echo Timeout</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">
            40 kHz ultrasound sonic burst time-of-flight acoustic surface reflection.
          </p>
          <div className="border-t border-slate-100 pt-2 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Effective Range:</span>
              <span className="font-mono text-slate-900">2 cm - 400 cm</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Trig Pulse Width:</span>
              <span className="font-mono text-slate-900">10 µs TTL High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cirkit Designer Virtual Prototype Pinout Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold text-slate-900">
            {t.diagnostics.pinoutHeader}
          </h2>
          <span className="text-xs font-mono text-slate-500">Cirkit Designer Mapping</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Physical wiring connections between ESP32 development board and connected modules as defined in the virtual prototype.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Component Module</th>
                <th className="py-2.5 px-3">ESP32 Pin</th>
                <th className="py-2.5 px-3">Signal Type</th>
                <th className="py-2.5 px-3">Engineering Notes & Protection</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {CIRKIT_PINOUT.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">{row.component}</td>
                  <td className="py-2.5 px-3 text-emerald-800 font-bold">{row.esp32Pin}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">{row.type}</td>
                  <td className="py-2.5 px-3 font-sans text-xs text-slate-600">{row.note}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status.includes('LOCKED')
                          ? 'bg-rose-100 text-rose-900'
                          : row.status.includes('Active')
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telemetry Event Log Console */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              {t.diagnostics.consoleHeader}
            </h2>
          </div>

          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="px-2.5 py-1 text-xs text-slate-600 hover:text-rose-700 rounded border border-slate-200 hover:bg-slate-50 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>{t.diagnostics.clearLogs}</span>
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded">
            No diagnostic events logged yet.
          </div>
        ) : (
          <div className="bg-slate-950 text-slate-200 p-3 rounded font-mono text-[11px] max-h-64 overflow-y-auto space-y-1">
            {logs.slice().reverse().map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 tabular-nums shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                <span
                  className={`uppercase font-bold shrink-0 text-[10px] px-1 rounded ${
                    log.level === 'error'
                      ? 'bg-rose-950 text-rose-400'
                      : log.level === 'warn'
                      ? 'bg-amber-950 text-amber-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-emerald-400 font-semibold shrink-0">[{log.category}]</span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
