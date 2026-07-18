// Grounding Layer & Knowledge Graph

export interface Node {
    id: string;
    type: 'Gate' | 'Food' | 'Medical' | 'Transport' | 'Route' | 'Zone';
    name: string;
    capacity?: number;
    connections: string[]; // IDs of connected nodes
}

export const GroundingKnowledgeGraph: Node[] = [
    // GATES
    { id: 'g_north', type: 'Gate', name: 'North Main Gate', capacity: 15000, connections: ['r_main_concourse', 't_uber_north'] },
    { id: 'g_south', type: 'Gate', name: 'South Gate', capacity: 8000, connections: ['r_south_concourse', 't_metro_south'] },
    { id: 'g_east', type: 'Gate', name: 'East VIP Gate', capacity: 2000, connections: ['r_vip_concourse'] },
    
    // ZONES (Seating)
    { id: 'z_100', type: 'Zone', name: 'Sector 100-110', capacity: 25000, connections: ['r_main_concourse'] },
    { id: 'z_200', type: 'Zone', name: 'Sector 200-210', capacity: 20000, connections: ['r_south_concourse'] },
    
    // ROUTES
    { id: 'r_main_concourse', type: 'Route', name: 'Main Concourse', connections: ['g_north', 'z_100', 'f_burger_1', 'm_alpha'] },
    { id: 'r_south_concourse', type: 'Route', name: 'South Concourse', connections: ['g_south', 'z_200', 'f_taco_1'] },
    { id: 'r_vip_concourse', type: 'Route', name: 'VIP Concourse', connections: ['g_east'] },
    
    // FOOD VENDORS
    { id: 'f_burger_1', type: 'Food', name: 'Concourse Burgers', connections: ['r_main_concourse'] },
    { id: 'f_taco_1', type: 'Food', name: 'Southside Tacos', connections: ['r_south_concourse'] },
    
    // MEDICAL
    { id: 'm_alpha', type: 'Medical', name: 'First Aid Alpha', connections: ['r_main_concourse'] },
    
    // TRANSPORT HUBS
    { id: 't_uber_north', type: 'Transport', name: 'Rideshare North Hub', connections: ['g_north'] },
    { id: 't_metro_south', type: 'Transport', name: 'Metro Station South', connections: ['g_south'] }
];

export const getConnectedNodes = (nodeId: string): Node[] => {
    const node = GroundingKnowledgeGraph.find(n => n.id === nodeId);
    if (!node) return [];
    return GroundingKnowledgeGraph.filter(n => node.connections.includes(n.id));
};

// Expose graph as a string for Gemini context window
export const generateGraphContextString = (): string => {
    return GroundingKnowledgeGraph.map(n => 
        `[${n.type}] ${n.name} (ID: ${n.id}) - Connects to: ${n.connections.join(', ')}`
    ).join('\n');
};
