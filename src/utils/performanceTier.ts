/**
 * Senior Mobile Performance Tier & Adaptive Quality Engine
 * Dynamically detects device capabilities (CPU, GPU, RAM, DPR, Touch, Screen)
 * and monitors runtime frame rate to adjust graphics quality on the fly.
 */

export type QualityLevel = 'low' | 'medium' | 'high';

export interface PerformanceProfile {
  quality: QualityLevel;
  isMobile: boolean;
  isTablet: boolean;
  pixelRatio: number;
  particleMultiplier: number;
  maxActiveParticles: number;
  maxTrailLength: number;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  embersCount: number;
  maxSimultaneousRockets: number;
  pointLightCount: number; // 1 for low, 3 for medium, 9 for high
  cylinderSegments: number;
  enableMotionParallax: boolean;
  prefersReducedMotion: boolean;
  gpuRenderer: string;
}

/**
 * Inspect WebGL unmasked renderer string for accurate mobile GPU classification
 */
function getGpuRenderer(): string {
  if (typeof window === 'undefined') return 'unknown';
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return 'unsupported';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'generic';
    }
    return gl.getParameter(gl.RENDERER) || 'generic';
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Detect static baseline device profile
 */
export function detectPerformanceProfile(): PerformanceProfile {
  if (typeof window === 'undefined') {
    return getProfileForQuality('high', false, false, 'server', false);
  }

  const userAgent = navigator.userAgent || '';
  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
  const isTabletUA = /iPad|Tablet|PlayBook/i.test(userAgent) || (isTouchDevice && window.innerWidth >= 768 && window.innerWidth <= 1024);

  const screenWidth = Math.min(window.innerWidth, window.screen?.width || window.innerWidth);
  const isSmallScreen = screenWidth < 768;
  const isMobile = isMobileUA || (isTouchDevice && isSmallScreen);
  const isTablet = !isMobile && (isTabletUA || (isTouchDevice && screenWidth <= 1024));

  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = (navigator as any).deviceMemory || 4;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gpuRenderer = getGpuRenderer().toLowerCase();

  // Classify GPU capability
  const isBudgetGpu =
    gpuRenderer.includes('mali-4') ||
    gpuRenderer.includes('mali-t') ||
    gpuRenderer.includes('mali-g3') ||
    gpuRenderer.includes('mali-g51') ||
    gpuRenderer.includes('mali-g52') ||
    gpuRenderer.includes('adreno (tm) 3') ||
    gpuRenderer.includes('adreno (tm) 4') ||
    gpuRenderer.includes('adreno (tm) 50') ||
    gpuRenderer.includes('adreno (tm) 610') ||
    gpuRenderer.includes('powervr') ||
    gpuRenderer.includes('intel hd') ||
    gpuRenderer.includes('swiftshader') ||
    gpuRenderer.includes('llvmpipe');

  const isHighEndGpu =
    gpuRenderer.includes('apple') ||
    gpuRenderer.includes('adreno (tm) 7') ||
    gpuRenderer.includes('adreno (tm) 660') ||
    gpuRenderer.includes('mali-g78') ||
    gpuRenderer.includes('mali-g710') ||
    gpuRenderer.includes('mali-g715') ||
    gpuRenderer.includes('mali-g925') ||
    gpuRenderer.includes('geforce') ||
    gpuRenderer.includes('nvidia') ||
    gpuRenderer.includes('radeon') ||
    gpuRenderer.includes('rtx') ||
    gpuRenderer.includes('gtx');

  let quality: QualityLevel = 'medium';

  if (isBudgetGpu || hardwareConcurrency <= 2 || deviceMemory <= 2 || prefersReducedMotion) {
    quality = 'low';
  } else if (!isMobile && !isTablet && (isHighEndGpu || hardwareConcurrency >= 6)) {
    quality = 'high';
  } else if (isMobile && isHighEndGpu && hardwareConcurrency >= 8 && deviceMemory >= 6) {
    quality = 'high';
  } else {
    quality = 'medium';
  }

  return getProfileForQuality(quality, isMobile, isTablet, gpuRenderer, prefersReducedMotion);
}

