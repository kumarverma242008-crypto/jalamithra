/**
 * JalaMitra - Localization Engine (English & Telugu - తెలుగు)
 * Designed for small/medium farmers in Telangana and engineering evaluators.
 */

export type Language = 'en' | 'te';

export interface Translations {
  appName: string;
  appSubtitle: string;
  demoModeBanner: string;
  demoModeDescription: string;
  exitDemoMode: string;
  enterDemoMode: string;
  nav: {
    dashboard: string;
    liveMonitoring: string;
    soil: string;
    tank: string;
    sensorHistory: string;
    alerts: string;
    diagnostics: string;
    recommendations: string;
    pumpSafety: string;
    about: string;
  };
  common: {
    status: string;
    source: string;
    liveData: string;
    simulatedData: string;
    lastUpdated: string;
    never: string;
    refreshNow: string;
    save: string;
    cancel: string;
    reset: string;
    clear: string;
    details: string;
    troubleshooting: string;
    calibrate: string;
    calibrated: string;
    uncalibrated: string;
    warning: string;
    critical: string;
    info: string;
    active: string;
    resolved: string;
    viewAll: string;
    exportCsv: string;
    clearData: string;
    connected: string;
    disconnected: string;
    offline: string;
    online: string;
    stale: string;
    unknown: string;
    healthy: string;
    fault: string;
    disabled: string;
    locked: string;
    notice: string;
  };
  dashboard: {
    soilMoistureTitle: string;
    soilMoistureDesc: string;
    waterTankTitle: string;
    waterTankDesc: string;
    esp32StatusTitle: string;
    esp32StatusDesc: string;
    alertsTitle: string;
    noActiveAlerts: string;
    recommendationsTitle: string;
    deviceHealthTitle: string;
    operatingMode: string;
    pumpStatusTitle: string;
    pumpStatusDesc: string;
    quickShortcuts: string;
    viewHistory: string;
    openDiagnostics: string;
    reviewSafety: string;
  };
  soil: {
    title: string;
    subtitle: string;
    rawAdcTitle: string;
    rawAdcDescription: string;
    calibratedPercentTitle: string;
    warningThresholdTitle: string;
    uncalibratedNotice: string;
    calibrationModalTitle: string;
    dryAirAdc: string;
    dryAirAdcHelp: string;
    wetWaterAdc: string;
    wetWaterAdcHelp: string;
    thresholdInput: string;
    saveCalibration: string;
    troubleshootHeader: string;
    tips: {
      fluctuation: string;
      airGap: string;
      adcRange: string;
      salinity: string;
    };
  };
  tank: {
    title: string;
    subtitle: string;
    distanceTitle: string;
    distanceDesc: string;
    levelPercentTitle: string;
    lowWaterThresholdTitle: string;
    uncalibratedNotice: string;
    calibrationModalTitle: string;
    tankDepthCm: string;
    tankDepthCmHelp: string;
    sensorBlindZoneCm: string;
    sensorBlindZoneCmHelp: string;
    lowWaterThresholdInput: string;
    troubleshootHeader: string;
    tips: {
      echoFail: string;
      blindZone: string;
      surfaceWaves: string;
      powerBounce: string;
    };
  };
  pump: {
    title: string;
    subtitle: string;
    statusLabel: string;
    statusLocked: string;
    safetyInterlockTitle: string;
    safetyReason: string;
    requirementsTitle: string;
    relayIsolation: string;
    motorInrush: string;
    dryRunSensor: string;
    physicalEStop: string;
  };
  alerts: {
    title: string;
    subtitle: string;
    activeCount: string;
    filterAll: string;
    filterCritical: string;
    filterWarning: string;
    filterInfo: string;
    diagnosticRecommendation: string;
  };
  recommendations: {
    title: string;
    subtitle: string;
    observationLabel: string;
    impactLabel: string;
    actionLabel: string;
  };
  diagnostics: {
    title: string;
    subtitle: string;
    transducerStatus: string;
    networkStatus: string;
    pinoutHeader: string;
    consoleHeader: string;
    clearLogs: string;
  };
  about: {
    title: string;
    subtitle: string;
    projectOverview: string;
    cirkitHeader: string;
    vivaChecklistHeader: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'JalaMitra',
    appSubtitle: 'Smart Irrigation & Water-Level Monitoring System',
    demoModeBanner: 'DEMO MODE — SIMULATED DATA — NOT FROM REAL SENSORS',
    demoModeDescription:
      'The system is currently running on simulated prototype data for presentation and evaluation purposes.',
    exitDemoMode: 'Exit Demo Mode (Switch to Live Ingress)',
    enterDemoMode: 'Enter Demo Mode',
    nav: {
      dashboard: 'Dashboard',
      liveMonitoring: 'Live Monitoring',
      soil: 'Soil Moisture',
      tank: 'Water Tank',
      sensorHistory: 'Sensor History',
      alerts: 'Alerts',
      diagnostics: 'Device Diagnostics',
      recommendations: 'Farmer Advisory',
      pumpSafety: 'Pump Safety & Interlocks',
      about: 'About JalaMitra',
    },
    common: {
      status: 'Status',
      source: 'Data Source',
      liveData: 'Live ESP32 Hardware',
      simulatedData: 'Demonstration / Simulated',
      lastUpdated: 'Last Updated',
      never: 'Never',
      refreshNow: 'Poll Now',
      save: 'Save Changes',
      cancel: 'Cancel',
      reset: 'Reset Defaults',
      clear: 'Clear',
      details: 'Details',
      troubleshooting: 'Troubleshooting Guide',
      calibrate: 'Calibrate Sensor',
      calibrated: 'Calibrated',
      uncalibrated: 'Uncalibrated',
      warning: 'Warning',
      critical: 'Critical',
      info: 'Info',
      active: 'Active',
      resolved: 'Resolved',
      viewAll: 'View All',
      exportCsv: 'Export CSV',
      clearData: 'Clear Local Data',
      connected: 'Connected',
      disconnected: 'Disconnected',
      offline: 'Offline',
      online: 'Online',
      stale: 'Stale (>30s)',
      unknown: 'Status Unknown',
      healthy: 'Operational',
      fault: 'Fault Detected',
      disabled: 'Disabled (Firmware Locked)',
      locked: 'Locked for Safety',
      notice: 'Notice',
    },
    dashboard: {
      soilMoistureTitle: 'Soil Moisture',
      soilMoistureDesc: 'Capacitive probe root-zone moisture telemetry',
      waterTankTitle: 'Water Tank Level',
      waterTankDesc: 'Ultrasonic acoustic time-of-flight reservoir level',
      esp32StatusTitle: 'ESP32 Device Node',
      esp32StatusDesc: 'Local Wi-Fi micro-controller telemetry ingress',
      alertsTitle: 'System Alerts & Warnings',
      noActiveAlerts: 'No active faults detected in current readings.',
      recommendationsTitle: 'Field Irrigation Guidance',
      deviceHealthTitle: 'Transducer & System Health',
      operatingMode: 'Operating Mode',
      pumpStatusTitle: 'Irrigation Pump Circuit',
      pumpStatusDesc: 'Physical relay control is disabled in current software version',
      quickShortcuts: 'Quick Navigation',
      viewHistory: 'Analyze Historical Graphs',
      openDiagnostics: 'Open Hardware Diagnostics',
      reviewSafety: 'Review Pump Safety Interlocks',
    },
    soil: {
      title: 'Soil Moisture Monitoring',
      subtitle: 'Real-time soil moisture monitoring with 2-point ADC calibration',
      rawAdcTitle: 'Raw Sensor ADC Output',
      rawAdcDescription: 'Direct 12-bit analog reading from ESP32 ADC1 channel (0 - 4095 counts)',
      calibratedPercentTitle: 'Calculated Moisture %',
      warningThresholdTitle: 'Dry Soil Alert Threshold',
      uncalibratedNotice:
        'Raw ADC is displaying without a calculated percentage. Capacitive probes require 2-point soil calibration before a volumetric water percentage can be verified.',
      calibrationModalTitle: 'Configure Soil Sensor Calibration',
      dryAirAdc: 'Dry Air ADC Value (0% Moisture)',
      dryAirAdcHelp: 'Hold the sensor dry in open air and note the raw ADC reading (typically 3000-3400).',
      wetWaterAdc: 'Submerged Water ADC Value (100% Moisture)',
      wetWaterAdcHelp: 'Submerge the sensor probe in a glass of water up to the white line (typically 1200-1600).',
      thresholdInput: 'Warning Moisture Threshold (%)',
      saveCalibration: 'Apply & Save Calibration',
      troubleshootHeader: 'Soil Moisture Engineering Diagnostics',
      tips: {
        fluctuation: 'Fluctuating readings often indicate poor soil-to-probe physical contact or air pockets.',
        airGap: 'Ensure the sensor is firmly inserted into root-zone depth without rocking the probe.',
        adcRange: 'ESP32 ADC non-linearity: Readings below 100mV and above 3.1V saturate. Use 11dB attenuation.',
        salinity: 'High fertilizer or salt content increases conductivity; recalibrate for specific field soil.',
      },
    },
    tank: {
      title: 'Water Tank Level Monitoring',
      subtitle: 'Ultrasonic distance measurement and tank reservoir capacity',
      distanceTitle: 'Measured Acoustic Distance',
      distanceDesc: 'Time-of-flight acoustic echo distance from sensor face to water surface',
      levelPercentTitle: 'Estimated Water Level %',
      lowWaterThresholdTitle: 'Low-Water Cutoff Limit',
      uncalibratedNotice:
        'Distance is measured in centimetres, but tank level % requires tank height geometry to be configured.',
      calibrationModalTitle: 'Configure Water Tank Dimensions',
      tankDepthCm: 'Total Tank Internal Depth (cm)',
      tankDepthCmHelp: 'Measure vertical distance from sensor face to the bottom of the water tank.',
      sensorBlindZoneCm: 'Sensor Blind Zone Clearance (cm)',
      sensorBlindZoneCmHelp: 'Minimum clearance above high-water mark (HC-SR04 has a 2-5cm dead zone).',
      lowWaterThresholdInput: 'Low Water Cutoff Threshold (%)',
      troubleshootHeader: 'Ultrasonic Sensor Engineering Diagnostics',
      tips: {
        echoFail: 'No echo (null cm): Check HC-SR04 5V VCC supply and verify trigger pulse duration (10µs).',
        blindZone: 'If water level is closer than 2 cm to the sensor face, echo reflections become erratic.',
        surfaceWaves: 'Filling water ripples or foam can disperse ultrasound waves; install a stilling pipe.',
        powerBounce: 'ESP32 3.3V GPIO to HC-SR04 Echo pin requires a voltage divider (1kΩ/2kΩ) to protect ESP32.',
      },
    },
    pump: {
      title: 'Irrigation Pump Management & Safety Architecture',
      subtitle: 'Pump control is deliberately disabled in this software version for safety',
      statusLabel: 'Motor Power Relay State',
      statusLocked: 'DISABLED & INTERLOCKED (SAFETY LOCKED)',
      safetyInterlockTitle: 'Hardware Verification Requirements',
      safetyReason:
        'Software cannot verify relay electrical isolation, motor inrush current, or physical dry-run protection on this untested prototype. Activating an unverified pump circuit can cause electrical fire or motor burnout.',
      requirementsTitle: 'Prerequisites Before Future Activation',
      relayIsolation: '1. Optocoupler Relay Module with Flyback Diode for Inductive Kickback Suppression',
      motorInrush: '2. Dedicated 12V/24V or 230V AC Power Supply Rated for 3x Inrush Motor Starting Current',
      dryRunSensor: '3. Redundant Mechanical Float Switch for Fail-Safe Hardware Dry-Run Interlock',
      physicalEStop: '4. Physical Emergency Stop Push-Button in Series with Relay Coil',
    },
    alerts: {
      title: 'Alert & Alarm Centre',
      subtitle: 'Active system events, hardware warnings, and diagnostic guidance',
      activeCount: 'Active System Alerts',
      filterAll: 'All Severities',
      filterCritical: 'Critical Only',
      filterWarning: 'Warnings',
      filterInfo: 'Info Notices',
      diagnosticRecommendation: 'Recommended Action',
    },
    recommendations: {
      title: 'Farmer Irrigation Advisory',
      subtitle: 'Explainable, rule-based field recommendations derived from sensor observations',
      observationLabel: '1. What Was Observed',
      impactLabel: '2. Why It Matters (Agronomic Impact)',
      actionLabel: '3. What To Check Next',
    },
    diagnostics: {
      title: 'Device Diagnostics & Hardware Workbench',
      subtitle: 'Embedded systems inspection, ESP32 connection telemetry, and Cirkit prototype pinouts',
      transducerStatus: 'Transducer Validity',
      networkStatus: 'Communication Link',
      pinoutHeader: 'ESP32 Hardware Pinout Reference (Cirkit Prototype)',
      consoleHeader: 'Telemetry Event Log',
      clearLogs: 'Clear Log History',
    },
    about: {
      title: 'About JalaMitra Major Project',
      subtitle: 'Engineering design, system architecture, and evaluation documentation',
      projectOverview: 'Project Objective & Architecture',
      cirkitHeader: 'Virtual Prototype in Cirkit Designer',
      vivaChecklistHeader: 'Engineering Viva & Interview Demonstration Checklist',
    },
  },

