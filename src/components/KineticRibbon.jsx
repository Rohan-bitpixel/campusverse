import React, { useEffect, useRef } from 'react';

const PALETTES = [
  ['#38d5e8', '#6366f1', '#22d3ee', '#818cf8', '#a855f7', '#06b6d4', '#e879f9', '#4ade80'],
  ['#f59e0b', '#f43f5e', '#ec4899', '#8b5cf6', '#38bdf8', '#fb923c', '#e11d48', '#a855f7'],
  ['#a3e635', '#06b6d4', '#f43f5e', '#38d5e8', '#fbbf24', '#c084fc', '#2dd4bf', '#fb7185'],
  ['#10b981', '#34d399', '#06b6d4', '#38d5e8', '#6366f1', '#818cf8', '#c084fc', '#22c55e'],
  ['#ff71ce', '#01cdfe', '#05ffa1', '#b967ff', '#fffb96', '#38d5e8', '#f43f5e', '#818cf8'],
  ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
];

export default function KineticRibbon() {
  const canvasRef = useRef(null);
  const paletteIndexRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Spine nodes
    const NUM_NODES = 46;
    const nodes = Array.from({ length: NUM_NODES }, () => ({
      x: width / 2,
      y: height / 2
    }));

    // Floating Interactive Particles
    const NUM_PARTICLES = 70;
    const particles = Array.from({ length: NUM_PARTICLES }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.8,
      baseAlpha: Math.random() * 0.4 + 0.15,
      alpha: 0.2,
      colorIndex: Math.floor(Math.random() * 8)
    }));

    const mouse = { x: width / 2, y: height / 2 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleClick = () => {
      paletteIndexRef.current = (paletteIndexRef.current + 1) % PALETTES.length;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    let time = 0;
    const NUM_STRANDS = 52;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.038;

      // Spine motion
      nodes[0].x += (mouse.x - nodes[0].x) * 0.36;
      nodes[0].y += (mouse.y - nodes[0].y) * 0.36;

      for (let i = 1; i < NUM_NODES; i++) {
        nodes[i].x += (nodes[i - 1].x - nodes[i].x) * 0.5;
        nodes[i].y += (nodes[i - 1].y - nodes[i].y) * 0.5;
      }

      const activeColors = PALETTES[paletteIndexRef.current];

      // 1. Render and Update Interactive Dust Particles
      for (let p = 0; p < NUM_PARTICLES; p++) {
        const pt = particles[p];

        // Interaction with Ribbon Spine (lead node and body)
        const dx = pt.x - nodes[0].x;
        const dy = pt.y - nodes[0].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Ribbon wake displacement: pushes particles away and illuminates them
        if (dist < 130 && dist > 1) {
          const force = (1 - dist / 130) * 1.6;
          pt.vx += (dx / dist) * force;
          pt.vy += (dy / dist) * force;
          pt.alpha = Math.min(0.9, pt.alpha + 0.08);
        } else {
          pt.alpha += (pt.baseAlpha - pt.alpha) * 0.04;
        }

        // Apply friction
        pt.vx *= 0.94;
        pt.vy *= 0.94;

        pt.x += pt.vx;
        pt.y += pt.vy;

        // Screen boundary wrap
        if (pt.x < 0) pt.x = width;
        if (pt.x > width) pt.x = 0;
        if (pt.y < 0) pt.y = height;
        if (pt.y > height) pt.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = activeColors[pt.colorIndex % activeColors.length];
        ctx.globalAlpha = pt.alpha;
        ctx.shadowColor = activeColors[pt.colorIndex % activeColors.length];
        ctx.shadowBlur = pt.alpha > 0.4 ? 8 : 0;
        ctx.fill();
      }

      // Reset shadow for ribbon
      ctx.shadowBlur = 0;

      // 2. Render Thin Kinetic Ribbon Strands
      for (let s = 0; s < NUM_STRANDS; s++) {
        const color = activeColors[s % activeColors.length];
        const strandPhase = s * (Math.PI / 12);
        const orbitRadius = 14 + ((s % 6) * 3) + Math.sin(time * 0.9 + s * 0.4) * 4;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.35 + 0.15 * Math.sin(time * 1.1 + s * 0.2);

        const startX = nodes[0].x + Math.cos(strandPhase + time) * (orbitRadius * 0.3);
        const startY = nodes[0].y + Math.sin(strandPhase + time) * (orbitRadius * 0.3);
        ctx.moveTo(startX, startY);

        for (let i = 1; i < NUM_NODES - 1; i++) {
          const trailDivergence = 1 + (i / NUM_NODES) * 0.45;
          const offsetX = Math.cos(strandPhase + i * 0.14 + time * 0.8) * (orbitRadius * trailDivergence);
          const offsetY = Math.sin(strandPhase + i * 0.14 + time * 1.0) * (orbitRadius * trailDivergence);

          const nextDivergence = 1 + ((i + 1) / NUM_NODES) * 0.45;
          const nextOffsetX = Math.cos(strandPhase + (i + 1) * 0.14 + time * 0.8) * (orbitRadius * nextDivergence);
          const nextOffsetY = Math.sin(strandPhase + (i + 1) * 0.14 + time * 1.0) * (orbitRadius * nextDivergence);

          const p0x = nodes[i].x + offsetX;
          const p0y = nodes[i].y + offsetY;
          const p1x = nodes[i + 1].x + nextOffsetX;
          const p1y = nodes[i + 1].y + nextOffsetY;

          const xc = (p0x + p1x) / 2;
          const yc = (p0y + p1y) / 2;

          ctx.quadraticCurveTo(p0x, p0y, xc, yc);
        }

        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}