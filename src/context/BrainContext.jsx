import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { usePod, useTable, useAgent } from '../utils/lemmaSdk';
import { generateGeminiContent } from '../utils/geminiClient';

const BrainContext = createContext();

// High-fidelity fallback templates if database is empty
const initialNotes = [
  {
    id: 'n1',
    title: 'Nova Brain Hackathon Pitch',
    content: 'Goal: Pitch Nova Brain as an Autonomous Epistemic Engine. Differentiators:\n1. Continual passive context insertion based on user cursor position.\n2. Spaced-Repetition sidebar to resurface older notes.\n3. Automatic task extraction via Gemini models.\nEnsure graph visuals are striking during the live demo!',
    type: 'note',
    tags: ['hackathon', 'pitch', 'strategy'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: 'n2',
    title: 'Google Gemini Integration Spec',
    content: 'Using Gemini 1.5 Flash for rapid entity extraction and graph auto-wiring.\nFor complex drafting tasks, fallback to Gemini 1.5 Pro.\nAPI calls will send current note content + neighboring node summaries to generate relevant contextual highlights in the sidebar.',
    type: 'note',
    tags: ['ai', 'api', 'gemini'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'n3',
    title: 'User Interview Feedback Logs',
    content: 'Summary of developer interviews regarding note-taking:\n- "I have 5,000 markdown files in Obsidian, but I never read them."\n- "Search only works if I remember the exact keyword I used months ago."\n- "I need my notes to turn into a list of checkboxes or Github issues directly, without manual copy-pasting."',
    type: 'file',
    tags: ['research', 'ux', 'feedback'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
  }
];

const initialEdges = [
  { id: 'e1', source: 'n1', target: 'n2', type: 'semantic', weight: 0.8 },
  { id: 'e2', source: 'n1', target: 'n3', type: 'reference', weight: 0.7 }
];

const initialTasks = [
  { id: 't1', nodeId: 'n1', title: 'Prepare the 2-minute slide deck', status: 'in-progress', priority: 'high', dueDate: new Date(Date.now() + 86400000).toISOString() },
  { id: 't2', nodeId: 'n1', title: 'Refine WebGL/Canvas force-directed animations', status: 'todo', priority: 'high', dueDate: new Date(Date.now() + 86400000).toISOString() }
];

export function BrainProvider({ children }) {
  const [notes, setNotes] = useState(initialNotes);
  const [edges, setEdges] = useState(initialEdges);
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedNoteId, setSelectedNoteId] = useState('n1');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [aiStreamResult, setAiStreamResult] = useState('');
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('aurabrain_theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('aurabrain_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Settings State
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [similarityThreshold, setSimilarityThreshold] = useState(parseFloat(localStorage.getItem('similarity_threshold')) || 0.65);
  const [forgottenDecayPeriod, setForgottenDecayPeriod] = useState(parseInt(localStorage.getItem('forgotten_decay_period')) || 15);
  const [isExtractingTasks, setIsExtractingTasks] = useState(false);
  
  // Lemma Integration
  const { pod } = usePod("aurabrain-epistemic-pod");
  const { runAgent, agentStatus, agentLogs } = useAgent(pod, "Auto-Wiring & Task Extractor Agent");
  
  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Storage and reminder helpers
  const getRemindersFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('aurabrain_reminders') || '{}');
    } catch {
      return {};
    }
  };

  const saveReminderToStorage = (noteId, reminder) => {
    try {
      const current = getRemindersFromStorage();
      if (reminder) {
        current[noteId] = reminder;
      } else {
        delete current[noteId];
      }
      localStorage.setItem('aurabrain_reminders', JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save reminder to localStorage', e);
    }
  };

  const mergeReminders = (notesList) => {
    const reminders = getRemindersFromStorage();
    return notesList.map(n => ({
      ...n,
      reminder: reminders[n.id] || null
    }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const playAlarmSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.30);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.30);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn("AudioContext failed to start", e);
    }
  };

  const dismissAlarm = (noteId) => {
    setActiveAlarms(prev => prev.filter(a => a.id !== noteId));
  };

  const snoozeAlarm = (noteId, minutes = 5) => {
    const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    dismissAlarm(noteId);
    updateNote(noteId, {
      reminder: {
        time: snoozeTime,
        active: true,
        triggered: false
      }
    });
  };

  // Alarm background checking hook
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const triggered = [];

      setNotes(prevNotes => {
        let changed = false;
        const nextNotes = prevNotes.map(note => {
          if (note.reminder && note.reminder.active && !note.reminder.triggered) {
            const reminderTime = new Date(note.reminder.time);
            if (reminderTime <= now) {
              triggered.push(note);
              changed = true;
              return {
                ...note,
                reminder: {
                  ...note.reminder,
                  triggered: true,
                  active: false
                }
              };
            }
          }
          return note;
        });

        if (changed) {
          const storageReminders = getRemindersFromStorage();
          triggered.forEach(note => {
            storageReminders[note.id] = {
              time: note.reminder.time,
              triggered: true,
              active: false
            };
          });
          localStorage.setItem('aurabrain_reminders', JSON.stringify(storageReminders));
          return nextNotes;
        }
        return prevNotes;
      });

      if (triggered.length > 0) {
        triggered.forEach(note => {
          playAlarmSound();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Nova Brain Reminder: ${note.title}`, {
              body: note.content.substring(0, 120) + '...',
              icon: '/favicon.svg'
            });
          }
        });
        setActiveAlarms(prev => [...prev, ...triggered]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // 1. Fetch data from Supabase on mount
  useEffect(() => {
    setNotes(prev => mergeReminders(prev));
    if (!supabase) return;

    const fetchAllData = async () => {
      try {
        // Fetch Notes
        const { data: dbNotes, error: notesError } = await supabase
          .from('nodes')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (!notesError && dbNotes && dbNotes.length > 0) {
          const formattedNotes = dbNotes.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            type: n.type,
            tags: n.tags || [],
            createdAt: n.created_at,
            updatedAt: n.updated_at
          }));
          setNotes(formattedNotes);
          setSelectedNoteId(formattedNotes[0].id);
        }

        // Fetch Edges
        const { data: dbEdges, error: edgesError } = await supabase
          .from('edges')
          .select('*');
        
        if (!edgesError && dbEdges) {
          setEdges(dbEdges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.relation_type,
            weight: e.weight
          })));
        }

        // Fetch Tasks
        const { data: dbTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*');
        
        if (!tasksError && dbTasks) {
          setTasks(dbTasks.map(t => ({
            id: t.id,
            nodeId: t.node_id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date
          })));
        }
      } catch (err) {
        console.warn("Supabase fetch failed. Falling back to local storage.", err);
      }
    };

    fetchAllData();
  }, []);

  // Auto-wiring system: triggers when notes are added or updated
  const autoWireRelationships = async (noteId, content) => {
    if (!content) return;
    const lowerContent = content.toLowerCase();
    const newEdges = [];

    notes.forEach(otherNote => {
      if (otherNote.id === noteId) return;
      
      const otherTitleWords = otherNote.title.toLowerCase().split(/\s+/);
      const otherTagWords = otherNote.tags;
      
      let matchedWord = null;
      const targetWords = [...otherTitleWords, ...otherTagWords];
      for (const word of targetWords) {
        if (word.length > 3 && lowerContent.includes(word)) {
          matchedWord = word;
          break;
        }
      }

      if (matchedWord) {
        const edgeExists = edges.some(e => 
          (e.source === noteId && e.target === otherNote.id) ||
          (e.source === otherNote.id && e.target === noteId)
        );

        if (!edgeExists) {
          newEdges.push({
            source: noteId,
            target: otherNote.id,
            relation_type: 'semantic',
            weight: parseFloat((0.65 + Math.random() * 0.25).toFixed(2))
          });
        }
      }
    });

    if (newEdges.length > 0) {
      if (supabase) {
        const { data, error } = await supabase.from('edges').insert(newEdges).select();
        if (!error && data) {
          setEdges(prev => [...prev, ...data.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.relation_type,
            weight: e.weight
          }))]);
        }
      } else {
        setEdges(prev => [...prev, ...newEdges.map((e, idx) => ({ id: `e-local-${Date.now()}-${idx}`, ...e, type: e.relation_type }))]);
      }
    }
  };

  const createNote = async (title, content, type = 'note', tags = []) => {
    const defaultTitle = title || 'Untitled Concept';
    const defaultTags = tags.length > 0 ? tags : ['inbox'];

    // Run Lemma SDK Background agent for auto-wiring & extraction
    runAgent({ title: defaultTitle, content, action: 'create' });

    if (supabase) {
      const { data, error } = await supabase
        .from('nodes')
        .insert([{ title: defaultTitle, content: content || '', type, tags: defaultTags }])
        .select();

      if (!error && data && data.length > 0) {
        const created = data[0];
        const formatted = {
          id: created.id,
          title: created.title,
          content: created.content,
          type: created.type,
          tags: created.tags,
          createdAt: created.created_at,
          updatedAt: created.updated_at
        };
        setNotes(prev => [formatted, ...prev]);
        setSelectedNoteId(formatted.id);
        setTimeout(() => autoWireRelationships(formatted.id, content), 200);
        return formatted.id;
      }
    }

    // Local fallback
    const newId = `n-${Date.now()}`;
    const newNote = {
      id: newId,
      title: defaultTitle,
      content: content || '',
      type,
      tags: defaultTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newId);
    setTimeout(() => autoWireRelationships(newId, content), 200);
    return newId;
  };

  const updateNote = async (id, fields) => {
    // Optimistic UI updates
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, ...fields, updatedAt: new Date().toISOString() };
        if (fields.reminder !== undefined) {
          saveReminderToStorage(id, fields.reminder);
        }
        return updated;
      }
      return n;
    }));

    if (fields.content || fields.title) {
      runAgent({ noteId: id, ...fields, action: 'update' });
    }

    if (supabase) {
      // Don't send fields if they are client specific (like id map formatting)
      const dbFields = {};
      if (fields.title !== undefined) dbFields.title = fields.title;
      if (fields.content !== undefined) dbFields.content = fields.content;
      if (fields.tags !== undefined) dbFields.tags = fields.tags;

      await supabase.from('nodes').update(dbFields).eq('id', id);
    }
    
    if (fields.content) {
      setTimeout(() => autoWireRelationships(id, fields.content), 200);
    }
  };

  const deleteNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setTasks(prev => prev.filter(t => t.nodeId !== id));

    if (selectedNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
    }

    if (supabase) {
      await supabase.from('nodes').delete().eq('id', id);
    }
  };

  // Task Management
  const addTask = async (nodeId, title, priority = 'medium') => {
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ node_id: nodeId, title, priority, status: 'todo' }])
        .select();

      if (!error && data && data.length > 0) {
        const t = data[0];
        setTasks(prev => [...prev, {
          id: t.id,
          nodeId: t.node_id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date
        }]);
        return;
      }
    }

    // Local fallback
    const newTask = {
      id: `t-${Date.now()}`,
      nodeId,
      title,
      status: 'todo',
      priority,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTaskStatus = async (id) => {
    let nextStatus = 'todo';
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        nextStatus = t.status === 'done' ? 'todo' : 'done';
        return { ...t, status: nextStatus };
      }
      return t;
    }));

    if (supabase) {
      await supabase.from('tasks').update({ status: nextStatus }).eq('id', id);
    }
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (supabase) {
      await supabase.from('tasks').delete().eq('id', id);
    }
  };

  const getSemanticMatches = (query, limit = 4) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return notes
      .map(note => {
        let score = 0;
        const words = lowerQuery.split(/\s+/);
        words.forEach(w => {
          if (note.title.toLowerCase().includes(w)) score += 0.5;
          if (note.content.toLowerCase().includes(w)) score += 0.2;
          note.tags.forEach(t => {
            if (t.toLowerCase().includes(w)) score += 0.3;
          });
        });
        return { note, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.note)
      .slice(0, limit);
  };

  const getRelatedNotes = () => {
    if (!selectedNote) return [];
    return notes
      .map(otherNote => {
        if (otherNote.id === selectedNoteId) return { note: otherNote, score: 0 };
        
        let score = 0;
        const sharedTags = selectedNote.tags.filter(t => otherNote.tags.includes(t));
        score += sharedTags.length * 0.35;

        const cleanWords = selectedNote.content
          .toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .split(/\s+/)
          .filter(w => w.length > 4);
          
        const otherContent = otherNote.content.toLowerCase();
        const matches = cleanWords.filter(w => otherContent.includes(w));
        score += Math.min(matches.length * 0.05, 0.6);

        return { note: otherNote, score };
      })
      .filter(item => item.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .map(item => item.note)
      .slice(0, 3);
  };

  const getForgottenContext = () => {
    const decayMs = forgottenDecayPeriod * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - decayMs);
    
    // Fallback: If no notes match the strict decay cutoff, return the 2 oldest ones so the UI is never blank
    const olderNotes = notes.filter(n => n.id !== selectedNoteId && new Date(n.createdAt) < cutoffDate);
    if (olderNotes.length > 0) {
      return olderNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(0, 2);
    }
    
    return notes
      .filter(n => n.id !== selectedNoteId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(0, 2);
  };

  const generateAiSynthesis = async (type, nodeIds) => {
    setIsAiStreaming(true);
    setAiStreamResult('');
    
    const selectedList = notes.filter(n => nodeIds.includes(n.id));
    const titleString = selectedList.map(n => n.title).join(', ');
    
    let text = '';
    if (geminiApiKey) {
      let prompt = '';
      let systemInstruction = 'You are AuraBrain AI, an autonomous epistemic co-pilot engine. Return professional, clear markdown. Be direct and avoid generic disclaimers.';
      
      if (type === 'draft') {
        prompt = `Generate a comprehensive markdown project proposal draft spec based on these notes:\n\n` +
          selectedList.map(n => `### Title: ${n.title}\nContent:\n${n.content}`).join('\n\n') +
          `\n\nStructure the draft with:
- Overview
- Unified Value Proposition
- Implementation Roadmap (including key architectural points)
- Immediate next steps.`;
      } else if (type === 'tasks') {
        prompt = `Analyze the following notes and extract a list of actionable to-do tasks (checkboxes):\n\n` +
          selectedList.map(n => `### Title: ${n.title}\nContent:\n${n.content}`).join('\n\n') +
          `\n\nFormat the response strictly as a list of checkboxes:
[ ] Task name (High Priority)
[ ] Task name (Medium Priority)
[ ] Task name (Low Priority)
Do not write any introductory or concluding text.`;
      } else {
        prompt = `Synthesize a cognitive insight summary based on these notes. Highlight connections, potential bottlenecks, and recommendation:\n\n` +
          selectedList.map(n => `### Title: ${n.title}\nContent:\n${n.content}`).join('\n\n') +
          `\n\nKeep the output concise (around 4-5 sentences).`;
      }

      try {
        text = await generateGeminiContent(geminiApiKey, prompt, systemInstruction);
      } catch (err) {
        text = `Error from Gemini: ${err.message}\n\nPlease check your API key in settings or try again.`;
      }
    } else {
      // Mocked fallbacks if no API Key is provided
      if (type === 'draft') {
        text = `## AI Generated Draft Spec: Project Synergy\n\n### Overview\nBased on your selected inputs: [${titleString}], Nova Brain has compiled a comprehensive project proposal drafts. This draft integrates user research and architectural goals.\n\n### 1. Unified Value Proposition\nBy feeding contextually relevant notes directly into the workflow, Nova Brain solves the "information graveyard" problem, boosting developer retention by 42%.\n\n### 2. Implementation Roadmap\n- Deploy local vector embeddings using Tensorflow.js/WASM.\n- Map real-time cursor updates to database queries.\n- Connect client-side Canvas visualizer with D3 forces.\n\n### 3. Immediate Action items\n- Finalize the presentation deck.\n- Deploy mock client to Vercel for judge preview.`;
      } else if (type === 'tasks') {
        text = `### Extracted AI Tasks:\n\n[ ] Design glowing glassmorphism sidebar (High Priority)\n[ ] Setup Gemini 1.5 Flash endpoint mapping (Medium Priority)\n[ ] Benchmark pgvector cosine similarity indices (Medium Priority)\n[ ] Clean up older user feedback items (Low Priority)`;
      } else {
        text = `### Cognitive Insight Summary:\n\nConnecting [${titleString}] reveals a direct correlation between vector search latency and layout responsiveness. Recommendation: Run embeddings creation in a dedicated Web Worker to maintain a smooth 60fps on the canvas graph visualizer.`;
      }
    }

    let i = 0;
    const interval = setInterval(() => {
      setAiStreamResult(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsAiStreaming(false);
      }
    }, 10);
  };

  const extractTasksForNote = async (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.content) return;
    setIsExtractingTasks(true);

    try {
      let text = '';
      if (geminiApiKey) {
        const prompt = `Analyze the following note and extract 3-5 specific, actionable to-do checklist tasks.
Note Title: ${note.title}
Note Content:
${note.content}

Format the response strictly as a list of bullet points or task checkboxes, with high, medium, or low priority specified in parentheses, e.g.:
- Task description (High Priority)
- Another task (Medium Priority)
Do not include any conversational intro or outro text.`;
        
        text = await generateGeminiContent(geminiApiKey, prompt, 'Extract task list.');
      } else {
        // Fallback mock tasks
        text = `- Design glowing glassmorphism sidebar (High Priority)\n- Setup Gemini 1.5 Flash endpoint mapping (Medium Priority)\n- Benchmark pgvector cosine similarity indices (Medium Priority)\n- Clean up older user feedback items (Low Priority)`;
      }

      // Parse text into tasks
      const lines = text.split('\n');
      for (const line of lines) {
        const cleanLine = line.replace(/^[-*\d.\s\[\]x]*\s*/i, '').trim();
        if (!cleanLine) continue;

        let priority = 'medium';
        if (/high/i.test(cleanLine)) {
          priority = 'high';
        } else if (/low/i.test(cleanLine)) {
          priority = 'low';
        }

        const taskTitle = cleanLine.replace(/\((high|medium|low)\s+priority\)/i, '').trim();
        if (taskTitle) {
          await addTask(noteId, taskTitle, priority);
        }
      }
    } catch (err) {
      console.error('Error auto-extracting tasks:', err);
    } finally {
      setIsExtractingTasks(false);
    }
  };

  const saveSettings = (apiKey, threshold, decay) => {
    setGeminiApiKey(apiKey);
    setSimilarityThreshold(threshold);
    setForgottenDecayPeriod(decay);
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('similarity_threshold', threshold);
    localStorage.setItem('forgotten_decay_period', decay);
  };

  return (
    <BrainContext.Provider value={{
      notes,
      edges,
      tasks,
      selectedNoteId,
      setSelectedNoteId,
      selectedNote,
      searchQuery,
      setSearchQuery,
      activeTab,
      setActiveTab,
      isAiStreaming,
      aiStreamResult,
      createNote,
      updateNote,
      deleteNote,
      addTask,
      toggleTaskStatus,
      deleteTask,
      getSemanticMatches,
      getRelatedNotes,
      getForgottenContext,
      generateAiSynthesis,
      agentStatus,
      agentLogs,
      geminiApiKey,
      similarityThreshold,
      forgottenDecayPeriod,
      isExtractingTasks,
      extractTasksForNote,
      saveSettings,
      activeAlarms,
      dismissAlarm,
      snoozeAlarm,
      requestNotificationPermission,
      theme,
      toggleTheme
    }}>
      {children}
    </BrainContext.Provider>
  );
}

export function useBrain() {
  return useContext(BrainContext);
}
