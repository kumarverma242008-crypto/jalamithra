/**
 * JalaMitra - Sensor Data Contract & Payload Validation Engine
 * Specification for ESP32 -> Web Application Telemetry Contract
 */

import { JalaMitraPayload } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedPayload: JalaMitraPayload | null;
}

export const DATA_CONTRACT_SPEC = {
  version: '1.0.0',
  description: 'ESP32 REST / Telemetry Ingress Specification for JalaMitra IoT',
  fields: [
    {
      name: 'deviceId',
      type: 'string',
      required: true,
      description: 'Unique identifier of the ESP32 node (e.g., jalamitra-esp32-01).',
      example: 'jalamitra-esp32-01',
    },
    {
      name: 'timestamp',
      type: 'string (ISO 8601 UTC)',
      required: true,
      description: 'Timestamp when reading was sampled by ESP32 NTP/RTC or client clock.',
      example: '2026-10-21T10:15:00.000Z',
    },
    {
      name: 'source',
      type: "'live' | 'simulated'",
      required: true,
      description: 'Provenance of the reading. Hardware node must flag "live".',
      example: 'live',
    },
    {
      name: 'soil.rawAdc',
      type: 'number | null (0 - 4095)',
      unit: '12-bit ADC raw count (ESP32 ADC1, 11dB attenuation 0-3.3V)',
      required: true,
      description: 'Direct analog reading from soil moisture sensor probe.',
    },
    {
      name: 'soil.moisturePercent',
      type: 'number | null (0 - 100%)',
      unit: '% Volumetric Water Content estimate',
      required: true,
      description: 'Calibrated percentage. Must be null if sensor is uncalibrated.',
    },
    {
      name: 'soil.valid',
      type: 'boolean',
      required: true,
      description: 'True if sensor probe is within plausible ADC physical limits.',
    },
    {
      name: 'tank.distanceCm',
      type: 'number | null (2 - 400 cm)',
      unit: 'centimetres (cm)',
      required: true,
      description: 'Time-of-flight acoustic distance from ultrasonic transducer to water surface.',
    },
    {
      name: 'tank.levelPercent',
      type: 'number | null (0 - 100%)',
      unit: '% Tank fill capacity',
      required: true,
      description: 'Calculated fill level based on configured tank depth and sensor mount offset.',
    },
    {
      name: 'tank.valid',
      type: 'boolean',
      required: true,
      description: 'True if echo was received within the physical sensor window (>2cm and <tank depth).',
    },
    {
      name: 'system.sensorFault',
      type: 'boolean',
      required: true,
      description: 'Flagged true if any connected transducer failed I/O or echo response.',
    },
    {
      name: 'system.pumpCommand',
      type: "'disabled' | 'locked' | 'unsupported'",
      required: true,
      description: 'Current motor command state. Strictly locked or disabled in current firmware.',
    },
    {
      name: 'system.pumpFeedback',
      type: "'unavailable' | 'unverified'",
      required: true,
      description: 'Motor relay contact sense state. No active current feedback without dedicated CT hardware.',
    },
  ],
};

/**
 * Validates incoming JSON string or object against JalaMitra payload schema
 */
