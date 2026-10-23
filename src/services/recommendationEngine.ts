/**
 * JalaMitra - Rule-Based Farmer & Technician Recommendation Engine
 * Provides transparent, explainable agricultural and operational advisory cards.
 */

import {
  JalaMitraPayload,
  SoilCalibrationConfig,
  TankCalibrationConfig,
  FarmerRecommendation,
} from '../types';

export class RecommendationEngine {
  static generateRecommendations(
    payload: JalaMitraPayload | null,
    soilConfig: SoilCalibrationConfig,
    tankConfig: TankCalibrationConfig,
    isDeviceConnected: boolean
  ): FarmerRecommendation[] {
    const recommendations: FarmerRecommendation[] = [];
    const now = new Date().toISOString();
    const source = payload?.source || 'simulated';

    if (!isDeviceConnected) {
      recommendations.push({
        id: 'rec-device-offline',
        category: 'device',
        observation: 'The ESP32 monitoring unit is currently offline or unreachable over the network.',
        impact: 'No live telemetry can be gathered from the field. Irrigation status cannot be monitored.',
        action: 'Inspect the ESP32 board in your field box. Ensure the power adapter is delivering 5V/2A and your Wi-Fi router is within signal range.',
        source: 'simulated',
        severity: 'alert',
        timestamp: now,
      });
      return recommendations;
    }

    if (!payload) return recommendations;

    // 1. Soil calibration advisory
    if (!soilConfig.isCalibrated) {
      recommendations.push({
        id: 'rec-soil-calib',
        category: 'calibration',
        observation: `Raw ADC output is ${payload.soil.rawAdc ?? 'N/A'}, but physical soil moisture percentage is not yet calibrated.`,
        impact: 'Different soils (clay, loam, sandy red soil) have different capacitive responses. Without calibration, moisture percentages are unreliable.',
        action: 'Calibrate using two containers: sample completely dry soil (Air reading) and fully saturated wet soil (Water reading) in the Soil tab.',
        source,
        severity: 'warning',
        timestamp: now,
      });
    } else if (payload.soil.moisturePercent !== null) {
      // 2. Soil moisture state advisory
      if (payload.soil.moisturePercent < soilConfig.warningThresholdPercent) {
        recommendations.push({
          id: 'rec-soil-dry',
          category: 'soil',
          observation: `Soil moisture is at ${payload.soil.moisturePercent}%, which is below your dry threshold of ${soilConfig.warningThresholdPercent}%.`,
          impact: 'Moisture in the root zone is depleting, which may cause plant moisture stress and affect crop transpiration.',
          action: 'Verify soil texture by digging 2-3 inches near root depth. If dry, plan manual watering or verify water storage before running irrigation.',
          source,
          severity: 'warning',
          timestamp: now,
        });
      } else if (payload.soil.moisturePercent > 85) {
        recommendations.push({
          id: 'rec-soil-saturated',
          category: 'soil',
          observation: `Soil moisture is at ${payload.soil.moisturePercent}%, showing high soil water saturation.`,
          impact: 'Waterlogged soil reduces oxygen availability to roots and can promote root rot or fungal issues.',
          action: 'Avoid applying irrigation water. Check field drainage channels if recent rainfall has occurred.',
          source,
          severity: 'info',
          timestamp: now,
        });
      } else {
        recommendations.push({
          id: 'rec-soil-optimal',
          category: 'soil',
          observation: `Soil moisture is at ${payload.soil.moisturePercent}%, within the configured healthy moisture window (${soilConfig.warningThresholdPercent}% to 85%).`,
          impact: 'Current soil moisture supports active nutrient uptake and vegetative growth for common crops.',
          action: 'Continue periodic monitoring. No irrigation intervention is recommended at this time.',
          source,
          severity: 'info',
          timestamp: now,
        });
      }
    }

    // 3. Tank water advisory
    if (!tankConfig.isCalibrated) {
      recommendations.push({
        id: 'rec-tank-calib',
        category: 'calibration',
        observation: `Ultrasonic transducer measures a distance of ${payload.tank.distanceCm?.toFixed(1) ?? 'N/A'} cm, but tank geometry is unconfigured.`,
        impact: 'Remaining water volume cannot be calculated accurately without knowing total tank height.',
        action: 'Measure your water tank depth from top rim to base and enter the dimensions in the Water Tank settings.',
        source,
        severity: 'warning',
        timestamp: now,
      });
    } else if (payload.tank.levelPercent !== null) {
      if (payload.tank.levelPercent < tankConfig.lowWaterCutoffPercent) {
        recommendations.push({
          id: 'rec-tank-low',
          category: 'tank',
          observation: `Water tank level is at ${payload.tank.levelPercent}%, which is below the safe low-water cutoff (${tankConfig.lowWaterCutoffPercent}%).`,
          impact: 'Running an agricultural pump with low reservoir volume causes cavitation, impeller overheating, and motor winding burnout.',
          action: 'Do not attempt to start irrigation. Refill the storage tank or switch to an alternate borewell line first.',
          source,
          severity: 'alert',
          timestamp: now,
        });
      } else if (payload.tank.levelPercent < 40) {
        recommendations.push({
          id: 'rec-tank-moderate',
          category: 'tank',
          observation: `Water tank level is at ${payload.tank.levelPercent}%. Reservoir capacity is less than half full.`,
          impact: 'Water reserves may not be sufficient for a complete field irrigation cycle.',
          action: 'Schedule water pumping from main source during off-peak electricity hours before planning long irrigation cycles.',
          source,
          severity: 'info',
          timestamp: now,
        });
      }
    }

    // 4. Sensor validity advisory
    if (!payload.soil.valid || !payload.tank.valid) {
      recommendations.push({
        id: 'rec-sensor-check',
        category: 'device',
        observation: 'One or more physical sensor signals are reporting invalid electrical or acoustic readings.',
        impact: 'Automated monitoring decisions cannot be trusted when sensor inputs are invalid.',
        action: 'Review the Device Diagnostics page for transducer troubleshooting steps and check wire connections at the terminal block.',
        source,
        severity: 'alert',
        timestamp: now,
      });
    }

    return recommendations;
  }
}
