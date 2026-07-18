import React, { useState } from 'react';
import { liveTelemetry } from '../data/TelemetryGenerator';

interface IncidentEvent {
    id: string;
    time: string;
    description: string;
    aiIntervention: string | null;
    status: 'Resolved' | 'Active';
    mitigationAction?: string;
    mitigationLabel?: string;
    successMessage?: string;
}

export const IncidentTimeline: React.FC = () => {
    const [events, setEvents] = useState<IncidentEvent[]>([
        { 
            id: '6', 
            time: '18:25', 
            description: 'Southside Taco vendor queue: Wait times exceed 20 mins.', 
            aiIntervention: 'Food Agent recommends inventory replenishment and queue redirect.', 
            status: 'Active',
            mitigationAction: 'restock_food',
            mitigationLabel: 'Trigger Food Stock replenishment',
            successMessage: 'Replenished inventory & optimized vendor queues.'
        },
        { 
            id: '5', 
            time: '18:20', 
            description: 'South Metro Hub bottleneck - transit delays accumulating.', 
            aiIntervention: 'Transport Agent recommends extending metro train operating hours.', 
            status: 'Active',
            mitigationAction: 'extend_metro',
            mitigationLabel: 'Extend Metro operating schedules',
            successMessage: 'Extended metro trains. Transit delays reduced to 3 minutes.'
        },
        { 
            id: '4', 
            time: '18:10', 
            description: 'South Gate density exceeds 85%. Egress bottleneck forming.', 
            aiIntervention: 'Security Agent recommends deploying crowd flow specialists.', 
            status: 'Active',
            mitigationAction: 'deploy_volunteers',
            mitigationLabel: 'Deploy 15 Volunteers to South Gate',
            successMessage: 'Deployed 15 volunteers. Egress normalized.'
        },
        { 
            id: '3', 
            time: '17:55', 
            description: 'VIP Concourse medical bottleneck. First aid request near East VIP gate.', 
            aiIntervention: 'Medical Agent dispatched First Aid Alpha.', 
            status: 'Resolved' 
        },
        { 
            id: '2', 
            time: '17:48', 
            description: 'North Concourse Burgers queue bottleneck.', 
            aiIntervention: 'Food Agent redirected traffic using digital signs.', 
            status: 'Resolved' 
        },
        { 
            id: '1', 
            time: '17:45', 
            description: 'Match concluded. Massive egress towards South Gate detected.', 
            aiIntervention: 'Commander Agent synchronized exit pathways.', 
            status: 'Resolved' 
        },
    ]);

    const handleMitigation = (id: string, actionKey: string, successMessage: string) => {
        liveTelemetry.applyMitigation(actionKey);
        setEvents(prev => prev.map(e => e.id === id ? { 
            ...e, 
            status: 'Resolved', 
            aiIntervention: `Executed: ${successMessage}` 
        } : e));
    };

    const exportTimeline = () => {
        const text = events.map(e => `[${e.time}] ${e.description} -> AI Action: ${e.aiIntervention || 'None'} (${e.status})`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'arena_incident_log.txt';
        a.click();
    };

    return (
        <div className="incident-timeline">
            <header className="dashboard-header" style={{marginBottom: '2rem'}}>
                <div>
                    <h2><i className="fa-solid fa-timeline"></i> AI Incident Command Room</h2>
                    <p className="text-sm">Continuous tracking and resolution of stadium swarm alerts</p>
                </div>
                <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <div className="text-sm" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <i className="fa-solid fa-circle-info text-accent"></i>
                        <span>Click playbook actions to update live sensors</span>
                    </div>
                    <button onClick={exportTimeline} className="primary-btn">
                        <i className="fa-solid fa-download"></i> Export Log
                    </button>
                </div>
            </header>

            <div className="timeline-container card glass-panel" style={{display: 'flex', flexDirection: 'column', gap: '0'}}>
                {events.map((event, idx) => (
                    <div key={event.id} style={{
                        display: 'flex', 
                        gap: '2rem', 
                        padding: '1.5rem',
                        borderBottom: idx !== events.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        position: 'relative'
                    }}>
                        <div style={{width: '60px', fontWeight: 'bold', color: 'var(--text-secondary)'}}>{event.time}</div>
                        
                        {/* Timeline line connecting dots */}
                        <div style={{position: 'absolute', left: '105px', top: '2rem', bottom: idx === events.length -1 ? '50%' : '-1.5rem', width: '2px', background: 'rgba(255,255,255,0.2)', zIndex: 0}}></div>
                        
                        <div style={{
                            width: '16px', height: '16px', borderRadius: '50%', 
                            background: event.status === 'Active' ? 'var(--warning)' : 'var(--success)',
                            boxShadow: event.status === 'Active' ? '0 0 10px var(--warning)' : 'none',
                            position: 'relative', zIndex: 1, marginTop: '2px'
                        }}></div>
                        
                        <div style={{flex: 1}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem'}}>
                                <div>
                                    <p style={{fontSize: '1.1rem', fontWeight: event.status === 'Active' ? 'bold' : 'normal'}}>{event.description}</p>
                                    {event.aiIntervention && (
                                        <div style={{marginTop: '0.75rem', background: event.status === 'Active' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', borderLeft: `4px solid ${event.status === 'Active' ? 'var(--warning)' : 'var(--success)'}`, padding: '0.75rem', borderRadius: '4px'}}>
                                            <strong><i className="fa-solid fa-robot"></i> AI Swarm Guidance:</strong> {event.aiIntervention}
                                        </div>
                                    )}
                                </div>
                                
                                {event.status === 'Active' && event.mitigationAction && (
                                    <button 
                                        onClick={() => handleMitigation(event.id, event.mitigationAction!, event.successMessage!)}
                                        className="primary-btn"
                                        style={{
                                            padding: '0.5rem 1rem', 
                                            fontSize: '0.85rem', 
                                            borderRadius: '6px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.4rem',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                                        }}
                                    >
                                        <i className="fa-solid fa-play fa-beat"></i> Run Playbook
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
