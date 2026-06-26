import React, { useState, useEffect } from 'react';
import { useBrain } from '../context/BrainContext';
import { Save, Trash2, Calendar, FileText, Globe, BookOpen } from 'lucide-react';

export default function NoteEditor() {
  const { selectedNote, updateNote, deleteNote } = useBrain();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Sync state with selected note
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTagsInput(selectedNote.tags.join(', '));
    }
  }, [selectedNote]);

  if (!selectedNote) {
    return (
      <div className="flex-col align-center justify-center" style={{ flex: 1, padding: '40px', textAlign: 'center', height: '100%', color: '#64748b' }}>
        <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h3>No Concept Selected</h3>
        <p style={{ fontSize: '13px', maxWidth: '300px' }}>Select a node on the canvas or pick a memo from the sidebar to view details and begin editing.</p>
      </div>
    );
  }

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    updateNote(selectedNote.id, { content: val });
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    updateNote(selectedNote.id, { title: val });
  };

  const handleTagsChange = (e) => {
    const val = e.target.value;
    setTagsInput(val);
    const splitTags = val.split(',').map(t => t.trim()).filter(t => t.length > 0);
    updateNote(selectedNote.id, { tags: splitTags });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${selectedNote.title}"?`)) {
      deleteNote(selectedNote.id);
    }
  };

  let typeBadge = (
    <span style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', padding: '3px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <BookOpen size={11} /> Memo
    </span>
  );
  if (selectedNote.type === 'url') {
    typeBadge = (
      <span style={{ fontSize: '11px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#facc15', padding: '3px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Globe size={11} /> Bookmark
      </span>
    );
  }
  if (selectedNote.type === 'file') {
    typeBadge = (
      <span style={{ fontSize: '11px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#22d3ee', padding: '3px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <FileText size={11} /> File Ingest
      </span>
    );
  }

  return (
    <div className="flex-col glass-panel" style={{ flex: 1.2, height: '100%', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13, 17, 33, 0.5)' }}>
      {/* Editor Header */}
      <div className="flex-row justify-between align-center" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex-row align-center gap-8">
          {typeBadge}
          <div style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={11} />
            <span>Updated: {new Date(selectedNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          style={{
            background: 'transparent',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '6px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Concept Title..."
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '20px',
          fontWeight: 700,
          outline: 'none',
          marginBottom: '8px'
        }}
      />

      {/* Tags Input */}
      <div className="flex-row align-center gap-8" style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>Tags (comma-separated):</span>
        <input
          type="text"
          value={tagsInput}
          onChange={handleTagsChange}
          placeholder="e.g., development, postgres, embeddings"
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#fff',
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '4px',
            outline: 'none'
          }}
        />
      </div>

      {/* Main Content Area */}
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing or paste text logs..."
        style={{
          flex: 1,
          width: '100%',
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          color: '#e2e8f0',
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.6',
          padding: '16px',
          outline: 'none',
          resize: 'none'
        }}
      />
      
      {/* Footer Info */}
      <div className="flex-row justify-between align-center" style={{ marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
        <span>Characters: {content.length} | Words: {content.split(/\s+/).filter(Boolean).length}</span>
        <span style={{ color: '#10b981' }}>⚡ Vector Synced Local-First</span>
      </div>
    </div>
  );
}
