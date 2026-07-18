import React, { useState, useEffect, useRef } from 'react';
import { liveTelemetry } from '../data/TelemetryGenerator';

interface AgentConfig {
    name: string;
    role: string;
    systemPrompt: string;
    tools: string[];
    status: 'Nominal' | 'Active' | 'Offline';
    color: string;
    icon: string;
}

const AGENTS: AgentConfig[] = [
    {
        name: 'Commander Agent',
        role: 'Orchestrator',
        systemPrompt: 'You are the central brain of ArenaMind. Route queries to specialized sub-agents (Crowd, Transport, Weather, Security, Medical), synthesize their outputs into executive summaries, and generate action mitigation recommendations.',
        tools: ['routeQuery()', 'synthesizeResponse()', 'generatePlaybook()'],
        status: 'Nominal',
        color: '#60A5FA',
        icon: 'fa-brain'
    },
    {
        name: 'Crowd Agent',
        role: 'Density Profiler',
        systemPrompt: 'Analyze stadium entrance turnstile telemetry, sector heatmaps, and concourse flows. Report high congestion alerts and calculate estimated egress times.',
        tools: ['getCrowdDensity()', 'calculateFlowRate()'],
        status: 'Nominal',
        color: '#3B82F6',
        icon: 'fa-users'
    },
    {
        name: 'Transport Agent',
        role: 'Transit Coordinator',
        systemPrompt: 'Poll public metro schedule APIs, rideshare hub wait times, and shuttle bus availability. Propose transport bridge schedules in case of delays.',
        tools: ['getMetroDelays()', 'getRideshareWaitTimes()', 'dispatchShuttles()'],
        status: 'Nominal',
        color: '#10B981',
        icon: 'fa-train'
    },
    {
        name: 'Weather Agent',
        role: 'Atmospheric Analyst',
        systemPrompt: 'Continuously fetch local doppler radar scans, ambient humidity, and temperature. Trigger roof closure alerts if precipitation probability exceeds 60%.',
        tools: ['getRadarData()', 'getRoofStatus()', 'toggleStadiumRoof()'],
        status: 'Nominal',
        color: '#F59E0B',
        icon: 'fa-cloud-sun'
    },
    {
        name: 'Security Agent',
        role: 'Perimeter Monitor',
        systemPrompt: 'Evaluate gate turnstile status, perimeter security fence alarms, and ticket verification rates. Alert operational coordinators of breach threats.',
        tools: ['getTurnstileStatus()', 'getFenceIntegrity()'],
        status: 'Nominal',
        color: '#EF4444',
        icon: 'fa-shield-halved'
    },
    {
        name: 'Medical Agent',
        role: 'Safety & Health responder',
        systemPrompt: 'Monitor stadium temperature index (heat stress) and first aid request counts. Direct paramedics via optimal accessibility pathways.',
        tools: ['getHeatStressIndex()', 'getParamedicStatus()', 'dispatchFirstAid()'],
        status: 'Nominal',
        color: '#EC4899',
        icon: 'fa-truck-medical'
    }
];

const LOG_TEMPLATES = [
    { agent: 'Crowd Agent', text: 'Scanning gate cameras... north gate density is at 38%' },
    { agent: 'Crowd Agent', text: 'Sector 100 density optimal. Flow rate: 120 fans/min' },
    { agent: 'Crowd Agent', text: 'Warning: South gate density rising. Flow rate: 240 fans/min' },
    { agent: 'Transport Agent', text: 'Querying Metro South API... Status: Nominal (4m delays)' },
    { agent: 'Transport Agent', text: 'Uber rideshare north waiting list: 12 passengers' },
    { agent: 'Transport Agent', text: 'Escalation: South station delay increased to 10 mins. Suggesting rail backup' },
    { agent: 'Weather Agent', text: 'Querying local weather radar... Temp: 74F, Humidity: 55%' },
    { agent: 'Weather Agent', text: 'Clear sky radar confirmation. Roof open recommendation.' },
    { agent: 'Weather Agent', text: 'Small moisture cell detected 12 miles North. Monitoring movement.' },
    { agent: 'Security Agent', text: 'Turnstiles online: 24/24. RFID scanners checking: 100% success rate' },
    { agent: 'Security Agent', text: 'CCTV validation: Perimeter fencing Sector B secure.' },
    { agent: 'Security Agent', text: 'Incident: VIP gate access flow sluggish. Dispatching hosts.' },
    { agent: 'Medical Agent', text: 'First Aid Alpha status: Available. 0 active patients.' },
    { agent: 'Medical Agent', text: 'Telemetry check: Ambient concourse temp 72F (Within safe bounds).' },
    { agent: 'Medical Agent', text: 'Team status: Paramedics standing by near Sector 112.' }
];

