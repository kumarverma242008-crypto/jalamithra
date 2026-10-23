/**
 * JalaMitra - Local Storage & Data Persistence Manager
 * Handles historical telemetry, user calibration settings, and CSV export.
 * Note: Uses browser LocalStorage for client-side persistence without external databases.
 */

import {
  SoilCalibrationConfig,
  TankCalibrationConfig,
  Esp32ConnectionConfig,
  HistoricalReading,
  SystemAlert,
  DiagnosticLog,
} from '../types';

const STORAGE_KEYS = {
  SOIL_CALIBRATION: 'jalamitra_soil_calib_v1',
  TANK_CALIBRATION: 'jalamitra_tank_calib_v1',
  ESP32_CONFIG: 'jalamitra_esp32_cfg_v1',
  HISTORY: 'jalamitra_telemetry_history_v1',
  ALERTS: 'jalamitra_alerts_v1',
  DIAG_LOGS: 'jalamitra_diag_logs_v1',
  LANGUAGE: 'jalamitra_lang_pref_v1',
  DEMO_MODE: 'jalamitra_demo_mode_v1',
};

export const DEFAULT_SOIL_CALIBRATION: SoilCalibrationConfig = {
  isCalibrated: false,
  airAdcDry: 3200, // Typical capacitive sensor dry reading
  waterAdcWet: 1400, // Typical capacitive sensor submerged reading
  warningThresholdPercent: 30, // Dry soil irrigation trigger
  lastCalibratedAt: null,
};

export const DEFAULT_TANK_CALIBRATION: TankCalibrationConfig = {
  isCalibrated: false,
  tankTotalDepthCm: 100, // 1 meter default cylindrical / rectangular tank depth
  sensorBlindZoneCm: 5, // HC-SR04 blind zone
  lowWaterCutoffPercent: 20, // Low water safety threshold
  lastCalibratedAt: null,
};

export const DEFAULT_ESP32_CONFIG: Esp32ConnectionConfig = {
  endpointUrl: 'http://192.168.4.1/api/telemetry', // ESP32 SoftAP default or local IP
  deviceId: 'jalamitra-esp32-01',
  pollingIntervalSeconds: 5,
  timeoutMs: 4000,
  autoReconnect: false,
};

export class StorageService {
  /**
   * Soil Calibration Config
   */
  static getSoilCalibration(): SoilCalibrationConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOIL_CALIBRATION);
      return data ? JSON.parse(data) : DEFAULT_SOIL_CALIBRATION;
    } catch {
      return DEFAULT_SOIL_CALIBRATION;
    }
  }

  static saveSoilCalibration(config: SoilCalibrationConfig): void {
    localStorage.setItem(STORAGE_KEYS.SOIL_CALIBRATION, JSON.stringify(config));
  }

  /**
   * Tank Calibration Config
   */
  static getTankCalibration(): TankCalibrationConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TANK_CALIBRATION);
      return data ? JSON.parse(data) : DEFAULT_TANK_CALIBRATION;
    } catch {
      return DEFAULT_TANK_CALIBRATION;
    }
  }

  static saveTankCalibration(config: TankCalibrationConfig): void {
    localStorage.setItem(STORAGE_KEYS.TANK_CALIBRATION, JSON.stringify(config));
  }

  /**
   * ESP32 Connection Config
   */
  static getEsp32Config(): Esp32ConnectionConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ESP32_CONFIG);
      return data ? JSON.parse(data) : DEFAULT_ESP32_CONFIG;
    } catch {
      return DEFAULT_ESP32_CONFIG;
    }
  }

  static saveEsp32Config(config: Esp32ConnectionConfig): void {
    localStorage.setItem(STORAGE_KEYS.ESP32_CONFIG, JSON.stringify(config));
  }

  /**
   * Language Preference
   */
  static getLanguage(): 'en' | 'te' {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'en' | 'te') || 'en';
  }

  static saveLanguage(lang: 'en' | 'te'): void {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }

  /**
   * Demo Mode Setting
   */
  static getDemoMode(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
    return val !== null ? val === 'true' : true; // Default to true initially so user sees full prototype immediately
  }

  static saveDemoMode(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(enabled));
  }

  /**
   * Historical Readings (Capped at 500 entries to prevent storage bloat)
   */
  static getHistory(): HistoricalReading[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static appendHistory(reading: HistoricalReading): void {
    try {
      const history = this.getHistory();
      history.push(reading);
      // Keep most recent 500 records
      const trimmed = history.slice(-500);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('LocalStorage limit reached while appending history', e);
    }
  }

  static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }

  /**
   * Alerts
   */
  static getAlerts(): SystemAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveAlerts(alerts: SystemAlert[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts.slice(-100)));
    } catch (e) {
      console.warn('LocalStorage limit reached while saving alerts', e);
    }
  }

  static clearAlerts(): void {
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
  }

  /**
   * Diagnostic Logs
   */
  static getDiagnosticLogs(): DiagnosticLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DIAG_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static appendDiagnosticLog(log: DiagnosticLog): void {
    try {
      const logs = this.getDiagnosticLogs();
      logs.push(log);
      localStorage.setItem(STORAGE_KEYS.DIAG_LOGS, JSON.stringify(logs.slice(-150)));
    } catch (e) {
      console.warn('LocalStorage limit reached while saving diagnostic logs', e);
    }
  }

  static clearDiagnosticLogs(): void {
    localStorage.removeItem(STORAGE_KEYS.DIAG_LOGS);
  }

  /**
   * Reset all demonstration / user data
   */
  static clearAllUserData(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.DIAG_LOGS);
  }

  /**
   * Export telemetry to RFC-4180 compliant CSV string
   */
  static exportHistoryToCsv(history: HistoricalReading[]): string {
    const headers = [
      'Timestamp (ISO-8601)',
      'Data Source',
      'Raw Soil ADC (0-4095)',
      'Soil Moisture (%)',
      'Tank Ultrasonic Distance (cm)',
      'Calculated Tank Level (%)',
      'System Fault Detected',
    ];

    const rows = history.map((row) => [
      `"${row.timestamp}"`,
      `"${row.source}"`,
      row.rawSoilAdc !== null ? row.rawSoilAdc : 'N/A',
      row.soilPercent !== null ? row.soilPercent.toFixed(1) : 'Uncalibrated',
      row.tankDistanceCm !== null ? row.tankDistanceCm.toFixed(1) : 'N/A',
      row.tankLevelPercent !== null ? row.tankLevelPercent.toFixed(1) : 'Uncalibrated',
      row.systemFault ? 'TRUE' : 'FALSE',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }

  /**
   * Calculate local storage usage in KB
   */
  static getStorageUsageEstimateKb(): number {
    let totalBytes = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
      const item = localStorage.getItem(key);
      if (item) {
        totalBytes += item.length * 2; // UTF-16
      }
    }
    return Math.round(totalBytes / 1024);
  }
}
