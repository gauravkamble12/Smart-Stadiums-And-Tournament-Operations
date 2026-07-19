import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import type { Message } from '../types';
import DOMPurify from 'dompurify';

export const FanCopilot: React.FC<{ isSosActive: boolean }> = ({ isSosActive }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial', sender: 'ai', text: "Hello! I'm your ArenaMind Copilot. I can reason about live crowd flows, translate in 100+ languages, or guide you via voice. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState('English');
    const [agent, setAgent] = useState('General');
    const [loading, setLoading] = useState(false);
    const [isCoolingDown, setIsCoolingDown] = useState(false);

    const handleSend = async () => {
        if (!input.trim() && !input.includes("[IMAGE UPLOADED")) return;
        if (isCoolingDown) return;

        setIsCoolingDown(true);
        setTimeout(() => setIsCoolingDown(false), 3000);

        const userMsg = DOMPurify.sanitize(input);
        const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: userMsg };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        // Build history string for memory
        const history = messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

        const aiResponse = await aiService.generateFanResponse(userMsg, language, agent, isSosActive, history);
        const cleanAiResponse = DOMPurify.sanitize(aiResponse);
        
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: cleanAiResponse
        }]);
        setLoading(false);
    };

    const simulateVisionUpload = async () => {
        const fakeImageMsg: Message = { id: Date.now().toString(), sender: 'user', text: "[IMAGE UPLOADED: gate_b_crowd.jpg] - Analyze congestion here." };
        setMessages(prev => [...prev, fakeImageMsg]);
    };

    return (
        <div className="fan-copilot" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <header className="dashboard-header" style={{marginBottom: '1rem'}}>
                <div>
                    <h2><i className="fa-solid fa-mobile-screen"></i> AI Fan Copilot</h2>
                    <p className="text-sm">Multilingual, Multi-Agent, Multimodal Mobile App Simulation</p>
                </div>
                <div style={{display: 'inline-block', background: 'rgba(236, 72, 153, 0.2)', color: '#EC4899', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #EC4899'}}>
                    <strong>JUDGE MODE:</strong> Features AI Memory (context persistence across messages) and Multimodal Vision Demo.
                </div>
                <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
                    <select value={agent} onChange={e => setAgent(e.target.value)} className="lang-dropdown" style={{padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white'}}>
                        <option value="General">General Copilot</option>
                        <option value="Food">Food Agent</option>
                        <option value="Transport">Transport Agent</option>
                        <option value="Accessibility">Accessibility Agent</option>
                    </select>
                </div>
            </header>

            <div className="chat-container glass-panel" style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                <div className="chat-history" aria-live="polite" style={{flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    {messages.map((m, idx) => (
                        <div key={idx} style={{
                            display: 'flex', gap: '1rem', 
                            flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%'
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                background: m.sender === 'ai' ? 'var(--accent-gradient)' : 'var(--bg-secondary)'
                            }}>
                                <i className={m.sender === 'ai' ? "fa-solid fa-brain" : "fa-solid fa-user"}></i>
                            </div>
                            <div style={{
                                padding: '1rem', borderRadius: '16px',
                                background: m.sender === 'ai' ? 'rgba(255,255,255,0.05)' : 'var(--accent-gradient)',
                                borderTopLeftRadius: m.sender === 'ai' ? '4px' : '16px',
                                borderTopRightRadius: m.sender === 'user' ? '4px' : '16px',
                            }}>
                                {m.text.includes("[IMAGE UPLOADED:") ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <img 
                                            src="/gate_b_crowd.jpg" 
                                            alt="Uploaded Gate Congestion" 
                                            style={{ 
                                                width: '100%', 
                                                maxWidth: '260px', 
                                                borderRadius: '8px', 
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                            }} 
                                        />
                                        <span>{m.text.replace(/\[IMAGE UPLOADED:[^\]]+\]/, '').trim()}</span>
                                    </div>
                                ) : (
                                    m.text
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{display: 'flex', gap: '1rem', alignSelf: 'flex-start'}}>
                            <div style={{width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-gradient)'}}><i className="fa-solid fa-brain"></i></div>
                            <div style={{padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', borderTopLeftRadius: '4px'}}>
                                <i className="fa-solid fa-ellipsis fa-bounce"></i> Syncing with Swarm...
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="chat-input-area" style={{padding: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <button 
                        onClick={simulateVisionUpload} 
                        className="secondary-btn" 
                        title="Simulate Multimodal Image Upload"
                        aria-label="Upload Image"
                        style={{padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', color: 'white'}}
                    >
                        <i className="fa-solid fa-camera"></i>
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything or upload a photo..."
                        aria-label="Ask anything or upload a photo"
                        style={{flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white'}}
                    />
                    <select value={language} onChange={e => setLanguage(e.target.value)} className="lang-dropdown" aria-label="Select Language" style={{padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white'}}>
                        <option value="English">EN</option>
                        <option value="Spanish">ES</option>
                        <option value="French">FR</option>
                        <option value="Arabic">AR</option>
                    </select>
                    <button onClick={handleSend} disabled={isCoolingDown} className="primary-btn" aria-label="Send Message">
                        {isCoolingDown ? <i className="fa-solid fa-hourglass fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    </button>
                </div>
            </div>
        </div>
    );
};
