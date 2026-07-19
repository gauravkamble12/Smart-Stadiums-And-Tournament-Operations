import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ExecutiveDashboard } from './ExecutiveDashboard';

// Mock the global ResizeObserver for Recharts / ThreeJS
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

describe('ExecutiveDashboard Component', () => {
    it('renders the initial KPI grid', () => {
        render(<ExecutiveDashboard isSosActive={false} />);
        expect(screen.getByText('Live Attendance')).toBeInTheDocument();
        expect(screen.getByText('Carbon Offset')).toBeInTheDocument();
        expect(screen.getByText('Risk Level')).toBeInTheDocument();
    });

    it('renders proactive AI feed section', () => {
        render(<ExecutiveDashboard isSosActive={false} />);
        expect(screen.getByText('Proactive AI Feed')).toBeInTheDocument();
    });
});
