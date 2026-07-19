import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiService } from './aiService';

describe('aiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset call throttle timer to avoid delays in tests
        (aiService.constructor as any).lastCallTime = 0;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should generate proactive alerts even when API key is missing (fallback)', async () => {
        aiService.setApiKey('');
        const alerts = await aiService.generateProactiveAlerts();
        expect(alerts.length).toBeGreaterThan(0);
        expect(alerts[0]).toHaveProperty('severity');
    });

    it('should fetch accessibility routes when API key is missing (fallback)', async () => {
        aiService.setApiKey('');
        const routes = await aiService.checkAccessibilityRoutes();
        expect(routes.length).toBeGreaterThan(0);
        expect(routes[0]).toHaveProperty('currentRouteStatus');
    });

    it('should format simulateDecision payload correctly (fallback)', async () => {
        aiService.setApiKey('');
        const decision = await aiService.simulateDecision('Close Gate C');
        expect(decision).toHaveProperty('recommendation');
    });

    // Integration tests mocking fetch
    it('should fetch generateStadiumMap successfully when API key is present', async () => {
        aiService.setApiKey('test_key');
        const mockResponse = [
            { id: "1", name: "Gate A", type: "Entry", position: [0,0,0] }
        ];

        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                candidates: [
                    { content: { parts: [{ text: JSON.stringify(mockResponse) }] } }
                ]
            })
        });

        const pois = await aiService.generateStadiumMap('Test Stadium');
        expect(pois.length).toBe(1);
        expect(pois[0].name).toBe('Gate A');
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API fetch errors gracefully in generateStadiumMap', async () => {
        aiService.setApiKey('test_key');
        (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

        const pois = await aiService.generateStadiumMap('Test Stadium');
        expect(pois.length).toBe(0); // Should fallback to empty array on error
    });

    it('should handle API HTTP errors gracefully in generateFanResponse', async () => {
        aiService.setApiKey('test_key');
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 500
        });

        const response = await aiService.generateFanResponse('Hello', 'English', 'General', false);
        expect(response).toBe('*ArenaMind Core Error:* Unable to process fan query.');
    });

    it('should handle missing API key when fetching fan response', async () => {
        aiService.setApiKey('');
        const response = await aiService.generateFanResponse('Help!', 'English', 'General', true);
        expect(response).toContain('EMERGENCY');
    });
});
