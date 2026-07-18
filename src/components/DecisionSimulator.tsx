import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import { liveTelemetry } from '../data/TelemetryGenerator';
import type { DecisionSimulation } from '../types';

export const DecisionSimulator: React.FC = () => {
    const [action, setAction] = useState('');
    const [simulation, setSimulation] = useState<DecisionSimulation | null>(null);
    const [loading, setLoading] = useState(false);

    const runSimulation = async () => {
        if (!action.trim()) return;
        setLoading(true);
        const result = await aiService.simulateDecision(action);
        if (result.estimatedCarbonReductionKg) {
            liveTelemetry.addCarbonSaved(result.estimatedCarbonReductionKg);
        }
        setSimulation(result);
        setLoading(false);
    };

    return (
        <div className="decision-simulator">
            <header className="dashboard-header" style={{marginBottom: '1rem'}}>
                <h2><i className="fa-solid fa-code-branch"></i> Executive Decision Engine</h2>
                <p className="text-sm">Simulate operational consequences using Grounded AI Reasoning.</p>
            </header>

            <div className="simulation-input card glass-panel" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input 
                    type="text" 
                    value={action}
                    onChange={e => setAction(e.target.value)}
                    placeholder="e.g. Close Gate B and move 10 security guards to Gate A"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                />
                <button onClick={runSimulation} disabled={loading} className="primary-btn">
                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-play"></i>} Simulate Impact
                </button>
            </div>

            {simulation && (
                <div className="summary-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                    
                    {/* Explainable AI Core */}
                    <div className="card glass-panel" style={{gridColumn: 'span 3'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <div>
                                <h3 className="text-accent" style={{marginBottom: '0.5rem'}}><i className="fa-solid fa-microchip"></i> AI Recommendation</h3>
                                <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{simulation.recommendation}</p>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <span className="text-sm">AI Confidence Score</span>
                                <div style={{fontSize: '2rem', fontWeight: 'bold', color: simulation.confidenceScore > 80 ? 'var(--success)' : 'var(--warning)'}}>
                                    {simulation.confidenceScore}%
                                </div>
                            </div>
                        </div>
                        <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginTop: '1rem'}}>
                            <strong><i className="fa-solid fa-brain"></i> Grounded Reasoning:</strong>
                            <p style={{marginTop: '0.5rem', fontStyle: 'italic'}}>{simulation.reasoning}</p>
                        </div>
                    </div>

                    {/* Evidence & Impact */}
                    <div className="card glass-panel">
                        <h3><i className="fa-solid fa-database"></i> Evidence (Telemetry)</h3>
                        <ul style={{marginTop: '0.5rem', paddingLeft: '1.2rem'}}>
                            {simulation.evidence.map((ev, i) => <li key={i} className="text-sm">{ev}</li>)}
                        </ul>
                    </div>

                    <div className="card glass-panel">
                        <h3><i className="fa-solid fa-arrow-trend-up"></i> Expected Impact</h3>
                        <p className="text-success" style={{marginTop: '0.5rem', fontWeight: 'bold'}}>{simulation.expectedImpact}</p>
                        <p style={{marginTop: '1rem'}}>Affected People: <strong>~{simulation.affectedPeople.toLocaleString()}</strong></p>
                    </div>

                    <div className="card glass-panel">
                        <h3><i className="fa-solid fa-scale-balanced"></i> Operational Cost</h3>
                        <p style={{marginTop: '0.5rem', fontWeight: 'bold'}}>{simulation.cost}</p>
                        <p style={{marginTop: '0.5rem'}}>Complexity: <strong className={simulation.operationalComplexity === 'High' ? 'text-danger' : 'text-warning'}>{simulation.operationalComplexity}</strong></p>
                        {simulation.estimatedCarbonReductionKg && (
                            <p style={{marginTop: '0.5rem', color: 'var(--success)'}}><i className="fa-solid fa-leaf"></i> Carbon Offset: +{simulation.estimatedCarbonReductionKg} kg</p>
                        )}
                    </div>

                    {/* Risks & Alternatives */}
                    <div className="card glass-panel" style={{gridColumn: 'span 1'}}>
                        <h3 className="text-danger"><i className="fa-solid fa-triangle-exclamation"></i> Risks & Cascading Effects</h3>
                        <ul style={{marginTop: '0.5rem', paddingLeft: '1.2rem'}}>
                            {simulation.risks.map((r, i) => <li key={i} className="text-danger text-sm">{r}</li>)}
                        </ul>
                    </div>

                    <div className="card glass-panel" style={{gridColumn: 'span 2'}}>
                        <h3><i className="fa-solid fa-shuffle"></i> Alternative Actions & Recovery</h3>
                        <div style={{marginTop: '0.5rem'}}>
                            <strong>Alternatives:</strong>
                            <ul style={{paddingLeft: '1.2rem'}}>
                                {simulation.alternativeActions.map((alt, i) => <li key={i} className="text-sm">{alt}</li>)}
                            </ul>
                            <div style={{background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', borderLeft: '4px solid var(--danger)'}}>
                                <strong>Recovery Strategy:</strong> {simulation.recoveryStrategy}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
