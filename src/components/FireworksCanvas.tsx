import React, { useEffect, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import { soundManager } from '../audio/soundManager';
import { detectPerformanceProfile } from '../utils/performanceTier';

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

interface PooledParticle {
  active: boolean;
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
  flicker: boolean;
  trailX: Float32Array;
  trailY: Float32Array;
  trailCount: number;
  maxTrail: number;
  type: FireworkType;
  secondaryBurst: boolean;
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
  trailX: number[];
  trailY: number[];
}

const PALETTES = [
  ['#FFD700', '#FFA500', '#FF8C00', '#FFF8DC', '#FFE4B5'],
  ['#FF1744', '#FF5252', '#FF4081', '#FF80AB', '#FFD700'],
  ['#00E676', '#1DE9B6', '#69F0AE', '#00B0FF', '#FFEA00'],
  ['#2979FF', '#7C4DFF', '#651FFF', '#00E5FF', '#E040FB'],
  ['#FF1744', '#FFD700', '#00E676', '#2979FF', '#FF4081', '#FF9100'],
  ['#FFF2A3', '#FFD700', '#F59E0B', '#FDE68A', '#FFFFFF']
];

export const FireworksCanvas = memo(
  forwardRef<FireworksHandle, { active?: boolean }>(({ active = true }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rocketsRef = useRef<Rocket[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const lastAutoLaunchRef = useRef<number>(0);
    const finaleQueueRef = useRef<number>(0);
    const isPausedRef = useRef<boolean>(false);

    // Performance Profile cached per session
    const perfRef = useRef(detectPerformanceProfile());

    // --- OBJECT POOL FOR PARTICLES (Zero GC Allocation Loop) ---
    const POOL_CAPACITY = perfRef.current.maxActiveParticles;
    const poolRef = useRef<PooledParticle[]>([]);
    const activeCountRef = useRef<number>(0);

    // Initialize particle pool once
    if (poolRef.current.length === 0) {
      const TRAIL_BUFFER_SIZE = 8;
      for (let i = 0; i < POOL_CAPACITY; i++) {
        poolRef.current.push({
          active: false,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          alpha: 0,
          color: '#FFD700',
          size: 2,
          decay: 0.015,
          gravity: 0.045,
          friction: 0.98,
          flicker: false,
          trailX: new Float32Array(TRAIL_BUFFER_SIZE),
          trailY: new Float32Array(TRAIL_BUFFER_SIZE),
          trailCount: 0,
          maxTrail: TRAIL_BUFFER_SIZE,
          type: 'chrysanthemum',
          secondaryBurst: false,
        });
      }
    }

    const allocateParticle = (): PooledParticle | null => {
      // Find inactive particle in pool
      const pool = poolRef.current;
      for (let i = 0; i < pool.length; i++) {
        if (!pool[i].active) {
          pool[i].active = true;
          pool[i].trailCount = 0;
          activeCountRef.current++;
          return pool[i];
        }
      }
      return null; // Pool capacity reached, drop gracefully to preserve 60fps
    };

    const createExplosion = (
      x: number,
      y: number,
      type: FireworkType,
      paletteChoice?: string[]
    ) => {
      const palette = paletteChoice || PALETTES[Math.floor(Math.random() * PALETTES.length)];
      const mult = perfRef.current.particleMultiplier;
      const count = Math.floor(
        (type === 'chrysanthemum' ? 120 : type === 'multi-layer' ? 140 : 85) * mult
      );

      // Play audio effect
      soundManager.playExplosionSound(0.85 + Math.random() * 0.35);

      if (type === 'ring') {
        const ringCount = Math.floor(60 * mult);
        const speed = 4.0 + Math.random() * 1.5;
        for (let i = 0; i < ringCount; i++) {
          const p = allocateParticle();
          if (!p) break;
          const angle = (i / ringCount) * Math.PI * 2;
          p.x = x;
          p.y = y;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.alpha = 1.0;
          p.color = palette[i % palette.length];
          p.size = 2.4;
          p.decay = 0.015 + Math.random() * 0.006;
          p.gravity = 0.038;
          p.friction = 0.98;
          p.flicker = false;
          p.maxTrail = 4;
          p.type = 'ring';
          p.secondaryBurst = false;
        }
        return;
      }

      if (type === 'multi-layer') {
        const outerColor = palette[0];
        const innerColor = palette[2] || '#FFFFFF';
        const outerCount = Math.floor(count * 0.6);
        const innerCount = Math.floor(count * 0.4);

        // Outer shell
        for (let i = 0; i < outerCount; i++) {
          const p = allocateParticle();
          if (!p) break;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5.0 + 2.2;
          p.x = x;
          p.y = y;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.alpha = 1.0;
          p.color = outerColor;
          p.size = 2.6;
          p.decay = 0.013 + Math.random() * 0.005;
          p.gravity = 0.048;
          p.friction = 0.975;
          p.flicker = false;
          p.maxTrail = 5;
          p.type = 'multi-layer';
          p.secondaryBurst = false;
        }

        // Inner core
        for (let i = 0; i < innerCount; i++) {
          const p = allocateParticle();
          if (!p) break;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2.2 + 0.6;
          p.x = x;
          p.y = y;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.alpha = 1.0;
          p.color = innerColor;
          p.size = 3.0;
          p.decay = 0.018 + Math.random() * 0.008;
          p.gravity = 0.03;
          p.friction = 0.96;
          p.flicker = true;
          p.maxTrail = 3;
          p.type = 'multi-layer';
          p.secondaryBurst = false;
        }
        return;
      }

      // Default spherical / chrysanthemum / willow-gold
      for (let i = 0; i < count; i++) {
        const p = allocateParticle();
        if (!p) break;

        const angle = Math.random() * Math.PI * 2;
        const speed =
          type === 'willow-gold'
            ? Math.random() * 3.2 + 1.0
            : type === 'chrysanthemum'
            ? Math.random() * 5.4 + 1.4
            : Math.random() * 4.4 + 1.0;

        const color = palette[Math.floor(Math.random() * palette.length)];
        const isCrackling = type === 'crackling' || Math.random() < 0.2;

        p.x = x;
        p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.alpha = 1.0;
        p.color = color;
        p.size = type === 'chrysanthemum' || type === 'willow-gold' ? 2.5 : 2.1;
        p.decay =
          type === 'willow-gold'
            ? 0.009 + Math.random() * 0.004
            : 0.014 + Math.random() * 0.007;
        p.gravity = type === 'willow-gold' ? 0.06 : 0.042;
        p.friction = type === 'chrysanthemum' ? 0.982 : 0.97;
        p.flicker = isCrackling;
        p.maxTrail = type === 'chrysanthemum' || type === 'willow-gold' ? 6 : 4;
        p.type = type;
        p.secondaryBurst = isCrackling && Math.random() < 0.25;
      }
    };

    const launchRocket = (
      targetX?: number,
      targetY?: number,
      preferredType?: FireworkType
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Limit simultaneous rockets
      if (rocketsRef.current.length >= perfRef.current.maxSimultaneousRockets) {
        return;
      }

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
          ? targetX + (Math.random() * 60 - 30)
          : canvas.width * 0.15 + Math.random() * canvas.width * 0.7;
      const startY = canvas.height + 15;

      const destX =
        targetX !== undefined
          ? targetX
          : canvas.width * 0.15 + Math.random() * canvas.width * 0.7;
      const destY =
        targetY !== undefined
          ? Math.max(70, Math.min(canvas.height * 0.62, targetY))
          : canvas.height * 0.12 + Math.random() * canvas.height * 0.36;

      const dx = destX - startX;
      const dy = destY - startY;
      const dist = Math.hypot(dx, dy);
      const speed = 13 + Math.random() * 3.5;

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
        trailX: [],
        trailY: []
      });

      soundManager.playLaunchSound();
    };

    const triggerGrandFinale = () => {
      finaleQueueRef.current = perfRef.current.isMobile ? 10 : 16;
    };

    useImperativeHandle(ref, () => ({
      launchRocket,
      triggerGrandFinale
    }));

    const handlePointerLaunch = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      launchRocket(x, y);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      handlePointerLaunch(e.clientX, e.clientY);
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const handleResize = () => {
        if (!canvas) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        // Keep display smooth without overworking GPU
        const dpr = perfRef.current.pixelRatio;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.scale(dpr, dpr);
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      // Handle Page Visibility: pause when inactive to save battery/CPU
      const handleVisibilityChange = () => {
        isPausedRef.current = document.hidden;
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const animate = (time: number) => {
        animationFrameRef.current = requestAnimationFrame(animate);

        if (isPausedRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Clear with motion blur
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
        ctx.fillRect(0, 0, width, height);

        // Additive blending for luminous glows
        ctx.globalCompositeOperation = 'lighter';

        // Auto launch ambient fireworks
        if (active) {
          const launchInterval = perfRef.current.isMobile ? 3200 : 2100;
          if (time - lastAutoLaunchRef.current > launchInterval + Math.random() * 1000) {
            launchRocket();
            lastAutoLaunchRef.current = time;
          }

          if (finaleQueueRef.current > 0 && Math.random() < 0.4) {
            finaleQueueRef.current--;
            launchRocket(
              width * 0.12 + Math.random() * width * 0.76,
              height * 0.12 + Math.random() * height * 0.38
            );
          }
        }

        // 1. Update Rockets
        for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
          const r = rocketsRef.current[i];
          r.x += r.vx;
          r.y += r.vy;

          r.trailX.push(r.x);
          r.trailY.push(r.y);
          if (r.trailX.length > 7) {
            r.trailX.shift();
            r.trailY.shift();
          }

          // Rocket Trail
          if (r.trailX.length > 1) {
            ctx.beginPath();
            ctx.moveTo(r.trailX[0], r.trailY[0]);
            for (let t = 1; t < r.trailX.length; t++) {
              ctx.lineTo(r.trailX[t], r.trailY[t]);
            }
            ctx.strokeStyle = '#FFA726';
            ctx.lineWidth = 2.2;
            ctx.stroke();
          }

          // Spark head
          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          const dist = Math.hypot(r.x - r.targetX, r.y - r.targetY);
          if (dist < 18 || r.y <= r.targetY) {
            createExplosion(r.x, r.y, r.type);
            rocketsRef.current.splice(i, 1);
          }
        }

        // 2. Update Pooled Particles (Fast batch render without allocations)
        const pool = poolRef.current;
        for (let i = 0; i < pool.length; i++) {
          const p = pool[i];
          if (!p.active) continue;

          // Record trail into pre-allocated typed arrays
          const tCount = p.trailCount;
          if (tCount < p.maxTrail) {
            p.trailX[tCount] = p.x;
            p.trailY[tCount] = p.y;
            p.trailCount++;
          } else {
            // Shift trail elements left by 1
            for (let s = 0; s < p.maxTrail - 1; s++) {
              p.trailX[s] = p.trailX[s + 1];
              p.trailY[s] = p.trailY[s + 1];
            }
            p.trailX[p.maxTrail - 1] = p.x;
            p.trailY[p.maxTrail - 1] = p.y;
          }

          p.vx *= p.friction;
          p.vy *= p.friction;
          p.vy += p.gravity;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            if (p.secondaryBurst && Math.random() < 0.25) {
              soundManager.playCrackleSound();
            }
            p.active = false;
            activeCountRef.current = Math.max(0, activeCountRef.current - 1);
            continue;
          }

          // Draw trail path
          if (p.trailCount > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trailX[0], p.trailY[0]);
            for (let t = 1; t < p.trailCount; t++) {
              ctx.lineTo(p.trailX[t], p.trailY[t]);
            }
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.alpha * 0.65;
            ctx.lineWidth = p.size * 0.75;
            ctx.stroke();
          }

          // Draw luminous particle head
          const flickerAlpha = p.flicker
            ? p.alpha * (0.35 + Math.random() * 0.65)
            : p.alpha;

          // Outer soft glow (efficient bloom without shadowBlur)
          ctx.globalAlpha = flickerAlpha * 0.35;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Core bright spark
          ctx.globalAlpha = flickerAlpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        ctx.globalAlpha = 1.0;
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [active]);

    return (
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="absolute inset-0 z-10 w-full h-full pointer-events-auto cursor-crosshair select-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          touchAction: 'none'
        }}
        title="Click or tap anywhere in the sky to launch fireworks!"
        aria-label="Interactive Diwali Fireworks Canvas"
      />
    );
  })
);

FireworksCanvas.displayName = 'FireworksCanvas';
