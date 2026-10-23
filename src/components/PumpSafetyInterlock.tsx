import React from 'react';
import { OperatingMode, TankCalibrationConfig } from '../types';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import {
  Lock,
  ShieldAlert,
  AlertTriangle,
  Zap,
  CheckSquare,
  XCircle,
  HelpCircle,
  Cpu,
  PowerOff,
} from 'lucide-react';

interface PumpSafetyInterlockProps {
  tankConfig: TankCalibrationConfig;
  operatingMode: OperatingMode;
  lang: Language;
}

export const PumpSafetyInterlock: React.FC<PumpSafetyInterlockProps> = ({
  tankConfig,
  operatingMode,
  lang,
}) => {
  const t = translations[lang];

  const SAFETY_PREREQUISITES = [
    {
      title: '1. Optocoupler Isolation & Flyback Suppression',
      description:
        'Relay coil switching generates a reverse EMF inductive kickback (hundreds of volts) that instantly resets or destroys the ESP32 silicon without an optoisolator (e.g. PC817) and reverse-biased freewheeling flyback diode (1N4007).',
      status: 'Awaiting physical testing',
    },
    {
      title: '2. Dedicated Auxiliary Power Rail & Decoupling',
      description:
        'Submersible DC pump startup inrush current can exceed 3x-5x continuous running current (e.g. 2A inrush on a 500mA motor). Powering motors from the ESP32 5V/VIN pin triggers brownout detector resets. Motors must use an isolated external power supply with common ground.',
      status: 'Awaiting hardware integration',
    },
    {
      title: '3. Hardwired Mechanical Float Switch Interlock',
      description:
        'Software-only dry-run protection via ultrasonic distance is insufficient if the ultrasonic sensor suffers an echo timeout or power fault. A hardware float switch must be wired in series with the relay coil so pump power is physically broken if reservoir water drops.',
      status: 'Planned future functionality',
    },
    {
      title: '4. Active-High vs Active-Low Relay Logic Verification',
      description:
        'Many cheap hobby relay boards are active-LOW (relay energizes when GPIO is driven LOW 0V). During ESP32 boot, GPIO pins float or pulse temporarily, which would accidentally turn on the pump during reboot unless pull-up/pull-down resistors and safe pin selection (avoid bootstrapping pins) are verified.',
      status: 'Awaiting physical testing',
    },
    {
      title: '5. Physical Emergency-Stop Push Button (E-Stop)',
      description:
        'A normally-closed (NC) mushroom-head mechanical latching emergency-stop switch must be installed on the field electrical enclosure to allow instantaneous human cutoff during water pipe bursts or electrical faults.',
      status: 'Planned future functionality',
    },
    {
      title: '6. Firmware Watchdog & Maximum Run Duration Timer',
      description:
        'Autonomous irrigation must enforce a strict fail-safe maximum runtime limit (e.g. 15 minutes hard timeout in ESP32 FreeRTOS watchdog task) so a loss of Wi-Fi communication never leaves a pump running indefinitely.',
      status: 'Implemented and software-tested',
    },
    {
      title: '7. Motor Current Sense Feedback (CT Sensor)',
      description:
        'The application must not claim "pump is running" merely because the relay command was asserted. Real running feedback requires a Hall-effect current sensor (ACS712) or pressure transducer.',
      status: 'Planned future functionality',
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
              <FeatureStatusBadge state="Planned future functionality" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t.pump.title}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{t.pump.subtitle}</p>
          </div>

          <div className="px-3 py-1.5 rounded bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 self-start md:self-auto">
            <Lock className="w-4 h-4 text-rose-700" />
            <span>RELAY COMMANDS FIRMWARE-LOCKED</span>
          </div>
        </div>
      </div>

      {/* Mandatory Safety Notice Box */}
      <div className="bg-rose-50 border border-rose-300 rounded-lg p-5 text-rose-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
          <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
          <span>Why Pump Control is Deliberately Disabled in JalaMitra v1.0</span>
        </div>
        <p className="text-xs text-rose-900 leading-relaxed">
          {t.pump.safetyReason}
        </p>
        <p className="text-xs text-rose-800">
          In real-world agricultural IoT engineering, dry-run protection and high-voltage motor control require hardware interlocks, not merely UI button toggles. No relay activation commands are sent to the ESP32 in this version.
        </p>
      </div>

      {/* Mock Disabled Interface to demonstrate future UX safely */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Future Pump Control Console (Non-Functional Mock for Evaluators)
            </h2>
            <p className="text-xs text-slate-500">
              All controls below are permanently inert and disabled in code.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            DISABLED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60 pointer-events-none select-none">
          <div className="p-4 rounded border border-slate-200 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500">Manual Pump Start</span>
            <button
              disabled
              className="mt-2 w-full py-2 bg-slate-300 text-slate-500 rounded text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>Pump Start (Locked)</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-1">Requires hardware interlock bypass key.</p>
          </div>

          <div className="p-4 rounded border border-slate-200 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500">Automatic Irrigation Mode</span>
            <button
              disabled
              className="mt-2 w-full py-2 bg-slate-300 text-slate-500 rounded text-xs font-bold cursor-not-allowed"
            >
              Autonomous Scheduling (Locked)
            </button>
            <p className="text-[11px] text-slate-400 mt-1">Requires tested soil calibration.</p>
          </div>

          <div className="p-4 rounded border border-slate-200 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500">Emergency Stop Signal</span>
            <button
              disabled
              className="mt-2 w-full py-2 bg-rose-200 text-rose-400 rounded text-xs font-bold cursor-not-allowed"
            >
              Emergency Halt
            </button>
            <p className="text-[11px] text-slate-400 mt-1">Physical E-Stop switch must be used.</p>
          </div>
        </div>
      </div>

      {/* 7-Point Safety Interlock Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          7-Point Hardware Verification & Interlock Matrix
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          The physical hardware system must be audited and verified against every item below before pump activation can be considered in future revisions.
        </p>

        <div className="space-y-3">
          {SAFETY_PREREQUISITES.map((item, index) => (
            <div
              key={index}
              className="p-3.5 rounded border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-slate-900">{item.title}</span>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="shrink-0 self-start sm:self-auto">
                <FeatureStatusBadge state={item.status as any} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
