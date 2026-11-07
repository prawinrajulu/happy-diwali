import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { soundManager } from '../audio/soundManager';

export interface FireworksHandle {
  launchRocket: (targetX?: number, targetY?: number, type?: FireworkType) => void;
  triggerGrandFinale: () => void;
}

export type FireworkType = 
  | 'chrysanthemum' 
  | 'spherical' 
  | 'crackling' 
  | 'multi-layer' 
  | 'willow-gold' 
  | 'ring';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  gravity: number;
  friction: number;
  flicker?: boolean;
  trail: { x: number; y: number; alpha: number }[];
  trailLength: number;
  type: FireworkType;
  secondaryBurst?: boolean;
}

interface Rocket {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  type: FireworkType;
  trail: { x: number; y: number }[];
  progress: number;
}

const PALETTES = [
  // Royal Golden & Amber
  ['#FFD700', '#FFA500', '#FF8C00', '#FFF8DC', '#FFE4B5'],
  // Ruby Crimson & Rose Gold
  ['#FF1744', '#FF5252', '#FF4081', '#FF80AB', '#FFD700'],
  // Emerald & Jade Royal
  ['#00E676', '#1DE9B6', '#69F0AE', '#00B0FF', '#FFEA00'],
  // Royal Sapphire & Electric Violet
  ['#2979FF', '#7C4DFF', '#651FFF', '#00E5FF', '#E040FB'],
  // Multiverse Festive Jewels
  ['#FF1744', '#FFD700', '#00E676', '#2979FF', '#FF4081', '#FF9100'],
  // Pure Platinum & Gold Chrysanthemum
  ['#FFF2A3', '#FFD700', '#F59E0B', '#FDE68A', '#FFFFFF']
];

