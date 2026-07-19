import React, { useState, useEffect } from 'react';
import { liveTelemetry } from '../data/TelemetryGenerator';

interface MatchFixture {
    id: string;
    teamA: string;
    teamB: string;
    time: string;
    stadium: string;
    referee: string;
    status: 'Scheduled' | 'Live' | 'Completed';
    pitchCondition: 'Excellent' | 'Good' | 'Requires Attention';
    gateAccess: 'Nominal' | 'Busy' | 'Congested';
}

const INITIAL_TEAMS = ['Argentina', 'Brazil', 'France', 'England', 'Germany', 'Spain', 'Italy', 'Portugal'];
const INITIAL_STADIUMS = ['Estadio Azteca', 'MetLife Stadium', 'Wembley Stadium', 'Lusail Stadium'];
const REFEREES = ['Pierluigi Collina', 'Howard Webb', 'Stephanie Frappart', 'Szymon Marciniak', 'Nestor Pitana'];

export const TournamentConsole: React.FC = () => {
    const [fixtures, setFixtures] = useState<MatchFixture[]>(() => {
        const saved = localStorage.getItem('arenamind_fixtures');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved fixtures:", e);
            }
        }
        return [
            { id: 'm-101', teamA: 'Argentina', teamB: 'Brazil', time: 'Today 20:00', stadium: 'Estadio Azteca', referee: 'Szymon Marciniak', status: 'Live', pitchCondition: 'Excellent', gateAccess: 'Busy' },
            { id: 'm-102', teamA: 'France', teamB: 'England', time: 'Tomorrow 18:00', stadium: 'Wembley Stadium', referee: 'Stephanie Frappart', status: 'Scheduled', pitchCondition: 'Excellent', gateAccess: 'Nominal' },
            { id: 'm-103', teamA: 'Germany', teamB: 'Spain', time: 'Tomorrow 21:00', stadium: 'Lusail Stadium', referee: 'Howard Webb', status: 'Scheduled', pitchCondition: 'Good', gateAccess: 'Nominal' },
            { id: 'm-104', teamA: 'Italy', teamB: 'Portugal', time: 'Jul 21, 19:30', stadium: 'MetLife Stadium', referee: 'Unassigned', status: 'Scheduled', pitchCondition: 'Excellent', gateAccess: 'Nominal' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('arenamind_fixtures', JSON.stringify(fixtures));
    }, [fixtures]);

    const [newTeamA, setNewTeamA] = useState(INITIAL_TEAMS[0]);
    const [newTeamB, setNewTeamB] = useState(INITIAL_TEAMS[1]);
    const [newStadium, setNewStadium] = useState(INITIAL_STADIUMS[0]);
    const [newTime, setNewTime] = useState('Jul 22, 20:00');

    const handleCreateFixture = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTeamA === newTeamB) {
            alert("A team cannot play against itself.");
            return;
        }

        const newFixture: MatchFixture = {
            id: `m-${Math.floor(100 + Math.random() * 900)}`,
            teamA: newTeamA,
            teamB: newTeamB,
            time: newTime,
            stadium: newStadium,
            referee: 'Unassigned',
            status: 'Scheduled',
            pitchCondition: 'Excellent',
            gateAccess: 'Nominal'
        };

        setFixtures(prev => [...prev, newFixture]);
    };

    const handleDispatchReferee = (matchId: string) => {
        const randomRef = REFEREES[Math.floor(Math.random() * REFEREES.length)];
        setFixtures(prev => prev.map(m => m.id === matchId ? { ...m, referee: randomRef } : m));
    };

    const handleToggleStatus = (matchId: string, currentStatus: 'Scheduled' | 'Live' | 'Completed') => {
        let nextStatus: 'Scheduled' | 'Live' | 'Completed' = 'Scheduled';
        if (currentStatus === 'Scheduled') {
            nextStatus = 'Live';
            // Trigger emergency/busy telemetry when match goes Live
            liveTelemetry.setSensorValue('g_north', 'Density', 78);
            liveTelemetry.setSensorValue('g_south', 'Density', 85);
            liveTelemetry.setSensorValue('f_burger_1', 'WaitTime', 15);
        } else if (currentStatus === 'Live') {
            nextStatus = 'Completed';
            // Egress telemetry after match conclude
            liveTelemetry.setSensorValue('g_south', 'Density', 95);
            liveTelemetry.setSensorValue('t_metro_south', 'WaitTime', 25);
        } else if (currentStatus === 'Completed') {
            nextStatus = 'Scheduled';
            // Telemetry returns to nominal
            liveTelemetry.setIsEmergency(false);
        }

        setFixtures(prev => prev.map(m => m.id === matchId ? { 
            ...m, 
            status: nextStatus,
            gateAccess: nextStatus === 'Live' ? 'Busy' : nextStatus === 'Completed' ? 'Congested' : 'Nominal'
        } : m));
    };

    const handlePitchConditionChange = (matchId: string, cond: 'Excellent' | 'Good' | 'Requires Attention') => {
        setFixtures(prev => prev.map(m => m.id === matchId ? { ...m, pitchCondition: cond } : m));
    };

    return (
        <div className="tournament-console" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header className="dashboard-header" style={{ marginBottom: '0rem' }}>
                <div>
                    <h2><i className="fa-solid fa-trophy text-warning"></i> Tournament Operations Center</h2>
                    <p className="text-sm">Manage match fixtures, referee dispatches, pitch diagnostics, and bracket progression.</p>
                </div>
            </header>

            {/* Fixtures and Creation Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                
                {/* Live Fixtures List */}
                <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        <i className="fa-solid fa-calendar-days text-accent"></i> Match Operations Roster
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '450px' }}>
                        {fixtures.map(match => (
                            <div key={match.id} style={{
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '10px',
                                padding: '1.2rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderLeft: `4px solid ${match.status === 'Live' ? 'var(--danger)' : match.status === 'Completed' ? 'var(--success)' : 'var(--accent-primary)'}`
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{match.time} | ID: {match.id}</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        {match.teamA} <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>vs</span> {match.teamB}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <span><i className="fa-solid fa-location-dot"></i> {match.stadium}</span>
                                        <span><i className="fa-solid fa-user-tie"></i> Ref: <strong style={{ color: match.referee === 'Unassigned' ? 'var(--warning)' : 'white' }}>{match.referee}</strong></span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
                                    {/* Badges */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{
                                            background: match.status === 'Live' ? 'rgba(239,68,68,0.2)' : match.status === 'Completed' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                                            color: match.status === 'Live' ? 'var(--danger)' : match.status === 'Completed' ? 'var(--success)' : 'var(--text-secondary)',
                                            border: `1px solid ${match.status === 'Live' ? 'var(--danger)' : match.status === 'Completed' ? 'var(--success)' : 'var(--glass-border)'}`,
                                            padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                                        }}>{match.status}</span>

                                        <select 
                                            value={match.pitchCondition}
                                            onChange={(e) => handlePitchConditionChange(match.id, e.target.value as any)}
                                            style={{
                                                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.75rem', borderRadius: '4px', padding: '1px 4px', cursor: 'pointer'
                                            }}
                                        >
                                            <option value="Excellent">Pitch: Excellent</option>
                                            <option value="Good">Pitch: Good</option>
                                            <option value="Requires Attention">Pitch: Check</option>
                                        </select>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {match.referee === 'Unassigned' && (
                                            <button 
                                                onClick={() => handleDispatchReferee(match.id)}
                                                className="secondary-btn" 
                                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', background: 'transparent', border: '1px solid var(--warning)', color: 'var(--warning)', cursor: 'pointer' }}
                                            >
                                                <i className="fa-solid fa-user-plus"></i> Assign Ref
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleToggleStatus(match.id, match.status)}
                                            className="primary-btn" 
                                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            {match.status === 'Scheduled' ? 'Kick Off' : match.status === 'Live' ? 'Conclude' : 'Reset'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create Fixture Panel */}
                <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        <i className="fa-solid fa-circle-plus text-success"></i> Schedule Match
                    </h3>

                    <form onSubmit={handleCreateFixture} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Team A (Home)</label>
                            <select value={newTeamA} onChange={e => setNewTeamA(e.target.value)} style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px' }}>
                                {INITIAL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Team B (Away)</label>
                            <select value={newTeamB} onChange={e => setNewTeamB(e.target.value)} style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px' }}>
                                {INITIAL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Stadium Location</label>
                            <select value={newStadium} onChange={e => setNewStadium(e.target.value)} style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px' }}>
                                {INITIAL_STADIUMS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kick-off Time</label>
                            <input 
                                type="text" 
                                value={newTime} 
                                onChange={e => setNewTime(e.target.value)}
                                style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px' }}
                            />
                        </div>

                        <button type="submit" className="primary-btn" style={{ padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>
                            <i className="fa-solid fa-calendar-plus"></i> Add to Roster
                        </button>
                    </form>
                </div>
            </div>

            {/* Tournament Knockout Bracket */}
            <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <i className="fa-solid fa-sitemap text-warning"></i> Knockout Bracket Progression
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '2rem 0', background: 'rgba(5, 8, 16, 0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    
                    {/* Quarterfinals */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', marginBottom: '-1rem' }}>QUARTERFINALS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', width: '140px' }}>
                            <div style={{ fontWeight: 'bold' }}>Argentina <span style={{ float: 'right', color: 'var(--success)' }}>2</span></div>
                            <div style={{ opacity: 0.5 }}>Ecuador <span style={{ float: 'right' }}>1</span></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', width: '140px' }}>
                            <div style={{ fontWeight: 'bold' }}>France <span style={{ float: 'right', color: 'var(--success)' }}>3</span></div>
                            <div style={{ opacity: 0.5 }}>Portugal <span style={{ float: 'right' }}>0</span></div>
                        </div>
                    </div>

                    {/* Connectors */}
                    <div style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }}><i className="fa-solid fa-chevron-right"></i></div>

                    {/* Semifinals */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5.5rem' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', marginBottom: '-1rem' }}>SEMIFINALS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', borderLeft: '3px solid var(--accent-primary)', width: '140px' }}>
                            <div style={{ fontWeight: 'bold' }}>Argentina</div>
                            <div style={{ fontWeight: 'bold' }}>France</div>
                        </div>
                    </div>

                    {/* Connectors */}
                    <div style={{ color: 'var(--warning)', fontSize: '2rem' }}><i className="fa-solid fa-trophy fa-bounce"></i></div>

                    {/* Finals */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5.5rem' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', marginBottom: '-1rem' }}>CHAMPIONSHIP FINALS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid var(--warning)', padding: '0.8rem 1.2rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', width: '160px', textAlign: 'center', boxShadow: '0 0 15px rgba(245,158,11,0.2)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--warning)', letterSpacing: '1px', fontWeight: 'bold' }}>GRAND FINALS</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.3rem' }}>TBD</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
