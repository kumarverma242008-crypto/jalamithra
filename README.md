# JalaMitra — Smart Irrigation & Water-Level Monitoring System

**Major Engineering Project**  
*ESP32-Based Telemetry Ingress with Future Pump Protection & Bilingual Agricultural Advisory*

---

## 1. Project Overview & Problem Statement

In semi-arid and groundwater-dependent agrarian regions (such as Telangana and Andhra Pradesh), small and medium-scale farmers face two acute challenges:
1. **Pump Motor Burnout & Dry-Running:** Running submersible or surface pump sets when sumps or borewells dry up causes rapid impeller cavitation, motor overheating, and winding insulation failure. This incurs costly motor rewinding expenses and downtime.
2. **Over-Irrigation & Energy Wastage:** Surface flood irrigation without real-time soil moisture monitoring leads to waterlogging, fertilizer runoff, and excessive electricity consumption.
3. **High Cost & Closed Ecosystems:** Commercial precision irrigation systems rely on expensive proprietary cloud subscriptions, English-only dashboards, and unverified automated controls.

**JalaMitra** is an open-standard, security-conscious, IoT monitoring system. It combines an **ESP32 DevKit V1 edge node** with **capacitive soil-moisture dielectric probing**, **acoustic ultrasonic water-level measurement**, an **on-device OLED display**, and a **bilingual (English & Telugu - తెలుగు) web application**.

---

## 2. Hardware Context & Prototype Baseline

An initial virtual prototype has been created in **Cirkit Designer**:
- **ESP32 DevKit V1 (30-pin)** (Dual-core Xtensa LX6 @ 240 MHz, 520 KB SRAM, 2.4 GHz Wi-Fi)
- **Capacitive Soil Moisture Sensor v1.2 / v2.0** (Analog 0–3.3V connected to ESP32 `GPIO 34 / ADC1_CH6`)
- **Ultrasonic Sensor (HC-SR04)** (Trig: `GPIO 5`, Echo: `GPIO 18` via 1kΩ/2kΩ resistive voltage divider)
- **0.96" I2C OLED Display (SSD1306)** (`GPIO 21 SDA`, `GPIO 22 SCL`)
- **Status LEDs & Piezo Buzzer** (`GPIO 2 Blue`, `GPIO 4 Red Fault`, `GPIO 19 Buzzer`)
- **Submersible Pump Relay Driver** (`GPIO 23`, **FIRMWARE-LOCKED / DISABLED**)

> **CRITICAL HARDWARE SAFETY NOTICE:**  
> The physical hardware has not yet undergone electrical high-voltage bench testing. Relay coil isolation, motor starting inrush current, and fail-safe dry-run interlocks are unverified. **Pump control commands are deliberately locked and disabled in this software release.**

---

## 3. System Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                            PHYSICAL SENSOR TRANSDUCERS                            |
|  - Capacitive Soil Moisture (Dielectric Frequency) -> Analog Voltage (0 - 3.3V)   |
|  - Ultrasonic Transducer HC-SR04 (40 kHz Burst)   -> Echo Pulse Width (Time-of-Flight)
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                             ESP32 EDGE CONTROLLER NODE                            |
|  - Samples ADC1 (GPIO 34, 11dB attenuation, 12-bit SAR ADC 0-4095 counts)         |
|  - Measures HC-SR04 echo duration (pulseIn) -> Converts to distance (cm)          |
|  - Local Hardware Diagnostics on SSD1306 OLED (I2C 400kHz)                        |
|  - Hosts HTTP REST Server (`/api/telemetry`) on local Wi-Fi / SoftAP              |
+-----------------------------------------------------------------------------------+
                                         │
                         (Local Wi-Fi / HTTP REST JSON)
                                         ▼
