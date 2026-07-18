import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { liveTelemetry } from '../data/TelemetryGenerator';
import { GroundingKnowledgeGraph } from '../data/KnowledgeGraph';

export const Settings: React.FC = () => {
    const [key, setKey] = useState(aiService.getApiKey() || '');
    const [saved, setSaved] = useState(false);
    const [sensors, setSensors] = useState<any[]>([]);

    useEffect(() => {
        setSensors(liveTelemetry.getRawData());
        const interval = setInterval(() => {
            setSensors(liveTelemetry.getRawData());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSave = () => {
        if (key.trim()) {
            aiService.setApiKey(key.trim());
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            
            // Reload page to re-initialize Gemini instances
            window.location.reload();
        }
    };

    const handleSensorChange = (nodeId: string, metricType: string, val: number) => {
        liveTelemetry.setSensorValue(nodeId, metricType, val);
        setSensors(liveTelemetry.getRawData());
    };

    const triggerIncidentPreset = (type: 'rain' | 'blackout' | 'reset') => {
        if (type === 'rain') {
            liveTelemetry.setSensorValue('g_north', 'Density', 78);
            liveTelemetry.setSensorValue('g_south', 'Density', 82);
            liveTelemetry.setSensorValue('z_100', 'Density', 85);
            liveTelemetry.setSensorValue('z_200', 'Density', 88);
            liveTelemetry.setSensorValue('f_burger_1', 'WaitTime', 18);
            // We can also override weather by editing liveTelemetry
        } else if (type === 'blackout') {
            liveTelemetry.setSensorValue('g_south', 'Density', 95);
            liveTelemetry.setSensorValue('t_metro_south', 'WaitTime', 30);
        } else if (type === 'reset') {
            liveTelemetry.setIsEmergency(false);
        }
        setSensors(liveTelemetry.getRawData());
    };

    const getNodeName = (nodeId: string) => {
        const node = GroundingKnowledgeGraph.find(n => n.id === nodeId);
        return node ? node.name : nodeId;
    };

    return (
        <div className="settings-module" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header className="dashboard-header" style={{marginBottom: '0rem'}}>
                <div>
                    <h2><i className="fa-solid fa-gear"></i> Ecosystem Config & Simulator</h2>
                    <p className="text-sm">Connect ArenaMind AI to the cloud and inject manual operational simulation vectors.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* Left side: Credentials & Simulator */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* API Key */}
                    <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <h3 style={{margin: 0, fontSize: '0.95rem'}}><i className="fa-brands fa-google"></i> Google Gemini API Key</h3>
                        <p className="text-sm" style={{margin: 0}}>
                            By default, the system uses mock telemetry responses if the API key is missing. 
                            Enter your Gemini API key to activate real generative reasoning models.
                        </p>
                        <input 
                            type="password"
                            value={key}
                            onChange={e => setKey(e.target.value)}
                            placeholder="Enter API Key (AIzaSy...)"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px', 
                                border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white'
                            }}
                        />
                        <button onClick={handleSave} className="primary-btn" style={{alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                            {saved ? <><i className="fa-solid fa-check"></i> Connected</> : <><i className="fa-solid fa-link"></i> Secure Connection</>}
                        </button>
                    </div>

                    {/* Environment Simulator Presets */}
                    <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <h3 style={{margin: 0, fontSize: '0.95rem'}}><i className="fa-solid fa-triangle-exclamation text-warning"></i> Environmental Alert Simulator</h3>
                        <p className="text-sm" style={{margin: 0}}>Inject custom, complex emergencies to stress-test the digital twin and RAG orchestration pipelines.</p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button onClick={() => triggerIncidentPreset('rain')} className="secondary-btn" style={{ padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'white' }}>
                                <i className="fa-solid fa-cloud-showers-heavy text-accent"></i> Rain Downpour
                            </button>
                            <button onClick={() => triggerIncidentPreset('blackout')} className="secondary-btn" style={{ padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--danger)', color: 'white' }}>
                                <i className="fa-solid fa-bolt text-danger"></i> Metro Outage
                            </button>
                            <button onClick={() => triggerIncidentPreset('reset')} className="secondary-btn" style={{ padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                                <i className="fa-solid fa-arrows-rotate"></i> Reset Ecosystem
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right side: Live Telemetry Customizer */}
                <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem' }}><i className="fa-solid fa-sliders"></i> Live Telemetry Customizer</h3>
                    <p className="text-sm" style={{ margin: 0 }}>Manually override physical stadium sensor values. The 3D stadium stands will update color based on your inputs.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', maxHeight: '420px', paddingRight: '0.5rem' }}>
                        {sensors.map((sensor, idx) => {
                            const isValNumber = typeof sensor.value === 'number';
                            if (!isValNumber) return null; // skip string status values for sliders
                            
                            const unit = sensor.metricType === 'Density' ? '%' : sensor.metricType === 'WaitTime' ? ' mins' : '%';
                            const maxVal = sensor.metricType === 'Density' ? 100 : sensor.metricType === 'Inventory' ? 100 : 30;

                            return (
                                <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                                        <span style={{ fontWeight: 'bold' }}>{getNodeName(sensor.nodeId)} <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>({sensor.metricType})</span></span>
                                        <strong style={{ color: 'var(--accent-primary)' }}>{sensor.value}{unit}</strong>
                                    </div>
                                    <input 
                                        type="range"
                                        min="0"
                                        max={maxVal}
                                        value={sensor.value}
                                        onChange={(e) => handleSensorChange(sensor.nodeId, sensor.metricType, parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            height: '4px',
                                            borderRadius: '2px',
                                            accentColor: 'var(--accent-primary)',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};
