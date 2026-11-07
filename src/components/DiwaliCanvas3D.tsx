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

    // 2. SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x03050c, 0.016);

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
    renderer.toneMappingExposure = 1.1;

    if (perf.shadowsEnabled) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      renderer.shadowMap.enabled = false;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. ATMOSPHERIC LIGHTING (Optimized for Mobile Fragment Cycles)
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

    // 4. PROCEDURAL RANGOLI TEXTURE (Warm Royal Gold & Crimson)
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

      ctx.beginPath();
      ctx.arc(cx, cy, 32 * scaleFactor, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE082';
      ctx.fill();

      const tex = new THREE.CanvasTexture(c);
      tex.generateMipmaps = !perf.isMobile;
      return tex;
    };

    const rangoliTex = createRangoliTexture();

    // Floor - Seamless deep midnight polished stone
    const floorGeo = new THREE.PlaneGeometry(90, 90);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x03040a,
      roughness: 0.16,
      metalness: 0.65,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = perf.shadowsEnabled;
    scene.add(floor);

    // Rangoli Mesh
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

    // 5. TRADITIONAL 3D DIYAS (Shared Geometries & Materials)
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
      // Optimize point lights: only hero and limited accents on mobile
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

    // Rangoli perimeter diyas in balanced circular harmony
    const rangoliDiyCount = perf.isMobile ? (perf.quality === 'low' ? 4 : 6) : 8;
    for (let i = 0; i < rangoliDiyCount; i++) {
      const angle = (i / rangoliDiyCount) * Math.PI * 2;
      const rx = Math.cos(angle) * 3.8;
      const rz = Math.sin(angle) * 3.8;
      createDiya(rx, 0.04, rz, 0.85);
    }

    if (!perf.isMobile) {
      const backdropDiyaPositions = [
        [-6.5, 0.04, -3],
        [6.5, 0.04, -3],
        [-9.5, 0.04, -1],
        [9.5, 0.04, -1],
      ];
      backdropDiyaPositions.forEach(([px, py, pz]) => {
        createDiya(px, py, pz, 0.8);
      });
    }

    // 6. INDIAN ARCHITECTURE (Palace Backdrop Pillars)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x141828,
      roughness: 0.45,
      metalness: 0.25,
    });
    const pillarGeo = new THREE.CylinderGeometry(0.32, 0.42, 9, perf.isMobile ? 6 : 12);
    const baseGeo = new THREE.BoxGeometry(1.1, 0.6, 1.1);
    const capGeo = new THREE.CylinderGeometry(0.65, 0.38, 0.7, perf.isMobile ? 6 : 10);

    const createPillar = (px: number, pz: number) => {
      const pillar = new THREE.Group();
      pillar.position.set(px, 0, pz);

      const baseMesh = new THREE.Mesh(baseGeo, pillarMat);
      baseMesh.position.y = 0.3;
      pillar.add(baseMesh);

      const shaftMesh = new THREE.Mesh(pillarGeo, pillarMat);
      shaftMesh.position.y = 4.8;
      pillar.add(shaftMesh);

      const capMesh = new THREE.Mesh(capGeo, pillarMat);
      capMesh.position.y = 9.4;
      pillar.add(capMesh);

      scene.add(pillar);
    };

    [-13, -8, 8, 13].forEach((px) => {
      createPillar(px, -8);
    });

    // Palace Backdrop Wall
    const palaceBackdropGeo = new THREE.PlaneGeometry(60, 24);
    const palaceMat = new THREE.MeshStandardMaterial({
      color: 0x060814,
      roughness: 0.8,
      metalness: 0.15,
    });
    const palaceWall = new THREE.Mesh(palaceBackdropGeo, palaceMat);
    palaceWall.position.set(0, 10, -20);
    scene.add(palaceWall);

    // Glowing Palace Domes (Wings only)
    if (!perf.isMobile) {
      const domeMat = new THREE.MeshBasicMaterial({ color: 0x0f1429 });
      const createDome = (dx: number, dy: number, dz: number, r: number) => {
        const domeGeo = new THREE.SphereGeometry(r, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.set(dx, dy, dz);

        const spireGeo = new THREE.ConeGeometry(0.18, 1.8, 6);
        const spireMat = new THREE.MeshBasicMaterial({ color: 0xb8860b });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.set(dx, dy + r + 0.9, dz);

        scene.add(dome);
        scene.add(spire);
      };

      createDome(-15, 11, -22, 3.4);
      createDome(15, 11, -22, 3.4);
    }

    // 7. SOFT GLOWING CIRCULAR GOLDEN EMBERS
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
      const tex = new THREE.CanvasTexture(c);
      return tex;
    };

    const sparkleTex = createSparkleTexture();

    const emberCount = perf.embersCount;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 26;
      emberPositions[i * 3 + 1] = Math.random() * 12;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
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

    // 8. DYNAMIC QUALITY DOWNGRADING SUBSCRIPTION
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

    // 9. EVENT LISTENERS & TOUCH RAYCASTING
    const handlePointerMove = (e: MouseEvent) => {
      if (!perf.enableMotionParallax) return;
      mousePos.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Raycasting for clicking/touching diyas
    const raycaster = new THREE.Raycaster();
    const touchVector = new THREE.Vector2();

    const checkDiyaIntersection = (clientX: number, clientY: number) => {
      touchVector.x = (clientX / window.innerWidth) * 2 - 1;
      touchVector.y = -(clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(touchVector, camera);
      const intersects = raycaster.intersectObjects(diyasGroup.children, true);

      if (intersects.length > 0) {
        let hitDiya = false;
        intersects.forEach((hit) => {
          if (hit.object.userData.isDiya || hit.object.parent?.userData?.isDiya) {
            hitDiya = true;
          }
        });

        if (hitDiya) {
          soundManager.playDiyaChime();
          onDiyaClickRef.current();

          // Flare all flames briefly
          flamesRef.current.forEach((f) => {
            if (f.light) f.light.intensity *= 1.8;
            setTimeout(() => {
              if (f.light) f.light.intensity /= 1.8;
            }, 600);
          });
        }
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      checkDiyaIntersection(e.clientX, e.clientY);
    };

    const handleCanvasTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        checkDiyaIntersection(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);
    renderer.domElement.addEventListener('touchstart', handleCanvasTouch, { passive: true });

    // Responsive Resize & Orientation Handler
    const handleResize = () => {
      if (!renderer || !camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const curAspect = w / h;
      camera.aspect = curAspect;

      // Adapt FOV for tall mobile portraits vs wide desktop
      if (curAspect < 0.65) {
        camera.fov = 62;
      } else if (curAspect < 1.0) {
        camera.fov = 54;
      } else {
        camera.fov = 48;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    // WebGL Context Loss Handlers (prevents black screen crash on mobile app switch)
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isPausedRef.current = true;
    };
    const handleContextRestored = () => {
      isPausedRef.current = false;
    };

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    const handleVisibilityChange = () => {
      isPausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 10. ANIMATION LOOP (Adaptive FPS Reporting + Zero Re-renders)
    let clock = new THREE.Clock();
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

      // 1. Camera positioning according to active mode & mobile aspect
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
          targetX = mousePos.current.x * (isPortrait ? 1.4 : 2.2);
          targetY = (isPortrait ? 2.8 : 2.4) - mousePos.current.y * 1.0;
          targetZ = isPortrait ? 12.6 : 10.5;
          lookAtY = isPortrait ? 0.75 : 0.6;
        }

        camera.position.x += (targetX - camera.position.x) * 0.04;
        camera.position.y += (targetY - camera.position.y) * 0.04;
        camera.position.z += (targetZ - camera.position.z) * 0.04;
        camera.lookAt(0, lookAtY, 0);
      }

      // 2. Animate Diya Flames with gentle realistic flicker
      flamesRef.current.forEach((item, idx) => {
        const offset = idx * 1.35;
        const flicker = Math.sin(time * 26 + offset) * 0.08 + Math.sin(time * 12 + offset) * 0.12;

        item.mesh.scale.set(
          1 + flicker * 0.35,
          1 + flicker * 1.2,
          1 + flicker * 0.35
        );

        if (item.light) {
          const baseIntensity = isIntroRef.current && idx > 0 ? 0.0 : idx === 0 ? 3.0 : 1.4;
          item.light.intensity = baseIntensity + flicker * 0.45;
        }
      });

      // 3. Rangoli subtle breathing pulse
      if (rangoli) {
        (rangoli.material as THREE.MeshBasicMaterial).opacity = 0.82 + Math.sin(time * 2.0) * 0.12;
      }

      // 4. Floating golden embers
      const positions = emberGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        positions[i * 3 + 1] += emberSpeeds[i];
        if (positions[i * 3 + 1] > 18) {
          positions[i * 3 + 1] = 0.05;
          positions[i * 3] = (Math.random() - 0.5) * 26;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
      }
      emberGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 11. CLEANUP ON UNMOUNT
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

        scene.traverse((obj) => {
          if ((obj as THREE.Mesh).geometry) {
            (obj as THREE.Mesh).geometry.dispose();
          }
          if ((obj as THREE.Mesh).material) {
            const mat = (obj as THREE.Mesh).material;
            if (Array.isArray(mat)) {
              mat.forEach((m) => m.dispose());
            } else {
              mat.dispose();
            }
          }
        });

        rangoliTex.dispose();
        sparkleTex.dispose();
        renderer.dispose();
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []); // Mounts once

  // Graceful WebGL Fallback UI
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