interface GraphNode {
    id: string;
    name: string;
    type: 'Gate' | 'Food' | 'Medical' | 'Transport' | 'Route' | 'Zone';
    x: number;
    y: number;
    color: string;
}

const GRAPH_NODES: Record<string, GraphNode> = {
    g_north: { id: 'g_north', name: 'North Main Gate', type: 'Gate', x: 80, y: 70, color: '#3B82F6' },
    g_east: { id: 'g_east', name: 'East VIP Gate', type: 'Gate', x: 80, y: 180, color: '#3B82F6' },
    g_south: { id: 'g_south', name: 'South Gate', type: 'Gate', x: 80, y: 290, color: '#3B82F6' },
    z_100: { id: 'z_100', name: 'Sector 100-110', type: 'Zone', x: 210, y: 100, color: '#8B5CF6' },
    z_200: { id: 'z_200', name: 'Sector 200-210', type: 'Zone', x: 210, y: 260, color: '#8B5CF6' },
    r_main_concourse: { id: 'r_main_concourse', name: 'Main Concourse', type: 'Route', x: 360, y: 100, color: '#10B981' },
    r_vip_concourse: { id: 'r_vip_concourse', name: 'VIP Concourse', type: 'Route', x: 360, y: 180, color: '#10B981' },
    r_south_concourse: { id: 'r_south_concourse', name: 'South Concourse', type: 'Route', x: 360, y: 260, color: '#10B981' },
    f_burger_1: { id: 'f_burger_1', name: 'Concourse Burgers', type: 'Food', x: 540, y: 50, color: '#F59E0B' },
    f_taco_1: { id: 'f_taco_1', name: 'Southside Tacos', type: 'Food', x: 540, y: 310, color: '#F59E0B' },
    m_alpha: { id: 'm_alpha', name: 'First Aid Alpha', type: 'Medical', x: 540, y: 110, color: '#EC4899' },
    t_uber_north: { id: 't_uber_north', name: 'Rideshare North', type: 'Transport', x: 540, y: 180, color: '#06B6D4' },
    t_metro_south: { id: 't_metro_south', name: 'Metro Station South', type: 'Transport', x: 540, y: 240, color: '#06B6D4' }
};

const GRAPH_LINKS = [
    { from: 'g_north', to: 'r_main_concourse' },
    { from: 'g_north', to: 't_uber_north' },
    { from: 'g_south', to: 'r_south_concourse' },
    { from: 'g_south', to: 't_metro_south' },
    { from: 'g_east', to: 'r_vip_concourse' },
    { from: 'z_100', to: 'r_main_concourse' },
    { from: 'z_200', to: 'r_south_concourse' },
    { from: 'r_main_concourse', to: 'f_burger_1' },
    { from: 'r_main_concourse', to: 'm_alpha' },
    { from: 'r_south_concourse', to: 'f_taco_1' }
];

