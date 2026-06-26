import React, { useEffect, useRef, useState } from 'react';
import { useBrain } from '../context/BrainContext';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Zap } from 'lucide-react';

export default function GraphView() {
  const { notes, edges, selectedNoteId, setSelectedNoteId } = useBrain();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Physics positions
  const nodesRef = useRef([]);
  const dragStart = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Sync React context nodes with physics nodes
  useEffect(() => {
    const existingNodes = nodesRef.current;
    
    nodesRef.current = notes.map(note => {
      const existing = existingNodes.find(n => n.id === note.id);
      if (existing) {
        return {
          ...existing,
          title: note.title,
          type: note.type,
        };
      } else {
        const width = canvasRef.current ? canvasRef.current.width : 600;
        const height = canvasRef.current ? canvasRef.current.height : 400;
        return {
          id: note.id,
          title: note.title,
          type: note.type,
          x: width / 2 + (Math.random() - 0.5) * 150,
          y: height / 2 + (Math.random() - 0.5) * 150,
          vx: 0,
          vy: 0,
          radius: note.id === selectedNoteId ? 22 : 16,
        };
      }
    });
  }, [notes, selectedNoteId]);

  // Physics and Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const updatePhysics = () => {
      const pNodes = nodesRef.current;
      const kRepulsion = 400;
      const kAttraction = 0.04;
      const damping = 0.85;
      const centerGravity = 0.015;
      const idealLength = 120;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const cx = width / 2;
      const cy = height / 2;

      // 1. Repulsion force
      for (let i = 0; i < pNodes.length; i++) {
        const n1 = pNodes[i];
        for (let j = i + 1; j < pNodes.length; j++) {
          const n2 = pNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);
          
          if (dist < 400) {
            const force = kRepulsion / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            if (n1 !== draggedNode) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (n2 !== draggedNode) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // 2. Attraction force
      edges.forEach(edge => {
        const n1 = pNodes.find(n => n.id === edge.source);
        const n2 = pNodes.find(n => n.id === edge.target);
        if (!n1 || !n2) return;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        
        const force = (dist - idealLength) * kAttraction * edge.weight;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (n1 !== draggedNode) {
          n1.vx += fx;
          n1.vy += fy;
        }
        if (n2 !== draggedNode) {
          n2.vx -= fx;
          n2.vy -= fy;
        }
      });

      // 3. Update physics bounds
      pNodes.forEach(node => {
        if (node === draggedNode) return;

        node.vx += (cx - node.x) * centerGravity;
        node.vy += (cy - node.y) * centerGravity;

        node.x += node.vx;
        node.y += node.vy;

        node.vx *= damping;
        node.vy *= damping;

        const margin = 30;
        if (node.x < margin) { node.x = margin; node.vx = 0; }
        if (node.x > width - margin) { node.x = width - margin; node.vx = 0; }
        if (node.y < margin) { node.y = margin; node.vy = 0; }
        if (node.y > height - margin) { node.y = height - margin; node.vy = 0; }
      });
    };

    const drawGraph = () => {
      // Clear with ratio safety
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      
      // Scaling for high pixel density (Retina correction)
      const dpr = window.devicePixelRatio || 1;
      ctx.scale(dpr, dpr);
      
      // Apply translation & zoom
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw Edges
      edges.forEach(edge => {
        const sourceNode = nodesRef.current.find(n => n.id === edge.source);
        const targetNode = nodesRef.current.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const isRelatedToSelected = sourceNode.id === selectedNoteId || targetNode.id === selectedNoteId;

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        
        if (isRelatedToSelected) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();

        if (isRelatedToSelected) {
          const time = Date.now() * 0.002;
          const ratio = (time % 1);
          const px = sourceNode.x + (targetNode.x - sourceNode.x) * ratio;
          const py = sourceNode.y + (targetNode.y - sourceNode.y) * ratio;

          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#06b6d4';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Nodes
      nodesRef.current.forEach(node => {
        const isSelected = node.id === selectedNoteId;
        const isHovered = hoveredNode && node.id === hoveredNode.id;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 20 : 15, 0, Math.PI * 2);
        
        let primaryColor = '#a855f7';
        if (node.type === 'url') primaryColor = '#eab308';
        else if (node.type === 'file') primaryColor = '#06b6d4';
        else if (node.type === 'task') primaryColor = '#10b981';

        ctx.shadowBlur = isSelected ? 20 : (isHovered ? 12 : 5);
        ctx.shadowColor = primaryColor;
        ctx.fillStyle = isSelected ? primaryColor : 'rgba(13, 17, 33, 0.9)';
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffffff' : primaryColor;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = isSelected ? '#000000' : '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let label = 'N';
        if (node.type === 'url') label = '🔗';
        else if (node.type === 'file') label = '📄';
        else if (node.type === 'task') label = '✓';
        
        ctx.fillText(label, node.x, node.y);

        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.font = isSelected ? 'bold 11px system-ui' : '10px system-ui';
        ctx.fillText(
          node.title.length > 15 ? node.title.substring(0, 15) + '...' : node.title,
          node.x,
          node.y + 28
        );
        
        ctx.restore();
      });

      ctx.restore();
    };

    const runLoop = () => {
      updatePhysics();
      drawGraph();
      animationFrameId = requestAnimationFrame(runLoop);
    };

    runLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [edges, selectedNoteId, hoveredNode, zoom, pan, draggedNode]);

  // Handle high resolution canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Set visible dimensions matching container size
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height - 45}px`;

      // Set actual pixel dimensions based on DPI
      canvas.width = rect.width * dpr;
      canvas.height = (rect.height - 45) * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  // Touch & Mouse Coordinate helpers for responsive targets
  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Support mobile touch coordinates
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const mouseX = (clientX - rect.left - pan.x) / zoom;
    const mouseY = (clientY - rect.top - pan.y) / zoom;
    return { x: mouseX, y: mouseY };
  };

  const handleStart = (e) => {
    const { x, y } = getCoordinates(e);

    const clickedNode = nodesRef.current.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 25;
    });

    if (clickedNode) {
      setDraggedNode(clickedNode);
      setSelectedNoteId(clickedNode.id);
      dragStart.current = { x: x - clickedNode.x, y: y - clickedNode.y };
    } else {
      isPanning.current = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      panStart.current = { x: clientX - pan.x, y: clientY - pan.y };
    }
  };

  const handleMove = (e) => {
    const { x, y } = getCoordinates(e);

    if (draggedNode) {
      draggedNode.x = x - dragStart.current.x;
      draggedNode.y = y - dragStart.current.y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
    } else if (isPanning.current) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setPan({
        x: clientX - panStart.current.x,
        y: clientY - panStart.current.y
      });
    } else {
      const hovered = nodesRef.current.find(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= 22;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleEnd = () => {
    setDraggedNode(null);
    isPanning.current = false;
  };

  const handleZoom = (factor) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev * factor)));
  };

  return (
    <div 
      ref={containerRef} 
      className={`glass-panel flex-col ${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'relative w-full h-full'}`}
      style={{ 
        height: isFullscreen ? '100vh' : '100%', 
        width: isFullscreen ? '100vw' : '100%', 
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div 
        className="flex-row justify-between align-center" 
        style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 12, 22, 0.6)',
          zIndex: 10
        }}
      >
        <div className="flex-row align-center gap-8">
          <Zap size={16} color="#a855f7" className="glow-purple" />
          <span style={{ fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px' }}>
            EPISTEMIC KNOWLEDGE MAP
          </span>
        </div>
        
        <div className="flex-row gap-8">
          <button 
            onClick={() => handleZoom(1.15)}
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <ZoomIn size={14} />
          </button>
          <button 
            onClick={() => handleZoom(0.85)}
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
          >
            <ZoomOut size={14} />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#fff', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{ cursor: draggedNode ? 'grabbing' : (hoveredNode ? 'pointer' : 'grab'), display: 'block', width: '100%', height: 'calc(100% - 45px)' }}
      />
      
      {hoveredNode && (
        <div 
          className="tooltip"
          style={{ 
            bottom: '16px', 
            left: '16px',
            borderLeft: `4px solid ${
              hoveredNode.type === 'url' ? '#eab308' : hoveredNode.type === 'file' ? '#06b6d4' : hoveredNode.type === 'task' ? '#10b981' : '#a855f7'
            }`
          }}
        >
          <strong>{hoveredNode.title}</strong>
        </div>
      )}
    </div>
  );
}
