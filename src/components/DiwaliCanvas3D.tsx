import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { soundManager } from '../audio/soundManager';
import {
  detectPerformanceProfile,
  getProfileForQuality,
  isWebGLAvailable,
  fpsMonitor,
  PerformanceProfile,
} from '../utils/performanceTier';

interface DiwaliCanvas3DProps {
  isIntro: boolean;
  diyasLitCount: number;
  onDiyaClick: () => void;
  cameraMode: 'courtyard' | 'sky' | 'cinematic';
}

export const DiwaliCanvas3D: React.FC<DiwaliCanvas3DProps> = memo(({
  isIntro,
  diyasLitCount,
  onDiyaClick,
  cameraMode,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  // Mutable refs to prevent re-instantiating WebGL scene when state changes
  const isIntroRef = useRef(isIntro);
  isIntroRef.current = isIntro;

  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const onDiyaClickRef = useRef(onDiyaClick);
  onDiyaClickRef.current = onDiyaClick;

  const isPausedRef = useRef(false);
  const flamesRef = useRef<{ mesh: THREE.Mesh; light: THREE.PointLight | null; baseScale: number }[]>([]);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    // 1. Verify WebGL availability
    if (!isWebGLAvailable()) {
      setWebGlSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let perf: PerformanceProfile = detectPerformanceProfile();

    // ─── 2. SCENE SETUP ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03050c, 0.013);

    const aspect = window.innerWidth / window.innerHeight;
    const initialFov = aspect < 0.65 ? 62 : aspect < 1.0 ? 54 : 48;
    const camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 500);
    camera.position.set(0, 1.2, 3.2);
    camera.lookAt(0, 0.4, 0);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: perf.quality === 'high',
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true,
      });
    } catch (e) {
      setWebGlSupported(false);
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(perf.pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    if (perf.shadowsEnabled) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      renderer.shadowMap.enabled = false;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ─── 3. ATMOSPHERIC LIGHTING ─────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x0e1120, perf.isMobile ? 1.05 : 0.9);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x223050, 0.45);
    moonLight.position.set(-15, 30, -10);
    if (perf.shadowsEnabled) {
      moonLight.castShadow = true;
      moonLight.shadow.mapSize.width = perf.shadowMapSize;
      moonLight.shadow.mapSize.height = perf.shadowMapSize;
    }
    scene.add(moonLight);

    // Warm golden fill light from below (simulates reflections off lit floor)
    const warmFill = new THREE.HemisphereLight(0xffb347, 0x020408, perf.isMobile ? 0.18 : 0.22);
    scene.add(warmFill);

    // ─── 4. PROCEDURAL TEXTURES ──────────────────────────────────────────────────

    // Rangoli texture
    const createRangoliTexture = () => {
      const c = document.createElement('canvas');
      const size = perf.isMobile ? (perf.quality === 'low' ? 256 : 512) : 1024;
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      const cx = size / 2;
      const cy = size / 2;

      ctx.clearRect(0, 0, size, size);

      const scaleFactor = size / 1024;
      const rings = [480, 420, 360, 300, 240, 180, 120, 60].map(r => r * scaleFactor);
      const colors = ['#FF9900', '#FFD700', '#D9381E', '#FFB300', '#F59E0B', '#B8860B', '#FFE082'];

      // Draw concentric rings with petals
      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.lineWidth = Math.max(2.5, 5 * scaleFactor);
        ctx.stroke();

        const petalCount = 8 * (idx + 1);
        for (let p = 0; p < petalCount; p++) {
          const angle = (p / petalCount) * Math.PI * 2;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          ctx.beginPath();
          ctx.arc(px, py, (3.5 + (idx % 3)) * scaleFactor, 0, Math.PI * 2);
          ctx.fillStyle = colors[(idx + 1) % colors.length];
          ctx.fill();
        }
      });

      // Lotus-like inner petals at scale ≥ medium
      if (perf.quality !== 'low') {
        const lotusCount = 8;
        const lr = 85 * scaleFactor;
        for (let i = 0; i < lotusCount; i++) {
          const a = (i / lotusCount) * Math.PI * 2;
          const lx = cx + Math.cos(a) * lr;
          const ly = cy + Math.sin(a) * lr;
          ctx.beginPath();
          ctx.ellipse(lx, ly, 22 * scaleFactor, 10 * scaleFactor, a + Math.PI / 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,180,0,0.5)';
          ctx.fill();
        }
      }

      // Bright center circle
      ctx.beginPath();
      ctx.arc(cx, cy, 32 * scaleFactor, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE082';
      ctx.fill();

      const tex = new THREE.CanvasTexture(c);
      tex.generateMipmaps = !perf.isMobile;
      return tex;
    };

    // Stone tile floor texture (procedural)
    const createFloorTexture = () => {
      const c = document.createElement('canvas');
      const size = perf.isMobile ? 256 : 512;
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;

      ctx.fillStyle = '#03040a';
      ctx.fillRect(0, 0, size, size);

      const tileSize = size / 8;
      ctx.strokeStyle = 'rgba(60,70,100,0.35)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= size; x += tileSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke();
      }
      for (let y = 0; y <= size; y += tileSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
      }

      // Subtle marble-like veins
      if (perf.quality !== 'low') {
        for (let v = 0; v < 12; v++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(80,90,130,${0.04 + Math.random() * 0.06})`;
          ctx.lineWidth = Math.random() * 2 + 0.5;
          ctx.moveTo(Math.random() * size, Math.random() * size);
          ctx.bezierCurveTo(
            Math.random() * size, Math.random() * size,
            Math.random() * size, Math.random() * size,
            Math.random() * size, Math.random() * size
          );
          ctx.stroke();
        }
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 8);
      return tex;
    };

    // Palace wall texture with ornamental bands
    const createPalaceWallTexture = () => {
      const c = document.createElement('canvas');
      const w = perf.isMobile ? 512 : 1024;
      const h = perf.isMobile ? 256 : 512;
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;

      // Deep base
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, w, h);

      // Golden horizontal bands
      const bandPositions = [0.08, 0.35, 0.65, 0.92];
      bandPositions.forEach(pos => {
        const y = pos * h;
        const grad = ctx.createLinearGradient(0, y - 4, 0, y + 4);
        grad.addColorStop(0, 'rgba(180,140,20,0)');
        grad.addColorStop(0.5, 'rgba(200,165,40,0.55)');
        grad.addColorStop(1, 'rgba(180,140,20,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, y - 4, w, 8);
      });

      // Arch-like decorative shapes
      if (perf.quality !== 'low') {
        const archCount = 5;
        const archW = w / archCount;
        for (let i = 0; i < archCount; i++) {
          const ax = archW * i + archW / 2;
          const ay = h * 0.65;
          ctx.beginPath();
          ctx.arc(ax, ay, archW * 0.28, Math.PI, Math.PI * 2);
          ctx.strokeStyle = 'rgba(190,150,30,0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Window glow inside arch
          const glowGrad = ctx.createRadialGradient(ax, ay - 10, 2, ax, ay - 10, archW * 0.22);
          glowGrad.addColorStop(0, 'rgba(255,180,50,0.12)');
          glowGrad.addColorStop(1, 'rgba(255,100,0,0)');
          ctx.fillStyle = glowGrad;
          ctx.arc(ax, ay - 10, archW * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const tex = new THREE.CanvasTexture(c);
      return tex;
    };

    const rangoliTex = createRangoliTexture();
    const floorTex = createFloorTexture();
    const palaceWallTex = createPalaceWallTexture();

    // Sparkle / ember texture
    const createSparkleTexture = () => {
      const c = document.createElement('canvas');
      const s = perf.isMobile ? 32 : 64;
      c.width = s;
      c.height = s;
      const ctx = c.getContext('2d')!;
      const r = s / 2;
      const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
      grad.addColorStop(0, 'rgba(255, 255, 230, 1)');
      grad.addColorStop(0.2, 'rgba(255, 215, 80, 0.9)');
      grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.35)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(c);
    };

    // Lantern glow texture
    const createLanternTex = () => {
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      const ctx = c.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,180,30,1)');
      grad.addColorStop(0.4, 'rgba(255,100,0,0.6)');
      grad.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    };

    const sparkleTex = createSparkleTexture();
    const lanternGlowTex = createLanternTex();

    // ─── 5. FLOOR ────────────────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(90, 90);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      color: 0x060a14,
      roughness: 0.14,
      metalness: 0.72,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = perf.shadowsEnabled;
    scene.add(floor);

    // Floor border strips (golden border)
    const borderGeo = new THREE.PlaneGeometry(90, 0.3);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xb8860b, transparent: true, opacity: 0.5 });
    const stripPositions = [-12, -6, 0, 6, 12];
    stripPositions.forEach(zPos => {
      const strip = new THREE.Mesh(borderGeo, borderMat);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(0, 0.005, zPos);
      scene.add(strip);
    });

    // ─── 6. RANGOLI ──────────────────────────────────────────────────────────────
    const rangoliGeo = new THREE.PlaneGeometry(8.2, 8.2);
    const rangoliMat = new THREE.MeshBasicMaterial({
      map: rangoliTex,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const rangoli = new THREE.Mesh(rangoliGeo, rangoliMat);
    rangoli.rotation.x = -Math.PI / 2;
    rangoli.position.set(0, 0.02, 0);
    scene.add(rangoli);

    // Golden torus ring around rangoli
    const rangoliRingGeo = new THREE.TorusGeometry(4.4, 0.08, 8, perf.isMobile ? 32 : 64);
    const rangoliRingMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.6 });
    const rangoliRing = new THREE.Mesh(rangoliRingGeo, rangoliRingMat);
    rangoliRing.rotation.x = -Math.PI / 2;
    rangoliRing.position.set(0, 0.025, 0);
    scene.add(rangoliRing);

    // ─── 7. DIYAS ────────────────────────────────────────────────────────────────
    const diyasGroup = new THREE.Group();
    scene.add(diyasGroup);

    const diyaPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.4, 0.02),
      new THREE.Vector2(0.65, 0.12),
      new THREE.Vector2(0.72, 0.25),
      new THREE.Vector2(0.68, 0.35),
      new THREE.Vector2(0.6, 0.38),
      new THREE.Vector2(0.48, 0.26),
      new THREE.Vector2(0.1, 0.12),
      new THREE.Vector2(0, 0.1),
    ];

    const diyaGeo = new THREE.LatheGeometry(diyaPoints, perf.cylinderSegments);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc8963e,
      roughness: 0.32,
      metalness: 0.78,
    });

    const flameGeo = new THREE.ConeGeometry(0.09, 0.32, perf.isMobile ? 8 : 14);
    flameGeo.translate(0, 0.16, 0);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffe277,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    });

    const wickGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 5);
    const wickMat = new THREE.MeshStandardMaterial({ color: 0x221105 });

    let activeLightsCount = 0;

    const createDiya = (x: number, y: number, z: number, scale = 1.0, isMain = false) => {
      const diyaHolder = new THREE.Group();
      diyaHolder.position.set(x, y, z);
      diyaHolder.scale.set(scale, scale, scale);

      const bowl = new THREE.Mesh(diyaGeo, brassMat);
      bowl.castShadow = perf.shadowsEnabled && isMain;
      bowl.receiveShadow = perf.shadowsEnabled;
      diyaHolder.add(bowl);

      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.set(0.18, 0.22, 0);
      wick.rotation.z = -0.3;
      diyaHolder.add(wick);

      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(0.2, 0.28, 0);
      diyaHolder.add(flame);

      let flameLight: THREE.PointLight | null = null;
      if (isMain || activeLightsCount < perf.pointLightCount) {
        flameLight = new THREE.PointLight(
          0xff9922,
          isMain ? (perf.isMobile ? 2.8 : 2.5) : 1.2,
          isMain ? 7.0 : 4.5
        );
        flameLight.position.set(0.2, 0.35, 0);
        diyaHolder.add(flameLight);
        activeLightsCount++;
      }

      diyasGroup.add(diyaHolder);

      flamesRef.current.push({
        mesh: flame,
        light: flameLight,
        baseScale: scale,
      });

      bowl.userData = { isDiya: true, parentHolder: diyaHolder };
      return diyaHolder;
    };

    // Hero center diya
    createDiya(0, 0.04, 0, 1.45, true);

    // Rangoli perimeter diyas
    const rangoliDiyCount = perf.isMobile ? (perf.quality === 'low' ? 4 : 6) : 8;
    for (let i = 0; i < rangoliDiyCount; i++) {
      const angle = (i / rangoliDiyCount) * Math.PI * 2;
      createDiya(Math.cos(angle) * 3.8, 0.04, Math.sin(angle) * 3.8, 0.85);
    }

    // Backdrop diyas
    if (!perf.isMobile) {
      [[-6.5, 0.04, -3], [6.5, 0.04, -3], [-9.5, 0.04, -1], [9.5, 0.04, -1]].forEach(([px, py, pz]) => {
        createDiya(px, py, pz, 0.8);
      });
    }

    // Pillar-base diyas (medium+)
    if (perf.quality !== 'low') {
      const pillarBasePositions = [
        [-12.5, 0.04, -6.5], [12.5, 0.04, -6.5],
        [-7.5, 0.04, -6.5], [7.5, 0.04, -6.5],
      ];
      pillarBasePositions.forEach(([px, py, pz]) => {
        createDiya(px, py, pz, 0.6);
      });
    }

    // ─── 8. GRAND PILLARS ────────────────────────────────────────────────────────
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1a1f38,
      roughness: 0.42,
      metalness: 0.3,
    });
    const pillarAccentMat = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      roughness: 0.3,
      metalness: 0.7,
    });

    // Shared geometries for pillars
    const pillarShaftGeo = new THREE.CylinderGeometry(0.32, 0.42, 9, perf.isMobile ? 7 : 14);
    const pillarBaseGeo = new THREE.BoxGeometry(1.1, 0.6, 1.1);
    const pillarCapGeo = new THREE.CylinderGeometry(0.65, 0.38, 0.7, perf.isMobile ? 7 : 12);
    // Decorative ring (ornamental band on pillar)
    const ringGeo = new THREE.TorusGeometry(0.42, 0.06, 6, perf.isMobile ? 16 : 28);
    // Capital lotus-like top (flared disk)
    const capitalGeo = new THREE.CylinderGeometry(0.75, 0.55, 0.35, perf.isMobile ? 7 : 14);

    const createPillar = (px: number, pz: number) => {
      const pillar = new THREE.Group();
      pillar.position.set(px, 0, pz);

      // Base plinth
      const baseMesh = new THREE.Mesh(pillarBaseGeo, pillarMat);
      baseMesh.position.y = 0.3;
      baseMesh.castShadow = perf.shadowsEnabled;
      pillar.add(baseMesh);

      // Shaft
      const shaftMesh = new THREE.Mesh(pillarShaftGeo, pillarMat);
      shaftMesh.position.y = 4.8;
      shaftMesh.castShadow = perf.shadowsEnabled;
      pillar.add(shaftMesh);

      // Ornamental rings at 1/3 and 2/3 height
      if (perf.quality !== 'low') {
        const ring1 = new THREE.Mesh(ringGeo, pillarAccentMat);
        ring1.position.y = 3.5;
        pillar.add(ring1);
        const ring2 = new THREE.Mesh(ringGeo, pillarAccentMat);
        ring2.position.y = 6.1;
        pillar.add(ring2);
      }

      // Capital
      const capMesh = new THREE.Mesh(pillarCapGeo, pillarMat);
      capMesh.position.y = 9.4;
      pillar.add(capMesh);

      // Flared capital top
      const capitalMesh = new THREE.Mesh(capitalGeo, pillarAccentMat);
      capitalMesh.position.y = 9.9;
      pillar.add(capitalMesh);

      scene.add(pillar);
    };

    // 4 inner pillars + 2 outer wing pillars each side
    const pillarXPositions = perf.isMobile ? [-10, -6, 6, 10] : [-13, -8, 8, 13];
    pillarXPositions.forEach(px => createPillar(px, -8));

    // Extra outer pillars for depth (desktop high quality)
    if (!perf.isMobile && perf.quality === 'high') {
      [-17, 17].forEach(px => createPillar(px, -6));
      [-13, 13].forEach(px => createPillar(px, -16));
      [-8, 8].forEach(px => createPillar(px, -16));
    }

    // ─── 9. ARCHES BETWEEN PILLARS ───────────────────────────────────────────────
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x141828,
      roughness: 0.5,
      metalness: 0.2,
    });
    const archAccentMat = new THREE.MeshBasicMaterial({ color: 0xb8860b, transparent: true, opacity: 0.55 });

    const createArch = (x1: number, x2: number, z: number, height: number, archThickness = 0.4) => {
      const archGroup = new THREE.Group();
      const midX = (x1 + x2) / 2;
      const halfSpan = Math.abs(x2 - x1) / 2;

      // Left vertical leg
      const legH = height * 0.55;
      const legGeo = new THREE.BoxGeometry(archThickness, legH, archThickness);
      const leftLeg = new THREE.Mesh(legGeo, archMat);
      leftLeg.position.set(x1, legH / 2, z);
      archGroup.add(leftLeg);

      // Right vertical leg
      const rightLeg = new THREE.Mesh(legGeo, archMat);
      rightLeg.position.set(x2, legH / 2, z);
      archGroup.add(rightLeg);

      // Curved arch top (using TorusGeometry half)
      const archRadius = halfSpan;
      const torusGeo = new THREE.TorusGeometry(archRadius, archThickness * 0.5, 5, perf.isMobile ? 10 : 20, Math.PI);
      const archTop = new THREE.Mesh(torusGeo, archMat);
      archTop.rotation.z = Math.PI; // flip so it arches upward
      archTop.position.set(midX, legH, z);
      archGroup.add(archTop);

      // Golden decorative strip along arch top
      const stripGeo = new THREE.TorusGeometry(archRadius, 0.06, 4, perf.isMobile ? 10 : 20, Math.PI);
      const archStrip = new THREE.Mesh(stripGeo, archAccentMat);
      archStrip.rotation.z = Math.PI;
      archStrip.position.set(midX, legH, z - 0.05);
      archGroup.add(archStrip);

      scene.add(archGroup);
      return archGroup;
    };

    // Arches between pillars (match pillar x-positions)
    if (!perf.isMobile) {
      createArch(-13, -8, -8, 10.1);
      createArch(8, 13, -8, 10.1);
      if (perf.quality === 'high') {
        createArch(-17, -13, -6, 9.5);
        createArch(13, 17, -6, 9.5);
      }
    } else {
      // Mobile: simpler arches
      createArch(-10, -6, -8, 10.1, 0.35);
      createArch(6, 10, -8, 10.1, 0.35);
    }

    // Grand center arch (entrance arch)
    const centerArchGeo = new THREE.TorusGeometry(4.5, 0.5, perf.isMobile ? 6 : 10, perf.isMobile ? 14 : 28, Math.PI);
    const centerArchMesh = new THREE.Mesh(centerArchGeo, archMat);
    centerArchMesh.rotation.z = Math.PI;
    centerArchMesh.position.set(0, 10.5, -18.5);
    scene.add(centerArchMesh);

    // Golden trim on center arch
    const centerArchTrimGeo = new THREE.TorusGeometry(4.5, 0.12, 4, perf.isMobile ? 14 : 28, Math.PI);
    const centerArchTrim = new THREE.Mesh(centerArchTrimGeo, archAccentMat);
    centerArchTrim.rotation.z = Math.PI;
    centerArchTrim.position.set(0, 10.5, -18.3);
    scene.add(centerArchTrim);

    // ─── 10. PALACE BACKDROP WALL ────────────────────────────────────────────────
    const palaceBackdropGeo = new THREE.PlaneGeometry(60, 24);
    const palaceMat = new THREE.MeshStandardMaterial({
      map: palaceWallTex,
      color: 0x060814,
      roughness: 0.8,
      metalness: 0.15,
    });
    const palaceWall = new THREE.Mesh(palaceBackdropGeo, palaceMat);
    palaceWall.position.set(0, 10, -20);
    scene.add(palaceWall);

    // Golden horizontal ledge bands on the wall
    const ledgeMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.4, metalness: 0.75 });
    const ledgeGeo = new THREE.BoxGeometry(60, 0.22, 0.4);
    [1.0, 4.5, 8.5, 13.0, 18.5].forEach(yOff => {
      const ledge = new THREE.Mesh(ledgeGeo, ledgeMat);
      ledge.position.set(0, yOff, -19.8);
      scene.add(ledge);
    });

    // Side walls
    const sideWallGeo = new THREE.PlaneGeometry(14, 24);
    const sideWallMat = new THREE.MeshStandardMaterial({ color: 0x080b18, roughness: 0.75, metalness: 0.1 });
    [-1, 1].forEach(sign => {
      const sw = new THREE.Mesh(sideWallGeo, sideWallMat);
      sw.rotation.y = sign * Math.PI / 2;
      sw.position.set(sign * 20, 10, -13);
      scene.add(sw);
    });

    // Ceiling / overhead beam (frames the top of the courtyard view)
    const ceilingGeo = new THREE.PlaneGeometry(42, 14);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x060810, roughness: 0.9, metalness: 0.05 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 20, -13);
    scene.add(ceiling);

    // ─── 11. DOMES ───────────────────────────────────────────────────────────────
    if (!perf.isMobile) {
      const domeMat = new THREE.MeshStandardMaterial({ color: 0x0f1429, roughness: 0.5, metalness: 0.3 });
      const spireBaseMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.8 });

      const createDome = (dx: number, dy: number, dz: number, r: number) => {
        const domeGeo = new THREE.SphereGeometry(r, perf.quality === 'high' ? 16 : 10, perf.quality === 'high' ? 14 : 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.set(dx, dy, dz);

        // Dome rings
        if (perf.quality !== 'low') {
          const domeRing1Geo = new THREE.TorusGeometry(r * 0.9, 0.12, 5, 24);
          const domeRing1 = new THREE.Mesh(domeRing1Geo, spireBaseMat);
          domeRing1.position.set(dx, dy - r * 0.4, dz);
          scene.add(domeRing1);
        }

        const spireGeo = new THREE.ConeGeometry(0.18, 2.2, 6);
        const spire = new THREE.Mesh(spireGeo, spireBaseMat);
        spire.position.set(dx, dy + r + 1.1, dz);

        // Spire ball finial
        const finialGeo = new THREE.SphereGeometry(0.22, 6, 5);
        const finial = new THREE.Mesh(finialGeo, spireBaseMat);
        finial.position.set(dx, dy + r + 2.3, dz);

        scene.add(dome, spire, finial);
      };

      createDome(-15, 11, -22, 3.4);
      createDome(15, 11, -22, 3.4);

      // Extra mini domes on deep-perspective pillars
      if (perf.quality === 'high') {
        createDome(-13, 10.5, -28, 2.8);
        createDome(13, 10.5, -28, 2.8);
      }
    }

    // ─── 12. HANGING LANTERNS (Akash Kandils) ────────────────────────────────────
    const lanternGlowMat = new THREE.MeshBasicMaterial({
      map: lanternGlowTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const lanternBodies: { mesh: THREE.Group; swayOffset: number }[] = [];

    const lanternGeoOct = new THREE.OctahedronGeometry(0.28, 0);
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0xd44400, roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.85 });
    const lanternTasselGeo = new THREE.CylinderGeometry(0.025, 0.005, 0.5, 5);
    const tasselMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const lanternGlowPlane = new THREE.PlaneGeometry(0.7, 0.7);

    const lanternPositions: [number, number, number, string][] = perf.isMobile
      ? [
          [-5, 7.0, -7, 'orange'],
          [5, 7.0, -7, 'red'],
          [0, 7.5, -12, 'green'],
        ]
      : [
          [-10.5, 7.5, -8, 'orange'],
          [-5.5, 7.5, -8, 'red'],
          [5.5, 7.5, -8, 'orange'],
          [10.5, 7.5, -8, 'red'],
          [-3, 8.0, -13, 'green'],
          [3, 8.0, -13, 'orange'],
          [0, 8.5, -16, 'red'],
          [-7, 8.0, -13, 'green'],
          [7, 8.0, -13, 'orange'],
        ];

    const lanternColors: Record<string, number> = { orange: 0xd44400, red: 0xcc1100, green: 0x006622 };
    const glowColors: Record<string, number> = { orange: 0xff8800, red: 0xff4400, green: 0x44ff88 };

    lanternPositions.forEach(([lx, ly, lz, color], i) => {
      const lanternGroup = new THREE.Group();

      // Hanging string
      const stringGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.0, 4);
      const stringMat = new THREE.MeshBasicMaterial({ color: 0x554422 });
      const string = new THREE.Mesh(stringGeo, stringMat);
      string.position.y = 0.5;
      lanternGroup.add(string);

      // Lantern body
      const lMat = new THREE.MeshStandardMaterial({
        color: lanternColors[color] ?? 0xd44400,
        roughness: 0.5,
        metalness: 0.3,
        transparent: true,
        opacity: 0.85,
      });
      const body = new THREE.Mesh(lanternGeoOct, lMat);
      body.scale.set(1, 1.4, 1);
      lanternGroup.add(body);

      // Glow sprite
      const glowMat = new THREE.MeshBasicMaterial({
        map: lanternGlowTex,
        color: glowColors[color] ?? 0xff8800,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(lanternGlowPlane, glowMat);
      glow.position.set(0, -0.1, 0);
      lanternGroup.add(glow);

      // Tassel
      const tassel = new THREE.Mesh(lanternTasselGeo, tasselMat);
      tassel.position.y = -0.65;
      lanternGroup.add(tassel);

      // Inner glow point light
      if (activeLightsCount < perf.pointLightCount) {
        const ll = new THREE.PointLight(glowColors[color] ?? 0xff8800, 0.9, 5.5);
        lanternGroup.add(ll);
        activeLightsCount++;
      }

      lanternGroup.position.set(lx, ly, lz);
      scene.add(lanternGroup);
      lanternBodies.push({ mesh: lanternGroup, swayOffset: i * 0.73 });
    });

    // ─── 13. TORAN / GARLAND DECORATIONS ─────────────────────────────────────────
    if (perf.quality !== 'low') {
      const marigoldMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.85 });
      const leafMat = new THREE.MeshBasicMaterial({ color: 0x226611, transparent: true, opacity: 0.8 });
      const marigoldGeo = new THREE.SphereGeometry(0.14, 5, 4);
      const leafGeo = new THREE.SphereGeometry(0.1, 4, 3);

      // Create a garland segment draped across arch spans
      const createGarland = (x1: number, x2: number, z: number, topY: number, segments: number) => {
        const midX = (x1 + x2) / 2;
        const span = x2 - x1;
        for (let s = 0; s <= segments; s++) {
          const t = s / segments;
          const gx = x1 + t * span;
          // Catenary sag formula
          const sag = Math.sin(t * Math.PI) * 0.9;
          const gy = topY - sag;

          const mg = new THREE.Mesh(marigoldGeo, s % 3 === 1 ? leafMat : marigoldMat);
          mg.position.set(gx, gy, z);
          scene.add(mg);
        }
      };

      if (!perf.isMobile) {
        createGarland(-13, -8, -8, 10.6, 14);
        createGarland(8, 13, -8, 10.6, 14);
        createGarland(-8, 8, -8, 11.0, 20); // wide center garland
        if (perf.quality === 'high') {
          createGarland(-17, -13, -6, 10.2, 12);
          createGarland(13, 17, -6, 10.2, 12);
        }
      } else {
        createGarland(-10, 10, -8, 10.8, 16);
      }
    }

    // ─── 14. MARIGOLD CLUSTERS ON LEDGES ─────────────────────────────────────────
    if (perf.quality !== 'low') {
      const flowerColors = [0xff8800, 0xffcc00, 0xff6600];
      const flowerGeo = new THREE.SphereGeometry(0.12, 5, 4);

      const flowerPositions: [number, number, number][] = perf.isMobile
        ? [[-3.5, 0.15, 5.5], [3.5, 0.15, 5.5], [-6.5, 0.15, 3.0], [6.5, 0.15, 3.0]]
        : [
            [-3.5, 0.15, 5.5], [-2.5, 0.15, 5.6], [-4.5, 0.15, 5.4],
            [3.5, 0.15, 5.5], [2.5, 0.15, 5.6], [4.5, 0.15, 5.4],
            [-6.5, 0.15, 3.0], [-7.0, 0.15, 2.8], [-7.5, 0.15, 3.2],
            [6.5, 0.15, 3.0], [7.0, 0.15, 2.8], [7.5, 0.15, 3.2],
            [-11, 0.15, -1], [11, 0.15, -1],
            [-14, 0.15, -4], [14, 0.15, -4],
          ];

      flowerPositions.forEach(([fx, fy, fz], fi) => {
        const fMat = new THREE.MeshBasicMaterial({ color: flowerColors[fi % flowerColors.length], transparent: true, opacity: 0.9 });
        const flower = new THREE.Mesh(flowerGeo, fMat);
        flower.position.set(fx, fy, fz);
        scene.add(flower);
      });
    }

    // ─── 15. STARFIELD ───────────────────────────────────────────────────────────
    const starCount = perf.isMobile ? (perf.quality === 'low' ? 150 : 280) : 500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5; // upper hemisphere only
      const radius = 180 + Math.random() * 60;
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) + 5; // above horizon
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: perf.isMobile ? 0.9 : 0.7,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Moon
    const moonGeo = new THREE.SphereGeometry(2.8, perf.isMobile ? 8 : 14, 8);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xd0d8e8 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(-55, 70, -100);
    scene.add(moon);

    // ─── 16. FLOATING GOLDEN EMBERS ──────────────────────────────────────────────
    const emberCount = perf.embersCount;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 30;
      emberPositions[i * 3 + 1] = Math.random() * 14;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 24;
      emberSpeeds[i] = 0.012 + Math.random() * 0.024;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    const emberMat = new THREE.PointsMaterial({
      map: sparkleTex,
      color: 0xffdf7a,
      size: perf.isMobile ? 0.34 : 0.28,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // Second ember layer for richness (high/medium quality)
    let embers2: THREE.Points | null = null;
    if (perf.quality !== 'low') {
      const e2count = Math.floor(emberCount * 0.5);
      const e2geo = new THREE.BufferGeometry();
      const e2pos = new Float32Array(e2count * 3);
      const e2speeds = new Float32Array(e2count);
      for (let i = 0; i < e2count; i++) {
        e2pos[i * 3] = (Math.random() - 0.5) * 20;
        e2pos[i * 3 + 1] = 5 + Math.random() * 12;
        e2pos[i * 3 + 2] = -5 + (Math.random() - 0.5) * 18;
        e2speeds[i] = 0.008 + Math.random() * 0.018;
      }
      e2geo.setAttribute('position', new THREE.BufferAttribute(e2pos, 3));
      const e2mat = new THREE.PointsMaterial({
        map: sparkleTex,
        color: 0xffaa33,
        size: perf.isMobile ? 0.22 : 0.18,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      embers2 = new THREE.Points(e2geo, e2mat);
      scene.add(embers2);
    }

    // ─── 17. DYNAMIC QUALITY SUBSCRIPTION ────────────────────────────────────────
    const unsubscribeFps = fpsMonitor.subscribe((newQuality) => {
      perf = getProfileForQuality(
        newQuality,
        perf.isMobile,
        perf.isTablet,
        perf.gpuRenderer,
        perf.prefersReducedMotion
      );
      if (renderer) {
        renderer.setPixelRatio(perf.pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (renderer.shadowMap.enabled !== perf.shadowsEnabled) {
          renderer.shadowMap.enabled = perf.shadowsEnabled;
        }
      }
    });

    // ─── 18. EVENT LISTENERS ─────────────────────────────────────────────────────
    const handlePointerMove = (e: MouseEvent) => {
      if (!perf.enableMotionParallax) return;
      mousePos.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    const raycaster = new THREE.Raycaster();
    const touchVector = new THREE.Vector2();

    const checkDiyaIntersection = (clientX: number, clientY: number) => {
      touchVector.x = (clientX / window.innerWidth) * 2 - 1;
      touchVector.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(touchVector, camera);
      const intersects = raycaster.intersectObjects(diyasGroup.children, true);

      if (intersects.length > 0) {
        let hitDiya = false;
        intersects.forEach(hit => {
          if (hit.object.userData.isDiya || hit.object.parent?.userData?.isDiya) hitDiya = true;
        });

        if (hitDiya) {
          soundManager.playDiyaChime();
          onDiyaClickRef.current();
          flamesRef.current.forEach(f => {
            if (f.light) f.light.intensity *= 1.8;
            setTimeout(() => { if (f.light) f.light.intensity /= 1.8; }, 600);
          });
        }
      }
    };

    const handleCanvasClick = (e: MouseEvent) => checkDiyaIntersection(e.clientX, e.clientY);
    const handleCanvasTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) checkDiyaIntersection(e.touches[0].clientX, e.touches[0].clientY);
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);
    renderer.domElement.addEventListener('touchstart', handleCanvasTouch, { passive: true });

    const handleResize = () => {
      if (!renderer || !camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const curAspect = w / h;
      camera.aspect = curAspect;
      camera.fov = curAspect < 0.65 ? 62 : curAspect < 1.0 ? 54 : 48;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    const handleContextLost = (e: Event) => { e.preventDefault(); isPausedRef.current = true; };
    const handleContextRestored = () => { isPausedRef.current = false; };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    const handleVisibilityChange = () => { isPausedRef.current = document.hidden; };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ─── 19. ANIMATION LOOP ──────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isPausedRef.current) return;

      fpsMonitor.reportFrame();

      const time = clock.getElapsedTime();
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const isPortrait = currentWidth < currentHeight;

      // Smooth mouse parallax
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      // — Camera positioning —
      if (isIntroRef.current) {
        const targetCamX = Math.sin(time * 0.3) * 0.3 + mousePos.current.x * 0.2;
        const targetCamY = (isPortrait ? 0.95 : 0.8) + Math.cos(time * 0.4) * 0.1 + mousePos.current.y * 0.15;
        const targetCamZ = (isPortrait ? 3.4 : 2.8) + Math.sin(time * 0.2) * 0.2;
        camera.position.x += (targetCamX - camera.position.x) * 0.04;
        camera.position.y += (targetCamY - camera.position.y) * 0.04;
        camera.position.z += (targetCamZ - camera.position.z) * 0.04;
        camera.lookAt(0, 0.35, 0);
      } else {
        const mode = cameraModeRef.current;
        let targetX = 0;
        let targetY = isPortrait ? 2.8 : 2.4;
        let targetZ = isPortrait ? 12.6 : 10.5;
        let lookAtY = isPortrait ? 0.75 : 0.6;

        if (mode === 'sky') {
          targetY = 1.4;
          targetZ = 8.0;
          lookAtY = 8.5;
        } else if (mode === 'cinematic') {
          const orbitRadius = isPortrait ? 12.5 : 10.5;
          targetX = Math.sin(time * 0.18) * orbitRadius;
          targetY = (isPortrait ? 3.5 : 3.0) + Math.cos(time * 0.22) * 1.2;
          targetZ = Math.cos(time * 0.18) * orbitRadius;
          lookAtY = 0.8;
        } else {
          // courtyard mode: add gentle autonomous drift for cinematic feel
          targetX = mousePos.current.x * (isPortrait ? 1.4 : 2.2) + Math.sin(time * 0.12) * 0.4;
          targetY = (isPortrait ? 2.8 : 2.4) - mousePos.current.y * 1.0 + Math.sin(time * 0.09) * 0.15;
          targetZ = isPortrait ? 12.6 : 10.5;
          lookAtY = isPortrait ? 0.75 : 0.6;
        }

        camera.position.x += (targetX - camera.position.x) * 0.04;
        camera.position.y += (targetY - camera.position.y) * 0.04;
        camera.position.z += (targetZ - camera.position.z) * 0.04;
        camera.lookAt(0, lookAtY, 0);
      }

      // — Animate diya flames —
      flamesRef.current.forEach((item, idx) => {
        const offset = idx * 1.35;
        const flicker = Math.sin(time * 26 + offset) * 0.08 + Math.sin(time * 12 + offset) * 0.12;
        item.mesh.scale.set(1 + flicker * 0.35, 1 + flicker * 1.2, 1 + flicker * 0.35);
        if (item.light) {
          const baseIntensity = isIntroRef.current && idx > 0 ? 0.0 : idx === 0 ? 3.0 : 1.4;
          item.light.intensity = baseIntensity + flicker * 0.45;
        }
      });

      // — Rangoli breathing pulse —
      if (rangoli) {
        (rangoli.material as THREE.MeshBasicMaterial).opacity = 0.82 + Math.sin(time * 2.0) * 0.12;
      }

      // — Rangoli ring pulse —
      rangoliRing.rotation.z = time * 0.08;
      (rangoliRingMat as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(time * 1.5) * 0.2;

      // — Stars gentle twinkle —
      (starMat as THREE.PointsMaterial).opacity = 0.65 + Math.sin(time * 0.7) * 0.12;

      // — Lantern sway —
      lanternBodies.forEach(({ mesh, swayOffset }) => {
        mesh.rotation.z = Math.sin(time * 0.9 + swayOffset) * 0.06;
        mesh.rotation.x = Math.sin(time * 0.65 + swayOffset) * 0.03;
      });

      // — Floating embers —
      const positions = emberGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        positions[i * 3 + 1] += emberSpeeds[i];
        if (positions[i * 3 + 1] > 18) {
          positions[i * 3 + 1] = 0.05;
          positions[i * 3] = (Math.random() - 0.5) * 30;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
        }
      }
      emberGeo.attributes.position.needsUpdate = true;

      // — Second ember layer —
      if (embers2) {
        const e2pos = (embers2.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
        const e2count = e2pos.length / 3;
        for (let i = 0; i < e2count; i++) {
          e2pos[i * 3] += Math.sin(time * 0.5 + i) * 0.004;
          e2pos[i * 3 + 1] += 0.009;
          if (e2pos[i * 3 + 1] > 20) {
            e2pos[i * 3 + 1] = 5;
            e2pos[i * 3] = (Math.random() - 0.5) * 20;
            e2pos[i * 3 + 2] = -5 + (Math.random() - 0.5) * 18;
          }
        }
        (embers2.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
      }

      renderer!.render(scene, camera);
    };

    animate();

    // ─── 20. CLEANUP ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      unsubscribeFps();
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (renderer) {
        renderer.domElement.removeEventListener('click', handleCanvasClick);
        renderer.domElement.removeEventListener('touchstart', handleCanvasTouch);
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

        scene.traverse(obj => {
          if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
          if ((obj as THREE.Mesh).material) {
            const mat = (obj as THREE.Mesh).material;
            if (Array.isArray(mat)) mat.forEach(m => m.dispose());
            else mat.dispose();
          }
        });

        rangoliTex.dispose();
        sparkleTex.dispose();
        floorTex.dispose();
        palaceWallTex.dispose();
        lanternGlowTex.dispose();
        renderer.dispose();
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []); // Mounts once

  if (!webGlSupported) {
    return (
      <div
        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-radial from-[#12152b] via-[#070914] to-[#020308] select-none"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}
      >
        <div className="relative flex flex-col items-center animate-pulse">
          <span className="text-7xl mb-2 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">🪔</span>
          <div className="w-32 h-6 bg-amber-400/20 blur-xl rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none',
      }}
      aria-label="3D Diwali Palace Courtyard Scene"
    />
  );
});

DiwaliCanvas3D.displayName = 'DiwaliCanvas3D';
