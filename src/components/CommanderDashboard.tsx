import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import type { TelemetryData, AICommanderSummary } from '../types';
import { liveTelemetry } from '../data/TelemetryGenerator';

export const CommanderDashboard: React.FC = () => {
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [summary, setSummary] = useState<AICommanderSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [showRawJson, setShowRawJson] = useState(false);

    const syncWithSwarm = async () => {
        setLoading(true);
        // Pull raw data dynamically from the telemetry generator
        const rawSensors = liveTelemetry.getRawData();
        const gateCongestion: Record<string, 'Low' | 'Medium' | 'High' | 'Critical'> = {};
        
        rawSensors.forEach(sensor => {
            if (sensor.metricType === 'Density') {
                const val = sensor.value as number;
                let lvl: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
                if (val > 80) lvl = 'Critical';
                else if (val > 60) lvl = 'High';
                else if (val > 40) lvl = 'Medium';
                
                if (sensor.nodeId === 'g_north') gateCongestion['North Main Gate'] = lvl;
                if (sensor.nodeId === 'g_south') gateCongestion['South Gate'] = lvl;
                if (sensor.nodeId === 'g_east') gateCongestion['East VIP Gate'] = lvl;
            }
        });

        const rawTelemetry: TelemetryData = {
            totalAttendance: 68450 + Math.floor(Math.random() * 500),
            weather: 'Clear',
            gateCongestion,
            incidents: []
        };
        setTelemetry(rawTelemetry);

        const aiSummary = await aiService.generateCommanderSummary(rawTelemetry);
        setSummary(aiSummary);
        setLoading(false);
    };

    const [timeToNextSync, setTimeToNextSync] = useState(60);

    // Auto-sync every 60s and countdown
    useEffect(() => {
        syncWithSwarm();
        
        const syncInterval = setInterval(syncWithSwarm, 60000);
        
        const countdownInterval = setInterval(() => {
            setTimeToNextSync(prev => prev <= 1 ? 60 : prev - 1);
        }, 1000);

        return () => {
            clearInterval(syncInterval);
            clearInterval(countdownInterval);
        };
    }, []);

    return (
        <div className="commander-dashboard">
            <header className="dashboard-header">
                <div>
                    <h2><i className="fa-solid fa-shield-halved"></i> AI Commander Dashboard</h2>
                    <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Orchestrating specialized sub-agents based on live telemetry</p>
                </div>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                        <i className="fa-solid fa-stopwatch"></i> Next AI Briefing: <strong style={{color: 'white'}}>{timeToNextSync}s</strong>
                    </div>
                    <button onClick={() => setShowRawJson(!showRawJson)} className="secondary-btn" style={{padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px'}}>
                        <i className="fa-solid fa-code"></i> {showRawJson ? 'Hide' : 'Show'} JSON
                    </button>
                    <button onClick={() => { syncWithSwarm(); setTimeToNextSync(60); }} disabled={loading} className="sync-btn">
                        {loading ? <i className="fa-solid fa-arrows-rotate fa-spin"></i> : <i className="fa-solid fa-arrows-rotate"></i>} Sync Swarm Now
                    </button>
                </div>
            </header>

            {summary ? (
                showRawJson ? (
                    <div style={{marginTop: '2rem', padding: '1.5rem', background: '#1e1e1e', borderRadius: '8px'}}>
                        <pre style={{color: '#d4d4d4', overflowX: 'auto', fontSize: '0.9rem'}}>
                            {JSON.stringify(summary, null, 2)}
                        </pre>
                    </div>
                ) : (
                <div className="summary-grid">
                    <div className="card glass-panel executive-summary" style={{gridColumn: 'span 2'}}>
                        <h3 className="text-accent"><i className="fa-solid fa-file-signature"></i> Executive Synthesis</h3>
                        <p style={{fontSize: '1.2rem', marginTop: '1rem', lineHeight: '1.5'}}>{summary.executiveSummary}</p>
                        
                        {/* Participating Agents */}
                        <div style={{marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem'}}>
                            <h4 style={{marginBottom: '0.5rem', color: 'var(--text-secondary)'}}><i className="fa-solid fa-network-wired"></i> Orchestration Layer (Participating Agents)</h4>
                            <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                                {summary.participatingAgents?.map(agent => (
                                    <span key={agent} style={{background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid rgba(59, 130, 246, 0.5)'}}>
                                        <i className="fa-solid fa-robot"></i> {agent}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card glass-panel risk-level" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <h3><i className="fa-solid fa-triangle-exclamation"></i> Threat Level</h3>
                        <div className={`risk-badge risk-${summary.riskLevel.toLowerCase()}`} style={{fontSize: '2rem', padding: '1rem 2rem', marginTop: '1rem'}}>
                            {summary.riskLevel}
                        </div>
                        <div style={{marginTop: '1rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)'}}>
                            {summary.confidenceScore}% Confidence
                        </div>
                    </div>

                    {/* Reasoning Details */}
                    <div className="card glass-panel" style={{gridColumn: 'span 2'}}>
                        <h3 className="text-warning"><i className="fa-solid fa-bolt"></i> Actionable Recommendations</h3>
                        <ul style={{marginTop: '1rem', paddingLeft: '1.2rem', lineHeight: '1.6'}}>
                            {summary.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="card glass-panel">
                        <h3><i className="fa-solid fa-bullseye"></i> Expected Impact</h3>
                        <p className="text-success" style={{marginTop: '1rem', fontWeight: 'bold', fontSize: '1.2rem'}}>{summary.expectedImpact}</p>
                        
                        <h3 style={{marginTop: '1.5rem'}}><i className="fa-solid fa-brain"></i> AI Reasoning</h3>
                        <p className="text-sm" style={{marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.8}}>{summary.reasoning}</p>
                    </div>

                    {/* Ingested Swarm Telemetry Horizontal Row */}
                    <div className="card glass-panel" style={{gridColumn: 'span 3'}}>
                        <h3 style={{marginBottom: '1rem'}}><i className="fa-solid fa-square-poll-vertical"></i> Ingested Swarm Telemetry</h3>
                        <div style={{display: 'flex', gap: '2rem', justifyContent: 'space-around', flexWrap: 'wrap', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px'}}>
                            {telemetry && (
                                <>
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                        <span className="text-sm">Attendance</span>
                                        <strong style={{fontSize: '1.4rem', color: 'var(--accent-primary)', marginTop: '0.25rem'}}>{telemetry.totalAttendance.toLocaleString()}</strong>
                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                        <span className="text-sm">Weather Status</span>
                                        <strong style={{fontSize: '1.4rem', color: '#60A5FA', marginTop: '0.25rem'}}>{telemetry.weather}</strong>
                                    </div>
                                    {Object.entries(telemetry.gateCongestion).map(([gate, level]) => (
                                        <div key={gate} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                            <span className="text-sm">{gate}</span>
                                            <strong style={{
                                                fontSize: '1.4rem', 
                                                marginTop: '0.25rem',
                                                color: level === 'Critical' ? 'var(--danger)' : level === 'High' ? '#F59E0B' : level === 'Medium' ? '#60A5FA' : 'var(--success)'
                                            }}>{level}</strong>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                    </div>
                )
            ) : (
                <div className="loading-state">
                    <i className="fa-solid fa-satellite-dish fa-beat"></i> Awaiting telemetry...
                </div>
            )}
        </div>
    );
};
