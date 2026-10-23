/**
 * JalaMitra - Type Definitions and Data Contracts
 * Project: Smart Irrigation and Water-Level Monitoring System with ESP32-Based Monitoring
 */

export type VerificationState =
  | 'Implemented and software-tested'
  | 'Demonstration-only'
  | 'Awaiting hardware integration'
  | 'Awaiting calibration'
  | 'Awaiting physical testing'
  | 'Planned future functionality';

export type OperatingMode = 'demo' | 'live' | 'disconnected';

export type SystemStatus =
  | 'normal'
  | 'warning'
  | 'fault'
  | 'unknown'
  | 'disconnected'
  | 'unavailable'
  | 'stale'
  | 'demo';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface SoilTelemetry {
  rawAdc: number | null;
  moisturePercent: number | null;
  valid: boolean;
}

export interface TankTelemetry {
  distanceCm: number | null;
  levelPercent: number | null;
  valid: boolean;
}

export interface SystemTelemetry {
  sensorFault: boolean;
  pumpCommand: 'disabled' | 'locked' | 'unsupported';
  pumpFeedback: 'unavailable' | 'unverified';
}

/**
 * Standard ESP32 -> Web Application Data Contract Schema
 */
export interface JalaMitraPayload {
  deviceId: string;
  timestamp: string; // ISO-8601
  source: 'live' | 'simulated';
  soil: SoilTelemetry;
  tank: TankTelemetry;
  system: SystemTelemetry;
}

export interface SoilCalibrationConfig {
  isCalibrated: boolean;
  airAdcDry: number; // Value in completely dry air (e.g. 3200-4095 on 12-bit ADC)
  waterAdcWet: number; // Value in submerged water (e.g. 1100-1600 on 12-bit ADC)
  warningThresholdPercent: number; // Below this % trigger irrigation alert
  lastCalibratedAt: string | null;
}

export interface TankCalibrationConfig {
  isCalibrated: boolean;
  tankTotalDepthCm: number; // Total height of the tank in cm
  sensorBlindZoneCm: number; // Dead band distance (typically 2cm - 20cm for HC-SR04)
  lowWaterCutoffPercent: number; // Below this % pump lock/alert
  lastCalibratedAt: string | null;
}

export interface SystemAlert {
  id: string;
  code: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  source: 'live' | 'simulated' | 'system';
  diagnosticStep: string;
  resolved: boolean;
}

export interface FarmerRecommendation {
  id: string;
  category: 'soil' | 'tank' | 'device' | 'calibration';
  observation: string;
  impact: string;
  action: string;
  source: 'live' | 'simulated';
  severity: 'info' | 'warning' | 'alert';
  timestamp: string;
}

export interface HistoricalReading {
  id: string;
  timestamp: string;
  source: 'live' | 'simulated';
  rawSoilAdc: number | null;
  soilPercent: number | null;
  tankDistanceCm: number | null;
  tankLevelPercent: number | null;
  systemFault: boolean;
}

export interface Esp32ConnectionConfig {
  endpointUrl: string;
  deviceId: string;
  pollingIntervalSeconds: number;
  timeoutMs: number;
  autoReconnect: boolean;
}

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  category: 'NETWORK' | 'SENSOR_SOIL' | 'SENSOR_TANK' | 'VALIDATION' | 'SYSTEM';
  message: string;
  details?: string;
}
