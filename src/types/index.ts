// ArenaMind AI Types
export interface TelemetryData {
    totalAttendance: number;
    weather: string;
    gateCongestion: Record<string, 'Low' | 'Medium' | 'High' | 'Critical'>;
    incidents: string[];
}

export interface AICommanderSummary {
    executiveSummary: string;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    recommendations: string[];
    expectedImpact: string;
    confidenceScore: number;
    reasoning: string;
    participatingAgents?: string[];
}

export interface TimeMachinePrediction {
    timeframe: string;
    crowdState: string;
    foodQueues: string;
    transportStatus: string;
    confidenceScore: number;
}

export interface ExplainableRecommendation {
    recommendation: string;
    reasoning: string;
    evidence: string[]; // From Grounding Data/Telemetry
    confidenceScore: number;
    alternativeActions: string[];
    expectedImpact: string;
}

export interface DecisionSimulation extends ExplainableRecommendation {
    risks: string[];
    cost: string;
    operationalComplexity: 'Low' | 'Medium' | 'High';
    affectedPeople: number;
    recoveryStrategy: string;
    estimatedCarbonReductionKg?: number;
}

export interface ProactiveAlert {
    id: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: Date;
    agentSource: string;
}

export interface DashboardKPIs {
    totalAttendance: number;
    carbonSavedKg: number;
    activeIncidents: number;
    avgTransportDelayMins: number;
}

export interface EmotionData {
    happiness: number;
    anger: number;
    panic: number;
    confusion: number;
    trendingSentiment: string;
    recentFeedback: string[];
}

export interface AccessibilityRoute {
    id: string;
    userNeeds: string[];
    currentRouteStatus: 'Clear' | 'Obstructed' | 'Elevator Down';
    aiSuggestion: string;
    estimatedTimeMins: number;
}

export interface StadiumPOI {
    id: string;
    name: string;
    type: 'Entry' | 'Exit' | 'Washroom' | 'Canteen' | 'Seating' | 'Medical';
    position: [number, number, number];
}

export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