+-----------------------------------------------------------------------------------+
|                        JALAMITRA WEB APPLICATION (CLIENT)                         |
|  - Data Contract Validation Engine (Strict schema & timestamp verification)       |
|  - 2-Point Soil Calibration & Tank Geometry Conversion Engine                     |
|  - Dynamic Alert & Stale-Data Watchdog Engine (>30s stale detection)              |
|  - Rule-Based Agronomic Farmer Advisory Engine                                    |
|  - Historical SVG Time-Series Analytics & RFC-4180 CSV Export                     |
|  - English & Telugu (తెలుగు) Bilingual Localization Interface                     |
+-----------------------------------------------------------------------------------+
```

---

## 4. ESP32 REST Telemetry Data Contract

The communication contract between the ESP32 node and the JalaMitra client uses a strictly typed JSON payload:

```json
{
  "deviceId": "jalamitra-esp32-01",
  "timestamp": "2026-10-21T10:15:00.000Z",
  "source": "live",
  "soil": {
    "rawAdc": 2150,
    "moisturePercent": 46.2,
    "valid": true
  },
  "tank": {
    "distanceCm": 42.5,
    "levelPercent": 68.0,
    "valid": true
  },
  "system": {
    "sensorFault": false,
    "pumpCommand": "disabled",
    "pumpFeedback": "unavailable"
  }
}
```

### Data Contract Field Dictionary

| Field | Type | Unit | Engineering Constraints |
| :--- | :--- | :--- | :--- |
| `deviceId` | `string` | — | Non-empty alphanumeric node ID. |
| `timestamp` | `string` | ISO 8601 | UTC timestamp. Stale if older than 30 seconds. |
| `source` | `string` | — | Strictly `'live'` or `'simulated'`. Unknown sources rejected. |
| `soil.rawAdc` | `number \| null` | 12-bit count | Range `0 - 4095`. ADC1_CH6 (11dB attenuation). |
| `soil.moisturePercent` | `number \| null` | % VWC | Range `0 - 100%`. Set to `null` if uncalibrated. |
| `soil.valid` | `boolean` | — | `false` if transducer open-circuit or shorted to GND. |
| `tank.distanceCm` | `number \| null` | centimetres | Range `2 - 400 cm`. `< 2 cm` is in transducer dead zone. |
| `tank.levelPercent` | `number \| null` | % capacity | Calculated via tank depth. Set to `null` if unconfigured. |
| `tank.valid` | `boolean` | — | `false` if acoustic echo timed out. |
| `system.sensorFault`| `boolean` | — | Flagged if any transducer failed I/O. |
| `system.pumpCommand`| `string` | — | Must be `'disabled'`, `'locked'`, or `'unsupported'`. |
| `system.pumpFeedback`| `string` | — | Must be `'unavailable'` or `'unverified'`. |

---

## 5. Feature Lifecycle & Verification Matrix

Every feature in JalaMitra is categorized by its actual verification state:

| Feature / Module | Verification State |
| :--- | :--- |
| **Professional Agricultural Dashboard** | `Implemented and software-tested` |
| **Soil Moisture Monitoring & 2-Point Calibration** | `Implemented and software-tested` |
| **Water Tank Monitoring & Geometry Calibration** | `Implemented and software-tested` |
| **Data Contract Ingress & Payload Validator** | `Implemented and software-tested` |
| **Alert Centre & Threshold Engine** | `Implemented and software-tested` |
| **Historical Analytics & CSV Export** | `Implemented and software-tested` |
| **Telugu (తెలుగు) & English Localization** | `Implemented and software-tested` |
| **Demonstration Simulator (5 Presets)** | `Demonstration-only` |
| **Cirkit Designer Virtual Prototype Mapping** | `Awaiting hardware integration` |
| **Soil Probe Field Calibration (Clay/Loam)** | `Awaiting calibration` |
| **7-Point Pump Safety Interlock & Relay Circuit** | `Awaiting physical testing` |
| **Autonomous Irrigation Relay Actuation** | `Planned future functionality` |
| **Solar / Battery Voltage ADC Monitoring** | `Planned future functionality` |

---

## 6. How to Run the Application

### Prerequisites
- Node.js 18+ and npm

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
http://localhost:3000
```

### Type Checking & Build
```bash
# Verify TypeScript syntax and types
npm run lint

# Compile production bundle
npm run build
```

---

## 7. How to Use Demonstration Mode

When physical hardware is not plugged in, JalaMitra boots into **Demo Mode** by default:
1. A banner is shown at the top:  
   `DEMO MODE — SIMULATED DATA — NOT FROM REAL SENSORS`
2. Use the **Test Scenarios** buttons in the banner:
   - **Normal:** Nominal soil moisture (~48%) and tank water level (~65%).
   - **Dry Soil:** Soil ADC count rises (3100+), moisture drops to ~8%, triggering a root-zone warning.
   - **Low Tank:** Tank distance increases (88cm), fill drops to ~12%, triggering a pump lockout cutoff alert.
   - **Sensor Fault:** Simulates ADC short (0 count) and ultrasonic echo loss (null cm).
   - **Uncalibrated:** Demonstrates raw ADC and raw distance cm with clear uncalibrated warnings.
3. Click **"Exit Demo"** or toggle in the header to switch to **Live Mode**. In live mode, the app polls the configured ESP32 HTTP endpoint. If the ESP32 is offline, the app displays a clear disconnected state rather than faking data.

