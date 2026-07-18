import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from './aiService';

// Mock the environment variable
vi.mock('./aiService', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./aiService')>();
    return {
        ...actual,
    };
});

describe('aiService', () => {
    beforeEach(() => {
        // Reset state if needed
    });

    it('should generate proactive alerts even when API key is missing (fallback)', async () => {
        // Force aiService to use mock by removing key
        (aiService as any).apiKey = '';
        const alerts = await aiService.generateProactiveAlerts();
        expect(alerts.length).toBeGreaterThan(0);
        expect(alerts[0]).toHaveProperty('severity');
    });

    it('should fetch accessibility routes when API key is missing (fallback)', async () => {
        (aiService as any).apiKey = '';
        const routes = await aiService.checkAccessibilityRoutes();
        expect(routes.length).toBeGreaterThan(0);
        expect(routes[0]).toHaveProperty('currentRouteStatus');
    });

    it('should format simulateDecision payload correctly', async () => {
        const decision = await aiService.simulateDecision('Close Gate C');
        expect(decision).toHaveProperty('recommendation');
    });
});
