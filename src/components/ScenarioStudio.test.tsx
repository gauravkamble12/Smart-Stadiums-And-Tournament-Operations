import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ScenarioStudio } from './ScenarioStudio';
import { aiService } from '../services/aiService';

// Mock the global ResizeObserver
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

vi.mock('../services/aiService', () => ({
    aiService: {
        simulateDecision: vi.fn().mockResolvedValue({
            recommendation: 'Mock recommendation',
            reasoning: 'Mock reasoning',
            evidence: [],
            confidenceScore: 90,
            alternativeActions: [],
            expectedImpact: 'Mock impact',
            risks: ['Mock risk'],
            cost: 'Low',
            operationalComplexity: 'Low',
            affectedPeople: 100,
            recoveryStrategy: 'None',
            estimatedCarbonReductionKg: 0
        })
    }
}));

describe('ScenarioStudio Component', () => {
    it('renders scenario buttons', () => {
        render(<ScenarioStudio />);
        expect(screen.getByText('Torrential Rain Downpour')).toBeInTheDocument();
        expect(screen.getByText('South Gate Power Outage')).toBeInTheDocument();
    });

    it('displays loading state and runs scenario on click', async () => {
        render(<ScenarioStudio />);
        const btn = screen.getByText('Torrential Rain Downpour');
        fireEvent.click(btn);
        
        await waitFor(() => {
            expect(screen.getByText(/Running Multimodal Scenario Simulation.../i)).toBeInTheDocument();
        });
    });
});
