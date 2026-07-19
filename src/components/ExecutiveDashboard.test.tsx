import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { TelemetryProvider } from '../context/TelemetryContext';

// Mock the global ResizeObserver for Recharts / ThreeJS
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

describe('ExecutiveDashboard Component', () => {
    it('renders the initial KPI grid', async () => {
        await act(async () => {
            render(
                <TelemetryProvider>
                    <ExecutiveDashboard />
                </TelemetryProvider>
            );
        });
        expect(screen.getByText('Live Attendance')).toBeInTheDocument();
        expect(screen.getByText('Carbon Offset')).toBeInTheDocument();
        expect(screen.getByText('Risk Level')).toBeInTheDocument();
    });

    it('renders proactive AI feed section', async () => {
        await act(async () => {
            render(
                <TelemetryProvider>
                    <ExecutiveDashboard />
                </TelemetryProvider>
            );
        });
        expect(screen.getByText('Proactive AI Feed')).toBeInTheDocument();
    });
});
