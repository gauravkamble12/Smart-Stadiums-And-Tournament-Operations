import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import type { EmotionData, AccessibilityRoute } from '../types';

export const AdvancedModules: React.FC = () => {
    const [emotion, setEmotion] = useState<EmotionData | null>(null);
    const [routes, setRoutes] = useState<AccessibilityRoute[]>([]);
    const [loading, setLoading] = useState(true);

    const syncModules = async () => {
        setLoading(true);
        const [emoData, routeData] = await Promise.all([
            aiService.generateEmotionAnalysis(),
            aiService.checkAccessibilityRoutes()
        ]);
        setEmotion(emoData);
        setRoutes(routeData);
        setLoading(false);
    };

    useEffect(() => {
        syncModules();
    }, []);

    return (
        <div className="advanced-modules" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <header className="dashboard-header">
                <h2><i className="fa-solid fa-microchip"></i> Advanced Swarm Modules</h2>
                <button onClick={syncModules} disabled={loading} className="sync-btn">
                    {loading ? <i className="fa-solid fa-arrows-rotate fa-spin"></i> : <i className="fa-solid fa-arrows-rotate"></i>} Sync Data
                </button>
            </header>

            {loading && !emotion ? (
                <div className="loading-state">Analyzing sentiment and accessibility telemetry...</div>
            ) : (
                <>
                    {/* Emotion AI */}
                    <div className="module-section">
                        <h3 style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}><i className="fa-solid fa-face-smile-beam"></i> Emotion AI Sentiment Analysis</h3>
                        <div className="summary-grid">
                            <div className="card glass-panel" style={{gridColumn: 'span 2'}}>
                                <h4>Trending Sentiment</h4>
                                <p style={{fontSize: '1.2rem', margin: '1rem 0'}}>{emotion?.trendingSentiment}</p>
                                <h4>Recent Fan Feedback</h4>
                                <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem'}}>
                                    {emotion?.recentFeedback.map((fb, i) => (
                                        <li key={i} style={{fontStyle: 'italic', color: 'var(--text-secondary)'}}>"{fb}"</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                <div><strong className="text-success">Happiness:</strong> <div style={{background: '#333', height: '8px', borderRadius: '4px', marginTop: '4px'}}><div style={{width: `${emotion?.happiness}%`, background: 'var(--success)', height: '100%', borderRadius: '4px'}}></div></div></div>
                                <div><strong className="text-warning">Confusion:</strong> <div style={{background: '#333', height: '8px', borderRadius: '4px', marginTop: '4px'}}><div style={{width: `${emotion?.confusion}%`, background: 'var(--warning)', height: '100%', borderRadius: '4px'}}></div></div></div>
                                <div><strong className="text-danger">Anger:</strong> <div style={{background: '#333', height: '8px', borderRadius: '4px', marginTop: '4px'}}><div style={{width: `${emotion?.anger}%`, background: 'var(--danger)', height: '100%', borderRadius: '4px'}}></div></div></div>
                                <div><strong className="text-danger">Panic:</strong> <div style={{background: '#333', height: '8px', borderRadius: '4px', marginTop: '4px'}}><div style={{width: `${emotion?.panic}%`, background: '#EF4444', height: '100%', borderRadius: '4px'}}></div></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Accessibility Guardian */}
                    <div className="module-section">
                        <h3 style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}><i className="fa-solid fa-wheelchair"></i> Accessibility Guardian</h3>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                            {routes.map((route, idx) => (
                                <div key={idx} className="card glass-panel" style={{borderLeft: route.currentRouteStatus !== 'Clear' ? '4px solid var(--danger)' : '4px solid var(--success)'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <h4>{route.id}</h4>
                                        <span className={route.currentRouteStatus !== 'Clear' ? 'text-danger' : 'text-success'} style={{fontWeight: 'bold'}}>{route.currentRouteStatus}</span>
                                    </div>
                                    <div style={{margin: '1rem 0'}}>
                                        <span className="text-sm">Needs: {route.userNeeds.join(', ')}</span>
                                    </div>
                                    <div style={{background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '8px'}}>
                                        <strong><i className="fa-solid fa-robot"></i> AI Suggestion:</strong>
                                        <p style={{marginTop: '0.5rem'}}>{route.aiSuggestion}</p>
                                    </div>
                                    <p className="text-sm" style={{marginTop: '1rem'}}><i className="fa-regular fa-clock"></i> Est. Time: {route.estimatedTimeMins} mins</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