export function validateJalaMitraPayload(input: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: ['Payload is not a valid JSON object.'],
      warnings: [],
      sanitizedPayload: null,
    };
  }

  const payload = input as Record<string, any>;

  // 1. Device ID validation
  if (typeof payload.deviceId !== 'string' || payload.deviceId.trim() === '') {
    errors.push('Field "deviceId" is required and must be a non-empty string.');
  }

  // 2. Timestamp validation (ISO-8601 check)
  if (typeof payload.timestamp !== 'string') {
    errors.push('Field "timestamp" must be an ISO-8601 formatted date string.');
  } else {
    const parsedDate = new Date(payload.timestamp);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Field "timestamp" ("${payload.timestamp}") is not a valid date.`);
    } else {
      // Check for timestamp in far future (> 1 hour ahead)
      const now = Date.now();
      if (parsedDate.getTime() > now + 3600 * 1000) {
        warnings.push('Timestamp is in the future. Check ESP32 NTP/RTC synchronization.');
      }
    }
  }

  // 3. Provenance source validation
  if (payload.source !== 'live' && payload.source !== 'simulated') {
    errors.push('Field "source" must be either "live" or "simulated". Unknown sources are rejected.');
  }

  // 4. Soil object validation
  if (!payload.soil || typeof payload.soil !== 'object') {
    errors.push('Missing or invalid nested object "soil".');
  } else {
    const soil = payload.soil;
    if (typeof soil.valid !== 'boolean') {
      errors.push('Field "soil.valid" must be a boolean.');
    }

    if (soil.rawAdc !== null && typeof soil.rawAdc !== 'number') {
      errors.push('Field "soil.rawAdc" must be a number or null.');
    } else if (typeof soil.rawAdc === 'number') {
      if (soil.rawAdc < 0 || soil.rawAdc > 4095) {
        errors.push(`Field "soil.rawAdc" (${soil.rawAdc}) is out of ESP32 12-bit ADC range (0-4095).`);
      }
    }

    if (soil.moisturePercent !== null && typeof soil.moisturePercent !== 'number') {
      errors.push('Field "soil.moisturePercent" must be a number or null.');
    } else if (typeof soil.moisturePercent === 'number') {
      if (soil.moisturePercent < 0 || soil.moisturePercent > 100) {
        warnings.push(`Field "soil.moisturePercent" (${soil.moisturePercent}%) is outside expected 0-100% range.`);
      }
    }

    // Distinguish missing from zero
    if (soil.rawAdc === 0) {
      warnings.push('Raw Soil ADC is 0 count. This could indicate a grounded sensor probe or disconnected line.');
    }
  }

  // 5. Tank object validation
  if (!payload.tank || typeof payload.tank !== 'object') {
    errors.push('Missing or invalid nested object "tank".');
  } else {
    const tank = payload.tank;
    if (typeof tank.valid !== 'boolean') {
      errors.push('Field "tank.valid" must be a boolean.');
    }

    if (tank.distanceCm !== null && typeof tank.distanceCm !== 'number') {
      errors.push('Field "tank.distanceCm" must be a number or null.');
    } else if (typeof tank.distanceCm === 'number') {
      if (tank.distanceCm < 0) {
        errors.push('Field "tank.distanceCm" cannot be negative.');
      } else if (tank.distanceCm < 2) {
        warnings.push('Ultrasonic distance < 2cm is inside the sensor blind zone (unreliable acoustic reflection).');
      } else if (tank.distanceCm > 450) {
        warnings.push('Ultrasonic distance > 450cm exceeds standard HC-SR04 acoustic range.');
      }
    }

    if (tank.levelPercent !== null && typeof tank.levelPercent !== 'number') {
      errors.push('Field "tank.levelPercent" must be a number or null.');
    } else if (typeof tank.levelPercent === 'number') {
      if (tank.levelPercent < 0 || tank.levelPercent > 100) {
        warnings.push(`Field "tank.levelPercent" (${tank.levelPercent}%) is outside expected 0-100% range.`);
      }
    }
  }

  // 6. System object validation
  if (!payload.system || typeof payload.system !== 'object') {
    errors.push('Missing or invalid nested object "system".');
  } else {
    const system = payload.system;
    if (typeof system.sensorFault !== 'boolean') {
      errors.push('Field "system.sensorFault" must be a boolean.');
    }

    // Safety enforcement: pump commands must never report enabled
    const validCommands = ['disabled', 'locked', 'unsupported'];
    if (!validCommands.includes(system.pumpCommand)) {
      errors.push(`Field "system.pumpCommand" must be one of: ${validCommands.join(', ')}. Activating real pumps is forbidden in this version.`);
    }

    const validFeedbacks = ['unavailable', 'unverified'];
    if (!validFeedbacks.includes(system.pumpFeedback)) {
      errors.push(`Field "system.pumpFeedback" must be one of: ${validFeedbacks.join(', ')}. No physical motor feedback sensors are certified.`);
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      sanitizedPayload: null,
    };
  }

  const sanitized: JalaMitraPayload = {
    deviceId: String(payload.deviceId),
    timestamp: String(payload.timestamp),
    source: payload.source as 'live' | 'simulated',
    soil: {
      rawAdc: payload.soil.rawAdc !== null ? Number(payload.soil.rawAdc) : null,
      moisturePercent: payload.soil.moisturePercent !== null ? Number(payload.soil.moisturePercent) : null,
      valid: Boolean(payload.soil.valid),
    },
    tank: {
      distanceCm: payload.tank.distanceCm !== null ? Number(payload.tank.distanceCm) : null,
      levelPercent: payload.tank.levelPercent !== null ? Number(payload.tank.levelPercent) : null,
      valid: Boolean(payload.tank.valid),
    },
    system: {
      sensorFault: Boolean(payload.system.sensorFault),
      pumpCommand: payload.system.pumpCommand,
      pumpFeedback: payload.system.pumpFeedback,
    },
  };

  return {
    isValid: true,
    errors: [],
    warnings,
    sanitizedPayload: sanitized,
  };
}

/**
 * Sample payloads for evaluation, documentation, and demonstration testing
 */
export const SAMPLE_PAYLOADS = {
  validCalibrated: {
    deviceId: 'jalamitra-esp32-01',
    timestamp: new Date().toISOString(),
    source: 'live' as const,
    soil: {
      rawAdc: 2150,
      moisturePercent: 46.2,
      valid: true,
    },
    tank: {
      distanceCm: 42.5,
      levelPercent: 68.0,
      valid: true,
    },
    system: {
      sensorFault: false,
      pumpCommand: 'disabled' as const,
      pumpFeedback: 'unavailable' as const,
    },
  },

  uncalibratedRaw: {
    deviceId: 'jalamitra-esp32-01',
    timestamp: new Date().toISOString(),
    source: 'live' as const,
    soil: {
      rawAdc: 2890,
      moisturePercent: null, // Calibration not performed on physical node
      valid: true,
    },
    tank: {
      distanceCm: 65.0,
      levelPercent: null, // Tank geometry not yet mapped
      valid: true,
    },
    system: {
      sensorFault: false,
      pumpCommand: 'disabled' as const,
      pumpFeedback: 'unavailable' as const,
    },
  },

  hardwareFault: {
    deviceId: 'jalamitra-esp32-01',
    timestamp: new Date().toISOString(),
    source: 'live' as const,
    soil: {
      rawAdc: 0,
      moisturePercent: null,
      valid: false, // Probe open circuit or ground short
    },
    tank: {
      distanceCm: null, // Echo timeout on HC-SR04
      levelPercent: null,
      valid: false,
    },
    system: {
      sensorFault: true,
      pumpCommand: 'disabled' as const,
      pumpFeedback: 'unavailable' as const,
    },
  },

  malformedInvalid: {
    deviceId: '',
    timestamp: 'not-a-timestamp',
    source: 'unknown-vendor',
    soil: {
      rawAdc: 99999, // Out of ADC range
      moisturePercent: 'wet', // Type error
      valid: 'yes', // Type error
    },
    tank: {
      distanceCm: -10, // Negative distance
    },
    system: {
      pumpCommand: 'running', // Safety violation
    },
  },
};
