/**
 * JalaMitra - ESP32 Communication & Telemetry Ingress Service
 * Implements decoupled transport, connection lifecycle, timeout handling,
 * and isolated demonstration simulator.
 */

import {
  JalaMitraPayload,
  Esp32ConnectionConfig,
  SoilCalibrationConfig,
  TankCalibrationConfig,
} from '../types';
import { validateJalaMitraPayload, SAMPLE_PAYLOADS } from './dataContract';
import { CalibrationEngine } from './calibrationEngine';
import { StorageService } from './storageService';

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface TelemetryEvent {
  payload: JalaMitraPayload | null;
  connectionState: ConnectionState;
  isStale: boolean;
  lastSuccessfulUpdate: string | null;
  errorCount: number;
  lastErrorMessage: string | null;
  isDemoMode: boolean;
}

export type TelemetryListener = (event: TelemetryEvent) => void;

export class Esp32Service {
  private static instance: Esp32Service | null = null;
  private listeners: Set<TelemetryListener> = new Set();

  private connectionState: ConnectionState = 'disconnected';
  private currentPayload: JalaMitraPayload | null = null;
  private lastSuccessfulUpdate: string | null = null;
  private errorCount: number = 0;
  private lastErrorMessage: string | null = null;
  private isDemoMode: boolean = true;
  private pollingTimer: number | null = null;
  private stalenessCheckTimer: number | null = null;

  // Demo simulator interval
  private demoTimer: number | null = null;
  private demoPreset: 'normal' | 'dry_soil' | 'low_tank' | 'sensor_fault' | 'uncalibrated' = 'normal';

  private constructor() {
    this.isDemoMode = StorageService.getDemoMode();
    this.initStalenessWatchdog();
  }

  static getInstance(): Esp32Service {
    if (!Esp32Service.instance) {
      Esp32Service.instance = new Esp32Service();
    }
    return Esp32Service.instance;
  }

  subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    // Emit initial state immediately
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('Error in telemetry listener', err);
      }
    }
  }

  getSnapshot(): TelemetryEvent {
    return {
      payload: this.currentPayload,
      connectionState: this.connectionState,
      isStale: this.checkIfStale(),
      lastSuccessfulUpdate: this.lastSuccessfulUpdate,
      errorCount: this.errorCount,
      lastErrorMessage: this.lastErrorMessage,
      isDemoMode: this.isDemoMode,
    };
  }

  private checkIfStale(): boolean {
    if (!this.lastSuccessfulUpdate) return false;
    const diffMs = Date.now() - new Date(this.lastSuccessfulUpdate).getTime();
    return diffMs > 30000; // 30 seconds threshold
  }

  private initStalenessWatchdog(): void {
    if (typeof window !== 'undefined') {
      this.stalenessCheckTimer = window.setInterval(() => {
        this.notify();
      }, 5000);
    }
  }

  /**
   * Toggle between Demo Mode and Live Ingress Mode
   */
  setDemoMode(enabled: boolean): void {
    this.isDemoMode = enabled;
    StorageService.saveDemoMode(enabled);

    if (enabled) {
      this.stopLivePolling();
      this.startDemoSimulator();
    } else {
      this.stopDemoSimulator();
      // Reset live payload state — never silently fall back or show demo data as live
      this.currentPayload = null;
      this.connectionState = 'disconnected';
      this.lastSuccessfulUpdate = null;
      StorageService.appendDiagnosticLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        category: 'NETWORK',
        message: 'Switched to Live ESP32 Mode. Ready for live endpoint polling or payload ingress.',
      });
      this.notify();
    }
  }

  /**
   * Start Live HTTP Polling to physical or local ESP32 endpoint
   */
  async startLivePolling(): Promise<void> {
    if (this.isDemoMode) return;
    this.stopLivePolling();

    const config = StorageService.getEsp32Config();
    this.connectionState = 'connecting';
    this.notify();

    // Perform initial fetch immediately
    await this.fetchFromLiveEndpoint(config);

    // Schedule recurring poll
    this.pollingTimer = window.setInterval(async () => {
      await this.fetchFromLiveEndpoint(config);
    }, Math.max(2, config.pollingIntervalSeconds) * 1000);
  }

  stopLivePolling(): void {
    if (this.pollingTimer !== null) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * Fetch from live endpoint with timeout and validation
   */
  async fetchFromLiveEndpoint(config: Esp32ConnectionConfig): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      StorageService.appendDiagnosticLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        category: 'NETWORK',
        message: `HTTP GET ${config.endpointUrl}`,
      });

      const response = await fetch(config.endpointUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const rawJson = await response.json();
      return this.ingestPayload(rawJson, 'live');
    } catch (err: any) {
      clearTimeout(timeoutId);
      this.connectionState = 'error';
      this.errorCount++;
      const msg = err.name === 'AbortError'
        ? `Connection timeout after ${config.timeoutMs}ms. ESP32 unreachable.`
        : err.message || 'Network request failed';
      this.lastErrorMessage = msg;

      StorageService.appendDiagnosticLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'error',
        category: 'NETWORK',
        message: `Live poll failed: ${msg}`,
      });

      this.notify();
      return false;
    }
  }

  /**
   * Ingest and strictly validate any payload (from Live poll, Serial ingress, or Test tool)
   */
  ingestPayload(rawJson: unknown, expectedSource?: 'live' | 'simulated'): boolean {
    const validation = validateJalaMitraPayload(rawJson);

    if (!validation.isValid || !validation.sanitizedPayload) {
      this.errorCount++;
      this.lastErrorMessage = `Payload validation rejected: ${validation.errors.join('; ')}`;

      StorageService.appendDiagnosticLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'error',
        category: 'VALIDATION',
        message: `Malformed payload rejected: ${validation.errors.join(' | ')}`,
      });

      this.notify();
      return false;
    }

    const payload = validation.sanitizedPayload;

    // Enforce source tag consistency
    if (expectedSource && payload.source !== expectedSource) {
      payload.source = expectedSource;
    }

    // Apply client-side calibrated values if hardware node is uncalibrated
    const soilConfig = StorageService.getSoilCalibration();
    const tankConfig = StorageService.getTankCalibration();

    if (payload.soil.moisturePercent === null && soilConfig.isCalibrated && payload.soil.rawAdc !== null) {
      payload.soil.moisturePercent = CalibrationEngine.calculateSoilMoisture(payload.soil.rawAdc, soilConfig);
    }

    if (payload.tank.levelPercent === null && tankConfig.isCalibrated && payload.tank.distanceCm !== null) {
      payload.tank.levelPercent = CalibrationEngine.calculateTankLevel(payload.tank.distanceCm, tankConfig);
    }

    this.currentPayload = payload;
    this.connectionState = 'connected';
    this.lastSuccessfulUpdate = new Date().toISOString();
    this.lastErrorMessage = null;

    // Append to telemetry history
    StorageService.appendHistory({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: payload.timestamp,
      source: payload.source,
      rawSoilAdc: payload.soil.rawAdc,
      soilPercent: payload.soil.moisturePercent,
      tankDistanceCm: payload.tank.distanceCm,
      tankLevelPercent: payload.tank.levelPercent,
      systemFault: payload.system.sensorFault,
    });

    this.notify();
    return true;
  }

  /**
   * Demonstration Mode Simulator
   * Generates sample telemetry cycles with explicit 'simulated' provenance
   */
  startDemoSimulator(): void {
    this.stopDemoSimulator();
    this.generateDemoTelemetry();

    this.demoTimer = window.setInterval(() => {
      this.generateDemoTelemetry();
    }, 4000);
  }

  stopDemoSimulator(): void {
    if (this.demoTimer !== null) {
      clearInterval(this.demoTimer);
      this.demoTimer = null;
    }
  }

  setDemoPreset(preset: 'normal' | 'dry_soil' | 'low_tank' | 'sensor_fault' | 'uncalibrated'): void {
    this.demoPreset = preset;
    this.generateDemoTelemetry();
  }

  private generateDemoTelemetry(): void {
    if (!this.isDemoMode) return;

    const soilConfig = StorageService.getSoilCalibration();
    const tankConfig = StorageService.getTankCalibration();

    let rawSoilAdc: number | null = 2200;
    let soilValid = true;
    let distanceCm: number | null = 35.0;
    let tankValid = true;
    let sensorFault = false;

    // Small jitter for natural sensor presentation
    const jitter = Math.floor(Math.random() * 21) - 10;

    switch (this.demoPreset) {
      case 'normal':
        rawSoilAdc = 2150 + jitter; // ~48% moisture on standard calibration
        distanceCm = 38.0 + (jitter / 10); // ~65% level on 100cm tank
        break;

      case 'dry_soil':
        rawSoilAdc = 3100 + jitter; // high ADC = dry soil (~8% moisture)
        distanceCm = 42.0 + (jitter / 10);
        break;

      case 'low_tank':
        rawSoilAdc = 2300 + jitter;
        distanceCm = 88.0 + (jitter / 10); // low water (~12% remaining)
        break;

      case 'sensor_fault':
        rawSoilAdc = 0; // Short circuit / open
        soilValid = false;
        distanceCm = null; // Echo loss
        tankValid = false;
        sensorFault = true;
        break;

      case 'uncalibrated':
        rawSoilAdc = 2650 + jitter;
        distanceCm = 45.0 + (jitter / 10);
        break;
    }

    const calculatedSoil = (this.demoPreset === 'uncalibrated')
      ? null
      : CalibrationEngine.calculateSoilMoisture(rawSoilAdc, soilConfig);

    const calculatedTank = (this.demoPreset === 'uncalibrated')
      ? null
      : CalibrationEngine.calculateTankLevel(distanceCm, tankConfig);

    const simulatedPayload: JalaMitraPayload = {
      deviceId: 'jalamitra-esp32-sim',
      timestamp: new Date().toISOString(),
      source: 'simulated',
      soil: {
        rawAdc: rawSoilAdc,
        moisturePercent: calculatedSoil,
        valid: soilValid,
      },
      tank: {
        distanceCm: distanceCm !== null ? Math.round(distanceCm * 10) / 10 : null,
        levelPercent: calculatedTank,
        valid: tankValid,
      },
      system: {
        sensorFault,
        pumpCommand: 'disabled',
        pumpFeedback: 'unavailable',
      },
    };

    this.ingestPayload(simulatedPayload, 'simulated');
  }
}
