import React, { createContext, useContext, useState, useEffect } from 'react';
import { liveTelemetry } from '../data/TelemetryGenerator';
import type { SensorData } from '../data/TelemetryGenerator';
import type { DashboardKPIs } from '../types';

interface SwarmLog {
    id: string;
    timestamp: string;
    agent: string;
    message: string;
}

interface TelemetryContextType {
    sensors: SensorData[];
    isEmergency: boolean;
    kpis: DashboardKPIs;
    logs: SwarmLog[];
    refreshTelemetry: () => void;
    setEmergency: (val: boolean) => void;
    triggerMitigation: (actionKey: string) => void;
    addLog: (agent: string, message: string) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

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

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sensors, setSensors] = useState<SensorData[]>([]);
    const [isEmergency, setIsEmergencyState] = useState(false);
    const [logs, setLogs] = useState<SwarmLog[]>([]);
    const [kpis, setKpis] = useState<DashboardKPIs>({
        totalAttendance: 74205,
        carbonSavedKg: liveTelemetry.getCarbonSaved(),
        activeIncidents: 2,
        avgTransportDelayMins: 4
    });

    const refreshTelemetry = () => {
        setSensors(liveTelemetry.getRawData());
        setIsEmergencyState(liveTelemetry.getIsEmergency());
        setKpis(prev => ({
            ...prev,
            carbonSavedKg: liveTelemetry.getCarbonSaved(),
            activeIncidents: liveTelemetry.getIsEmergency() ? 3 : liveTelemetry.getRawData().filter(s => typeof s.value === 'number' && s.value > 80).length
        }));
    };

    const setEmergency = (val: boolean) => {
        liveTelemetry.setIsEmergency(val);
        refreshTelemetry();
    };

    const triggerMitigation = (actionKey: string) => {
        liveTelemetry.applyMitigation(actionKey);
        refreshTelemetry();
        
        // Log the mitigation event
        const newLog: SwarmLog = {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString(),
            agent: 'Commander Agent',
            message: `Mitigation Playbook [${actionKey}] dispatched to field units.`
        };
        setLogs(prev => [...prev.slice(-24), newLog]);
    };

    const addLog = (agent: string, message: string) => {
        const newLog: SwarmLog = {
            id: Math.random().toString(),
            timestamp: new Date().toLocaleTimeString(),
            agent,
            message
        };
        setLogs(prev => [...prev.slice(-24), newLog]);
    };

    // Initialize state
    useEffect(() => {
        refreshTelemetry();
        
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

    // Single unified polling loop (every 3 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            // Fluctuates metrics in backend
            refreshTelemetry();
            
            // Generate a random swarm agent log
            const temp = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
            const newLog: SwarmLog = {
                id: Math.random().toString(),
                timestamp: new Date().toLocaleTimeString(),
                agent: temp.agent,
                message: temp.text
            };
            setLogs(prev => [...prev.slice(-24), newLog]);

            // Tick KPI attendance slightly
            setKpis(prev => ({
                ...prev,
                totalAttendance: prev.totalAttendance + Math.floor(Math.random() * 4),
                carbonSavedKg: liveTelemetry.getCarbonSaved()
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <TelemetryContext.Provider value={{
            sensors,
            isEmergency,
            kpis,
            logs,
            refreshTelemetry,
            setEmergency,
            triggerMitigation,
            addLog
        }}>
            {children}
        </TelemetryContext.Provider>
    );
};

export const useTelemetry = () => {
    const context = useContext(TelemetryContext);
    if (!context) {
        throw new Error('useTelemetry must be used within a TelemetryProvider');
    }
    return context;
};
