/**
 * Mock Lemma SDK implementation for Nova Brain OS workspace
 * Extends local operations with human-agent collaboration hooks
 */

import React from 'react';

export class LemmaClient {
  constructor(config = {}) {
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || 'http://localhost:8000';
    this.listeners = new Set();
  }

  // Mimic real-time streaming updates from agent workspace
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach(cb => cb(event));
  }
}

// 25+ React Hooks simulation for Agent/Pod/Table management
export function usePod(podId) {
  return {
    pod: { id: podId, name: "Nova Brain Agent Pod", status: "active" },
    isLoading: false,
    error: null,
  };
}

export function useTable(pod, tableName, initialRows = []) {
  const [rows, setRows] = React.useState(initialRows);

  const insertRow = async (newRow) => {
    const row = { id: Math.random().toString(36).substr(2, 9), ...newRow, createdAt: new Date().toISOString() };
    setRows(prev => [row, ...prev]);
    return row;
  };

  const updateRow = async (rowId, updates) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, ...updates } : r));
  };

  const deleteRow = async (rowId) => {
    setRows(prev => prev.filter(r => r.id !== rowId));
  };

  return { rows, insertRow, updateRow, deleteRow };
}

export function useAgent(pod, agentName) {
  const [agentStatus, setAgentStatus] = React.useState('idle'); // 'idle' | 'running' | 'completed' | 'failed'
  const [agentLogs, setAgentLogs] = React.useState([]);

  const runAgent = async (taskInput) => {
    setAgentStatus('running');
    setAgentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting Agent ${agentName}...`]);
    
    // Simulate runtime steps in agent box sandbox
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAgentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Analyzing context nodes...`]);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAgentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Successfully completed agent actions.`]);
    setAgentStatus('completed');
  };

  return { runAgent, agentStatus, agentLogs };
}
