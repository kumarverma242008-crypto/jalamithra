/**
 * JalaMitra - Calibration & Metric Conversion Engine
 * Converts raw physical transducer signals into engineering metrics.
 * Ensures that if calibration is missing, values remain strictly null/uncalibrated.
 */

import { SoilCalibrationConfig, TankCalibrationConfig } from '../types';

export interface CalibrationValidationResult {
  isValid: boolean;
  message: string;
}

export class CalibrationEngine {
  /**
   * Validate Soil Moisture Calibration parameters
   */
  static validateSoilConfig(config: SoilCalibrationConfig): CalibrationValidationResult {
    if (config.airAdcDry < 0 || config.airAdcDry > 4095) {
      return { isValid: false, message: 'Air ADC (dry) must be between 0 and 4095.' };
    }
    if (config.waterAdcWet < 0 || config.waterAdcWet > 4095) {
      return { isValid: false, message: 'Water ADC (wet) must be between 0 and 4095.' };
    }
    if (Math.abs(config.airAdcDry - config.waterAdcWet) < 200) {
      return {
        isValid: false,
        message: 'ADC difference between dry and wet calibration points must be at least 200 counts for reliable resolution.',
      };
    }
    if (config.warningThresholdPercent < 5 || config.warningThresholdPercent > 95) {
      return { isValid: false, message: 'Moisture warning threshold must be between 5% and 95%.' };
    }
    return { isValid: true, message: 'Soil calibration parameters are mathematically valid.' };
  }

  /**
   * Calculate Soil Moisture Percentage from Raw ADC
   * Returns null if calibration has not been completed!
   */
  static calculateSoilMoisture(
    rawAdc: number | null,
    config: SoilCalibrationConfig
  ): number | null {
    if (rawAdc === null || !config.isCalibrated) {
      return null;
    }

    const { airAdcDry, waterAdcWet } = config;
    if (airAdcDry === waterAdcWet) return null;

    // Standard capacitive soil sensor: high voltage/ADC in dry air, lower in conductive wet water
    let percent: number;
    if (airAdcDry > waterAdcWet) {
      percent = ((airAdcDry - rawAdc) / (airAdcDry - waterAdcWet)) * 100;
    } else {
      // Resistive sensor inverted setup
      percent = ((rawAdc - airAdcDry) / (waterAdcWet - airAdcDry)) * 100;
    }

    // Clamp between 0% and 100%
    return Math.max(0, Math.min(100, Math.round(percent * 10) / 10));
  }

  /**
   * Validate Tank Geometry Calibration parameters
   */
  static validateTankConfig(config: TankCalibrationConfig): CalibrationValidationResult {
    if (config.tankTotalDepthCm <= 10) {
      return { isValid: false, message: 'Tank total depth must be greater than 10 cm.' };
    }
    if (config.tankTotalDepthCm > 2000) {
      return { isValid: false, message: 'Tank depth exceeds standard physical limits (> 20 meters).' };
    }
    if (config.sensorBlindZoneCm < 0 || config.sensorBlindZoneCm >= config.tankTotalDepthCm) {
      return { isValid: false, message: 'Sensor blind zone must be positive and less than the tank depth.' };
    }
    if (config.lowWaterCutoffPercent < 5 || config.lowWaterCutoffPercent > 80) {
      return { isValid: false, message: 'Low-water cutoff threshold must be between 5% and 80%.' };
    }
    return { isValid: true, message: 'Tank geometry parameters are mathematically valid.' };
  }

  /**
   * Calculate Water Tank Level Percentage from Ultrasonic Distance (cm)
   * Returns null if geometry calibration is not completed!
   */
  static calculateTankLevel(
    distanceCm: number | null,
    config: TankCalibrationConfig
  ): number | null {
    if (distanceCm === null || !config.isCalibrated) {
      return null;
    }

    const { tankTotalDepthCm, sensorBlindZoneCm } = config;
    const effectiveWaterDepth = tankTotalDepthCm - sensorBlindZoneCm;

    if (effectiveWaterDepth <= 0) return null;

    // Distance measured is from transducer (top) down to water surface
    // Water height in tank = tankTotalDepthCm - distanceCm
    const currentWaterHeight = tankTotalDepthCm - distanceCm;

    const percent = (currentWaterHeight / effectiveWaterDepth) * 100;
    return Math.max(0, Math.min(100, Math.round(percent * 10) / 10));
  }
}
