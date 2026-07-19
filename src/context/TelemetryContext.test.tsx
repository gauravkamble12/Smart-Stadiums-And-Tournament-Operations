import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TelemetryProvider, useTelemetry } from './TelemetryContext';

const TestComponent = () => {
    const { sensors, isEmergency, setEmergency, triggerMitigation, kpis } = useTelemetry();
    return (
        <div>
            <span data-testid="emergency">{isEmergency ? 'YES' : 'NO'}</span>
            <span data-testid="sensors-count">{sensors.length}</span>
            <span data-testid="attendance">{kpis.totalAttendance}</span>
            <button onClick={() => setEmergency(true)}>Trigger SOS</button>
            <button onClick={() => triggerMitigation('r_south_gate_override')}>Mitigate</button>
        </div>
    );
};

describe('TelemetryContext Provider', () => {
    it('provides telemetry states to children', () => {
        render(
            <TelemetryProvider>
                <TestComponent />
            </TelemetryProvider>
        );
        expect(screen.getByTestId('emergency').textContent).toBe('NO');
        expect(Number(screen.getByTestId('sensors-count').textContent)).toBeGreaterThan(0);
    });

    it('allows updating emergency state globally', () => {
        render(
            <TelemetryProvider>
                <TestComponent />
            </TelemetryProvider>
        );
        const btn = screen.getByText('Trigger SOS');
        act(() => {
            btn.click();
        });
        expect(screen.getByTestId('emergency').textContent).toBe('YES');
    });
});