/**
 * Generate full profile parameters for a specific quality level
 */
export function getProfileForQuality(
  quality: QualityLevel,
  isMobile: boolean,
  isTablet: boolean,
  gpuRenderer = 'generic',
  prefersReducedMotion = false
): PerformanceProfile {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  if (quality === 'low') {
    return {
      quality: 'low',
      isMobile,
      isTablet,
      pixelRatio: 1.0, // Force 1:1 on low-end mobile to avoid 2.5K/3K fill-rate bottleneck
      particleMultiplier: 0.35,
      maxActiveParticles: 200,
      maxTrailLength: 2,
      shadowsEnabled: false,
      shadowMapSize: 512,
      embersCount: 18,
      maxSimultaneousRockets: 2,
      pointLightCount: 1, // Only hero diya flame point light
      cylinderSegments: 12,
      enableMotionParallax: false,
      prefersReducedMotion,
      gpuRenderer,
    };
  }

  if (quality === 'medium') {
    return {
      quality: 'medium',
      isMobile,
      isTablet,
      pixelRatio: Math.min(dpr, isMobile ? 1.25 : 1.5),
      particleMultiplier: 0.65,
      maxActiveParticles: 450,
      maxTrailLength: 4,
      shadowsEnabled: !isMobile, // Disable dynamic shadows on mobile phones to maintain 60fps
      shadowMapSize: 512,
      embersCount: 35,
      maxSimultaneousRockets: 4,
      pointLightCount: 3, // Hero diya + 2 key flanking accents
      cylinderSegments: 18,
      enableMotionParallax: !isMobile,
      prefersReducedMotion,
      gpuRenderer,
    };
  }

  // HIGH Quality (Desktops, iPads, High-end flagships)
  return {
    quality: 'high',
    isMobile,
    isTablet,
    pixelRatio: Math.min(dpr, isMobile ? 1.5 : 2.0),
    particleMultiplier: 1.0,
    maxActiveParticles: 850,
    maxTrailLength: 6,
    shadowsEnabled: true,
    shadowMapSize: 1024,
    embersCount: 55,
    maxSimultaneousRockets: 6,
    pointLightCount: 5,
    cylinderSegments: 26,
    enableMotionParallax: true,
    prefersReducedMotion,
    gpuRenderer,
  };
}

/**
 * Runtime Adaptive FPS Monitor
 * Automatically drops graphics quality if frame rate falls below 28 FPS
 * for consecutive frames on budget/struggling devices.
 */
class AdaptiveFpsMonitor {
  private frameTimes: number[] = [];
  private lastTime = performance.now();
  private currentQuality: QualityLevel = 'medium';
  private listeners: ((quality: QualityLevel) => void)[] = [];
  private isMonitoring = false;
  private lowFpsCounter = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const initialProfile = detectPerformanceProfile();
      this.currentQuality = initialProfile.quality;
    }
  }

  public getQuality(): QualityLevel {
    return this.currentQuality;
  }

  public subscribe(listener: (quality: QualityLevel) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public reportFrame(): void {
    if (typeof window === 'undefined') return;
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    if (delta > 0 && delta < 200) {
      this.frameTimes.push(delta);
      if (this.frameTimes.length > 45) {
        this.frameTimes.shift();

        // Calculate average FPS over last 45 frames
        const avgDelta =
          this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        const currentFps = 1000 / avgDelta;

        if (currentFps < 27) {
          this.lowFpsCounter++;
          if (this.lowFpsCounter >= 3) {
            this.downgradeQuality();
            this.lowFpsCounter = 0;
            this.frameTimes = [];
          }
        } else {
          this.lowFpsCounter = Math.max(0, this.lowFpsCounter - 1);
        }
      }
    }
  }

  private downgradeQuality(): void {
    if (this.currentQuality === 'high') {
      this.currentQuality = 'medium';
      this.notifyListeners();
    } else if (this.currentQuality === 'medium') {
      this.currentQuality = 'low';
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentQuality);
      } catch (e) {
        // Safe dispatch
      }
    });
  }
}

export const fpsMonitor = new AdaptiveFpsMonitor();

/**
 * Check if WebGL is supported and functioning
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
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
