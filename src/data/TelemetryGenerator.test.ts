import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { liveTelemetry } from './TelemetryGenerator';

describe('TelemetryGenerator', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Reset emergency state before each test
        liveTelemetry.setIsEmergency(false);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('generates state within valid bounds', () => {
        const carbon = liveTelemetry.getCarbonSaved();
        expect(carbon).toBeGreaterThanOrEqual(1400);
        expect(carbon).toBeLessThanOrEqual(2500);
        
        const rawData = liveTelemetry.getRawData();
        expect(rawData.length).toBeGreaterThan(0);
    });

    it('generates a formatted live state string', () => {
        const str = liveTelemetry.getLiveStateString();
        expect(typeof str).toBe('string');
        expect(str).toContain('Total Attendance:');
        expect(str).toContain('Sensor');
    });

    it('should initialize sensors with baseline values', () => {
        const rawData = liveTelemetry.getRawData();
        expect(rawData.length).toBeGreaterThan(0);
        
        const northGate = rawData.find(d => d.nodeId === 'g_north');
        expect(northGate).toBeDefined();
        expect(northGate?.metricType).toBe('Density');
        
        expect(northGate?.value).toBe(35);
    });

    it('should update sensors realistically over time', () => {
        const initialData = liveTelemetry.getRawData().find(d => d.nodeId === 'g_north')?.value as number;
        
        // Fast forward 10 seconds to trigger updateSensors
        vi.advanceTimersByTime(10000);
        
        const newData = liveTelemetry.getRawData().find(d => d.nodeId === 'g_north')?.value as number;
        // The value should be close to initial (shift is between -2 and +2)
        expect(Math.abs(newData - initialData)).toBeLessThanOrEqual(2);
    });

    it('should max out density during an emergency', () => {
        liveTelemetry.setIsEmergency(true);
        const isEmerg = liveTelemetry.getIsEmergency();
        expect(isEmerg).toBe(true);

        const rawData = liveTelemetry.getRawData();
        const gateData = rawData.find(d => d.metricType === 'Density');
        expect(gateData?.value).toBe(95); // Expect peak density on emergency
    });

    it('should apply mitigations properly', () => {
        liveTelemetry.applyMitigation('deploy_volunteers');
        const southGate = liveTelemetry.getRawData().find(d => d.nodeId === 'g_south');
        expect(southGate?.value).toBe(28);

        liveTelemetry.applyMitigation('restock_food');
        const burgerInv = liveTelemetry.getRawData().find(d => d.nodeId === 'f_burger_1' && d.metricType === 'Inventory');
        expect(burgerInv?.value).toBe(100);
    });
});
