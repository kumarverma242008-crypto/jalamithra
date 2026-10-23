import React from 'react';
import { translations, Language } from '../locales/i18n';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import {
  CheckCircle2,
  Layers,
  Cpu,
  ShieldCheck,
  Award,
  BookOpen,
  FileText,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface AboutProjectProps {
  lang: Language;
}

export const AboutProject: React.FC<AboutProjectProps> = ({ lang }) => {
  const t = translations[lang];

  const FEATURE_MATRIX = [
    {
      feature: 'Professional Agricultural Dashboard',
      description: 'Real-time telemetry cards, soil moisture, water level, and connection status.',
      status: 'Implemented and software-tested',
    },
    {
      feature: 'Soil Moisture Monitoring & 2-Point Calibration',
      description: 'Raw 12-bit ADC tracking, dry/wet 2-point calibration engine, and dry soil alerts.',
      status: 'Implemented and software-tested',
    },
    {
      feature: 'Water Tank Monitoring & Geometry Calibration',
      description: 'HC-SR04 ultrasonic distance measurement, tank depth configuration, and low-water cutoff.',
      status: 'Implemented and software-tested',
    },
    {
      feature: 'ESP32 REST Telemetry Contract & Ingress Validator',
      description: 'Strict JSON schema validation, timeout handling, stale data detection, and sample payload testing.',
      status: 'Implemented and software-tested',
    },
    {
      feature: 'Dual English & Telugu (తెలుగు) Localization',
      description: 'Bilingual user experience tailored for Telangana farmers and engineering evaluators.',
      status: 'Implemented and software-tested',
    },
    {
      feature: 'Demonstration Simulator with 5 Field Presets',
      description: 'Isolated test scenarios (Normal, Dry Soil, Low Tank, Hardware Fault, Uncalibrated).',
      status: 'Demonstration-only',
    },
    {
      feature: 'Historical Analytics & CSV Data Export',
      description: 'SVG time-series curves, min/max statistics, and RFC-4180 CSV export.',
      status: 'Implemented and software-tested',
    },
    {
      feature: 'Cirkit Designer Virtual Prototype Mapping',
      description: 'Complete pinout specification and virtual hardware wiring documentation.',
      status: 'Awaiting hardware integration',
    },
    {
      feature: 'Physical Sensor Field Calibration',
      description: 'Soil probe calibration in local field soil and ultrasonic mounting depth alignment.',
      status: 'Awaiting calibration',
    },
    {
      feature: 'Pump Relay Electrical Safety Interlock',
      description: 'Optocoupler isolation, flyback diode, inrush current rating, and E-Stop switch.',
      status: 'Awaiting physical testing',
    },
    {
      feature: 'Autonomous Closed-Loop Pump Irrigation',
      description: 'Automated relay activation based on soil moisture thresholds with hardware dry-run cutoff.',
      status: 'Planned future functionality',
    },
    {
      feature: 'Weather Forecast & Solar/Battery Telemetry',
      description: 'Rain prediction integration and solar charging ADC monitoring.',
      status: 'Planned future functionality',
    },
  ];

  const VIVA_QUESTIONS = [
    {
      q: 'Why does JalaMitra use ESP32 ADC1 instead of ADC2 for the soil sensor?',
      a: 'On the ESP32, ADC2 is internally multiplexed and shared with the Wi-Fi transceiver subsystem. When Wi-Fi is active (scanning, connecting, or transmitting packets), ADC2 analog readings fail and return error values. ADC1 (GPIOs 32-39) operates independently of Wi-Fi.',
    },
    {
      q: 'Why is pump activation disabled in the software dashboard?',
      a: 'Engineering safety first: the current prototype has only been simulated in Cirkit Designer and has not undergone electrical bench testing. Running an untested motor relay risks high-voltage kickback destroying the MCU, motor dry-running, or electrical hazards. Safety interlocks must be hardware-verified before activation.',
    },
    {
      q: 'Why are raw ADC values shown instead of unverified percentages when uncalibrated?',
      a: 'Different soils (clay, loam, sand) have vastly different dielectric constants and conductivity. Assuming a universal percentage from a raw ADC count is misleading and dangerous. JalaMitra requires an explicit 2-point reference calibration (Air & Water) before reporting volumetric moisture percentage.',
    },
    {
      q: 'What is the acoustic blind zone on the HC-SR04 ultrasonic sensor?',
      a: 'The HC-SR04 has a 2 cm - 5 cm physical dead band. When ultrasonic bursts are emitted, transducer membrane ringing takes ~115 µs to dissipate. Water closer than 2 cm reflects while the transducer is still ringing, causing erratic or lost echo readings. The sensor must be mounted with clearance above the maximum water mark.',
    },
    {
      q: 'How does JalaMitra handle network failures and stale data?',
      a: 'The application implements strict timeout handling (configurable, default 4000ms), tracks communication error counters, flags data as Stale if no reading is received for >30 seconds, and never silently falls back from failed live polling to fake simulated data.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>B.Tech / B.E. Major Project</span>
              <span aria-hidden="true">·</span>
              <FeatureStatusBadge state="Implemented and software-tested" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t.about.title}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{t.about.subtitle}</p>
          </div>

          <div className="text-xs font-mono bg-slate-100 text-slate-800 px-3 py-1.5 rounded border border-slate-200 self-start md:self-auto">
            Project Code: JALAMITRA-2026
          </div>
        </div>
      </div>

      {/* Project Overview & Problem Statement */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <span>{t.about.projectOverview}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">1. Problem Statement</h3>
            <p>
              In agricultural regions of Telangana and Andhra Pradesh, smallholder farmers face severe water management challenges:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>
                <strong>Borewell & Sump Dry-Running:</strong> Agricultural pumps running when reservoir or groundwater levels deplete suffer pump impeller cavitation and motor winding burnout, resulting in costly motor rewinding expenses.
              </li>
              <li>
                <strong>Over-Irrigation:</strong> Surface flooding without soil moisture telemetry leads to root-zone hypoxia, fertilizer leaching, and wasted electricity during subsidized power hours.
              </li>
              <li>
                <strong>Lack of Transparent Edge Telemetry:</strong> Existing commercial smart irrigation systems rely on expensive proprietary cloud subscriptions with closed protocols and English-only interfaces unsuited for local farmers.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900">2. The JalaMitra Solution</h3>
            <p>
              JalaMitra provides an open-standard, low-cost, ESP32-based monitoring edge node paired with a bilingual, responsive web client:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>
                <strong>Non-Corrosive Capacitive Probing:</strong> Uses capacitive dielectric sensing rather than cheap resistive probes that undergo galvanic corrosion.
              </li>
              <li>
                <strong>Acoustic Ultrasonic Water-Level Tracking:</strong> Continuous time-of-flight monitoring of reservoir depth with configurable dry-run safety cutoffs.
              </li>
              <li>
                <strong>Decoupled JSON Telemetry Contract:</strong> Clean REST/HTTP contract allowing easy integration with local Wi-Fi, MQTT brokers, or LoRaWAN gateways.
              </li>
              <li>
                <strong>Safety-First Architecture:</strong> Strict lockout of pump relays until 7-point electrical isolation and physical dry-run interlocks are hardware-verified.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Architecture Block Diagram (SVG / Text) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-base font-bold text-slate-900 mb-2">
          System Architecture & Signal Flow
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          End-to-end data flow from physical transducers to the web application.
        </p>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto">
          <div className="min-w-[680px] flex items-center justify-between text-center text-xs">
            {/* Block 1: Transducers */}
            <div className="w-48 p-3 bg-white rounded border border-slate-300 shadow-2xs space-y-1">
              <div className="font-bold text-slate-900 text-xs">Physical Sensors</div>
              <div className="text-[11px] text-slate-600">Capacitive Soil Probe (GPIO 34)</div>
              <div className="text-[11px] text-slate-600">Ultrasonic HC-SR04 (GPIO 5/18)</div>
              <div className="text-[10px] text-slate-400">Soil Moisture & Reservoir Depth</div>
            </div>

            <div className="px-2 text-slate-400 font-bold font-mono">────►</div>

            {/* Block 2: ESP32 Node */}
            <div className="w-56 p-3 bg-emerald-50 rounded border border-emerald-300 shadow-2xs space-y-1">
              <div className="font-bold text-emerald-950 text-xs">ESP32 Microcontroller</div>
              <div className="text-[11px] text-emerald-800">12-bit SAR ADC & Attenuation</div>
              <div className="text-[11px] text-emerald-800">Local OLED Display (SSD1306)</div>
              <div className="text-[10px] text-emerald-700">HTTP REST Server / SoftAP</div>
            </div>

            <div className="px-2 text-slate-400 font-bold font-mono">──(Wi-Fi)──►</div>

            {/* Block 3: JalaMitra Web Client */}
            <div className="w-56 p-3 bg-slate-900 text-white rounded shadow-2xs space-y-1">
              <div className="font-bold text-white text-xs">JalaMitra Web Application</div>
              <div className="text-[11px] text-slate-300">Data Contract Validation</div>
              <div className="text-[11px] text-slate-300">Calibration & Alert Engine</div>
              <div className="text-[10px] text-emerald-400">English & Telugu (తెలుగు) UI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Completeness & Verification Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Feature Verification & Lifecycle Status Matrix
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Strict engineering separation of verified software components, simulated features, and pending hardware integrations.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">System Module / Feature</th>
                <th className="py-2.5 px-3">Engineering Scope & Deliverables</th>
                <th className="py-2.5 px-3 text-right">Verification State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {FEATURE_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{row.feature}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.description}</td>
                  <td className="py-2.5 px-3 text-right">
                    <FeatureStatusBadge state={row.status as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering Viva & Interview Checklist */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          <Award className="w-5 h-5 text-amber-600" />
          <span>{t.about.vivaChecklistHeader}</span>
        </div>

        <div className="space-y-3">
          {VIVA_QUESTIONS.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded border border-slate-200 bg-slate-50/60 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-start gap-2">
                <span className="font-mono text-emerald-700 shrink-0">Q{idx + 1}.</span>
                <span>{item.q}</span>
              </div>
              <div className="text-slate-600 pl-6 leading-relaxed">
                <strong className="text-slate-800">Answer:</strong> {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
