import React, { useState, useEffect } from 'react';
import { BrainProvider, useBrain } from './context/BrainContext';
import KnowledgeBase from './components/KnowledgeBase';
import GraphView from './components/GraphView';
import NoteEditor from './components/NoteEditor';
import ContextPanel from './components/ContextPanel';
import { Cpu, Database, BarChart3, Settings, ShieldAlert, Sparkles, Network, List, FileText } from 'lucide-react';

function DashboardAssembly() {
  const { activeTab, setActiveTab, notes, edges } = useBrain();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [mobileTab, setMobileTab] = useState('graph'); // 'list' | 'graph' | 'editor' | 'copilot'

  // Sync screen width resize updates
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      {/* Top Header/Navigation */}
      <div 
        className="flex-row justify-between align-center" 
        style={{ 
          height: '52px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
          background: 'rgba(10, 12, 22, 0.8)', 
          padding: '0 16px',
          backdropFilter: 'blur(10px)',
          flexShrink: 0
        }}
      >
        <div className="flex-row align-center gap-8">
          <Sparkles size={16} color="#a855f7" className="glow-purple" />
          <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            NovaBrain OS
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex-row gap-4" style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button
            onClick={() => setActiveTab('notes')}
            style={{
              background: activeTab === 'notes' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              border: 'none',
              color: activeTab === 'notes' ? '#c084fc' : '#94a3b8',
              padding: isMobile ? '4px 8px' : '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <Network size={12} /> {isMobile ? 'Graph' : 'Epistemic Graph'}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              background: activeTab === 'analytics' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              border: 'none',
              color: activeTab === 'analytics' ? '#c084fc' : '#94a3b8',
              padding: isMobile ? '4px 8px' : '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <BarChart3 size={12} /> {isMobile ? 'Metrics' : 'Cognitive Analytics'}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              background: activeTab === 'settings' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              border: 'none',
              color: activeTab === 'settings' ? '#c084fc' : '#94a3b8',
              padding: isMobile ? '4px 8px' : '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <Settings size={12} /> {isMobile ? 'Engine' : 'Engine Settings'}
          </button>
        </div>

        {/* Sync Indicator - hidden on small mobile to save space */}
        {!isMobile && (
          <div className="flex-row align-center gap-8" style={{ fontSize: '11px', color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
            <span>Local Engine Active</span>
          </div>
        )}
      </div>

      {/* Main Assembly Layout */}
      {activeTab === 'notes' && (
        isMobile ? (
          /* Responsive Mobile Layout containing bottom navigation bar switcher */
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* View Port: render selected focus panel */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: mobileTab === 'graph' ? '8px' : '0' }}>
              {mobileTab === 'list' && <KnowledgeBase />}
              {mobileTab === 'graph' && <GraphView />}
              {mobileTab === 'editor' && <NoteEditor />}
              {mobileTab === 'copilot' && <ContextPanel />}
            </div>

            {/* Bottom Navigation Toolbar */}
            <div 
              style={{ 
                height: '56px', 
                borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
                background: 'rgba(10, 12, 22, 0.95)', 
                backdropFilter: 'blur(10px)',
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-around', 
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <button 
                onClick={() => setMobileTab('list')}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: mobileTab === 'list' ? '#c084fc' : '#64748b',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600
                }}
              >
                <List size={16} />
                <span>Library</span>
              </button>
              <button 
                onClick={() => setMobileTab('graph')}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: mobileTab === 'graph' ? '#c084fc' : '#64748b',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600
                }}
              >
                <Network size={16} />
                <span>Graph</span>
              </button>
              <button 
                onClick={() => setMobileTab('editor')}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: mobileTab === 'editor' ? '#c084fc' : '#64748b',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600
                }}
              >
                <FileText size={16} />
                <span>Editor</span>
              </button>
              <button 
                onClick={() => setMobileTab('copilot')}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: mobileTab === 'copilot' ? '#c084fc' : '#64748b',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600
                }}
              >
                <Cpu size={16} />
                <span>Co-pilot</span>
              </button>
            </div>
          </div>
        ) : (
          /* Standard PC Desktop Workspace Layout */
          <div className="workspace-layout">
            <KnowledgeBase />
            
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden', padding: '16px', gap: '16px' }}>
              <div style={{ flex: 1, minHeight: '300px' }}>
                <GraphView />
              </div>
              <div style={{ flex: 1.1, minHeight: '250px' }}>
                <NoteEditor />
              </div>
            </div>
            
            <ContextPanel />
          </div>
        )
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: isMobile ? '16px' : '24px', overflowY: 'auto', gap: isMobile ? '16px' : '24px' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 600 }}>COGNITIVE GROWTH INDEX & MAP</h2>
          
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
            {/* Box 1 */}
            <div className="glass-panel" style={{ flex: 1.5, padding: '20px', minWidth: '100%' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#a855f7' }}>CONCEPT DRIFT ANALYSIS (TEMPORAL MAP)</h3>
              <div style={{ height: '220px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <svg width="100%" height="100%" style={{ padding: '10px' }}>
                  <path 
                    d="M 40,180 Q 120,50 220,120 T 400,40" 
                    fill="none" 
                    stroke="url(#purpleGrad)" 
                    strokeWidth="4" 
                  />
                  <path 
                    d="M 40,180 Q 120,50 220,120 T 400,40" 
                    fill="none" 
                    stroke="rgba(168, 85, 247, 0.2)" 
                    strokeWidth="10" 
                  />
                  <circle cx="40" cy="180" r="5" fill="#a855f7" />
                  <circle cx="140" cy="85" r="5" fill="#06b6d4" />
                  <circle cx="240" cy="115" r="5" fill="#eab308" />
                  <circle cx="370" cy="45" r="7" fill="#10b981" className="glow-purple" />
                  
                  <text x="50" y="185" fill="#64748b" fontSize="9">Jan</text>
                  <text x="150" y="80" fill="#64748b" fontSize="9">Mar</text>
                  <text x="250" y="130" fill="#64748b" fontSize="9">May</text>
                  <text x="310" y="30" fill="#10b981" fontSize="10" fontWeight="bold">Current: Graph RAG</text>

                  <defs>
                    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Box 2 */}
            <div className="glass-panel" style={{ flex: 1, padding: '20px', minWidth: '100%' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#06b6d4' }}>SEMANTIC DENSITY CLUSTERS</h3>
              <div className="flex-col gap-12" style={{ marginTop: '12px' }}>
                <div>
                  <div className="flex-row justify-between" style={{ fontSize: '11px', marginBottom: '4px' }}>
                    <span>AI & Machine Learning</span>
                    <span style={{ color: '#06b6d4', fontWeight: 600 }}>45%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#06b6d4', width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex-row justify-between" style={{ fontSize: '11px', marginBottom: '4px' }}>
                    <span>Product Pitch & Strategy</span>
                    <span style={{ color: '#a855f7', fontWeight: 600 }}>30%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#a855f7', width: '30%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex-row justify-between" style={{ fontSize: '11px', marginBottom: '4px' }}>
                    <span>Infrastructure</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>15%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#10b981', width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Database connections table */}
          <div className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#10b981' }}>COMPUTED DATABASE CO-ORDINATES</h3>
            <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b' }}>
                  <th style={{ padding: '6px' }}>Concept Name</th>
                  <th style={{ padding: '6px' }}>Type</th>
                  <th style={{ padding: '6px' }}>Active Links</th>
                  <th style={{ padding: '6px' }}>Similarity Score</th>
                  <th style={{ padding: '6px' }}>Decay Status</th>
                </tr>
              </thead>
              <tbody>
                {notes.map(n => {
                  const linkCount = edges.filter(e => e.source === n.id || e.target === n.id).length;
                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '8px 6px', fontWeight: 500 }}>{n.title}</td>
                      <td style={{ padding: '8px 6px', textTransform: 'capitalize', color: '#64748b' }}>{n.type}</td>
                      <td style={{ padding: '8px 6px', color: '#06b6d4', fontWeight: 600 }}>{linkCount} links</td>
                      <td style={{ padding: '8px 6px', fontFamily: 'monospace', color: '#a855f7' }}>
                        {(0.75 + Math.random() * 0.2).toFixed(4)}
                      </td>
                      <td style={{ padding: '8px 6px' }}>
                        <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1px 4px', borderRadius: '4px' }}>
                          Retained
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: isMobile ? '16px' : '24px', overflowY: 'auto', gap: isMobile ? '16px' : '24px', maxWidth: '800px' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 600 }}>NovaBrain Engine Settings</h2>
          
          <div className="glass-panel flex-col gap-16" style={{ padding: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#a855f7' }}>GOOGLE GEMINI API INTEGRATION</span>
            
            <div className="flex-col gap-8">
              <label style={{ fontSize: '11px', color: '#94a3b8' }}>Gemini API Token Key:</label>
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '10px',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  width: '100%'
                }}
              />
              <span style={{ fontSize: '10px', color: '#64748b' }}>
                Provide your API key to activate production summaries. Fallback simulations are running locally using a high-fidelity template parser.
              </span>
            </div>
          </div>

          <div className="glass-panel flex-col gap-16" style={{ padding: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#06b6d4' }}>INDEXING PARAMETERS</span>
            
            <div className="flex-row gap-16" style={{ flexWrap: 'wrap' }}>
              <div className="flex-col gap-8" style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Similarity Threshold (Cosine):</label>
                <input type="range" min="0" max="1" step="0.05" defaultValue="0.65" style={{ accentColor: '#06b6d4' }} />
              </div>
              <div className="flex-col gap-8" style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Forgotten Context Decay Period:</label>
                <input type="number" defaultValue="15" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#fff', fontSize: '12px' }} />
              </div>
            </div>
          </div>

          <div className="flex-row gap-8">
            <button 
              style={{
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => alert('Settings Saved (Mocked)')}
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrainProvider>
      {/* Glow Ambient Grid Overlay */}
      <div className="grid-bg" />
      <DashboardAssembly />
    </BrainProvider>
  );
}
