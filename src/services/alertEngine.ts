/**
 * JalaMitra - Alert & Threshold Engine
 * Evaluates real-time telemetry against hardware validity, calibration, and thresholds.
 */

import {
  JalaMitraPayload,
  SoilCalibrationConfig,
  TankCalibrationConfig,
  SystemAlert,
} from '../types';

export class AlertEngine {
  /**
   * Evaluate a telemetry payload and return a list of active alerts
   */
  static evaluatePayload(
    payload: JalaMitraPayload | null,
    soilConfig: SoilCalibrationConfig,
    tankConfig: TankCalibrationConfig,
    isDeviceConnected: boolean,
    isDataStale: boolean
  ): SystemAlert[] {
    const alerts: SystemAlert[] = [];
    const timestamp = payload?.timestamp || new Date().toISOString();
    const source = payload?.source || 'system';

    // 1. ESP32 Disconnection Check
    if (!isDeviceConnected) {
      alerts.push({
        id: `alert-conn-offline-${Date.now()}`,
        code: 'ESP32_OFFLINE',
        severity: 'critical',
        title: 'ESP32 Disconnected',
        description: 'Unable to reach the ESP32 endpoint. Telemetry streaming is halted.',
        timestamp,
        source: 'system',
        diagnosticStep: 'Check ESP32 power LED, Wi-Fi router connection, and verify configured endpoint IP in Device Connectivity.',
        resolved: false,
      });
      return alerts; // If disconnected, further sensor alerts are moot
    }

    // 2. Data Staleness Check
    if (isDataStale) {
      alerts.push({
        id: `alert-stale-${Date.now()}`,
        code: 'DATA_STALE',
        severity: 'warning',
        title: 'Sensor Data Stale',
        description: 'No fresh readings received in the last 30 seconds. Data shown may not reflect actual conditions.',
        timestamp,
        source,
        diagnosticStep: 'Verify ESP32 loop execution and check for Wi-Fi packet drops or serial monitor errors.',
        resolved: false,
      });
    }

    if (!payload) return alerts;

    // 3. System-level Sensor Fault flag from ESP32 firmware
    if (payload.system.sensorFault) {
      alerts.push({
        id: `alert-sys-fault-${Date.now()}`,
        code: 'DEVICE_HARDWARE_FAULT',
        severity: 'critical',
        title: 'Hardware Sensor Fault Flagged',
        description: 'The ESP32 reported a transducer hardware failure (I/O communication error or transducer open-circuit).',
        timestamp,
        source,
        diagnosticStep: 'Inspect sensor wiring pins on ESP32 DevKit, check 3.3V/5V rails, and test transducers individually.',
        resolved: false,
      });
    }

    // 4. Soil Sensor Validity & Threshold Check
    if (!payload.soil.valid || payload.soil.rawAdc === null) {
      alerts.push({
        id: `alert-soil-invalid-${Date.now()}`,
        code: 'SOIL_SENSOR_INVALID',
        severity: 'critical',
        title: 'Soil Moisture Sensor Invalid Reading',
        description: 'Soil probe reading is missing or returning out-of-range ADC counts (short to GND or VCC).',
        timestamp,
        source,
        diagnosticStep: 'Check analog input pin wiring (ESP32 ADC1 GPIO34/35/36). Verify probe is not loose or corroded.',
        resolved: false,
      });
    } else {
      // Check calibration status
      if (!soilConfig.isCalibrated && payload.soil.moisturePercent === null) {
        alerts.push({
          id: `alert-soil-uncalibrated-${Date.now()}`,
          code: 'SOIL_UNCALIBRATED',
          severity: 'info',
          title: 'Soil Sensor Needs Calibration',
          description: `Raw ADC is ${payload.soil.rawAdc}, but soil moisture % cannot be calculated until dry/wet calibration is performed.`,
          timestamp,
          source,
          diagnosticStep: 'Perform 2-point calibration in Soil Monitoring view using dry air and clean water test points.',
          resolved: false,
        });
      } else if (payload.soil.moisturePercent !== null) {
        if (payload.soil.moisturePercent < soilConfig.warningThresholdPercent) {
          alerts.push({
            id: `alert-soil-low-${Date.now()}`,
            code: 'SOIL_MOISTURE_LOW',
            severity: 'warning',
            title: 'Soil Moisture Below Warning Threshold',
            description: `Soil moisture has dropped to ${payload.soil.moisturePercent}% (configured threshold: ${soilConfig.warningThresholdPercent}%). Crop root zone is dry.`,
            timestamp,
            source,
            diagnosticStep: 'Check soil condition in field. Note: pump activation is disabled in software for safety.',
            resolved: false,
          });
        }
      }
    }

    // 5. Tank Ultrasonic Sensor Validity & Level Check
    if (!payload.tank.valid || payload.tank.distanceCm === null) {
      alerts.push({
        id: `alert-tank-invalid-${Date.now()}`,
        code: 'TANK_SENSOR_INVALID',
        severity: 'critical',
        title: 'Water Tank Sensor Echo Invalid',
        description: 'Ultrasonic sensor failed to receive an echo or distance exceeds physical limits.',
        timestamp,
        source,
        diagnosticStep: 'Check HC-SR04 Trig/Echo pins, ensure sensor face is perpendicular to water surface without foam, and check 5V power supply.',
        resolved: false,
      });
    } else {
      if (payload.tank.distanceCm < 2) {
        alerts.push({
          id: `alert-tank-blindzone-${Date.now()}`,
          code: 'TANK_BLIND_ZONE',
          severity: 'warning',
          title: 'Ultrasonic Blind Zone Warning',
          description: `Distance is ${payload.tank.distanceCm.toFixed(1)} cm. HC-SR04 cannot measure echoes below 2 cm reliably.`,
          timestamp,
          source,
          diagnosticStep: 'Mount the ultrasonic sensor higher above the maximum water level to provide at least 5-10cm clearance.',
          resolved: false,
        });
      }

      // Check tank calibration status
      if (!tankConfig.isCalibrated && payload.tank.levelPercent === null) {
        alerts.push({
          id: `alert-tank-uncalibrated-${Date.now()}`,
          code: 'TANK_UNCALIBRATED',
          severity: 'info',
          title: 'Tank Geometry Unconfigured',
          description: `Measured surface distance is ${payload.tank.distanceCm.toFixed(1)} cm, but fill % requires tank depth configuration.`,
          timestamp,
          source,
          diagnosticStep: 'Configure total tank depth and mounting offset in Water Tank view.',
          resolved: false,
        });
      } else if (payload.tank.levelPercent !== null) {
        if (payload.tank.levelPercent < tankConfig.lowWaterCutoffPercent) {
          alerts.push({
            id: `alert-tank-low-${Date.now()}`,
            code: 'TANK_WATER_LOW',
            severity: 'critical',
            title: 'Low Water Level Cutoff Alert',
            description: `Water tank level is ${payload.tank.levelPercent}% (below safety cutoff of ${tankConfig.lowWaterCutoffPercent}%).`,
            timestamp,
            source,
            diagnosticStep: 'Refill storage reservoir before irrigation. Future pump interlock will strictly block motor activation.',
            resolved: false,
          });
        }
      }
    }

    return alerts;
  }
}
