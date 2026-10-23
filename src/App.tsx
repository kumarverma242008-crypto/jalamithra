/**
 * JalaMitra - Smart Irrigation and Water-Level Monitoring System
 * Main Application Component
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  JalaMitraPayload,
  SoilCalibrationConfig,
  TankCalibrationConfig,
  Esp32ConnectionConfig,
  SystemAlert,
  FarmerRecommendation,
  HistoricalReading,
  DiagnosticLog,
  OperatingMode,
} from './types';
import { StorageService } from './services/storageService';
import { Esp32Service, TelemetryEvent } from './services/esp32Service';
import { AlertEngine } from './services/alertEngine';
import { RecommendationEngine } from './services/recommendationEngine';
import { Language, translations } from './locales/i18n';

// Components
import { Header } from './components/Header';
import { DemoModeBanner } from './components/DemoModeBanner';
import { Dashboard } from './components/Dashboard';
import { SoilMonitoring } from './components/SoilMonitoring';
import { TankMonitoring } from './components/TankMonitoring';
import { Esp32Connectivity } from './components/Esp32Connectivity';
import { SensorHistory } from './components/SensorHistory';
import { AlertCenter } from './components/AlertCenter';
import { DeviceDiagnostics } from './components/DeviceDiagnostics';
import { RecommendationsView } from './components/RecommendationsView';
import { PumpSafetyInterlock } from './components/PumpSafetyInterlock';
import { AboutProject } from './components/AboutProject';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Language preference
  const [lang, setLang] = useState<Language>(() => StorageService.getLanguage());

  // Configurations
  const [soilConfig, setSoilConfig] = useState<SoilCalibrationConfig>(() =>
    StorageService.getSoilCalibration()
  );
  const [tankConfig, setTankConfig] = useState<TankCalibrationConfig>(() =>
    StorageService.getTankCalibration()
  );
  const [esp32Config, setEsp32Config] = useState<Esp32ConnectionConfig>(() =>
    StorageService.getEsp32Config()
  );

  // Telemetry state from ESP32 service
  const [telemetry, setTelemetry] = useState<TelemetryEvent>(() =>
    Esp32Service.getInstance().getSnapshot()
  );

  // Stored historical and diagnostic records
  const [history, setHistory] = useState<HistoricalReading[]>(() =>
    StorageService.getHistory()
  );
  const [diagnosticLogs, setDiagnosticLogs] = useState<DiagnosticLog[]>(() =>
    StorageService.getDiagnosticLogs()
  );

  // Subscribe to ESP32 Telemetry Service
  useEffect(() => {
    const service = Esp32Service.getInstance();
    const unsubscribe = service.subscribe((event) => {
      setTelemetry(event);
      // Sync fresh records
      setHistory(StorageService.getHistory());
      setDiagnosticLogs(StorageService.getDiagnosticLogs());
    });

    // Start appropriate engine on mount
    if (service.getSnapshot().isDemoMode) {
      service.startDemoSimulator();
    } else {
      service.startLivePolling();
    }

    return () => {
      unsubscribe();
      service.stopLivePolling();
      service.stopDemoSimulator();
    };
  }, []);

  // Compute Alerts dynamically
  const alerts = useMemo(() => {
    return AlertEngine.evaluatePayload(
      telemetry.payload,
      soilConfig,
      tankConfig,
      telemetry.connectionState === 'connected',
      telemetry.isStale
    );
  }, [telemetry.payload, soilConfig, tankConfig, telemetry.connectionState, telemetry.isStale]);

  // Compute Farmer Recommendations
  const recommendations = useMemo(() => {
    return RecommendationEngine.generateRecommendations(
      telemetry.payload,
      soilConfig,
      tankConfig,
      telemetry.connectionState === 'connected'
    );
  }, [telemetry.payload, soilConfig, tankConfig, telemetry.connectionState]);

  // Handle Language switch
  const handleToggleLang = useCallback(() => {
    const newLang: Language = lang === 'en' ? 'te' : 'en';
    setLang(newLang);
    StorageService.saveLanguage(newLang);
  }, [lang]);

  // Handle Demo Mode switch
  const handleToggleDemoMode = useCallback(() => {
    const service = Esp32Service.getInstance();
    const nextMode = !telemetry.isDemoMode;
    service.setDemoMode(nextMode);
  }, [telemetry.isDemoMode]);

  // Handle Demo Preset selection
  const handleSelectDemoPreset = useCallback(
    (preset: 'normal' | 'dry_soil' | 'low_tank' | 'sensor_fault' | 'uncalibrated') => {
      Esp32Service.getInstance().setDemoPreset(preset);
    },
    []
  );

  // Configuration handlers
  const handleSaveSoilConfig = useCallback((newConfig: SoilCalibrationConfig) => {
    setSoilConfig(newConfig);
    StorageService.saveSoilCalibration(newConfig);
  }, []);

  const handleSaveTankConfig = useCallback((newConfig: TankCalibrationConfig) => {
    setTankConfig(newConfig);
    StorageService.saveTankCalibration(newConfig);
  }, []);

  const handleSaveEsp32Config = useCallback((newConfig: Esp32ConnectionConfig) => {
    setEsp32Config(newConfig);
    StorageService.saveEsp32Config(newConfig);
  }, []);

  const handleClearHistory = useCallback(() => {
    StorageService.clearHistory();
    setHistory([]);
  }, []);

  const handleClearLogs = useCallback(() => {
    StorageService.clearDiagnosticLogs();
    setDiagnosticLogs([]);
  }, []);

  const operatingMode: OperatingMode = telemetry.isDemoMode ? 'demo' : 'live';

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${lang === 'te' ? 'lang-te' : ''}`}>
      {/* Top Bar Contract Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lang={lang}
        onToggleLang={handleToggleLang}
        operatingMode={operatingMode}
        onToggleDemoMode={handleToggleDemoMode}
        activeAlertCount={alerts.length}
      />

      {/* Prominent Demo Mode & Hardware Status Banner */}
      <DemoModeBanner
        operatingMode={operatingMode}
        lang={lang}
        onExitDemo={() => Esp32Service.getInstance().setDemoMode(false)}
        onSelectPreset={handleSelectDemoPreset}
        isStale={telemetry.isStale}
        connectionState={telemetry.connectionState}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            payload={telemetry.payload}
            soilConfig={soilConfig}
            tankConfig={tankConfig}
            alerts={alerts}
            recommendations={recommendations}
            isDeviceConnected={telemetry.connectionState === 'connected'}
            isStale={telemetry.isStale}
            operatingMode={operatingMode}
            lastUpdated={telemetry.lastSuccessfulUpdate}
            lang={lang}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'soil' && (
          <SoilMonitoring
            soil={telemetry.payload?.soil || null}
            config={soilConfig}
            onSaveConfig={handleSaveSoilConfig}
            lang={lang}
            operatingMode={operatingMode}
            lastUpdated={telemetry.lastSuccessfulUpdate}
          />
        )}

        {currentTab === 'tank' && (
          <TankMonitoring
            tank={telemetry.payload?.tank || null}
            config={tankConfig}
            onSaveConfig={handleSaveTankConfig}
            lang={lang}
            operatingMode={operatingMode}
            lastUpdated={telemetry.lastSuccessfulUpdate}
          />
        )}

        {currentTab === 'connectivity' && (
          <Esp32Connectivity
            config={esp32Config}
            onSaveConfig={handleSaveEsp32Config}
            connectionState={telemetry.connectionState}
            isStale={telemetry.isStale}
            lastUpdated={telemetry.lastSuccessfulUpdate}
            errorCount={telemetry.errorCount}
            lastErrorMessage={telemetry.lastErrorMessage}
            operatingMode={operatingMode}
            lang={lang}
          />
        )}

        {currentTab === 'history' && (
          <SensorHistory
            history={history}
            onClearHistory={handleClearHistory}
            lang={lang}
            operatingMode={operatingMode}
          />
        )}

        {currentTab === 'alerts' && (
          <AlertCenter
            alerts={alerts}
            operatingMode={operatingMode}
            lang={lang}
          />
        )}

        {currentTab === 'diagnostics' && (
          <DeviceDiagnostics
            payload={telemetry.payload}
            logs={diagnosticLogs}
            onClearLogs={handleClearLogs}
            isDeviceConnected={telemetry.connectionState === 'connected'}
            isStale={telemetry.isStale}
            operatingMode={operatingMode}
            lang={lang}
          />
        )}

        {currentTab === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            operatingMode={operatingMode}
            lang={lang}
          />
        )}

        {currentTab === 'pump' && (
          <PumpSafetyInterlock
            tankConfig={tankConfig}
            operatingMode={operatingMode}
            lang={lang}
          />
        )}

        {currentTab === 'about' && (
          <AboutProject lang={lang} />
        )}
      </main>

      {/* Quiet, Accessible Engineering Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">JalaMitra</span>
            <span>·</span>
            <span>Smart Irrigation & Water Monitoring Major Project</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setCurrentTab('about')}
              className="hover:text-slate-900 transition-colors"
            >
              Project Documentation
            </button>
            <button
              onClick={() => setCurrentTab('pump')}
              className="hover:text-slate-900 transition-colors"
            >
              Pump Safety Matrix
            </button>
            <button
              onClick={() => setCurrentTab('diagnostics')}
              className="hover:text-slate-900 transition-colors"
            >
              Hardware Pinouts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
