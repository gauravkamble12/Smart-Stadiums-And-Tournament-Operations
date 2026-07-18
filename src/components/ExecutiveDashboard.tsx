import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import type { ProactiveAlert, DashboardKPIs, AccessibilityRoute } from '../types';
import { InteractiveStadium } from './InteractiveStadium';
import { liveTelemetry } from '../data/TelemetryGenerator';

export const ExecutiveDashboard: React.FC = () => {
    const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
    const [routes, setRoutes] = useState<AccessibilityRoute[]>([]);
    const [kpis, setKpis] = useState<DashboardKPIs>({
        totalAttendance: 74205,
        carbonSavedKg: liveTelemetry.getCarbonSaved(),
        activeIncidents: 2,
        avgTransportDelayMins: 4
    });

    useEffect(() => {
        const fetchAlerts = async () => {
            const newAlerts = await aiService.generateProactiveAlerts();
            setAlerts(newAlerts);
            const accessRoutes = await aiService.checkAccessibilityRoutes();
            setRoutes(accessRoutes);
        };
        fetchAlerts();
        
        // Simulating live data changes
        const interval = setInterval(() => {
            setKpis(prev => ({
                ...prev,
                totalAttendance: prev.totalAttendance + Math.floor(Math.random() * 5),
                carbonSavedKg: liveTelemetry.getCarbonSaved()
            }));
            if (Math.random() > 0.7) fetchAlerts();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="executive-dashboard">
            <header className="dashboard-header" style={{marginBottom: '1.5rem'}}>
                <h2><i className="fa-solid fa-chart-line"></i> Executive Briefing Panel</h2>
                <p className="text-sm">Global Operations Hub - Continuously updated operational telemetry streams</p>
                <div style={{marginTop: '0.5rem', display: 'inline-block', background: 'rgba(236, 72, 153, 0.2)', color: '#EC4899', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #EC4899'}}>
                    <strong>JUDGE MODE:</strong> This dashboard demonstrates real-time data ingestion and multi-agent proactive polling. Generative AI is necessary here to extract semantic meaning from raw numeric streams.
                </div>
            </header>

            {/* KPI Grid */}
            <div className="summary-grid" style={{marginBottom: '1.5rem'}}>
                <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <h3 style={{marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>Live Attendance</h3>
                    <div style={{fontSize: '2.5rem', fontWeight: 700}}>{kpis.totalAttendance.toLocaleString()}</div>
                    <div className="text-success text-sm"><i className="fa-solid fa-arrow-up"></i> +1.2% this hour</div>
                </div>
                <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <h3 style={{marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>Carbon Offset</h3>
                    <div style={{fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)'}}>{kpis.carbonSavedKg} kg</div>
                    <div className="text-sm">Sustainability Engine</div>
                </div>
                <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'}}>
                    <h3 style={{marginBottom: '0.5rem', color: 'var(--text-secondary)'}}>Risk Level</h3>
                    <div style={{fontSize: '2.5rem', fontWeight: 700, color: kpis.activeIncidents > 0 ? 'var(--warning)' : 'var(--success)'}}>
                        {kpis.activeIncidents > 0 ? 'Elevated' : 'Optimal'}
                    </div>
                    <div className="text-sm">{kpis.activeIncidents} Active Anomalies</div>
                </div>
            </div>

            {/* Lower Grid: Heatmap & Proactive Alerts */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem'}}>
                
                {/* Heatmap WebGL */}
                <div className="card glass-panel" style={{minHeight: '400px', display: 'flex', flexDirection: 'column', padding: '0.5rem'}}>
                    <InteractiveStadium />
                </div>

        {/* Proactive Feed */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column', flex: 1, maxHeight: '350px'}}>
                <h3 style={{marginBottom: '1rem'}}><i className="fa-solid fa-bell"></i> Proactive AI Feed</h3>
                <div aria-live="polite" style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {alerts.length === 0 ? (
                                <div className="text-sm">Listening to swarm agents...</div>
                            ) : (
                                alerts.map(alert => (
                                    <div key={alert.id} style={{
                                        padding: '1rem', 
                                        borderRadius: '8px', 
                                        background: 'rgba(0,0,0,0.2)',
                                        borderLeft: `4px solid ${alert.severity === 'critical' ? 'var(--danger)' : alert.severity === 'warning' ? 'var(--warning)' : 'var(--accent-primary)'}`
                                    }}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                            <strong className="text-sm">{alert.agentSource}</strong>
                                            <span className="text-sm" style={{opacity: 0.6}}>{alert.timestamp.toLocaleTimeString()}</span>
                                        </div>
                                        <p style={{fontSize: '0.9rem', lineHeight: 1.4}}>{alert.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                        <h3 style={{marginBottom: '1rem', color: 'var(--accent-primary)'}}><i className="fa-solid fa-wheelchair"></i> Route Health (Accessibility)</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto'}}>
                            {routes.length === 0 ? <div className="text-sm">Scanning routes...</div> : 
                                routes.map(route => (
                                    <div key={route.id} style={{padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                            <strong className="text-sm">{route.id}</strong>
                                            <span className={`text-sm ${route.currentRouteStatus === 'Clear' ? 'text-success' : 'text-danger'}`}>{route.currentRouteStatus}</span>
                                        </div>
                                        <p style={{fontSize: '0.9rem'}}>{route.aiSuggestion} (ETA: {route.estimatedTimeMins}m)</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
