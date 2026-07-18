import { useState, useEffect } from 'react';
import { CommanderDashboard } from './components/CommanderDashboard';
import { StadiumTimeMachine } from './components/StadiumTimeMachine';
import { DecisionSimulator } from './components/DecisionSimulator';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AdvancedModules } from './components/AdvancedModules';
import { FanCopilot } from './components/FanCopilot';
import { Settings } from './components/Settings';
import { ScenarioStudio } from './components/ScenarioStudio';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { IncidentTimeline } from './components/IncidentTimeline';
import { liveTelemetry } from './data/TelemetryGenerator';

function App() {
  const [activeTab, setActiveTab] = useState<'commander' | 'timeMachine' | 'simulator' | 'executive' | 'advanced' | 'fan' | 'settings' | 'timeline' | 'scenario' | 'architecture'>('executive');
  const [isSosActive, setIsSosActive] = useState(false);

  useEffect(() => {
    // Sync telemetry generator emergency status
    liveTelemetry.setIsEmergency(isSosActive);

    if (isSosActive) {
      document.body.classList.add('sos-active');
      // In an emergency, force view to Commander Dashboard to see alerts
      setActiveTab('commander');
    } else {
      document.body.classList.remove('sos-active');
    }
  }, [isSosActive]);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
          <div className="logo">
              <i className="fa-solid fa-brain"></i>
              <span>ArenaMind AI V3</span>
          </div>
          
          <div className="nav-section-title">COMMAND CENTER</div>
          <ul className="nav-links">
              <li className={activeTab === 'executive' ? 'active' : ''} onClick={() => setActiveTab('executive')}>
                  <i className="fa-solid fa-chart-line"></i> Executive Dashboard
              </li>
              <li className={activeTab === 'commander' ? 'active' : ''} onClick={() => setActiveTab('commander')}>
                  <i className="fa-solid fa-shield-halved"></i> AI Commander
              </li>
              <li className={activeTab === 'timeline' ? 'active' : ''} onClick={() => setActiveTab('timeline')}>
                  <i className="fa-solid fa-timeline"></i> Incident Timeline
              </li>
              <li className={activeTab === 'scenario' ? 'active' : ''} onClick={() => setActiveTab('scenario')}>
                  <i className="fa-solid fa-clapperboard"></i> Scenario Studio
              </li>
              <li className={activeTab === 'architecture' ? 'active' : ''} onClick={() => setActiveTab('architecture')}>
                  <i className="fa-solid fa-diagram-project"></i> AI Architecture
              </li>
              <li className={activeTab === 'advanced' ? 'active' : ''} onClick={() => setActiveTab('advanced')}>
                  <i className="fa-solid fa-microchip"></i> Swarm Modules (Emotion)
              </li>
              <li className={activeTab === 'timeMachine' ? 'active' : ''} onClick={() => setActiveTab('timeMachine')}>
                  <i className="fa-solid fa-clock-rotate-left"></i> Stadium Time Machine
              </li>
              <li className={activeTab === 'simulator' ? 'active' : ''} onClick={() => setActiveTab('simulator')}>
                  <i className="fa-solid fa-code-branch"></i> Decision Simulator
              </li>
          </ul>

          <div className="nav-section-title">FAN EXPERIENCE</div>
          <ul className="nav-links">
              <li className={activeTab === 'fan' ? 'active' : ''} onClick={() => setActiveTab('fan')}>
                  <i className="fa-solid fa-headset"></i> AI Fan Copilot
              </li>
          </ul>

          <div className="nav-section-title">SYSTEM</div>
          <ul className="nav-links">
              <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                  <i className="fa-solid fa-gear"></i> Ecosystem Config
              </li>
          </ul>

          {/* Emergency SOS Toggle */}
          <div style={{marginTop: 'auto', padding: '1rem'}}>
              <button 
                onClick={() => setIsSosActive(!isSosActive)}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                  background: isSosActive ? 'var(--danger)' : 'transparent',
                  color: isSosActive ? 'white' : 'var(--danger)',
                  border: '2px solid var(--danger)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isSosActive ? <><i className="fa-solid fa-triangle-exclamation fa-beat"></i> EVACUATION ACTIVE</> : <><i className="fa-solid fa-triangle-exclamation"></i> TRIGGER EMERGENCY AI</>}
              </button>
          </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content" style={{ padding: '2rem' }}>
          {activeTab === 'executive' && <ExecutiveDashboard />}
          {activeTab === 'commander' && <CommanderDashboard />}
          {activeTab === 'timeline' && <IncidentTimeline />}
          {activeTab === 'scenario' && <ScenarioStudio />}
          {activeTab === 'architecture' && <ArchitectureViewer />}
          {activeTab === 'advanced' && <AdvancedModules />}
          {activeTab === 'timeMachine' && <StadiumTimeMachine />}
          {activeTab === 'simulator' && <DecisionSimulator />}
          {activeTab === 'fan' && <FanCopilot isSosActive={isSosActive} />}
          {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