---

## 8. How to Connect a Real ESP32 Later

### ESP32 Wiring Diagram (DevKit V1)
- **Soil Moisture Probe (Capacitive v1.2):**
  - VCC -> ESP32 3.3V
  - GND -> ESP32 GND
  - AOUT -> ESP32 `GPIO 34` (ADC1_CH6)
- **Ultrasonic Sensor (HC-SR04):**
  - VCC -> External 5V rail
  - GND -> Common GND
  - Trig -> ESP32 `GPIO 5`
  - Echo -> Voltage divider: 1kΩ resistor to `GPIO 18`, 2kΩ resistor from `GPIO 18` to GND.
- **I2C OLED (SSD1306):**
  - VCC -> 3.3V
  - GND -> GND
  - SDA -> `GPIO 21`
  - SCL -> `GPIO 22`

### ESP32 Arduino / PlatformIO Firmware Sketch Template
```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const char* ssid = "JalaMitra-AP";
const char* password = "irrigation_pass";

WebServer server(80);

const int SOIL_PIN = 34; // ADC1
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

void handleTelemetry() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");

  int rawSoil = analogRead(SOIL_PIN);
  bool soilValid = (rawSoil > 50 && rawSoil < 4050);

  // Ultrasonic distance
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  float distanceCm = (duration > 0) ? (duration * 0.0343 / 2.0) : -1.0;
  bool tankValid = (distanceCm >= 2.0 && distanceCm <= 400.0);

  StaticJsonDocument<512> doc;
  doc["deviceId"] = "jalamitra-esp32-01";
  doc["timestamp"] = "2026-10-21T10:15:00.000Z"; // Sync via NTP in production
  doc["source"] = "live";

  JsonObject soil = doc.createNestedObject("soil");
  soil["rawAdc"] = soilValid ? rawSoil : (int)0;
  soil["moisturePercent"] = nullptr; // Let client apply calibrated formula
  soil["valid"] = soilValid;

  JsonObject tank = doc.createNestedObject("tank");
  if (tankValid) {
    tank["distanceCm"] = distanceCm;
    tank["levelPercent"] = nullptr;
  } else {
    tank["distanceCm"] = nullptr;
    tank["levelPercent"] = nullptr;
  }
  tank["valid"] = tankValid;

  JsonObject system = doc.createNestedObject("system");
  system["sensorFault"] = (!soilValid || !tankValid);
  system["pumpCommand"] = "disabled";
  system["pumpFeedback"] = "unavailable";

  String output;
  serializeJson(doc, output);
  server.send(200, "application/json", output);
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(SOIL_PIN, ADC_11db);

  WiFi.softAP(ssid, password);
  server.on("/api/telemetry", HTTP_GET, handleTelemetry);
  server.begin();
}

void loop() {
  server.handleClient();
}
```

---

## 9. Security & Privacy Measures

1. **Zero Hardcoded Secrets:** No API keys, database credentials, or passwords are baked into frontend code.
2. **Safe Input Validation:** All incoming JSON telemetry is strictly validated through `validateJalaMitraPayload()`. Malformed or injection payloads are safely discarded.
3. **No Unnecessary Data Harvesting:** No user phone numbers, biometric data, precise GPS coordinates, or cloud tracking trackers are used.
4. **Local Data Isolation:** Telemetry records and calibration parameters are stored exclusively in the browser's `localStorage` and can be wiped completely using the **"Clear Local Data"** button.
5. **CORS & Network Safety:** Clear documentation on browser mixed content security and preflight headers for local embedded web servers.
6. **Hardware Interlock Enforcement:** Software explicitly prevents relay actuation commands from being issued.

---

## 10. Remaining Hardware Verification Checklist

Before motor pump control can ever be activated in physical field trials:
- [ ] Verify optocoupler isolation (PC817) between ESP32 3.3V logic and relay coil.
- [ ] Install reverse-biased flyback diode (1N4007) across relay inductive coil.
- [ ] Measure motor starting inrush current with an oscilloscope / clamp meter to ensure external power supply capacity.
- [ ] Ensure pump motor power supply has a completely separate rail from the ESP32 3.3V regulator to prevent brownout resets.
- [ ] Install a redundant physical mechanical float switch in series with the relay coil for fail-safe hardware dry-run cutoff.
- [ ] Install a latching, normally-closed Emergency Stop push-button on the field enclosure.
- [ ] Verify that the relay is driven active-high and does not pulse on during ESP32 boot.
