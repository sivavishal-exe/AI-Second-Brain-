import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { Cpu, RefreshCw, Layers, CheckCircle2, ChevronRight, Wand2, FileSpreadsheet, ListChecks } from 'lucide-react';

export default function ContextPanel() {
  const { 
    selectedNote, 
    tasks, 
    addTask, 
    toggleTaskStatus, 
    deleteTask, 
    getRelatedNotes, 
    getForgottenContext,
    notes,
    generateAiSynthesis,
    isAiStreaming,
    aiStreamResult
  } = useBrain();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [synthType, setSynthType] = useState('draft'); // 'draft' | 'tasks' | 'summary'
  const [selectedNodesForSynth, setSelectedNodesForSynth] = useState([]);
  
  if (!selectedNote) return null;

  const relatedNotes = getRelatedNotes();
  const forgottenNotes = getForgottenContext();
  
  // Get tasks for current note
  const currentNoteTasks = tasks.filter(t => t.nodeId === selectedNote.id);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    addTask(selectedNote.id, newTaskTitle, 'medium');
    setNewTaskTitle('');
  };

  const handleToggleNodeSelection = (id) => {
    setSelectedNodesForSynth(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const handleSynthesize = () => {
    // Include current note by default + selected check-boxed notes
    const ids = [selectedNote.id, ...selectedNodesForSynth];
    generateAiSynthesis(synthType, ids);
  };

  return (
    <div className="copilot-sidebar">
      {/* AI Header */}
      <div className="flex-row align-center gap-8" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Cpu size={16} color="#06b6d4" className="glow-cyan" />
        <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px' }}>AI CO-PILOT WORKBENCH</span>
      </div>

      {/* Segment 1: AI Action Tasks */}
      <div className="flex-col gap-8 glass-card" style={{ padding: '12px' }}>
        <div className="flex-row justify-between align-center">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ListChecks size={13} /> ACTIONABLE AUTO-TASKS
          </span>
          <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1px 6px', borderRadius: '10px' }}>
            {currentNoteTasks.filter(t => t.status === 'done').length}/{currentNoteTasks.length} Done
          </span>
        </div>

        <form onSubmit={handleAddTask} className="flex-row gap-8" style={{ marginTop: '4px' }}>
          <input 
            type="text" 
            placeholder="Add action item..." 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '11px',
              padding: '6px 8px',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </form>

        <div className="flex-col gap-4" style={{ marginTop: '8px', maxHeight: '120px', overflowY: 'auto' }}>
          {currentNoteTasks.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', padding: '4px 0' }}>
              No tasks extracted. Add tasks or write actionable points to trigger extraction.
            </div>
          ) : (
            currentNoteTasks.map(task => (
              <div 
                key={task.id} 
                className="flex-row align-center justify-between"
                style={{ 
                  background: 'rgba(255,255,255,0.01)', 
                  padding: '6px 8px', 
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}
              >
                <div className="flex-row align-center gap-8">
                  <input 
                    type="checkbox" 
                    checked={task.status === 'done'}
                    onChange={() => toggleTaskStatus(task.id)}
                    style={{ cursor: 'pointer', accentColor: '#10b981' }}
                  />
                  <span style={{ 
                    fontSize: '11px', 
                    color: task.status === 'done' ? '#64748b' : '#e2e8f0',
                    textDecoration: task.status === 'done' ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </span>
                </div>
                <span style={{ 
                  fontSize: '8px', 
                  background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                  color: task.priority === 'high' ? '#f87171' : '#94a3b8',
                  padding: '1px 4px',
                  borderRadius: '3px'
                }}>
                  {task.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Segment 2: Semantic Overlaps & Serendipity */}
      <div className="flex-col gap-8">
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={13} /> RELATED SEMANTIC OVERLAPS
        </span>
        <div className="flex-col gap-8">
          {relatedNotes.length === 0 ? (
            <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
              No strong relationships detected yet. Add overlapping words or tags.
            </div>
          ) : (
            relatedNotes.map(n => (
              <div 
                key={n.id} 
                className="glass-card flex-row align-center justify-between" 
                style={{ padding: '8px 12px', borderLeft: '3px solid #a855f7' }}
              >
                <div className="flex-col">
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>{n.title}</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Shared conceptual vectors</span>
                </div>
                <ChevronRight size={14} color="#64748b" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Forgotten Context (Serendipity) */}
      <div className="flex-col gap-8">
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#eab308', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={13} /> SERENDIPITY (FORGOTTEN GEMS)
        </span>
        <div className="flex-col gap-8">
          {forgottenNotes.map(n => (
            <div 
              key={n.id} 
              className="glass-card flex-col" 
              style={{ padding: '8px 12px', borderLeft: '3px solid #eab308' }}
            >
              <div className="flex-row justify-between align-center">
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>{n.title}</span>
                <span style={{ fontSize: '9px', color: '#eab308', fontWeight: 500 }}>Unopened in 15d</span>
              </div>
              <p style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {n.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Segment 3: Generative AI Concept Synthesizer */}
      <div className="flex-col gap-8 glass-card" style={{ padding: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wand2 size={13} /> CONCEPT SYNTHESIZER
        </span>
        
        <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 8px 0' }}>
          Select sibling concepts to synthesize into compiled project templates.
        </p>

        {/* Node Selectors */}
        <div className="flex-col gap-4" style={{ maxHeight: '100px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '6px' }}>
          {notes.filter(n => n.id !== selectedNote.id).map(n => (
            <label key={n.id} className="flex-row align-center gap-8" style={{ cursor: 'pointer', fontSize: '10px', color: '#94a3b8' }}>
              <input 
                type="checkbox" 
                checked={selectedNodesForSynth.includes(n.id)}
                onChange={() => handleToggleNodeSelection(n.id)}
                style={{ accentColor: '#06b6d4' }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
            </label>
          ))}
        </div>

        {/* Synthesis Options */}
        <div className="flex-row gap-8" style={{ marginTop: '8px' }}>
          {['draft', 'summary', 'tasks'].map(type => (
            <button
              key={type}
              onClick={() => setSynthType(type)}
              style={{
                flex: 1,
                background: synthType === type ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${synthType === type ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)'}`,
                color: synthType === type ? '#22d3ee' : '#94a3b8',
                padding: '4px',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={handleSynthesize}
          disabled={isAiStreaming}
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            color: '#000',
            border: 'none',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 700,
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyCenter: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Wand2 size={12} /> {isAiStreaming ? 'Synthesizing...' : 'Run Epistemic Synthesis'}
        </button>

        {/* Stream Result Display */}
        {(aiStreamResult || isAiStreaming) && (
          <div 
            className="ai-stream" 
            style={{ 
              marginTop: '12px', 
              background: 'rgba(0,0,0,0.4)', 
              padding: '10px', 
              borderRadius: '6px', 
              fontSize: '11px', 
              lineHeight: '1.4', 
              maxHeight: '180px', 
              overflowY: 'auto',
              border: '1px solid rgba(6, 182, 212, 0.15)',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap'
            }}
          >
            {aiStreamResult}
            {isAiStreaming && <span style={{ animation: 'float 0.8s infinite', marginLeft: '2px' }}>█</span>}
          </div>
        )}
      </div>
    </div>
  );
}
