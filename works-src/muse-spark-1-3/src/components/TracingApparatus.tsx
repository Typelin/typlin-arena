import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../audio/soundEngine';

export type ApparatusMode = 'drafting' | 'friction' | 'resonance';

interface NodePoint {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  pinned: boolean;
  baseX: number;
  baseY: number;
  layer: 'human' | 'construct';
  id: number;
}

interface SpringLink {
  nodeA: NodePoint;
  nodeB: NodePoint;
  targetLength: number;
  stiffness: number;
  stress: number; // calculated realtime
}

interface StrokePoint {
  x: number;
  y: number;
  alpha: number;
  age: number;
}

interface TracingApparatusProps {
  mode: ApparatusMode;
  onModeChange: (mode: ApparatusMode) => void;
  chapterProgress: number; // 0 to 1 from scroll/narrative
  isReducedMotion: boolean;
  onStats?: (s: { tensionScore: number; inkEnergy: number }) => void;
}

export const TracingApparatus: React.FC<TracingApparatusProps> = ({
  mode,
  onModeChange,
  chapterProgress,
  isReducedMotion,
  onStats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Physics state stored in refs to avoid React re-render lag during 60FPS animation
  const nodesRef = useRef<NodePoint[]>([]);
  const springsRef = useRef<SpringLink[]>([]);
  const userStrokesRef = useRef<StrokePoint[][]>([]);
  const activeStrokeRef = useRef<StrokePoint[]>([]);
  const draggingNodeRef = useRef<NodePoint | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; vx: number; vy: number; isDown: boolean }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    isDown: false,
  });
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const onStatsRef = useRef(onStats);
  useEffect(() => { onStatsRef.current = onStats; }, [onStats]);
  // Narrative phase mirrored into a ref so scroll updates never restart the rAF loop.
  const chapterRef = useRef(chapterProgress);
  chapterRef.current = chapterProgress;

  const [interactiveStats, setInteractiveStats] = useState({
    tensionScore: 0,
    activeNodes: 0,
    totalInkEnergy: 0,
  });

  // Initialize structural lattice
  const initApparatus = useCallback((width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.28;

    const newNodes: NodePoint[] = [];
    const newSprings: SpringLink[] = [];

    // Outer polygon (Human Layer: intuitive ring)
    const countOuter = 8;
    for (let i = 0; i < countOuter; i++) {
      const angle = (i / countOuter) * Math.PI * 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      newNodes.push({
        id: i,
        x,
        y,
        oldX: x,
        oldY: y,
        pinned: false,
        baseX: x,
        baseY: y,
        layer: 'human',
      });
    }

    // Inner polygon (Construct Layer: structural counter-balance)
    const countInner = 6;
    const innerRadius = radius * 0.48;
    for (let i = 0; i < countInner; i++) {
      const angle = (i / countInner) * Math.PI * 2 + Math.PI / 6;
      const x = cx + Math.cos(angle) * innerRadius;
      const y = cy + Math.sin(angle) * innerRadius;
      newNodes.push({
        id: countOuter + i,
        x,
        y,
        oldX: x,
        oldY: y,
        pinned: false,
        baseX: x,
        baseY: y,
        layer: 'construct',
      });
    }

    // Central anchor nucleus
    const centerNode: NodePoint = {
      id: countOuter + countInner,
      x: cx,
      y: cy,
      oldX: cx,
      oldY: cy,
      pinned: false,
      baseX: cx,
      baseY: cy,
      layer: 'construct',
    };
    newNodes.push(centerNode);

    // Build springs
    // 1. Outer perimeter springs
    for (let i = 0; i < countOuter; i++) {
      const next = (i + 1) % countOuter;
      const dist = Math.hypot(newNodes[i].x - newNodes[next].x, newNodes[i].y - newNodes[next].y);
      newSprings.push({
        nodeA: newNodes[i],
        nodeB: newNodes[next],
        targetLength: dist,
        stiffness: 0.08,
        stress: 0,
      });
    }

    // 2. Inner perimeter springs
    for (let i = 0; i < countInner; i++) {
      const next = countOuter + ((i + 1) % countInner);
      const curr = countOuter + i;
      const dist = Math.hypot(newNodes[curr].x - newNodes[next].x, newNodes[curr].y - newNodes[next].y);
      newSprings.push({
        nodeA: newNodes[curr],
        nodeB: newNodes[next],
        targetLength: dist,
        stiffness: 0.14,
        stress: 0,
      });
    }

    // 3. Tensegrity cross-bracing (Human to Construct)
    for (let i = 0; i < countOuter; i++) {
      const innerTarget = countOuter + (i % countInner);
      const dist = Math.hypot(newNodes[i].x - newNodes[innerTarget].x, newNodes[i].y - newNodes[innerTarget].y);
      newSprings.push({
        nodeA: newNodes[i],
        nodeB: newNodes[innerTarget],
        targetLength: dist,
        stiffness: 0.05,
        stress: 0,
      });
    }

    // 4. Center radials
    for (let i = 0; i < countInner; i++) {
      const curr = countOuter + i;
      const dist = Math.hypot(newNodes[curr].x - centerNode.x, newNodes[curr].y - centerNode.y);
      newSprings.push({
        nodeA: newNodes[curr],
        nodeB: centerNode,
        targetLength: dist,
        stiffness: 0.12,
        stress: 0,
      });
    }

    nodesRef.current = newNodes;
    springsRef.current = newSprings;
  }, []);

  // Responsive canvas resize handling with DPI ratio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      initApparatus(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initApparatus]);

  // Verlet integration & Animation loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      tick++;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Mode parameters
      let damping = 0.94;
      let springMultiplier = 1.0;
      let returnHomeForce = 0.003;

      if (mode === 'drafting') {
        damping = 0.96;
        springMultiplier = 0.6;
        returnHomeForce = 0.0015;
      } else if (mode === 'friction') {
        damping = 0.88;
        springMultiplier = 1.6;
        returnHomeForce = 0.008;
      } else if (mode === 'resonance') {
        damping = 0.92;
        springMultiplier = 1.2;
        returnHomeForce = 0.005;
      }

      if (isReducedMotion) {
        damping = 0.7;
        returnHomeForce = 0.05;
      }

      // 1. Verlet Physics step
      const nodes = nodesRef.current;
      const springs = springsRef.current;

      nodes.forEach((node) => {
        if (node.pinned) return;

        const vx = (node.x - node.oldX) * damping;
        const vy = (node.y - node.oldY) * damping;

        node.oldX = node.x;
        node.oldY = node.y;

        // Return to home base equilibrium
        const hx = (node.baseX - node.x) * returnHomeForce;
        const hy = (node.baseY - node.y) * returnHomeForce;

        // Influence of chapter narrative phase (read via ref: no loop restart on scroll)
        const chapterOffset = Math.sin(chapterRef.current * Math.PI * 2 + node.id) * 8;

        node.x += vx + hx;
        node.y += vy + hy + chapterOffset * 0.05;

        // Gentle ambient breathing
        if (!isReducedMotion) {
          const breath = Math.sin(tick * 0.02 + node.id * 0.8) * 0.35;
          node.x += breath * (node.layer === 'human' ? 0.8 : -0.5);
          node.y += breath * 0.3;
        }

        // Bound to canvas
        const pad = 30;
        node.x = Math.max(pad, Math.min(width - pad, node.x));
        node.y = Math.max(pad, Math.min(height - pad, node.y));
      });

      // Dragging node constraint
      if (draggingNodeRef.current) {
        draggingNodeRef.current.x = mousePosRef.current.x;
        draggingNodeRef.current.y = mousePosRef.current.y;
      }

      // Cursor repulsive or attractive aerodynamic wake
      const mouse = mousePosRef.current;
      if (!isReducedMotion) {
        nodes.forEach((node) => {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 120;
          if (dist < maxDist && dist > 1) {
            const force = (1 - dist / maxDist) * (mode === 'friction' ? 3.5 : 1.8);
            node.x += (dx / dist) * force;
            node.y += (dy / dist) * force;
          }
        });
      }

      // Spring relaxation iterations
      let totalStress = 0;
      const iterations = mode === 'friction' ? 6 : 4;
      for (let iter = 0; iter < iterations; iter++) {
        springs.forEach((spring) => {
          const dx = spring.nodeB.x - spring.nodeA.x;
          const dy = spring.nodeB.y - spring.nodeA.y;
          const currentDist = Math.hypot(dx, dy);
          if (currentDist === 0) return;

          const delta = currentDist - spring.targetLength;
          const stressAmount = Math.abs(delta) / spring.targetLength;
          spring.stress = stressAmount;
          totalStress += stressAmount;

          const stiffness = spring.stiffness * springMultiplier;
          const offsetX = (dx / currentDist) * delta * 0.5 * stiffness;
          const offsetY = (dy / currentDist) * delta * 0.5 * stiffness;

          if (!spring.nodeA.pinned && spring.nodeA !== draggingNodeRef.current) {
            spring.nodeA.x += offsetX;
            spring.nodeA.y += offsetY;
          }
          if (!spring.nodeB.pinned && spring.nodeB !== draggingNodeRef.current) {
            spring.nodeB.x -= offsetX;
            spring.nodeB.y -= offsetY;
          }
        });
      }

      // 2. Render Layer: Substrate Graph Grid lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(120, 127, 138, 0.12)';
      ctx.setLineDash([2, 6]);

      // Subtle isometric grid lines
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset dash

      // 3. Render User Chalk / Carbon strokes with ink dispersion
      const userStrokes = userStrokesRef.current;
      for (let s = userStrokes.length - 1; s >= 0; s--) {
        const stroke = userStrokes[s];
        if (stroke.length < 2) continue;

        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let p = 1; p < stroke.length; p++) {
          ctx.lineTo(stroke[p].x, stroke[p].y);
          // Fade over time
          stroke[p].age += 0.002;
          stroke[p].alpha = Math.max(0, 1 - stroke[p].age);
        }

        const avgAlpha = stroke[0].alpha;
        ctx.strokeStyle = `rgba(27, 45, 66, ${avgAlpha * 0.55})`;
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Ink dispersion wash effect in resonance mode
        if (mode === 'resonance' && avgAlpha > 0.4) {
          ctx.strokeStyle = `rgba(191, 81, 54, ${avgAlpha * 0.15})`;
          ctx.lineWidth = 6.0;
          ctx.stroke();
        }

        if (avgAlpha <= 0.01) {
          userStrokes.splice(s, 1);
        }
      }

      // Active live stroke
      const active = activeStrokeRef.current;
      if (active.length > 1) {
        ctx.beginPath();
        ctx.moveTo(active[0].x, active[0].y);
        for (let p = 1; p < active.length; p++) {
          ctx.lineTo(active[p].x, active[p].y);
        }
        ctx.strokeStyle = 'rgba(27, 45, 66, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // 4. Render Structural Springs (The Apparatus Tensegrity)
      springs.forEach((spring) => {
        const isHuman = spring.nodeA.layer === 'human' && spring.nodeB.layer === 'human';
        const isConstruct = spring.nodeA.layer === 'construct' && spring.nodeB.layer === 'construct';

        // Color based on stress & layer
        const stressHighlight = Math.min(spring.stress * 4, 1);

        ctx.beginPath();
        ctx.moveTo(spring.nodeA.x, spring.nodeA.y);

        if (mode === 'resonance') {
          // Harmonic wave curvature
          const midX = (spring.nodeA.x + spring.nodeB.x) / 2;
          const midY = (spring.nodeA.y + spring.nodeB.y) / 2;
          const waveAmp = Math.sin(tick * 0.1 + spring.nodeA.id) * (spring.stress * 15);
          ctx.quadraticCurveTo(midX + waveAmp, midY - waveAmp, spring.nodeB.x, spring.nodeB.y);
        } else {
          ctx.lineTo(spring.nodeB.x, spring.nodeB.y);
        }

        if (isHuman) {
          // Deep indigo human ink line
          ctx.strokeStyle = `rgba(27, 45, 66, ${0.45 + stressHighlight * 0.4})`;
          ctx.lineWidth = 1.5 + stressHighlight * 1.5;
        } else if (isConstruct) {
          // Ochre architectural oxide line
          ctx.strokeStyle = `rgba(191, 81, 54, ${0.5 + stressHighlight * 0.45})`;
          ctx.lineWidth = 2.0 + stressHighlight * 2.0;
        } else {
          // Tensegrity link: dashed dialogue between human & construct
          ctx.strokeStyle = `rgba(120, 127, 138, ${0.35 + stressHighlight * 0.3})`;
          ctx.lineWidth = 1.0;
          ctx.setLineDash([3, 4]);
        }

        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 5. Render Nodes (Articulated Pivots)
      nodes.forEach((node) => {
        const isDragged = node === draggingNodeRef.current;
        const radius = node.layer === 'construct' ? (node.id >= 14 ? 6.5 : 4.5) : 3.5;

        // Outer halo on hover/drag
        if (isDragged) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(191, 81, 54, 0.18)';
          ctx.fill();
        }

        // Main node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, isDragged ? radius + 2 : radius, 0, Math.PI * 2);

        if (node.layer === 'construct') {
          ctx.fillStyle = '#bf5136'; // Ochre
        } else {
          ctx.fillStyle = '#1b2d42'; // Indigo
        }
        ctx.fill();

        // Node center pivot dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#f8f6f0';
        ctx.fill();

        // Micro-numeric label for architectural precision
        if (mode === 'friction' || isDragged) {
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(20, 22, 27, 0.55)';
          ctx.fillText(`N°${node.id}`, node.x + 8, node.y - 6);
        }
      });

      // 6. Realtime statistics update throttled
      if (tick % 10 === 0) {
        const stats = {
          tensionScore: Math.round(totalStress * 40),
          activeNodes: nodes.length,
          totalInkEnergy: userStrokes.length * 12 + active.length,
        };
        setInteractiveStats(stats);
        onStatsRef.current?.({ tensionScore: stats.tensionScore, inkEnergy: stats.totalInkEnergy });
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, isReducedMotion]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePosRef.current.isDown = true;
    mousePosRef.current.x = x;
    mousePosRef.current.y = y;

    // Check if clicked directly on a node
    const clickedNode = nodesRef.current.find((n) => Math.hypot(n.x - x, n.y - y) < 22);

    if (clickedNode) {
      draggingNodeRef.current = clickedNode;
      sound.playPluck(clickedNode.layer === 'construct' ? 240 : 440, 0.3);
    } else {
      // Start freehand carbon trace
      activeStrokeRef.current = [{ x, y, alpha: 1.0, age: 0 }];
      sound.playPaperFriction(1.0);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - prevMouseRef.current.x;
    const dy = y - prevMouseRef.current.y;
    const velocity = Math.hypot(dx, dy);

    mousePosRef.current.vx = dx;
    mousePosRef.current.vy = dy;
    mousePosRef.current.x = x;
    mousePosRef.current.y = y;
    prevMouseRef.current = { x, y };

    if (activeStrokeRef.current.length > 0 && mousePosRef.current.isDown) {
      activeStrokeRef.current.push({ x, y, alpha: 1.0, age: 0 });
      if (Math.random() < 0.25) {
        sound.playPaperFriction(velocity * 0.1);
      }
    }
  };

  const handlePointerUp = () => {
    if (draggingNodeRef.current) {
      sound.playPluck(360, 0.25);
      draggingNodeRef.current = null;
    }
    if (activeStrokeRef.current.length > 0) {
      userStrokesRef.current.push([...activeStrokeRef.current]);
      activeStrokeRef.current = [];
      if (mode === 'resonance') {
        sound.playResonanceChord();
      }
    }
    mousePosRef.current.isDown = false;
  };

  const handleClearTraces = () => {
    userStrokesRef.current = [];
    activeStrokeRef.current = [];
    sound.playPaperFriction(1.5);
  };

  const handleDisturbApparatus = () => {
    nodesRef.current.forEach((node) => {
      const angle = Math.random() * Math.PI * 2;
      const force = 30 + Math.random() * 40;
      node.x += Math.cos(angle) * force;
      node.y += Math.sin(angle) * force;
    });
    sound.playPluck(520, 0.4);
  };

  return (
    <div
      ref={containerRef}
      className="apparatus-container"
      role="region"
      aria-label="物理拓印儀：互動張力與刻劃畫布"
    >
      <canvas
        ref={canvasRef}
        className="apparatus-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        tabIndex={0}
        aria-label="可拖拽節點或自由繪製意圖線條的拓印畫布。按空白鍵或回車鍵可引發共鳴震盪。"
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleDisturbApparatus();
          }
        }}
      />

      {/* Floating Instrument Control HUD */}
      <div className="instrument-hud">
        <div className="mode-toggle-cluster" role="radiogroup" aria-label="拓印思維模式選擇">
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'drafting'}
            className={`hud-tab ${mode === 'drafting' ? 'active' : ''}`}
            onClick={() => {
              onModeChange('drafting');
              sound.playPluck(380, 0.2);
            }}
          >
            <span className="mode-index">01</span>
            <span className="mode-name">起稿 · 流體</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'friction'}
            className={`hud-tab ${mode === 'friction' ? 'active' : ''}`}
            onClick={() => {
              onModeChange('friction');
              sound.playPluck(260, 0.35);
            }}
          >
            <span className="mode-index">02</span>
            <span className="mode-name">阻尼 · 批判</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'resonance'}
            className={`hud-tab ${mode === 'resonance' ? 'active' : ''}`}
            onClick={() => {
              onModeChange('resonance');
              sound.playResonanceChord();
            }}
          >
            <span className="mode-index">03</span>
            <span className="mode-name">晶化 · 諧振</span>
          </button>
        </div>

        <div className="instrument-telemetry">
          <div className="telemetry-item">
            <span className="telemetry-label">結構張力</span>
            <span className="telemetry-value mono">{interactiveStats.tensionScore} N</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">意圖墨量</span>
            <span className="telemetry-value mono">{interactiveStats.totalInkEnergy} px</span>
          </div>
          <button
            type="button"
            className="hud-action-btn"
            onClick={handleClearTraces}
            title="拭除畫布上的暫態墨跡"
          >
            拭除墨跡
          </button>
          <button
            type="button"
            className="hud-action-btn"
            onClick={handleDisturbApparatus}
            title="給予張力網絡一次物理激發"
          >
            撥動張力
          </button>
        </div>
      </div>

      <div className="canvas-instruction-badge">
        <span className="badge-dot"></span>
        <span>可拖拽節點感受阻尼，或在紙面任意處劃下墨跡</span>
      </div>
    </div>
  );
};
