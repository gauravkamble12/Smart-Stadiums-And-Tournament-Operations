import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/aiService';
import type { TimeMachinePrediction } from '../types';

export const StadiumTimeMachine: React.FC = () => {
    const [timeVal, setTimeVal] = useState<number>(0); // 0 to 120 minutes
    const [isPlaying, setIsPlaying] = useState(false);
    const [prediction, setPrediction] = useState<TimeMachinePrediction | null>(null);
    const [loading, setLoading] = useState(false);
    const playIntervalRef = useRef<number | null>(null);

    // Dynamic metrics calculated in real-time based on slider position
    const getTimelineMetrics = (mins: number) => {
        const attendanceOffset = Math.floor(mins * 80);
        let crowdState = 'Normal operations. Smooth movement at all concourses.';
        let crowdLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
        let foodQueues = 'Average wait time: 3-5 minutes.';
        let transportStatus = 'Metro South operating nominal schedule. Shuttle buses active.';
        let confidenceScore = 95 - Math.floor(mins * 0.15); // decreases slightly as we look further

        if (mins > 0 && mins <= 20) {
            crowdState = 'Initial crowd surge. Density at North Main Gate is building up (45%).';
            crowdLevel = 'Medium';
            foodQueues = 'Average wait time at Burgers and Tacos: 7-9 minutes.';
            transportStatus = 'Metro lines at capacity. Slight boarding delays at South Station.';
        } else if (mins > 20 && mins <= 50) {
            crowdState = 'Match egress commencing. North Concourse density is High (75%). Bottleneck forming.';
            crowdLevel = 'High';
            foodQueues = 'Peak dinner queues. Wait times at Burgers exceed 14 minutes. Inventory at 55%.';
            transportStatus = 'Metro South delays rising (8m). Rideshare North Hub demand surge active.';
        } else if (mins > 50 && mins <= 90) {
            crowdState = 'Peak egress density. South Gate density critical (92%). Main Concourse congested.';
            crowdLevel = 'Critical';
            foodQueues = 'Burgers out of stock. Taco inventory critical. Average wait: 18 minutes.';
            transportStatus = 'Metro South delayed by 15 mins. Rideshare hub experiencing 20m pick-up queues.';
        } else if (mins > 90) {
            crowdState = 'Concourse crowd dispersing. Heavy density shifting to transport exits.';
            crowdLevel = 'High';
            foodQueues = 'All food vendors closed or restocking. Average wait: 2 minutes.';
            transportStatus = 'Metro line delays peaking (22m). Rideshare wait times normalising.';
        }

        return {
            attendanceOffset,
            crowdState,
            crowdLevel,
            foodQueues,
            transportStatus,
            confidenceScore
        };
    };

    const metrics = getTimelineMetrics(timeVal);

    // Fetch AI detailed reasoning briefing from Gemini for the chosen timeframe
    const fetchAIBriefing = async (minutes: number) => {
        setLoading(true);
        const tfString = `${minutes}m`;
        const res = await aiService.generateTimeMachinePrediction(tfString as any);
        setPrediction(res);
        setLoading(false);
    };

    // Auto-fetch AI report when slider changes (debounced)
    useEffect(() => {
        const handler = setTimeout(() => {
            if (timeVal > 0) {
                fetchAIBriefing(timeVal);
            } else {
                setPrediction(null);
            }
        }, 1200);

        return () => clearTimeout(handler);
    }, [timeVal]);

    // Handle auto play
    useEffect(() => {
        if (isPlaying) {
            playIntervalRef.current = window.setInterval(() => {
                setTimeVal(prev => {
                    if (prev >= 120) {
                        setIsPlaying(false);
                        return 120;
                    }
                    return prev + 10;
                });
            }, 1000);
        } else {
            if (playIntervalRef.current) {
                clearInterval(playIntervalRef.current);
            }
        }

        return () => {
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
        };
    }, [isPlaying]);

    const getStatusColor = (level: 'Low' | 'Medium' | 'High' | 'Critical') => {
        if (level === 'Critical') return 'var(--danger)';
        if (level === 'High') return 'var(--warning)';
        if (level === 'Medium') return '#60A5FA';
        return 'var(--success)';
    };

    return (
        <div className="time-machine">
            <header className="dashboard-header" style={{marginBottom: '2rem'}}>
                <div>
                    <h2><i className="fa-solid fa-clock-rotate-left"></i> Stadium Time Machine</h2>
                    <p className="text-sm">Predict future stadium states using continuous timeline analysis</p>
                </div>
                <div style={{display: 'inline-block', background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', padding: '6px 12px', border: '1px solid #EC4899', borderRadius: '6px', fontSize: '0.85rem'}}>
                    <strong>SYSTEM STABILITY CHECK:</strong> Immediate mathematical estimation on drag, with lazy-loaded Gemini-deep RAG briefings.
                </div>
            </header>

            {/* Slider and Controls */}
            <div className="card glass-panel" style={{marginBottom: '2rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                width: '45px', height: '45px', borderRadius: '50%', border: 'none',
                                background: 'var(--accent-gradient)', color: 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                                boxShadow: '0 4px 10px rgba(59,130,246,0.3)'
                            }}
                        >
                            {isPlaying ? <i className="fa-solid fa-pause"></i> : <i className="fa-solid fa-play"></i>}
                        </button>
                        <div>
                            <span className="text-sm" style={{color: 'var(--text-secondary)'}}>Timeline Forecast Target</span>
                            <h3 style={{margin: 0, color: 'white', fontSize: '1.5rem'}}>T + {timeVal} minutes</h3>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => fetchAIBriefing(timeVal)} 
                        disabled={loading || timeVal === 0} 
                        className="secondary-btn"
                        style={{padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center', border: '1px solid var(--accent-primary)', color: 'white', borderRadius: '6px', background: 'transparent'}}
                    >
                        {loading ? <i className="fa-solid fa-arrows-rotate fa-spin"></i> : <i className="fa-solid fa-arrows-rotate"></i>} Reload AI Briefing
                    </button>
                </div>

                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <span className="text-sm">Now</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="120" 
                        step="5"
                        value={timeVal} 
                        onChange={(e) => setTimeVal(parseInt(e.target.value))}
                        style={{
                            flex: 1, 
                            height: '8px', 
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.1)', 
                            outline: 'none', 
                            cursor: 'pointer',
                            accentColor: 'var(--accent-primary)'
                        }}
                    />
                    <span className="text-sm">T+120m</span>
                </div>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="summary-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem'}}>
                <div className="card glass-panel" style={{gridColumn: 'span 2', borderLeft: `4px solid ${getStatusColor(metrics.crowdLevel)}`}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h4 className="text-sm" style={{color: 'var(--text-secondary)'}}><i className="fa-solid fa-users"></i> Crowd Congestion State</h4>
                        <span style={{
                            background: getStatusColor(metrics.crowdLevel) + '22',
                            color: getStatusColor(metrics.crowdLevel),
                            border: `1px solid ${getStatusColor(metrics.crowdLevel)}`,
                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                        }}>{metrics.crowdLevel}</span>
                    </div>
                    <p style={{fontSize: '1.2rem', marginTop: '1rem', fontWeight: 'bold'}}>{metrics.crowdState}</p>
                </div>

                <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <span className="text-sm" style={{color: 'var(--text-secondary)'}}>Prediction Confidence</span>
                    <div className="confidence-value text-accent" style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '0.5rem'}}>
                        {metrics.confidenceScore}%
                    </div>
                </div>

                <div className="card glass-panel">
                    <h4 className="text-sm" style={{color: 'var(--text-secondary)'}}><i className="fa-solid fa-burger"></i> Predicted Food Queues</h4>
                    <p style={{marginTop: '0.75rem', fontSize: '1rem', lineHeight: '1.4'}}>{metrics.foodQueues}</p>
                </div>

                <div className="card glass-panel" style={{gridColumn: 'span 2'}}>
                    <h4 className="text-sm" style={{color: 'var(--text-secondary)'}}><i className="fa-solid fa-train"></i> Transit Forecast</h4>
                    <p style={{marginTop: '0.75rem', fontSize: '1rem', lineHeight: '1.4'}}>{metrics.transportStatus}</p>
                </div>
            </div>

            {/* Deep Generative AI Briefing */}
            {timeVal > 0 && (
                <div className="card glass-panel" style={{padding: '1.5rem', borderLeft: '4px solid var(--success)'}}>
                    <h3 style={{fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <i className="fa-solid fa-brain text-success"></i> Deep AI Generative Analysis Briefing
                    </h3>
                    
                    {loading ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem'}}>
                            <i className="fa-solid fa-spinner fa-spin text-success" style={{fontSize: '1.5rem'}}></i>
                            <span>Querying temporal grounding model...</span>
                        </div>
                    ) : prediction ? (
                        <div style={{background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', lineHeight: '1.5'}}>
                                <div><strong style={{color: 'var(--text-secondary)'}}>Simulated Timeframe:</strong> T+{prediction.timeframe}</div>
                                <div><strong style={{color: 'var(--text-secondary)'}}>Crowd Status:</strong> {prediction.crowdState}</div>
                                <div><strong style={{color: 'var(--text-secondary)'}}>Food & Beverage Queue Impact:</strong> {prediction.foodQueues}</div>
                                <div><strong style={{color: 'var(--text-secondary)'}}>Transport Hub Wait-Time Forecast:</strong> {prediction.transportStatus}</div>
                                <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#10B981'}}>
                                    <i className="fa-solid fa-circle-check"></i>
                                    <span>Synthesized dynamically via Gemini from Live ground telemetry graph context.</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm" style={{fontStyle: 'italic'}}>Awaiting deep AI context generation...</p>
                    )}
                </div>
            )}
        </div>
    );
};
