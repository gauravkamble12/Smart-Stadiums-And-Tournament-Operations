import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { aiService } from '../services/aiService';
import { useTelemetry } from '../context/TelemetryContext';
import type { StadiumPOI } from '../types';
import { HologramStadium } from './stadium/HologramStadium';

export const InteractiveStadium: React.FC = () => {
  const { sensors: telemetryList, isEmergency } = useTelemetry();
  const [viewMode, setViewMode] = useState<'graph' | 'satellite'>('graph');
  const [stadium, setStadium] = useState('Estadio Azteca');
  const [pois, setPois] = useState<StadiumPOI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<StadiumPOI | null>(null);

  useEffect(() => {
      const loadMap = async () => {
          setLoading(true);
          const data = await aiService.generateStadiumMap(stadium);
          setPois(data);
          setLoading(false);
      };
      loadMap();
  }, [stadium]);

  const getIconForType = (type: string) => {
      switch(type) {
          case 'Entry': return 'fa-door-open';
          case 'Exit': return 'fa-person-running';
          case 'Washroom': return 'fa-restroom';
          case 'Canteen': return 'fa-burger';
          case 'Medical': return 'fa-truck-medical';
          case 'Seating': return 'fa-chair';
          default: return 'fa-map-pin';
      }
  };

  const getMetricForPoi = (poi: StadiumPOI) => {
      const name = poi.name.toLowerCase();
      let key = '';
      if (name.includes('north')) key = 'g_north';
      else if (name.includes('south')) key = 'g_south';
      else if (name.includes('canteen') || name.includes('burger')) key = 'f_burger_1';
      else if (name.includes('medical') || name.includes('aid')) key = 'm_alpha';
      else if (name.includes('vip seating')) key = 'g_east';
      else return null;

      const metrics = telemetryList.filter(t => t.nodeId === key);
      return metrics.length > 0 ? metrics : null;
  };

  const getStatusColor = (value: number | string, metricType: string) => {
      if (typeof value !== 'number') return 'var(--success)';
      if (metricType === 'Density') {
          if (value > 80) return 'var(--danger)';
          if (value > 50) return 'var(--warning)';
          return 'var(--success)';
      }
      if (metricType === 'WaitTime') {
          if (value > 15) return 'var(--danger)';
          if (value > 8) return 'var(--warning)';
          return 'var(--success)';
      }
      return 'var(--success)';
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: viewMode === 'graph' ? 'var(--bg-secondary)' : '#e2e8f0', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
      
      {/* Top Controls */}
      <div style={{position: 'absolute', top: '1rem', left: '1rem', right: '1rem', zIndex: 10, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none'}}>
        {/* View Toggle */}
        <div style={{display: 'flex', background: 'rgba(5, 8, 16, 0.85)', borderRadius: '8px', padding: '4px', pointerEvents: 'auto', border: '1px solid var(--glass-border)'}}>
            <button 
                onClick={() => setViewMode('graph')}
                style={{padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: viewMode === 'graph' ? 'var(--accent-primary)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'}}
            >
                <i className="fa-solid fa-network-wired"></i> Graph Mode
            </button>
            <button 
                onClick={() => setViewMode('satellite')}
                style={{padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: viewMode === 'satellite' ? 'var(--accent-primary)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'}}
            >
                <i className="fa-solid fa-satellite"></i> Satellite Mode
            </button>
        </div>

        {/* Stadium Selector */}
        <div style={{pointerEvents: 'auto'}}>
            <select 
                value={stadium} 
                onChange={(e) => {
                    setStadium(e.target.value);
                    setSelectedPoi(null);
                }}
                style={{padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(5, 8, 16, 0.85)', color: 'white', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer'}}
            >
                <option value="Estadio Azteca">Estadio Azteca (Mexico)</option>
                <option value="MetLife Stadium">MetLife Stadium (New York)</option>
                <option value="Wembley Stadium">Wembley Stadium (London)</option>
                <option value="Lusail Stadium">Lusail Stadium (Qatar)</option>
            </select>
        </div>
      </div>

      {loading && (
          <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, background: 'rgba(5, 8, 16, 0.9)', border: '1px solid var(--glass-border)', padding: '1rem 2rem', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold'}}>
              <i className="fa-solid fa-spinner fa-spin text-accent"></i> Gemini Spatial Mapping...
          </div>
      )}

      {/* Main View Area */}
      <div style={{ flex: 1, height: '100%' }}>
          {viewMode === 'satellite' ? (
              <div style={{width: '100%', height: '100%', position: 'relative'}}>
                  <iframe 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(stadium)}&t=k&z=17&ie=UTF8&iwloc=&output=embed`}
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{border: 0, filter: 'brightness(0.75)'}}
                      title="Stadium Map"
                  ></iframe>
                  {/* Overlay POIs on the map */}
                  {pois.map(poi => {
                      const left = ((poi.position[0] + 10) / 20) * 100;
                      const top = ((poi.position[2] + 10) / 20) * 100;
                      
                      const getColorForType = (type: string) => {
                        switch(type) {
                            case 'Entry': return '#3B82F6';
                            case 'Exit': return '#EF4444';
                            case 'Canteen': return '#F59E0B';
                            case 'Medical': return '#EC4899';
                            default: return '#10B981';
                        }
                      };

                      return (
                          <div 
                              key={poi.id} 
                              onClick={() => setSelectedPoi(poi)}
                              style={{
                                  position: 'absolute',
                                  left: `${left}%`,
                                  top: `${top}%`,
                                  transform: 'translate(-50%, -50%)',
                                  background: getColorForType(poi.type),
                                  color: 'white',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
                                  pointerEvents: 'auto',
                                  cursor: 'pointer',
                                  zIndex: 20,
                                  border: '1px solid rgba(255,255,255,0.2)'
                              }}
                          >
                              <i className={`fa-solid ${getIconForType(poi.type)}`}></i>
                              {poi.name}
                          </div>
                      );
                  })}
              </div>
          ) : (
              <Canvas camera={{ position: [0, 14, 22], fov: 45 }}>
                <color attach="background" args={['#070a13']} />
                
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 18, 10]} intensity={1.5} color="#3B82F6" />
                <pointLight position={[0, 4, 0]} intensity={2.5} color="#10B981" distance={25} />

                <Grid 
                    renderOrder={-1} 
                    position={[0, -2.05, 0]} 
                    infiniteGrid 
                    cellSize={1} 
                    cellThickness={0.5} 
                    sectionSize={5} 
                    sectionThickness={0.8} 
                    sectionColor="#1e293b" 
                    fadeDistance={45} 
                />
                
                <HologramStadium viewMode={viewMode} pois={pois} telemetryList={telemetryList} isEmergency={isEmergency} onSelectPoi={(poi) => setSelectedPoi(poi)} selectedPoi={selectedPoi} />
                
                <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                maxDistance={50} 
                minDistance={8} 
                maxPolarAngle={Math.PI / 2 - 0.05}
                />
              </Canvas>
          )}
      </div>

      {/* Futuristic Glassmorphic Sidebar */}
      {selectedPoi && (
          <div 
              style={{
                  width: '320px',
                  height: '100%',
                  background: 'rgba(10, 15, 30, 0.85)',
                  backdropFilter: 'blur(15px)',
                  borderLeft: '1px solid var(--glass-border)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  color: 'white',
                  zIndex: 30,
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  animation: 'slideIn 0.3s ease-out'
              }}
          >
              {/* Header */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <i className={`fa-solid ${getIconForType(selectedPoi.type)}`} style={{color: 'var(--accent-primary)', fontSize: '1.2rem'}}></i>
                      <h4 style={{margin: 0, fontSize: '1rem', fontWeight: 'bold'}}>{selectedPoi.name}</h4>
                  </div>
                  <button 
                      onClick={() => setSelectedPoi(null)}
                      style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem'}}
                  >
                      <i className="fa-solid fa-xmark"></i>
                  </button>
              </div>

              {/* Live Metric Content */}
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div>
                      <span style={{fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)'}}>Node Type</span>
                      <p style={{margin: '0.2rem 0', fontWeight: 'bold', fontSize: '0.9rem'}}>{selectedPoi.type}</p>
                  </div>

                  {/* Telemetry metrics display */}
                  <div style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem'}}>
                      <h5 style={{margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)'}}><i className="fa-solid fa-chart-bar"></i> Real-time Telemetry</h5>
                      {getMetricForPoi(selectedPoi) ? (
                          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                              {getMetricForPoi(selectedPoi)?.map((m, idx) => (
                                  <div key={idx}>
                                      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem'}}>
                                          <span>{m.metricType}</span>
                                          <strong style={{color: getStatusColor(m.value, m.metricType)}}>{m.value}{m.metricType === 'Density' ? '%' : m.metricType === 'WaitTime' ? ' mins' : '% left'}</strong>
                                      </div>
                                      <div style={{height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                                          <div style={{
                                              height: '100%', 
                                              width: `${typeof m.value === 'number' ? Math.min(100, m.value) : 100}%`,
                                              background: getStatusColor(m.value, m.metricType)
                                          }}></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p style={{fontSize: '0.85rem', fontStyle: 'italic', margin: 0, color: 'var(--text-secondary)'}}>Operating nominally. Sensor readings optimal.</p>
                      )}
                  </div>

                  {/* AI Recommended Playbook */}
                  <div style={{background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '1rem'}}>
                      <h5 style={{margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#60A5FA'}}><i className="fa-solid fa-robot"></i> Operational Playbook</h5>
                      <p style={{fontSize: '0.85rem', lineHeight: '1.4', margin: 0}}>
                          {selectedPoi.type === 'Entry' || selectedPoi.type === 'Exit' ? (
                              "Crowd flow is currently stable. In case density exceeds 70%, AI will trigger egress rerouting via west access lanes."
                          ) : selectedPoi.type === 'Canteen' ? (
                              "Inventory check shows supplies at peak levels. Digital boards display a 10% discount on Sector B canteen to balance crowds."
                          ) : selectedPoi.type === 'Medical' ? (
                              "First aid responder teams are fully staffed. Paramedic units configured for immediate dispatch via route A-2."
                          ) : (
                              "Facilities are clean and operational. Sanitation agent automated schedule: Next inspection in 14 minutes."
                          )}
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
