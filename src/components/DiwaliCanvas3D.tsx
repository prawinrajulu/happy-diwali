import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { soundManager } from '../audio/soundManager';

interface DiwaliCanvas3DProps {
  isIntro: boolean;
  diyasLitCount: number;
  onDiyaClick: () => void;
  cameraMode: 'courtyard' | 'sky' | 'cinematic';
}

export const DiwaliCanvas3D: React.FC<DiwaliCanvas3DProps> = ({
  isIntro,
  diyasLitCount,
  onDiyaClick,
  cameraMode,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // References to keep animation objects accessible in render loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const diyasGroupRef = useRef<THREE.Group | null>(null);
  const lanternsGroupRef = useRef<THREE.Group | null>(null);
  const flamesRef = useRef<{ mesh: THREE.Mesh; light: THREE.PointLight; baseScale: number }[]>([]);
  const sparkParticlesRef = useRef<THREE.Points | null>(null);
  const rangoliMeshRef = useRef<THREE.Mesh | null>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x05060f, 0.015);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    // Initial camera position for Intro (close-up on single Diya)
    camera.position.set(0, 1.2, 3.2);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- 2. AMBIENT & MOONLIGHT ---
    const ambientLight = new THREE.AmbientLight(0x080c1e, 0.8);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x385285, 0.6);
    moonLight.position.set(-15, 30, -10);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    scene.add(moonLight);

    // --- 3. PROCEDURAL TEXTURES ---
    // A. Sacred Mandala / Rangoli Canvas Texture
    const createRangoliTexture = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 1024;
      const ctx = c.getContext('2d')!;
      const cx = 512;
      const cy = 512;

      // Dark background with subtle gold rim
      ctx.clearRect(0, 0, 1024, 1024);

      // Concentric circles with ornamental patterns
      const rings = [480, 420, 360, 300, 240, 180, 120, 60];
      const colors = ['#FF9900', '#FFD700', '#FF1744', '#FF5722', '#F59E0B', '#E040FB', '#FFEB3B'];

      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.lineWidth = 6;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors[idx % colors.length];
        ctx.stroke();

        // Petals / Lotus rays
        const petalCount = 8 * (idx + 1);
        for (let p = 0; p < petalCount; p++) {
          const angle = (p / petalCount) * Math.PI * 2;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          ctx.beginPath();
          ctx.arc(px, py, 4 + (idx % 3), 0, Math.PI * 2);
          ctx.fillStyle = colors[(idx + 1) % colors.length];
          ctx.fill();
        }
      });

      // Central Om / Auspicious sun flower
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE082';
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#FFB300';
      ctx.fill();

      const tex = new THREE.CanvasTexture(c);
      return tex;
    };

    // B. Marble Courtyard Floor
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070912,
      roughness: 0.18,
      metalness: 0.5,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Decorative Raised Marble Dais for Rangoli
    const daisGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.12, 48);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x111322,
      roughness: 0.25,
      metalness: 0.4
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.set(0, 0.05, 0);
    dais.receiveShadow = true;
    scene.add(dais);

    // Rangoli Mesh on Dais
    const rangoliGeo = new THREE.PlaneGeometry(7.8, 7.8);
    const rangoliMat = new THREE.MeshBasicMaterial({
      map: createRangoliTexture(),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const rangoli = new THREE.Mesh(rangoliGeo, rangoliMat);
    rangoli.rotation.x = -Math.PI / 2;
    rangoli.position.set(0, 0.12, 0);
    scene.add(rangoli);
    rangoliMeshRef.current = rangoli;

    // --- 4. TRADITIONAL 3D DIYA BUILDER ---
    const diyasGroup = new THREE.Group();
    diyasGroupRef.current = diyasGroup;
    scene.add(diyasGroup);

    // Diya Clay/Brass lathe profile
    const diyaPoints = [];
    diyaPoints.push(new THREE.Vector2(0, 0));
    diyaPoints.push(new THREE.Vector2(0.4, 0.02));
    diyaPoints.push(new THREE.Vector2(0.65, 0.12));
    diyaPoints.push(new THREE.Vector2(0.72, 0.25));
    diyaPoints.push(new THREE.Vector2(0.68, 0.35));
    diyaPoints.push(new THREE.Vector2(0.6, 0.38));
    diyaPoints.push(new THREE.Vector2(0.48, 0.26));
    diyaPoints.push(new THREE.Vector2(0.1, 0.12));
    diyaPoints.push(new THREE.Vector2(0, 0.1));

    const diyaGeo = new THREE.LatheGeometry(diyaPoints, 32);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc8963e, // Antique Indian Brass
      roughness: 0.32,
      metalness: 0.78,
    });

    // Flame Geometry: teardrop flame
    const flameGeo = new THREE.ConeGeometry(0.09, 0.32, 16);
    flameGeo.translate(0, 0.16, 0);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffe277,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });

    const createDiya = (x: number, y: number, z: number, scale = 1.0, isMain = false) => {
      const diyaHolder = new THREE.Group();
      diyaHolder.position.set(x, y, z);
      diyaHolder.scale.set(scale, scale, scale);

      const bowl = new THREE.Mesh(diyaGeo, brassMat);
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      diyaHolder.add(bowl);

      // Wick
      const wickGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8);
      const wickMat = new THREE.MeshStandardMaterial({ color: 0x221105 });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.set(0.18, 0.22, 0);
      wick.rotation.z = -0.3;
      diyaHolder.add(wick);

      // Flame
      const flame = new THREE.Mesh(flameGeo, flameMat.clone());
      flame.position.set(0.2, 0.28, 0);
      diyaHolder.add(flame);

      // Point Light from Flame
      const flameLight = new THREE.PointLight(0xff9922, isMain ? 2.5 : 1.4, 6.5);
      flameLight.position.set(0.2, 0.35, 0);
      flameLight.castShadow = isMain;
      flameLight.shadow.bias = -0.002;
      diyaHolder.add(flameLight);

      diyasGroup.add(diyaHolder);

      flamesRef.current.push({
        mesh: flame,
        light: flameLight,
        baseScale: scale
      });

      // Attach data for raycasting
      bowl.userData = { isDiya: true, parentHolder: diyaHolder };
      return diyaHolder;
    };

    // Central Hero Diya (used in Intro and courtyard center)
    createDiya(0, 0.12, 0, 1.4, true);

    // Circle of Diyas around the Rangoli border
    const rangoliDiyCount = 10;
    for (let i = 0; i < rangoliDiyCount; i++) {
      const angle = (i / rangoliDiyCount) * Math.PI * 2;
      const rx = Math.cos(angle) * 3.8;
      const rz = Math.sin(angle) * 3.8;
      createDiya(rx, 0.08, rz, 0.85);
    }

    // Additional Courtyard Diyas on pedestals / perimeter
    const perimeterPositions = [
      [-6, 0.08, -3],
      [6, 0.08, -3],
      [-6, 0.08, 4],
      [6, 0.08, 4],
      [-9, 0.08, 0],
      [9, 0.08, 0],
      [-3, 0.08, 8],
      [3, 0.08, 8],
      [-8, 0.08, 8],
      [8, 0.08, 8]
    ];
    perimeterPositions.forEach(([px, py, pz]) => {
      createDiya(px, py, pz, 0.9);
    });

    // --- 5. INDIAN ARCHITECTURE (Pillars, Jali Lattice Arches, Palace Domes) ---
    const archGroup = new THREE.Group();
    scene.add(archGroup);

    // Carved Pillars
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1c1e30,
      roughness: 0.35,
      metalness: 0.3
    });

    const createPillar = (px: number, pz: number) => {
      const pillar = new THREE.Group();
      pillar.position.set(px, 0, pz);

      // Base
      const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), pillarMat);
      baseMesh.position.y = 0.3;
      pillar.add(baseMesh);

      // Shaft
      const shaftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 9, 16), pillarMat);
      shaftMesh.position.y = 5;
      shaftMesh.castShadow = true;
      pillar.add(shaftMesh);

      // Capital
      const capMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.4, 0.8, 12), pillarMat);
      capMesh.position.y = 9.8;
      pillar.add(capMesh);

      archGroup.add(pillar);
    };

    [-12, -7, 7, 12].forEach(px => {
      createPillar(px, -6);
      createPillar(px, 10);
    });

    // Background Palace Wall with Glowing Rajput/Mughal Arches
    const palaceBackdropGeo = new THREE.PlaneGeometry(60, 24);
    const palaceMat = new THREE.MeshStandardMaterial({
      color: 0x090c18,
      roughness: 0.7,
      metalness: 0.2
    });
    const palaceWall = new THREE.Mesh(palaceBackdropGeo, palaceMat);
    palaceWall.position.set(0, 10, -18);
    scene.add(palaceWall);

    // Glowing Palace Domes (Silhouette in deep background)
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x161b36,
    });
    const createDome = (dx: number, dy: number, dz: number, r: number) => {
      const domeGeo = new THREE.SphereGeometry(r, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.set(dx, dy, dz);

      // Spire / Kalash atop dome
      const spireGeo = new THREE.ConeGeometry(0.2, 1.8, 12);
      const spireMat = new THREE.MeshBasicMaterial({ color: 0xcca040 });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(dx, dy + r + 0.9, dz);

      scene.add(dome);
      scene.add(spire);
    };

    createDome(0, 14, -20, 4.5);
    createDome(-14, 12, -22, 3.2);
    createDome(14, 12, -22, 3.2);

    // Decorative Jali Arch Silhouettes with Warm Golden Rim Backlight
    const jaliLight = new THREE.PointLight(0xff8811, 2.5, 30);
    jaliLight.position.set(0, 8, -12);
    scene.add(jaliLight);

    // --- 6. 3D HANGING LANTERNS (AKASH KANDILS) ---
    const lanternsGroup = new THREE.Group();
    lanternsGroupRef.current = lanternsGroup;
    scene.add(lanternsGroup);

    const createKandil = (kx: number, ky: number, kz: number) => {
      const kandil = new THREE.Group();
      kandil.position.set(kx, ky, kz);

      // Hanging string
      const stringGeo = new THREE.CylinderGeometry(0.01, 0.01, 4, 6);
      const stringMat = new THREE.MeshBasicMaterial({ color: 0xcca040 });
      const stringMesh = new THREE.Mesh(stringGeo, stringMat);
      stringMesh.position.y = 2;
      kandil.add(stringMesh);

      // Diamond body (octahedron)
      const bodyGeo = new THREE.OctahedronGeometry(0.85, 0);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xd9381e, // Festive vermilion silk
        emissive: 0xaa2200,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.3
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      kandil.add(bodyMesh);

      // Golden tassels hanging from base
      const tasselGeo = new THREE.ConeGeometry(0.25, 1.2, 8);
      const tasselMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const tasselMesh = new THREE.Mesh(tasselGeo, tasselMat);
      tasselMesh.position.y = -1.1;
      tasselMesh.rotation.x = Math.PI;
      kandil.add(tasselMesh);

      // Internal Warm Lantern Glow
      const kLight = new THREE.PointLight(0xffaa33, 1.2, 7);
      kandil.add(kLight);

      lanternsGroup.add(kandil);
      return kandil;
    };

    const kandilPositions = [
      [-7, 8.5, -4],
      [7, 8.5, -4],
      [-11, 7.8, 2],
      [11, 7.8, 2],
      [-3.5, 9.2, 4],
      [3.5, 9.2, 4]
    ];
    const kandilObjects = kandilPositions.map(([x, y, z]) => createKandil(x, y, z));

    // --- 7. FLOATING GOLDEN EMBERS / FIREFLIES PARTICLES ---
    const emberCount = 350;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberSpeeds = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 35;
      emberPositions[i * 3 + 1] = Math.random() * 16;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      emberSpeeds[i] = 0.015 + Math.random() * 0.035;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    // Emissive Gold Sparkle Particle Material
    const emberMat = new THREE.PointsMaterial({
      color: 0xffd24d,
      size: 0.14,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);
    sparkParticlesRef.current = embers;

    // --- 8. MOUSE PARALLAX & RAYCASTING ---
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      mousePos.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handlePointerMove);

    const handleCanvasClick = (e: MouseEvent) => {
      mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(diyasGroup.children, true);

      if (intersects.length > 0) {
        let hitDiya = false;
        intersects.forEach(hit => {
          if (hit.object.userData.isDiya || hit.object.parent?.userData?.isDiya) {
            hitDiya = true;
          }
        });

        if (hitDiya) {
          // Play auspicious bell chime
          soundManager.playDiyaChime();
          onDiyaClick();

          // Flash all flames temporarily
          flamesRef.current.forEach(f => {
            f.light.intensity *= 1.8;
            setTimeout(() => {
              f.light.intensity /= 1.8;
            }, 600);
          });
        }
      }
    };
    renderer.domElement.addEventListener('click', handleCanvasClick);

    // --- 9. RESIZE HANDLER ---
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 10. MAIN ANIMATION LOOP ---
    let clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Mouse Parallax Smooth Lerp
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      // 1. Camera Transitions based on state & cameraMode
      if (isIntro) {
        // Close-up intro view focused on center diya with gentle breathing orbit
        const introDist = 2.8;
        const targetCamX = Math.sin(time * 0.3) * 0.4 + mousePos.current.x * 0.3;
        const targetCamY = 0.8 + Math.cos(time * 0.4) * 0.1 + mousePos.current.y * 0.2;
        const targetCamZ = introDist + Math.sin(time * 0.2) * 0.2;

        camera.position.x += (targetCamX - camera.position.x) * 0.04;
        camera.position.y += (targetCamY - camera.position.y) * 0.04;
        camera.position.z += (targetCamZ - camera.position.z) * 0.04;
        camera.lookAt(0, 0.35, 0);
      } else {
        // Main celebration scene camera positioning
        let targetX = 0;
        let targetY = 3.8;
        let targetZ = 12.5;
        let lookAtY = 2.0;

        if (cameraMode === 'sky') {
          targetY = 1.6;
          targetZ = 9.0;
          lookAtY = 9.5; // Look upwards towards the fireworks
        } else if (cameraMode === 'cinematic') {
          // Slow dramatic orbit around the lit courtyard
          targetX = Math.sin(time * 0.2) * 11.0;
          targetY = 4.2 + Math.cos(time * 0.25) * 1.5;
          targetZ = Math.cos(time * 0.2) * 11.0;
          lookAtY = 1.2;
        } else {
          // Courtyard view with subtle mouse parallax
          targetX = mousePos.current.x * 3.5;
          targetY = 3.5 - mousePos.current.y * 1.5;
          targetZ = 11.5;
          lookAtY = 1.6;
        }

        camera.position.x += (targetX - camera.position.x) * 0.04;
        camera.position.y += (targetY - camera.position.y) * 0.04;
        camera.position.z += (targetZ - camera.position.z) * 0.04;
        camera.lookAt(0, lookAtY, 0);
      }

      // 2. Animate Diya Flames (realistic flickering & light dancing)
      flamesRef.current.forEach((item, idx) => {
        const offset = idx * 1.35;
        const wobble = Math.sin(time * 18 + offset) * 0.04;
        const flicker = Math.sin(time * 30 + offset) * 0.08 + Math.sin(time * 12 + offset) * 0.12;

        item.mesh.scale.set(
          1 + wobble,
          1 + flicker * 1.5,
          1 + wobble
        );

        // Flame point light intensity flicker
        const baseIntensity = isIntro && idx > 0 ? 0.0 : (idx === 0 ? 3.0 : 1.6);
        item.light.intensity = baseIntensity + flicker * 0.6;
      });

      // 3. Gentle Swaying of Akash Kandils (lanterns)
      kandilObjects.forEach((k, idx) => {
        const swayOffset = idx * 0.9;
        k.rotation.z = Math.sin(time * 1.4 + swayOffset) * 0.08;
        k.rotation.x = Math.cos(time * 1.1 + swayOffset) * 0.06;
      });

      // 4. Rangoli Pulse Animation
      if (rangoliMeshRef.current) {
        const pulse = 0.85 + Math.sin(time * 2.2) * 0.15;
        (rangoliMeshRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
      }

      // 5. Floating Embers rising up into the night sky
      if (sparkParticlesRef.current) {
        const positions = sparkParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < emberCount; i++) {
          positions[i * 3 + 1] += emberSpeeds[i];
          positions[i * 3] += Math.sin(time + i) * 0.008; // gentle horizontal drift

          // Reset if too high
          if (positions[i * 3 + 1] > 20) {
            positions[i * 3 + 1] = 0.1;
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 28;
          }
        }
        sparkParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isIntro, cameraMode]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', touchAction: 'none' }}
    />
  );
};