export const FireworksCanvas = forwardRef<FireworksHandle, { active?: boolean }>(
  ({ active = true }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rocketsRef = useRef<Rocket[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const lastAutoLaunchRef = useRef<number>(0);
    const finaleQueueRef = useRef<number>(0);

    const createExplosion = (
      x: number,
      y: number,
      type: FireworkType,
      paletteChoice?: string[]
    ) => {
      const palette = paletteChoice || PALETTES[Math.floor(Math.random() * PALETTES.length)];
      const baseColor = palette[0];
      const count = type === 'chrysanthemum' ? 140 : type === 'multi-layer' ? 160 : 100;

      // Play explosion sound effect with pitch variance
      soundManager.playExplosionSound(0.85 + Math.random() * 0.4);

      if (type === 'ring') {
        const ringCount = 70;
        const speed = 4.2 + Math.random() * 1.5;
        for (let i = 0; i < ringCount; i++) {
          const angle = (i / ringCount) * Math.PI * 2;
          const color = palette[i % palette.length];
          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color,
            size: 2.4,
            decay: 0.014 + Math.random() * 0.006,
            gravity: 0.04,
            friction: 0.98,
            trail: [],
            trailLength: 5,
            type: 'ring'
          });
        }
        return;
      }

      if (type === 'multi-layer') {
        // Outer layer
        const outerColor = palette[0];
        const innerColor = palette[2] || '#FFFFFF';
        for (let i = 0; i < 90; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5.5 + 2.5;
          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: outerColor,
            size: 2.8,
            decay: 0.012 + Math.random() * 0.005,
            gravity: 0.05,
            friction: 0.97,
            trail: [],
            trailLength: 6,
            type: 'multi-layer'
          });
        }
        // Inner core
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2.5 + 0.8;
          particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: innerColor,
            size: 3.2,
            decay: 0.018 + Math.random() * 0.008,
            gravity: 0.03,
            friction: 0.96,
            flicker: true,
            trail: [],
            trailLength: 4,
            type: 'multi-layer'
          });
        }
        return;
      }

      // Chrysanthemum, spherical, crackling, willow-gold
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed =
          type === 'willow-gold'
            ? Math.random() * 3.5 + 1.2
            : type === 'chrysanthemum'
            ? Math.random() * 5.8 + 1.5
            : Math.random() * 4.8 + 1.0;

        const color = palette[Math.floor(Math.random() * palette.length)];
        const isCrackling = type === 'crackling' || Math.random() < 0.25;

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: type === 'chrysanthemum' || type === 'willow-gold' ? 2.6 : 2.2,
          decay:
            type === 'willow-gold'
              ? 0.008 + Math.random() * 0.004 // falls longer like weeping willow
              : 0.014 + Math.random() * 0.008,
          gravity: type === 'willow-gold' ? 0.065 : 0.045,
          friction: type === 'chrysanthemum' ? 0.985 : 0.97,
          flicker: isCrackling,
          trail: [],
          trailLength: type === 'chrysanthemum' || type === 'willow-gold' ? 9 : 5,
          type,
          secondaryBurst: isCrackling && Math.random() < 0.2
        });
      }
    };

    const launchRocket = (
      targetX?: number,
      targetY?: number,
      preferredType?: FireworkType
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const types: FireworkType[] = [
        'chrysanthemum',
        'spherical',
        'crackling',
        'multi-layer',
        'willow-gold',
        'ring'
      ];
      const type = preferredType || types[Math.floor(Math.random() * types.length)];
      const startX =
        targetX !== undefined
          ? targetX + (Math.random() * 100 - 50)
          : canvas.width * 0.15 + Math.random() * canvas.width * 0.7;
      const startY = canvas.height + 20;

      const destX =
        targetX !== undefined
          ? targetX
          : canvas.width * 0.15 + Math.random() * canvas.width * 0.7;
      const destY =
        targetY !== undefined
          ? Math.max(80, Math.min(canvas.height * 0.65, targetY))
          : canvas.height * 0.12 + Math.random() * canvas.height * 0.38;

      const dx = destX - startX;
      const dy = destY - startY;
      const dist = Math.hypot(dx, dy);
      const speed = 12 + Math.random() * 4;

      rocketsRef.current.push({
        x: startX,
        y: startY,
        startX,
        startY,
        targetX: destX,
        targetY: destY,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        color: '#FFD700',
        type,
        trail: [],
        progress: 0
      });

      soundManager.playLaunchSound();
    };

    const triggerGrandFinale = () => {
      finaleQueueRef.current = 18;
    };

    useImperativeHandle(ref, () => ({
      launchRocket,
      triggerGrandFinale
    }));

    // Handle user clicking anywhere on sky
    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      // Launch firework to clicked coordinates
      launchRocket(x, y);
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const handleResize = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      const animate = (time: number) => {
        animationFrameRef.current = requestAnimationFrame(animate);

        // Semi-transparent clear to create luxury motion blur/glowing light trails
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Switch to additive blending for luminous glowing fireworks
        ctx.globalCompositeOperation = 'lighter';

        // Auto launch ambient fireworks when active
        if (active) {
          if (time - lastAutoLaunchRef.current > 1800 + Math.random() * 1200) {
            launchRocket();
            lastAutoLaunchRef.current = time;
          }

          // Handle grand finale queue
          if (finaleQueueRef.current > 0 && Math.random() < 0.45) {
            finaleQueueRef.current--;
            launchRocket(
              canvas.width * 0.1 + Math.random() * canvas.width * 0.8,
              canvas.height * 0.1 + Math.random() * canvas.height * 0.4
            );
          }
        }

        // 1. Update & Render Rockets
        for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
          const r = rocketsRef.current[i];
          r.x += r.vx;
          r.y += r.vy;

          // Record trail
          r.trail.push({ x: r.x, y: r.y });
          if (r.trail.length > 8) r.trail.shift();

          // Render rocket trail
          ctx.beginPath();
          ctx.moveTo(r.trail[0].x, r.trail[0].y);
          for (let t = 1; t < r.trail.length; t++) {
            ctx.lineTo(r.trail[t].x, r.trail[t].y);
          }
          ctx.strokeStyle = '#FFA726';
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FFB300';
          ctx.stroke();

          // Rocket head spark
          ctx.beginPath();
          ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Check if reached destination or going past target
          const distToTarget = Math.hypot(r.x - r.targetX, r.y - r.targetY);
          if (distToTarget < 20 || r.y <= r.targetY) {
            createExplosion(r.x, r.y, r.type);
            rocketsRef.current.splice(i, 1);
          }
        }

        // 2. Update & Render Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
          if (p.trail.length > p.trailLength) p.trail.shift();

          p.vx *= p.friction;
          p.vy *= p.friction;
          p.vy += p.gravity;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            // Secondary sparkle crackle
            if (p.secondaryBurst && Math.random() < 0.3) {
              soundManager.playCrackleSound();
            }
            particlesRef.current.splice(i, 1);
            continue;
          }

          // Draw trail
          if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let t = 1; t < p.trail.length; t++) {
              ctx.lineTo(p.trail[t].x, p.trail[t].y);
            }
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.alpha * 0.7;
            ctx.lineWidth = p.size * 0.8;
            ctx.stroke();
          }

          // Draw particle head
          const flickerOpacity = p.flicker
            ? p.alpha * (0.4 + Math.random() * 0.6)
            : p.alpha;
          ctx.globalAlpha = Math.max(0, flickerOpacity);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.fill();
        }

        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        window.removeEventListener('resize', handleResize);
      };
    }, [active]);

    return (
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="absolute inset-0 z-10 w-full h-full pointer-events-auto cursor-crosshair"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}
        title="Click anywhere to launch fireworks!"
      />
    );
  }
);

