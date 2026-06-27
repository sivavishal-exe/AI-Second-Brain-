import React, { useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { Search, Plus, BookOpen, Link2, FileText, Database, PlusCircle } from 'lucide-react';

export default function KnowledgeBase() {
  const { notes, selectedNoteId, setSelectedNoteId, createNote, searchQuery, setSearchQuery } = useBrain();
  const [filterType, setFilterType] = useState('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickUrl, setQuickUrl] = useState('');
  const [showIngest, setShowIngest] = useState(false);

  // Filter notes based on type and search query
  const filteredNotes = notes.filter(note => {
    const matchesType = filterType === 'all' || note.type === filterType;
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleCreateNote = () => {
    const newId = createNote('New AI Memo', 'Draft your ideas here. Mention terms like "Gemini" or "Feedback" to trigger automatic graph wiring.', 'note', ['inbox']);
    setShowIngest(false);
  };

  const handleIngestUrl = (e) => {
    e.preventDefault();
    if (!quickUrl) return;
    const title = quickUrl.replace('https://', '').replace('http://', '').split('/')[0];
    createNote(quickUrl, `Automatically scraped content from bookmark. Tagged under #web.\nSource: ${quickUrl}`, 'url', ['web', 'curated']);
    setQuickUrl('');
    setShowIngest(false);
  };

  const handleIngestFileMock = (fileName) => {
    createNote(fileName, `Mock imported text file content for ${fileName}.\nExtracted paragraphs were analyzed for semantic indexing and vector-aligned.`, 'file', ['local-upload']);
    setShowIngest(false);
  };

  return (
    <div className="kb-sidebar">
      {/* Brand Header */}
      <div className="flex-row align-center justify-between" style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="flex-row align-center gap-8">
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #a855f7, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>Ω</div>
          <span style={{ fontWeight: 700, fontSize: '18px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Nova Brain AI
          </span>
        </div>
        <span style={{ fontSize: '10px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', padding: '2px 6px', borderRadius: '12px', fontWeight: 600 }}>
          v1.0.0
        </span>
      </div>

      {/* Database Statistics */}
      <div className="flex-row justify-between" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '11px', color: '#64748b' }}>
        <div className="flex-col align-center">
          <Database size={12} color="#a855f7" />
          <span style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>{notes.length}</span>
          <span>Nodes</span>
        </div>
        <div className="flex-col align-center">
          <Link2 size={12} color="#06b6d4" />
          <span style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>
            {notes.filter(n => n.type === 'url').length}
          </span>
          <span>Links</span>
        </div>
        <div className="flex-col align-center">
          <FileText size={12} color="#10b981" />
          <span style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>
            {notes.filter(n => n.type === 'file').length}
          </span>
          <span>Files</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-row gap-8">
        <button 
          onClick={handleCreateNote}
          className="flex-row align-center justify-center gap-8"
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1.0)'}
        >
          <Plus size={16} /> New Memo
        </button>
        <button 
          onClick={() => setShowIngest(!showIngest)}
          className="flex-row align-center justify-center"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            width: '40px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.2s',
          }}
        >
          <PlusCircle size={18} />
        </button>
      </div>

      {/* Ingestion Dock Drawer */}
      {showIngest && (
        <div className="flex-col gap-8 glass-card" style={{ padding: '12px', border: '1px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#06b6d4' }}>INGESTION DOCK</span>
          
          <form onSubmit={handleIngestUrl} className="flex-col gap-8">
            <input 
              type="url" 
              placeholder="Paste bookmark url..." 
              value={quickUrl}
              onChange={e => setQuickUrl(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '6px 8px',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <button 
              type="submit" 
              style={{ 
                background: '#06b6d4', 
                border: 'none', 
                padding: '6px', 
                borderRadius: '6px', 
                color: '#000', 
                fontWeight: 600, 
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Fetch & Vectorize URL
            </button>
          </form>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
          
          <span style={{ fontSize: '11px', color: '#64748b' }}>Simulate Local File Import:</span>
          <div className="flex-row gap-8">
            <button 
              onClick={() => handleIngestFileMock('obsidian_migration.md')}
              style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#fff', fontSize: '10px', cursor: 'pointer' }}
            >
              obsidian.md
            </button>
            <button 
              onClick={() => handleIngestFileMock('customer_log.json')}
              style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px', borderRadius: '6px', color: '#fff', fontSize: '10px', cursor: 'pointer' }}
            >
              customer.json
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative" style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Semantic semantic or search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '8px 12px 8px 32px',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748b' }} />
      </div>

      {/* Filters */}
      <div className="flex-row gap-8" style={{ flexWrap: 'wrap' }}>
        {['all', 'note', 'url', 'file'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              background: filterType === type ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${filterType === type ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)'}`,
              color: filterType === type ? '#c084fc' : '#94a3b8',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              textTransform: 'capitalize',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="flex-col gap-8" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {filteredNotes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '24px' }}>
            No matching nodes found.
          </div>
        ) : (
          filteredNotes.map(note => {
            const isSelected = note.id === selectedNoteId;
            let icon = <BookOpen size={13} color="#a855f7" />;
            if (note.type === 'url') icon = <Link2 size={13} color="#eab308" />;
            if (note.type === 'file') icon = <FileText size={13} color="#06b6d4" />;

            return (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                style={{
                  background: isSelected ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  border: `1px solid ${isSelected ? 'var(--border-active)' : 'rgba(255, 255, 255, 0.03)'}`,
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className={isSelected ? 'glow-purple' : 'glass-card'}
              >
                {/* Left accent glowing bar */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: '3px', 
                    background: note.type === 'url' ? '#eab308' : note.type === 'file' ? '#06b6d4' : '#a855f7' 
                  }} 
                />

                <div className="flex-row justify-between align-center" style={{ marginBottom: '4px' }}>
                  <div className="flex-row align-center gap-8">
                    {icon}
                    <strong style={{ fontSize: '13px', color: isSelected ? '#fff' : '#e2e8f0', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      {note.title}
                    </strong>
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '32px', margin: 0 }}>
                  {note.content}
                </p>

                <div className="flex-row justify-between align-center" style={{ marginTop: '8px' }}>
                  <div className="flex-row gap-8">
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} style={{ fontSize: '9px', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '1px 4px', borderRadius: '4px' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>
                    {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