export const ArchitectureViewer: React.FC = () => {
    const [logs, setLogs] = useState<{ id: string; timestamp: string; agent: string; message: string }[]>([]);
    const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('All');
    const [activeConfig, setActiveConfig] = useState<AgentConfig | null>(AGENTS[0]);
    const [telemetry, setTelemetry] = useState<any[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Populate initial logs & telemetry
    useEffect(() => {
        setTelemetry(liveTelemetry.getRawData());
        
        const initialLogs = Array.from({ length: 8 }).map((_, idx) => {
            const temp = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
            const time = new Date(Date.now() - (8 - idx) * 15000);
            return {
                id: Math.random().toString(),
                timestamp: time.toLocaleTimeString(),
                agent: temp.agent,
                message: temp.text
            };
        });
        setLogs(initialLogs);
    }, []);

    // Live log & telemetry polling simulator
    useEffect(() => {
        const interval = setInterval(() => {
            const temp = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
            const newLog = {
                id: Math.random().toString(),
                timestamp: new Date().toLocaleTimeString(),
                agent: temp.agent,
                message: temp.text
            };
            setLogs(prev => [...prev.slice(-25), newLog]);
            setTelemetry(liveTelemetry.getRawData());
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const filteredLogs = logs.filter(log => selectedAgentFilter === 'All' || log.agent === selectedAgentFilter);

    const getSensorValue = (nodeId: string, type: string) => {
        const key = type === 'Food' ? `${nodeId}` : nodeId;
        const sensor = telemetry.find(s => s.nodeId === key);
        if (sensor) {
            const unit = sensor.metricType === 'Density' ? '%' : sensor.metricType === 'WaitTime' ? 'm' : '';
            return `${sensor.value}${unit}`;
        }
        return '';
    };

    const isLinkConnected = (link: { from: string; to: string }) => {
        if (!hoveredNode) return true;
        return link.from === hoveredNode || link.to === hoveredNode;
    };

    return (
        <div className="architecture-viewer" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header className="dashboard-header" style={{ marginBottom: '0rem' }}>
                <div>
                    <h2><i className="fa-solid fa-diagram-project"></i> GenAI Architecture & Swarm Workspace</h2>
                    <p className="text-sm">Inspect internal agent reasoning, orchestration logs, and RAG grounding configurations</p>
                </div>
            </header>

            {/* Top row: Interactive SVG Knowledge Graph Visualizer */}
            <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.4rem', fontSize: '0.95rem', color: 'var(--accent-primary)' }}><i className="fa-solid fa-network-wired"></i> Interactive RAG Knowledge Graph</h3>
                <p className="text-sm" style={{ marginBottom: '1.5rem' }}>Hover over nodes to inspect connectivity and query live sensor streams in real-time.</p>
                
                <div style={{ background: 'rgba(5, 8, 16, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)', padding: '1.5rem', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <svg viewBox="0 0 700 360" width="100%" height="340px" style={{ overflow: 'visible' }}>
                        {/* Render Links */}
                        {GRAPH_LINKS.map((link, idx) => {
                            const fromNode = GRAPH_NODES[link.from];
                            const toNode = GRAPH_NODES[link.to];
                            if (!fromNode || !toNode) return null;
                            const isConnected = isLinkConnected(link);
                            return (
                                <line 
                                    key={idx}
                                    x1={fromNode.x}
                                    y1={fromNode.y}
                                    x2={toNode.x}
                                    y2={toNode.y}
                                    stroke={isConnected ? (hoveredNode ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.25)') : 'rgba(255, 255, 255, 0.05)'}
                                    strokeWidth={isConnected && hoveredNode ? 2.5 : 1.5}
                                    style={{ transition: 'all 0.3s ease' }}
                                />
                            );
                        })}

                        {/* Render Nodes */}
                        {Object.values(GRAPH_NODES).map(node => {
                            const isHovered = hoveredNode === node.id;
                            const isFaded = hoveredNode && !isHovered && !GRAPH_LINKS.some(l => (l.from === node.id && l.to === hoveredNode) || (l.to === node.id && l.from === hoveredNode));
                            
                            const liveVal = getSensorValue(node.id, node.type);
                            
                            return (
                                <g 
                                    key={node.id}
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    style={{ cursor: 'pointer', transition: 'all 0.3s ease', opacity: isFaded ? 0.3 : 1 }}
                                >
                                    {/* Glowing Aura on hover */}
                                    <circle 
                                        cx={node.x}
                                        cy={node.y}
                                        r={isHovered ? 19 : 14}
                                        fill={node.color}
                                        opacity={isHovered ? 0.4 : 0.15}
                                        style={{ transition: 'all 0.3s' }}
                                    />
                                    {/* Main Circle */}
                                    <circle 
                                        cx={node.x}
                                        cy={node.y}
                                        r={12}
                                        fill="var(--bg-primary)"
                                        stroke={node.color}
                                        strokeWidth={isHovered ? 3 : 2}
                                        style={{ transition: 'all 0.3s' }}
                                    />
                                    {/* Initial character */}
                                    <text 
                                        x={node.x}
                                        y={node.y + 4}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize="10px"
                                        fontWeight="bold"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        {node.name.charAt(0)}
                                    </text>

                                    {/* Node Name Label */}
                                    <text 
                                        x={node.x}
                                        y={node.y - 18}
                                        textAnchor="middle"
                                        fill={isHovered ? 'white' : 'var(--text-secondary)'}
                                        fontSize="10px"
                                        fontWeight={isHovered ? 'bold' : 'normal'}
                                        style={{ pointerEvents: 'none', transition: 'fill 0.3s' }}
                                    >
                                        {node.name}
                                    </text>

                                    {/* Live Value Tag */}
                                    {liveVal && (
                                        <text 
                                            x={node.x}
                                            y={node.y + 24}
                                            textAnchor="middle"
                                            fill={isHovered ? 'var(--accent-primary)' : 'var(--success)'}
                                            fontSize="9px"
                                            fontWeight="bold"
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {liveVal}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Tooltip Overlay */}
                    {hoveredNode && (
                        <div style={{
                            position: 'absolute',
                            bottom: '1rem',
                            left: '1rem',
                            background: 'rgba(5, 8, 16, 0.9)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            width: '240px',
                            color: 'white',
                            fontSize: '0.8rem',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                            animation: 'slideUp 0.2s ease-out'
                        }}>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{GRAPH_NODES[hoveredNode].name}</h4>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', opacity: 0.6 }}>Type: {GRAPH_NODES[hoveredNode].type}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem' }}>
                                <div>Connections: <strong style={{ color: 'var(--success)' }}>{GRAPH_LINKS.filter(l => l.from === hoveredNode || l.to === hoveredNode).map(l => l.from === hoveredNode ? GRAPH_NODES[l.to].name : GRAPH_NODES[l.from].name).join(', ')}</strong></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Second row: Orchestrator flow Chart & Swarm Agents list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--success)' }}><i className="fa-solid fa-network-wired"></i> Orchestration & Function Call</h3>
                    <pre style={{
                        background: 'rgba(0,0,0,0.3)', 
                        padding: '1.25rem', 
                        borderRadius: '8px', 
                        color: '#4ADE80', 
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        overflowX: 'auto'
                    }}>
{`[ AI Commander Agent ] (Router & Validator)
       │
       ├─────────► [ Crowd Agent ]     ──► getCrowdDensity()
       ├─────────► [ Transport Agent ] ──► getTransport()
       ├─────────► [ Weather Agent ]   ──► getWeather()
       ▼
[ Response Synthesizer ] ──► [ Action Plan recommendations ]`}
                    </pre>
                </div>

                <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem' }}><i className="fa-solid fa-users-gear"></i> Swarm Agents</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {AGENTS.map(agent => (
                            <div 
                                key={agent.name}
                                onClick={() => setActiveConfig(agent)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    background: activeConfig?.name === agent.name ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                                    border: activeConfig?.name === agent.name ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <i className={`fa-solid ${agent.icon}`} style={{ color: agent.color }}></i>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{agent.name}</span>
                                </div>
                                <span style={{
                                    fontSize: '0.7rem',
                                    background: 'rgba(16,185,129,0.15)',
                                    color: 'var(--success)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                }}>{agent.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Third row: Live scrolling terminal */}
            <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '420px', padding: 0, overflow: 'hidden' }}>
                <div style={{ 
                    padding: '1rem 1.5rem', 
                    borderBottom: '1px solid var(--glass-border)', 
                    background: 'rgba(5, 8, 16, 0.4)',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fa-solid fa-terminal text-accent" style={{ color: 'var(--accent-primary)' }}></i>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Swarm Agent Live Logs</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['All', 'Crowd Agent', 'Transport Agent', 'Weather Agent', 'Security Agent', 'Medical Agent'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setSelectedAgentFilter(filter)}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '0.75rem',
                                    borderRadius: '4px',
                                    border: selectedAgentFilter === filter ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                                    background: selectedAgentFilter === filter ? 'rgba(59,130,246,0.15)' : 'transparent',
                                    color: selectedAgentFilter === filter ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {filter === 'All' ? 'All Logs' : filter.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ 
                    flex: 1, 
                    background: '#040712', 
                    padding: '1rem 1.5rem', 
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                }}>
                    {filteredLogs.map(log => {
                        const agentData = AGENTS.find(a => a.name === log.agent);
                        const labelColor = agentData ? agentData.color : 'white';
                        return (
                            <div key={log.id} className="terminal-line" style={{ display: 'flex', gap: '0.5rem', lineHeight: '1.4' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>[{log.timestamp}]</span>
                                <span style={{ color: labelColor, fontWeight: 'bold' }}>[{log.agent}]:</span>
                                <span style={{ color: '#E2E8F0' }}>{log.message}</span>
                            </div>
                        );
                    })}
                    <div ref={terminalEndRef} />
                </div>
            </div>

            {/* Config Inspector */}
            {activeConfig && (
                <div className="card glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${activeConfig.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                            <i className={`fa-solid ${activeConfig.icon}`} style={{ color: activeConfig.color }}></i>
                            <span>Configuration Inspector: <strong>{activeConfig.name}</strong></span>
                        </h4>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Role: <strong>{activeConfig.role}</strong></span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        <div>
                            <strong style={{ color: 'var(--text-secondary)' }}>System Instruction / Prompt:</strong>
                            <p style={{ marginTop: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', color: '#cbd5e1' }}>
                                {activeConfig.systemPrompt}
                            </p>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--text-secondary)' }}>Registered Swarm Tools:</strong>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                {activeConfig.tools.map(tool => (
                                    <span key={tool} style={{ 
                                        fontFamily: 'monospace', 
                                        fontSize: '0.75rem', 
                                        background: 'rgba(255,255,255,0.05)', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px',
                                        color: activeConfig.color
                                    }}>
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
