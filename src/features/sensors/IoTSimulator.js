import { INITIAL_SENSORS, recordSensorReading, recordSensorAlert } from './sensorService';

/**
 * Cloud-Based Disaster Management & Emergency Response System
 * Software-Based IoT Sensor Simulator
 *
 * This module simulates virtual IoT telemetry devices entirely in software.
 * It demonstrates the cloud telemetry ingestion pipeline:
 * Simulated Device -> JS Generator -> Firebase SDK -> Cloud Firestore -> Real-Time Listener -> Threshold Alert
 */
class IoTSimulatorService {
  constructor() {
    this.sensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
    this.isRunning = false;
    this.intervalId = null;
    this.intervalSeconds = 10;
    this.activeScenario = 'NORMAL'; // 'NORMAL' | 'RISING_WATER' | 'WILDFIRE'
    this.scenarioStep = 0;
    
    // Alert state tracking to avoid duplicate alert flooding when sensor stays above threshold
    // { [sensorId]: boolean (true if currently alerted) }
    this.alertStates = {};
    this.sensors.forEach(s => {
      this.alertStates[s.id] = false;
    });

    this.listeners = new Set();
    this.totalReadingsGenerated = 0;
    this.lastReadingTime = null;
  }

  // Subscribe UI components to simulator state
  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  getState() {
    return {
      isRunning: this.isRunning,
      intervalSeconds: this.intervalSeconds,
      activeScenario: this.activeScenario,
      scenarioStep: this.scenarioStep,
      sensors: [...this.sensors],
      totalReadingsGenerated: this.totalReadingsGenerated,
      lastReadingTime: this.lastReadingTime
    };
  }

  setIntervalSeconds(sec) {
    this.intervalSeconds = Math.max(3, Number(sec) || 10);
    if (this.isRunning) {
      this.stop();
      this.start();
    } else {
      this.notify();
    }
  }

  setScenario(scenario) {
    this.activeScenario = scenario;
    this.scenarioStep = 0;
    console.log(`[IoT Simulator] Scenario set to: ${scenario}`);
    this.notify();
  }

  resetScenario() {
    this.activeScenario = 'NORMAL';
    this.scenarioStep = 0;
    this.sensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
    this.sensors.forEach(s => {
      this.alertStates[s.id] = false;
    });
    console.log('[IoT Simulator] Scenario reset to baseline.');
    this.notify();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[IoT Simulator] Started at ${this.intervalSeconds}s interval.`);
    
    // Run an immediate tick
    this.tick();

    // Setup periodic interval
    this.intervalId = setInterval(() => {
      this.tick();
    }, this.intervalSeconds * 1000);

    this.notify();
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[IoT Simulator] Stopped.');
    this.notify();
  }

  /**
   * Main simulation step (Tick)
   * Generates realistic readings based on sensor physics and active demo scenario
   */
  async tick() {
    this.scenarioStep++;
    this.lastReadingTime = new Date().toISOString();

    for (const sensor of this.sensors) {
      let nextValue = sensor.currentValue;

      if (this.activeScenario === 'RISING_WATER') {
        if (sensor.type === 'water-level') {
          // Surge water level steadily to breach the 150cm threshold
          nextValue = Math.min(220, Number((nextValue + 12 + Math.random() * 6).toFixed(1)));
        } else {
          // Normal fluctuation for others
          nextValue = this.applyRandomWalk(sensor);
        }
      } else if (this.activeScenario === 'WILDFIRE') {
        if (sensor.type === 'temperature') {
          // Rapid heat surge to breach 45°C
          nextValue = Math.min(65, Number((nextValue + 3.5 + Math.random() * 1.5).toFixed(1)));
        } else if (sensor.type === 'smoke') {
          // Heavy smoke index breach
          nextValue = Math.min(100, Number((nextValue + 7 + Math.random() * 4).toFixed(1)));
        } else {
          nextValue = this.applyRandomWalk(sensor);
        }
      } else {
        // Normal state: fluctuate gently around normal range
        nextValue = this.applyRandomWalk(sensor);
      }

      sensor.currentValue = nextValue;
      sensor.lastUpdated = this.lastReadingTime;

      // Status determination
      const isExceeded = nextValue >= sensor.threshold;
      sensor.status = isExceeded ? 'CRITICAL' : (nextValue >= sensor.threshold * 0.85 ? 'WARNING' : 'NORMAL');

      // Create payload object conforming to academic specification
      const readingPayload = {
        sensorId: sensor.id,
        sensorName: sensor.name,
        sensorType: sensor.type,
        readingValue: nextValue,
        unit: sensor.unit,
        simulatedLocation: sensor.location,
        lat: sensor.lat,
        lng: sensor.lng,
        status: sensor.status,
        threshold: sensor.threshold,
        isSimulated: true
      };

      // 1. Send reading to Cloud Firestore / local cache
      await recordSensorReading(readingPayload);
      this.totalReadingsGenerated++;

      // 2. Threshold Alert Processing with Alert State Debouncing
      if (isExceeded) {
        if (!this.alertStates[sensor.id]) {
          // State transition: Normal -> Alert (Trigger fresh alert once!)
          this.alertStates[sensor.id] = true;
          console.warn(`[IoT Threshold Alert] Sensor ${sensor.id} breached threshold: ${nextValue} ${sensor.unit} (Limit: ${sensor.threshold})`);

          await recordSensorAlert({
            sensorId: sensor.id,
            sensorName: sensor.name,
            sensorType: sensor.type,
            readingValue: nextValue,
            unit: sensor.unit,
            threshold: sensor.threshold,
            simulatedLocation: sensor.location,
            severity: nextValue > sensor.threshold * 1.2 ? 'CRITICAL' : 'HIGH',
            message: `Simulated threshold alert: ${sensor.name} measured ${nextValue} ${sensor.unit}, exceeding safety limit of ${sensor.threshold} ${sensor.unit}.`
          });
        }
      } else {
        // Sensor returned below threshold: reset alert state so future breaches trigger an alert
        if (this.alertStates[sensor.id]) {
          console.info(`[IoT Status] Sensor ${sensor.id} normalized to ${nextValue} ${sensor.unit}. Alert state cleared.`);
          this.alertStates[sensor.id] = false;
        }
      }
    }

    this.notify();
  }

  // Realistic random fluctuation around bounds
  applyRandomWalk(sensor) {
    const range = sensor.normalRange.max - sensor.normalRange.min;
    const delta = (Math.random() - 0.5) * (range * 0.1);
    let val = sensor.currentValue + delta;

    // Gently nudge towards the normal center if drifted too far
    const center = (sensor.normalRange.min + sensor.normalRange.max) / 2;
    val = val * 0.95 + center * 0.05;

    return Number(val.toFixed(1));
  }
}

// Export singleton instance
export const IoTSimulator = new IoTSimulatorService();
