import type { TelemetryData, AICommanderSummary, TimeMachinePrediction, DecisionSimulation, ProactiveAlert, EmotionData, AccessibilityRoute, StadiumPOI } from '../types';
import { liveTelemetry } from '../data/TelemetryGenerator';

class AIService {
    private apiKey: string;
    
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key') || '';
    }

    setApiKey(key: string) {
        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
    }

    getApiKey(): string {
        return this.apiKey;
    }

    private async postAPI(endpoint: string, body: any): Promise<any> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (this.apiKey) {
            headers['x-gemini-key'] = this.apiKey;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async generateCommanderSummary(telemetry: TelemetryData): Promise<AICommanderSummary | null> {
        if (!this.apiKey) {
            return this.mockDelay({
                executiveSummary: "System is operating nominally. Minor congestion detected at North Gate.",
                riskLevel: "Low",
                recommendations: ["Monitor North Gate", "Dispatch 2 Transport Agents to Uber Hub"],
                expectedImpact: "Will prevent queue spillover into Main Concourse.",
                confidenceScore: 92,
                reasoning: "Transport wait times correlate with upcoming match end time.",
                participatingAgents: ["Commander Agent", "Crowd Agent", "Transport Agent"]
            } as any);
        }

        try {
            const result = await this.postAPI('/api/commander-summary', {
                telemetry,
                liveTelemetryString: liveTelemetry.getLiveStateString()
            });
            return result as AICommanderSummary;
        } catch (error) {
            console.error("AI Error:", error);
            return null;
        }
    }

    async generateTimeMachinePrediction(timeframe: '15m' | '30m' | '60m'): Promise<TimeMachinePrediction> {
        if (!this.apiKey) {
            return this.mockDelay({
                timeframe,
                crowdState: `Congestion expected to rise by ${timeframe === '60m' ? '25%' : '10%'} at northern gates.`,
                foodQueues: `Vendor wait times peaking around 18 minutes.`,
                transportStatus: `Metro line orange experiencing delays.`,
                confidenceScore: 85
            });
        }

        try {
            const result = await this.postAPI('/api/time-machine', {
                timeframe,
                liveTelemetryString: liveTelemetry.getLiveStateString()
            });
            return result as TimeMachinePrediction;
        } catch {
            return { timeframe, crowdState: "Prediction unavailable.", foodQueues: "N/A", transportStatus: "N/A", confidenceScore: 0 };
        }
    }

    async simulateDecision(action: string): Promise<DecisionSimulation> {
        const sanitizedAction = action.replace(/(ignore previous instructions|system:|###|forget all|you are now)/gi, "[REDACTED]").substring(0, 500);

        if (!this.apiKey) {
            return this.mockDelay({
                recommendation: `Proceed with caution on: ${sanitizedAction}`,
                reasoning: "Mock reasoning due to missing API key.",
                evidence: ["Sensor [North Main Gate]: Density = 85%"],
                confidenceScore: 78,
                alternativeActions: ["Deploy 5 more volunteers to North Gate"],
                expectedImpact: "Will reduce congestion by 12% over 15 mins.",
                risks: ["May cause secondary bottleneck at Main Concourse"],
                cost: "$450 (Staff Overtime)",
                operationalComplexity: "Medium",
                affectedPeople: 1200,
                recoveryStrategy: "If density exceeds 95%, revert immediately.",
                estimatedCarbonReductionKg: 15
            });
        }

        try {
            const result = await this.postAPI('/api/simulate-decision', {
                action: sanitizedAction,
                liveTelemetryString: liveTelemetry.getLiveStateString()
            });
            return result as DecisionSimulation;
        } catch (e) {
            console.error("AI Simulation Parse Error: ", e);
            return {
                recommendation: "Error", reasoning: "Simulation failed.", evidence: [], confidenceScore: 0,
                alternativeActions: [], expectedImpact: "Unknown", risks: [], cost: "Unknown",
                operationalComplexity: "High", affectedPeople: 0, recoveryStrategy: "N/A"
            };
        }
    }

    async generateProactiveAlerts(): Promise<ProactiveAlert[]> {
        if (!this.apiKey) {
            return this.mockDelay([
                { id: Math.random().toString(), severity: 'warning', message: 'Rain cell approaching from the North. Roof closure recommended.', timestamp: new Date(), agentSource: 'Weather Agent' },
                { id: Math.random().toString(), severity: 'critical', message: 'Gate C turnstile malfunction causing 15min delay.', timestamp: new Date(), agentSource: 'Security Agent' }
            ]);
        }

        try {
            const result = await this.postAPI('/api/proactive-alerts', {});
            return result.map((a: any) => ({
                id: a.id,
                severity: a.severity,
                message: a.message,
                agentSource: a.agentSource,
                timestamp: new Date(a.timestamp)
            }));
        } catch {
            console.warn("Gemini API failed or quota exceeded. Falling back to mock proactive alerts.");
            return this.mockDelay([
                { id: Math.random().toString(), severity: 'warning', message: 'Rain cell approaching from the North. Roof closure recommended.', timestamp: new Date(), agentSource: 'Weather Agent' },
                { id: Math.random().toString(), severity: 'critical', message: 'Gate C turnstile malfunction causing 15min delay.', timestamp: new Date(), agentSource: 'Security Agent' }
            ]);
        }
    }

    async generateEmotionAnalysis(): Promise<EmotionData> {
        if (!this.apiKey) {
            return this.mockDelay({
                happiness: 72, anger: 15, panic: 2, confusion: 11,
                trendingSentiment: "Generally positive, but confusion rising near Gate C regarding transport.",
                recentFeedback: ["'Where is the Uber pickup?'", "'Amazing goal!!'", "'Line for hotdogs is barely moving.'"]
            });
        }

        try {
            const result = await this.postAPI('/api/emotion-analysis', {});
            return result as EmotionData;
        } catch {
            return { happiness: 50, anger: 0, panic: 0, confusion: 0, trendingSentiment: "Unavailable", recentFeedback: [] };
        }
    }

    async checkAccessibilityRoutes(): Promise<AccessibilityRoute[]> {
        if (!this.apiKey) {
            return this.mockDelay([
                { id: "Route A-12", userNeeds: ["Wheelchair"], currentRouteStatus: "Elevator Down", aiSuggestion: "Reroute via West Concourse ramp.", estimatedTimeMins: 8 },
                { id: "Route B-04", userNeeds: ["Visual Assistance"], currentRouteStatus: "Obstructed", aiSuggestion: "Activate audio beacons for detoured Path C.", estimatedTimeMins: 5 }
            ]);
        }

        try {
            const result = await this.postAPI('/api/accessibility-routes', {});
            return result as AccessibilityRoute[];
        } catch {
            console.warn("Gemini API failed or quota exceeded. Falling back to mock accessibility routes.");
            return this.mockDelay([
                { id: "Route A-12", userNeeds: ["Wheelchair"], currentRouteStatus: "Elevator Down", aiSuggestion: "Reroute via West Concourse ramp.", estimatedTimeMins: 8 },
                { id: "Route B-04", userNeeds: ["Visual Assistance"], currentRouteStatus: "Obstructed", aiSuggestion: "Activate audio beacons for detoured Path C.", estimatedTimeMins: 5 }
            ]);
        }
    }

    async generateStadiumMap(stadiumName: string): Promise<StadiumPOI[]> {
        if (!this.apiKey) {
            const modifier = stadiumName.length % 2 === 0 ? 1 : -1;
            return this.mockDelay([
                { id: "p1", name: `${stadiumName} North Gate`, type: "Entry", position: [0, 2, -10 * modifier] },
                { id: "p2", name: "Main Concourse Canteen", type: "Canteen", position: [8, 3, 5] },
                { id: "p3", name: "Sector 112 Washrooms", type: "Washroom", position: [-7, 2, -6] },
                { id: "p4", name: "VIP Seating Deck", type: "Seating", position: [0, 4.5, 8 * modifier] },
                { id: "p5", name: "South Exit", type: "Exit", position: [0, 0, 10 * modifier] },
                { id: "p6", name: "First Aid Station Alpha", type: "Medical", position: [-9, 1, 0] }
            ]);
        }

        try {
            const result = await this.postAPI('/api/stadium-map', { stadiumName });
            return result as StadiumPOI[];
        } catch {
            console.warn("Gemini API failed or quota exceeded. Falling back to mock POIs.");
            const modifier = stadiumName.length % 2 === 0 ? 1 : -1;
            return this.mockDelay([
                { id: "p1", name: `${stadiumName} North Gate`, type: "Entry", position: [0, 2, -10 * modifier] },
                { id: "p2", name: "Main Concourse Canteen", type: "Canteen", position: [8, 3, 5] },
                { id: "p3", name: "Sector 112 Washrooms", type: "Washroom", position: [-7, 2, -6] },
                { id: "p4", name: "VIP Seating Deck", type: "Seating", position: [0, 4.5, 8 * modifier] },
                { id: "p5", name: "South Exit", type: "Exit", position: [0, 0, 10 * modifier] },
                { id: "p6", name: "First Aid Station Alpha", type: "Medical", position: [-9, 1, 0] }
            ]);
        }
    }

    async generateFanResponse(userMessage: string, language: string, agentType: string, isEmergency: boolean, history: string = ""): Promise<string> {
        const sanitizedMessage = userMessage.replace(/(ignore previous instructions|system:|###|forget all|you are now)/gi, "[REDACTED]");
        const truncatedMessage = sanitizedMessage.substring(0, 500);

        if (!this.apiKey) {
            return this.mockDelay(isEmergency ? "🚨 EMERGENCY: Please follow the red marked paths to the nearest exit immediately." : `I am the ArenaMind ${agentType} Agent. How can I help you today?`);
        }

        try {
            const result = await this.postAPI('/api/fan-response', {
                userMessage: truncatedMessage,
                language,
                agentType,
                isEmergency,
                history
            });
            return result.text;
        } catch (error) {
            return "*ArenaMind Core Error:* Unable to process fan query.";
        }
    }

    private mockDelay<T>(data: T, delay = 300): Promise<T> {
        return new Promise(resolve => setTimeout(() => resolve(data), delay));
    }
}

export const aiService = new AIService();