  te: {
    appName: 'జలమిత్ర (JalaMitra)',
    appSubtitle: 'స్మార్ట్ నీటిపారుదల మరియు నీటి ట్యాంక్ పర్యవేక్షణ వ్యవస్థ',
    demoModeBanner: 'డెమో మోడ్ — సిమ్యులేటెడ్ డేటా — అసలు సెన్సార్ల నుండి కాదు',
    demoModeDescription:
      'ఈ వ్యవస్థ ప్రస్తుతం నమూనా ప్రదర్శన మరియు పరీక్షల కొరకు కృత్రిమ డేటాతో నడుస్తోంది.',
    exitDemoMode: 'లైవ్ మోడ్‌కి మారండి',
    enterDemoMode: 'డెమో మోడ్‌ని ప్రారంభించండి',
    nav: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      liveMonitoring: 'లైవ్ పర్యవేక్షణ',
      soil: 'నేల తేమ',
      tank: 'నీటి ట్యాంక్',
      sensorHistory: 'సెన్సార్ చరిత్ర',
      alerts: 'హెచ్చరికలు',
      diagnostics: 'పరికర నిర్ధారణ',
      recommendations: 'రైతు సలహాలు',
      pumpSafety: 'పంపు భద్రత & లాక్',
      about: 'ప్రాజెక్ట్ గురించి',
    },
    common: {
      status: 'స్థితి',
      source: 'డేటా మూలం',
      liveData: 'ESP32 ప్రత్యక్ష హార్డ్‌వేర్',
      simulatedData: 'డెమో / కృత్రిమ నమూనా',
      lastUpdated: 'చివరి నవీకరణ',
      never: 'ఎప్పుడూ లేదు',
      refreshNow: 'రీఫ్రెష్ చేయండి',
      save: 'భద్రపరచండి',
      cancel: 'రద్దు చేయండి',
      reset: 'రీసెట్ చేయండి',
      clear: 'తుడిచివేయండి',
      details: 'వివరాలు',
      troubleshooting: 'సమస్య పరిష్కార సూచనలు',
      calibrate: 'సెన్సార్ క్రమాంకనం (Calibrate)',
      calibrated: 'క్రమాంకనం పూర్తయింది',
      uncalibrated: 'క్రమాంకనం కాలేదు',
      warning: 'హెచ్చరిక',
      critical: 'తీవ్ర హెచ్చరిక',
      info: 'సమాచారం',
      active: 'క్రియాశీలకంగా ఉంది',
      resolved: 'పరిష్కరించబడింది',
      viewAll: 'అన్నీ చూడండి',
      exportCsv: 'CSV ఎగుమతి చేయండి',
      clearData: 'లోకల్ డేటా తుడిపివేయండి',
      connected: 'కనెక్ట్ అయింది',
      disconnected: 'కనెక్షన్ తెగిపోయింది',
      offline: 'ఆఫ్‌లైన్',
      online: 'ఆన్‌లైన్',
      stale: 'పాత డేటా (>30 సెకన్లు)',
      unknown: 'స్థితి తెలియదు',
      healthy: 'సక్రమంగా పనిచేస్తోంది',
      fault: 'లోపం గుర్తించబడింది',
      disabled: 'నిలిపివేయబడింది (భద్రత కొరకు)',
      locked: 'భద్రత కొరకు లాక్ చేయబడింది',
      notice: 'గమనిక',
    },
    dashboard: {
      soilMoistureTitle: 'నేల తేమ శాతం',
      soilMoistureDesc: 'మొక్కల వేరు ప్రాంతపు నేల తేమ రీడింగ్',
      waterTankTitle: 'నీటి ట్యాంక్ స్థాయి',
      waterTankDesc: 'అల్ట్రాసోనిక్ సెన్సార్ ద్వారా నీటి నిల్వ కొలత',
      esp32StatusTitle: 'ESP32 పరికరం',
      esp32StatusDesc: 'స్థానిక వై-ఫై ద్వారా డేటా స్వీకరణ',
      alertsTitle: 'వ్యవస్థ హెచ్చరికలు',
      noActiveAlerts: 'ప్రస్తుతం ఎలాంటి లోపాలు లేవు.',
      recommendationsTitle: 'రైతులకు సాగు సలహాలు',
      deviceHealthTitle: 'సెన్సార్ల పనితీరు',
      operatingMode: 'పనిచేస్తున్న విధానం',
      pumpStatusTitle: 'మోటారు పంపు స్థితి',
      pumpStatusDesc: 'భద్రత కొరకు పంపు నియంత్రణ ప్రస్తుతం నిలిపివేయబడింది',
      quickShortcuts: 'ముఖ్యమైన లింకులు',
      viewHistory: 'గత రికార్డులను చూడండి',
      openDiagnostics: 'హార్డ్‌వేర్ పరీక్షలు',
      reviewSafety: 'పంపు భద్రతా నియమాలు',
    },
    soil: {
      title: 'నేల తేమ పర్యవేక్షణ',
      subtitle: 'నిజ-సమయ నేల తేమ రీడింగ్ మరియు కాలిబ్రేషన్',
      rawAdcTitle: 'సెన్సార్ నేరుగా ఇచ్చిన ADC విలువ',
      rawAdcDescription: 'ESP32 అనలాగ్ పిన్ నుండి వచ్చిన 12-బిట్ సంఖ్య (0 - 4095)',
      calibratedPercentTitle: 'లెక్కించిన తేమ శాతం (%)',
      warningThresholdTitle: 'కనీస తేమ హెచ్చరిక పరిమితి',
      uncalibratedNotice:
        'సెన్సార్ క్రమాంకనం (Calibration) చేయలేదు. ఎండిన మట్టి మరియు తడి మట్టి విలువలను నమోదు చేసిన తర్వాతే శాతం కచ్చితంగా వస్తుంది.',
      calibrationModalTitle: 'నేల తేమ సెన్సార్ కాలిబ్రేషన్ సెట్టింగులు',
      dryAirAdc: 'గాలిలో / ఎండిన మట్టిలో ADC విలువ (0% తేమ)',
      dryAirAdcHelp: 'సెన్సార్‌ను గాలిలో ఉంచి వచ్చిన ADC సంఖ్యను నమోదు చేయండి (సుమారు 3000-3400).',
      wetWaterAdc: 'నీటిలో ముంచినప్పుడు ADC విలువ (100% తేమ)',
      wetWaterAdcHelp: 'సెన్సార్‌ను గ్లాసు నీటిలో ముంచి వచ్చిన ADC సంఖ్యను నమోదు చేయండి (సుమారు 1200-1600).',
      thresholdInput: 'హెచ్చరిక రావలసిన కనీస తేమ శాతం (%)',
      saveCalibration: 'కాలిబ్రేషన్ సేవ్ చేయండి',
      troubleshootHeader: 'నేల తేమ సెన్సార్ సమస్యల పరిష్కారం',
      tips: {
        fluctuation: 'రీడింగ్లు త్వరగా మారుతుంటే సెన్సార్ మట్టిలో వదులుగా ఉందని అర్థం.',
        airGap: 'సెన్సార్‌ను మొక్క వేర్ల దగ్గర మట్టి గట్టిగా ఉండేలా గుచ్చండి.',
        adcRange: 'ESP32 లో 3.1V కన్నా ఎక్కువ లేదా 100mV కన్నా తక్కువ ఉన్నప్పుడు రీడింగ్ స్థిరంగా ఉండదు.',
        salinity: 'మట్టిలో ఉప్పు లేదా ఎరువులు ఎక్కువగా ఉంటే తేమ విలువ మారవచ్చు.',
      },
    },
    tank: {
      title: 'నీటి ట్యాంక్ స్థాయి పర్యవేక్షణ',
      subtitle: 'అల్ట్రాసోనిక్ సెన్సార్ ద్వారా నీటి నిల్వ కొలత',
      distanceTitle: 'సెన్సార్ నుండి నీటికి ఉన్న దూరం (సెం.మీ)',
      distanceDesc: 'అల్ట్రాసోనిక్ తరంగాలు నీటి ఉపరితలాన్ని తాకి తిరిగి రావడానికి పట్టిన సమయం',
      levelPercentTitle: 'ట్యాంక్‌లో ఉన్న నీటి శాతం (%)',
      lowWaterThresholdTitle: 'కనీస నీటి హెచ్చరిక పరిమితి (%)',
      uncalibratedNotice:
        'దూరం సెంటీమీటర్లలో వస్తోంది, కానీ ట్యాంక్ పూర్తి ఎత్తు నమోదు చేయకపోవడం వల్ల శాతం లెక్కించబడలేదు.',
      calibrationModalTitle: 'ట్యాంక్ కొలతల వివరాలు నమోదు చేయండి',
      tankDepthCm: 'ట్యాంక్ మొత్తం లోతు (సెం.మీ)',
      tankDepthCmHelp: 'సెన్సార్ ఉన్న పైభాగం నుండి ట్యాంక్ అడుగుభాగం వరకు ఉన్న మొత్తం దూరం.',
      sensorBlindZoneCm: 'సెన్సార్ బ్లైండ్ జోన్ ఖాళీ (సెం.మీ)',
      sensorBlindZoneCmHelp: 'గరిష్ట నీటి స్థాయికి మరియు సెన్సార్‌కు మధ్య ఉంచాల్సిన కనీస ఖాళీ (2-5 సెం.మీ).',
      lowWaterThresholdInput: 'కనీస నీటి పరిమితి శాతం (%)',
      troubleshootHeader: 'అల్ట్రాసోనిక్ సెన్సార్ సమస్యల పరిష్కారం',
      tips: {
        echoFail: 'రీడింగ్ రాకపోతే HC-SR04 కి 5V కరెంట్ సరిగ్గా అందుతుందో లేదో చూడండి.',
        blindZone: 'నీరు సెన్సార్‌కు 2 సెం.మీ కంటే దగ్గరగా వస్తే సెన్సార్ సరిగ్గా పని చేయదు.',
        surfaceWaves: 'ట్యాంక్‌లోకి నీరు పడేటప్పుడు ఏర్పడే నురుగు లేదా అలల వల్ల తరంగాలు చెల్లాచెదురవుతాయి.',
        powerBounce: 'ESP32 పిన్ను రక్షించడానికి Echo పిన్ దగ్గర వోల్టేజ్ డివైడర్ వాడాలి.',
      },
    },
    pump: {
      title: 'మోటారు పంపు నియంత్రణ మరియు భద్రతా సూత్రాలు',
      subtitle: 'భద్రత దృష్ట్యా ఈ సాఫ్ట్‌వేర్ వెర్షన్‌లో పంపు స్విచ్ పూర్తిగా నిలిపివేయబడింది',
      statusLabel: 'రిలే స్విచ్ స్థితి',
      statusLocked: 'నిలిపివేయబడింది (భద్రత కొరకు లాక్ చేయబడింది)',
      safetyInterlockTitle: 'హార్డ్‌వేర్ భద్రతా తనిఖీ అవసరం',
      safetyReason:
        'ఈ నమూనా ప్రాజెక్ట్‌లో రిలే సర్క్యూట్, మోటార్ స్టార్టింగ్ కరెంట్ మరియు డ్రై-రన్ ప్రొటెక్షన్ ఇంకా శారీరకంగా పరీక్షించబడలేదు. తనిఖీ చేయకుండా పంపు ఆన్ చేస్తే విద్యుత్ ప్రమాదాలు జరిగే అవకాశం ఉంది.',
      requirementsTitle: 'భవిష్యత్తులో పంపు ఆన్ చేయడానికి కావాల్సినవి',
      relayIsolation: '1. ఆప్టోకప్లర్ మరియు ఫ్లైబ్యాక్ డయోడ్ ఉన్న సురక్షితమైన రిలే మాడ్యూల్',
      motorInrush: '2. మోటారు ఆన్ అయ్యేటప్పుడు వచ్చే అధిక కరెంట్‌ను తట్టుకోగల విద్యుత్ సరఫరా',
      dryRunSensor: '3. ట్యాంక్‌లో నీరు లేనప్పుడు మోటారు ఆన్ కాకుండా చూసే ఫ్లోట్ స్విచ్',
      physicalEStop: '4. అత్యవసర పరిస్థితుల్లో మోటారును వెంటనే ఆపడానికి ఎమర్జెన్సీ స్టాప్ బటన్',
    },
    alerts: {
      title: 'హెచ్చరికల కేంద్రం',
      subtitle: 'వ్యవస్థలోని సమస్యలు, హెచ్చరికలు మరియు తనిఖీ సూచనలు',
      activeCount: 'ప్రస్తుతం ఉన్న హెచ్చరికలు',
      filterAll: 'అన్ని హెచ్చరికలు',
      filterCritical: 'తీవ్రమైనవి మాత్రమే',
      filterWarning: 'సాధారణ హెచ్చరికలు',
      filterInfo: 'సమాచార నోటీసులు',
      diagnosticRecommendation: 'తనిఖీ చేయవలసిన విధానం',
    },
    recommendations: {
      title: 'రైతులకు ఉపయోగకరమైన సలహాలు',
      subtitle: 'సెన్సార్ రీడింగుల ఆధారంగా పొలంలో తీసుకోవలసిన తక్షణ చర్యలు',
      observationLabel: '1. వ్యవస్థ గమనించిన అంశం',
      impactLabel: '2. దీని ప్రభావం (పంటకు ఏమి జరుగుతుంది)',
      actionLabel: '3. మీరు తదుపరి చేయవలసిన పని',
    },
    diagnostics: {
      title: 'పరికర నిర్ధారణ & సాంకేతిక వివరాలు',
      subtitle: 'ఇంజనీరింగ్ విద్యార్థులు మరియు సాంకేతిక నిపుణుల కొరకు హార్డ్‌వేర్ తనిఖీ కేంద్రం',
      transducerStatus: 'సెన్సార్ల స్థితి',
      networkStatus: 'వై-ఫై కమ్యూనికేషన్',
      pinoutHeader: 'ESP32 పిన్ వివరాలు (Cirkit నమూనా ఆధారంగా)',
      consoleHeader: 'ఈవెంట్ లాగ్',
      clearLogs: 'లాగ్ చరిత్రను తొలగించండి',
    },
    about: {
      title: 'జలమిత్ర మేజర్ ప్రాజెక్ట్ గురించి',
      subtitle: 'ఇంజనీరింగ్ నమూనా, ఆర్కిటెక్చర్ మరియు ప్రాజెక్ట్ మూల్యాంకన వివరాలు',
      projectOverview: 'ప్రాజెక్ట్ లక్ష్యం మరియు నిర్మాణం',
      cirkitHeader: 'Cirkit డిజైనర్ వర్చువల్ ప్రోటోటైప్',
      vivaChecklistHeader: 'ప్రాజెక్ట్ వైవా & ఇంటర్వ్యూ డెమో చెక్‌లిస్ట్',
    },
  },
};
