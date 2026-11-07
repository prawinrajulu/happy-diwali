/**
 * Adaptive Performance & Device Tier Utility
 * Analyzes device capabilities (CPU concurrency, GPU tier, memory, touch, screen)
 * to balance visual luxury and 60fps responsiveness.
 */

export type PerformanceTier = 'mobile' | 'laptop' | 'desktop';

export interface PerformanceProfile {
  tier: PerformanceTier;
  isMobile: boolean;
  pixelRatio: number;
  particleMultiplier: number;
  maxActiveParticles: number;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  embersCount: number;
  maxSimultaneousRockets: number;
  enableMotionParallax: boolean;
  prefersReducedMotion: boolean;
}

export function detectPerformanceProfile(): PerformanceProfile {
  if (typeof window === 'undefined') {
    return {
      tier: 'desktop',
      isMobile: false,
      pixelRatio: 1,
      particleMultiplier: 1,
      maxActiveParticles: 1000,
      shadowsEnabled: true,
      shadowMapSize: 1024,
      embersCount: 300,
      maxSimultaneousRockets: 8,
      enableMotionParallax: true,
      prefersReducedMotion: false,
    };
  }

  const userAgent = navigator.userAgent || '';
  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
  const screenWidth = Math.min(window.innerWidth, window.screen?.width || window.innerWidth);
  const isSmallScreen = screenWidth < 768;
  const isMobile = isMobileUA || (isTouchDevice && isSmallScreen);

  // CPU cores & device memory if available
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = (navigator as any).deviceMemory || 4;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let tier: PerformanceTier = 'desktop';

  if (isMobile || hardwareConcurrency <= 2 || deviceMemory <= 2) {
    tier = 'mobile';
  } else if (screenWidth < 1200 || hardwareConcurrency <= 4 || deviceMemory <= 4) {
    tier = 'laptop';
  } else {
    tier = 'desktop';
  }

  const dpr = window.devicePixelRatio || 1;

  if (tier === 'mobile') {
    return {
      tier: 'mobile',
      isMobile: true,
      pixelRatio: Math.min(dpr, 1.25),
      particleMultiplier: 0.45,
      maxActiveParticles: 350,
      shadowsEnabled: false, // Saves massive fill-rate on mobile GPUs
      shadowMapSize: 512,
      embersCount: 110,
      maxSimultaneousRockets: 4,
      enableMotionParallax: false,
      prefersReducedMotion,
    };
  }

  if (tier === 'laptop') {
    return {
      tier: 'laptop',
      isMobile: false,
      pixelRatio: Math.min(dpr, 1.5),
      particleMultiplier: 0.75,
      maxActiveParticles: 750,
      shadowsEnabled: true,
      shadowMapSize: 1024,
      embersCount: 200,
      maxSimultaneousRockets: 6,
      enableMotionParallax: true,
      prefersReducedMotion,
    };
  }

  return {
    tier: 'desktop',
    isMobile: false,
    pixelRatio: Math.min(dpr, 2.0),
    particleMultiplier: 1.0,
    maxActiveParticles: 1200,
    shadowsEnabled: true,
    shadowMapSize: 1024,
    embersCount: 320,
    maxSimultaneousRockets: 9,
    enableMotionParallax: true,
    prefersReducedMotion,
  };
}

/**
 * Check if WebGL is supported and functioning
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

