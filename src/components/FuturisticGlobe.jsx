import React, { useEffect, useRef, useState } from 'react';

export default function FuturisticGlobe({ activeSavingsCount = 0 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });
  const pointsRef = useRef([]);
  const floatingParticlesRef = useRef([]);
  const angleRef = useRef({ x: 0.2, y: 0 });
  const prevSavingsCount = useRef(activeSavingsCount);

  // Generate 3D sphere points
  useEffect(() => {
    const points = [];
    const numPoints = 120;
    for (let i = 0; i < numPoints; i++) {
      // Golden spiral distribution on sphere
      const offset = 2 / numPoints;
      const increment = Math.PI * (3 - Math.sqrt(5));
      const y = ((i * offset) - 1) + (offset / 2);
      const r = Math.sqrt(1 - y * y);
      const phi = i * increment;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      
      points.push({ 
        x, y, z, 
        originalColor: i % 3 === 0 ? 'green' : 'blue',
        pulseSeed: Math.random() * 100
      });
    }
    pointsRef.current = points;
  }, []);

  // Listen for change in savings count to trigger floating particles
  useEffect(() => {
    if (activeSavingsCount > prevSavingsCount.current) {
      // Spawn 12 restoration particles rising from bottom
      const canvas = canvasRef.current;
      if (canvas) {
        for (let i = 0; i < 15; i++) {
          floatingParticlesRef.current.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
            targetX: canvas.width / 2 + (Math.random() - 0.5) * 80,
            targetY: canvas.height / 2 + (Math.random() - 0.5) * 80,
            speed: 1.5 + Math.random() * 2,
            size: 2 + Math.random() * 3,
            alpha: 1,
            color: '#00ff66',
            angleOffset: Math.random() * Math.PI * 2
          });
        }
      }
    }
    prevSavingsCount.current = activeSavingsCount;
  }, [activeSavingsCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width || 300;
      height = rect.height || 300;
      
      // Support high DPI screens
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38;

      // Draw grid ring outlines behind globe
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
      ctx.stroke();

      // Outer dashed tracking ring
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.12)';
      ctx.setLineDash([4, 12]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, angleRef.current.y * 0.5, angleRef.current.y * 0.5 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Auto rotation when not dragging
      if (!mouseRef.current.isDown) {
        angleRef.current.y += 0.003;
        angleRef.current.x = 0.2 + Math.sin(Date.now() * 0.0003) * 0.1;
      }

      const cosY = Math.cos(angleRef.current.y);
      const sinY = Math.sin(angleRef.current.y);
      const cosX = Math.cos(angleRef.current.x);
      const sinX = Math.sin(angleRef.current.x);

      // Project 3D points
      const projected = pointsRef.current.map(p => {
        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Perspective projection factor
        const fov = 3.5;
        const scale = fov / (fov + z2);
        
        return {
          x: centerX + x1 * radius * scale,
          y: centerY + y2 * radius * scale,
          z: z2, // keep depth for layering
          color: p.originalColor,
          pulse: Math.sin((Date.now() * 0.003) + p.pulseSeed) * 0.3 + 0.7
        };
      });

      // Sort by depth (back to front) for visual occlusion
      projected.sort((a, b) => b.z - a.z);

      // Draw wireframe connections for close points (only front hemisphere mostly to avoid clutter)
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.z > 0.3) continue; // Skip back hemisphere links

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (p2.z > 0.3) continue;

          // Check distance
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius * 0.45) {
            const alpha = (1 - dist / (radius * 0.45)) * 0.18 * (1 - p1.z) * (1 - p2.z);
            ctx.strokeStyle = p1.color === 'green' ? `rgba(0, 255, 90, ${alpha})` : `rgba(0, 229, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle points
      projected.forEach(p => {
        const opacity = (1 - p.z) * 0.8; // dimmer in background
        const size = (p.z < 0 ? 3.5 : 2.0) * (p.pulse * 0.4 + 0.8);
        
        ctx.shadowBlur = p.color === 'green' ? 8 : 12;
        ctx.shadowColor = p.color === 'green' ? '#00ff66' : '#00e5ff';
        
        ctx.fillStyle = p.color === 'green' ? `rgba(0, 255, 102, ${opacity})` : `rgba(0, 229, 255, ${opacity})`;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset shadows
      ctx.shadowBlur = 0;

      // Handle and draw floating energy particles (rising up to cure the planet)
      const floating = floatingParticlesRef.current;
      for (let i = floating.length - 1; i >= 0; i--) {
        const f = floating[i];
        
        // Wobble float effect
        f.x += Math.sin(Date.now() * 0.01 + f.angleOffset) * 0.5;
        // Move towards center globe
        const dx = centerX - f.x;
        const dy = centerY - f.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < radius * 0.6) {
          // Merge particle into globe
          floating.splice(i, 1);
          continue;
        }

        // Float upwards and inwards
        f.y -= f.speed;
        f.x += dx * 0.015;
        f.alpha -= 0.004;

        if (f.y < -10 || f.alpha <= 0) {
          floating.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(0, 255, 102, ${f.alpha})`;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw holographic HUD crosshairs
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;
      
      // Top left bracket
      ctx.beginPath();
      ctx.moveTo(15, 30); ctx.lineTo(15, 15); ctx.lineTo(30, 15);
      ctx.stroke();

      // Bottom right bracket
      ctx.beginPath();
      ctx.moveTo(width - 15, height - 30); ctx.lineTo(width - 15, height - 15); ctx.lineTo(width - 30, height - 15);
      ctx.stroke();

      // Overlay status text
      ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.font = '10px Courier New';
      ctx.fillText("SYS.LOC: ECO-SPHERE // CORE.ACTIVE", 25, 25);
      ctx.fillText(`SAVINGS_LOGS: ${activeSavingsCount}`, width - 140, height - 20);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Mouse handlers for dragging/spinning the globe
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.isDown = true;
    mouseRef.current.lastX = e.clientX - rect.left;
    mouseRef.current.lastY = e.clientY - rect.top;
  };

  const handleMouseMove = (e) => {
    if (!mouseRef.current.isDown) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = x - mouseRef.current.lastX;
    const deltaY = y - mouseRef.current.lastY;

    angleRef.current.y += deltaX * 0.007;
    angleRef.current.x += deltaY * 0.007;

    // limit vertical rotation to avoid flip confusion
    angleRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, angleRef.current.x));

    mouseRef.current.lastX = x;
    mouseRef.current.lastY = y;
  };

  const handleMouseUpOrLeave = () => {
    mouseRef.current.isDown = false;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[320px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-bg via-transparent to-transparent z-10 pointer-events-none" />
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="z-0"
      />
    </div>
  );
}
