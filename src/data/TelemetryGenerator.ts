import { GroundingKnowledgeGraph } from './KnowledgeGraph';

export interface SensorData {
    nodeId: string;
    metricType: 'Density' | 'WaitTime' | 'Inventory' | 'Status';
    value: number | string;
    timestamp: Date;
}

class TelemetryGenerator {
    private currentTelemetry: Map<string, SensorData> = new Map();
    private baseAttendance = 68450;
    private carbonSavedKg = 1450;
    
    public getCarbonSaved() { return this.carbonSavedKg; }
    public addCarbonSaved(amount: number) { this.carbonSavedKg += amount; }
    
    constructor() {
        this.initializeSensors();
        
        // Start polling loop to update metrics realistically
        setInterval(() => this.updateSensors(), 10000);
    }

    private initializeSensors() {
        GroundingKnowledgeGraph.forEach(node => {
            if (node.type === 'Gate') {
                this.currentTelemetry.set(node.id, { nodeId: node.id, metricType: 'Density', value: 35, timestamp: new Date() });
            }
            if (node.type === 'Food') {
                this.currentTelemetry.set(node.id, { nodeId: node.id, metricType: 'WaitTime', value: 5, timestamp: new Date() });
                this.currentTelemetry.set(`${node.id}_inv`, { nodeId: node.id, metricType: 'Inventory', value: 100, timestamp: new Date() });
            }
            if (node.type === 'Transport') {
                this.currentTelemetry.set(node.id, { nodeId: node.id, metricType: 'WaitTime', value: 10, timestamp: new Date() });
            }
        });
    }

    private updateSensors() {
        // Realistically fluctuate values based on previous state
        this.currentTelemetry.forEach((data) => {
            if (typeof data.value === 'number') {
                // Fluctuations
                const shift = Math.floor(Math.random() * 5) - 2; // -2 to +2
                
                let newValue = data.value + shift;
                if (data.metricType === 'Inventory') {
                    // Inventory only goes down
                    newValue = data.value - Math.floor(Math.random() * 3);
                    if (newValue < 0) newValue = 0;
                }
                
                if (newValue < 0 && data.metricType !== 'Inventory') newValue = 0;
                if (data.metricType === 'Density' && newValue > 100) newValue = 100;
                
                data.value = newValue;
                data.timestamp = new Date();
            }
        });

        this.baseAttendance += Math.floor(Math.random() * 10);
    }

    private isEmergency = false;

    public getLiveStateString(): string {
        let state = `Live Operational Telemetry (Time: ${new Date().toLocaleTimeString()}):\n`;
        state += `Total Attendance: ${this.baseAttendance}\n\n`;
        
        this.currentTelemetry.forEach(data => {
            const node = GroundingKnowledgeGraph.find(n => n.id === data.nodeId);
            if (node) {
                const unit = data.metricType === 'Density' ? '%' : data.metricType === 'WaitTime' ? ' mins' : '% remaining';
                state += `Sensor [${node.name}]: ${data.metricType} = ${data.value}${unit}\n`;
            }
        });
        
        return state;
    }
    
    public getRawData() {
        return Array.from(this.currentTelemetry.values());
    }

    public setSensorValue(nodeId: string, metricType: string, newValue: number | string) {
        const key = metricType === 'Inventory' ? `${nodeId}_inv` : nodeId;
        const sensor = this.currentTelemetry.get(key);
        if (sensor) {
            sensor.value = newValue;
            sensor.timestamp = new Date();
        }
    }

    public getIsEmergency(): boolean {
        return this.isEmergency;
    }

    public setIsEmergency(val: boolean): void {
        this.isEmergency = val;
        if (val) {
            // Under emergency egress, densities at exits peak
            this.currentTelemetry.forEach(data => {
                if (data.metricType === 'Density') {
                    data.value = 95;
                }
            });
        } else {
            this.initializeSensors();
        }
    }

    public applyMitigation(action: string) {
        if (action === 'deploy_volunteers') {
            const gate = this.currentTelemetry.get('g_south');
            if (gate) gate.value = 28; // Congestion resolved
            const gateNorth = this.currentTelemetry.get('g_north');
            if (gateNorth) gateNorth.value = 32;
        } else if (action === 'extend_metro') {
            const metro = this.currentTelemetry.get('t_metro_south');
            if (metro) metro.value = 3; // delays reduced
        } else if (action === 'restock_food') {
            const burger = this.currentTelemetry.get('f_burger_1_inv');
            if (burger) burger.value = 100;
            const taco = this.currentTelemetry.get('f_taco_1_inv');
            if (taco) taco.value = 100;
            const waitBurger = this.currentTelemetry.get('f_burger_1');
            if (waitBurger) waitBurger.value = 4;
            const waitTaco = this.currentTelemetry.get('f_taco_1');
            if (waitTaco) waitTaco.value = 3;
        } else if (action === 'dispatch_paramedic') {
            const gate = this.currentTelemetry.get('g_east');
            if (gate) gate.value = 20; // restore VIP access flow
        }
    }
}

export const liveTelemetry = new TelemetryGenerator();
