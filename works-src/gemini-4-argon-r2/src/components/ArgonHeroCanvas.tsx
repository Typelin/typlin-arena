import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type ExcitationMode = 'INERT_18V' | 'IONIZED_420V' | 'SUPERCRITICAL_1048V';

interface ArgonHeroCanvasProps {
  mode: ExcitationMode;
  reducedMotion: boolean;
}

export const ArgonHeroCanvas: React.FC<ArgonHeroCanvasProps> = ({ mode, reducedMotion }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const modeRef = useRef<ExcitationMode>(mode);
  modeRef.current = mode;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      host.classList.add('webgl-fallback');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.className = 'argon-hero-webgl';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 80);
    camera.position.set(0, 1.4, 9.15);
    camera.lookAt(0, 0.26, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTarget = pmrem.fromScene(room, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.88;
    room.dispose();
    pmrem.dispose();

    // Studio lighting
    const keyLight = new THREE.DirectionalLight(0xfff6e5, 3.1);
    keyLight.position.set(-5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xdce6f7, 2.3);
    rimLight.position.set(6, 3, -5);
    scene.add(rimLight);

    const warmFill = new THREE.PointLight(0xd96b27, 3.6, 16, 1.5);
    warmFill.position.set(0, 0.8, 3.5);
    scene.add(warmFill);

    // Custom Materials: Anodized Obsidian Slate, Burnished Champagne Brass, Prussian Cobalt, Cinnabar Crystal
    const matObsidian = new THREE.MeshStandardMaterial({
      color: 0x191d23,
      metalness: 0.9,
      roughness: 0.24,
    });
    const matBrass = new THREE.MeshStandardMaterial({
      color: 0xc99e56,
      metalness: 0.96,
      roughness: 0.2,
    });
    const matPrussian = new THREE.MeshStandardMaterial({
      color: 0x1e3b68,
      metalness: 0.84,
      roughness: 0.26,
    });
    const matCinnabar = new THREE.MeshPhysicalMaterial({
      color: 0xc8431c,
      metalness: 0.14,
      roughness: 0.18,
      clearcoat: 0.88,
      clearcoatRoughness: 0.1,
    });
    const matAlabaster = new THREE.MeshPhysicalMaterial({
      color: 0xf4efe6,
      metalness: 0.08,
      roughness: 0.2,
      clearcoat: 0.65,
    });

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // 4 Horizontal Interferometer Datum Rails (Gemini 4) spanning full width
    const railGroup = new THREE.Group();
    stageGroup.add(railGroup);
    for (let r = 0; r < 4; r++) {
      const zOff = (r - 1.5) * 0.56;
      const railBar = new THREE.Mesh(
        new THREE.BoxGeometry(11.6, 0.048, 0.07),
        r % 2 === 0 ? matBrass : matObsidian
      );
      railBar.position.set(0, -1.08 + (r % 2) * 0.42, zOff);
      railBar.castShadow = true;
      railBar.receiveShadow = true;
      railGroup.add(railBar);
    }

    // 18 Hexagonal Kinetic Prism Columns (Argon Atomic Number Z = 18)
    interface PrismColumn {
      group: THREE.Group;
      shaft: THREE.Mesh;
      collar: THREE.Mesh;
      crown: THREE.Mesh;
      index: number;
      normX: number;
      rank: number;
    }

    const columns: PrismColumn[] = [];
    const TOTAL_COLUMNS = 18;

    for (let i = 0; i < TOTAL_COLUMNS; i++) {
      const normX = (i / (TOTAL_COLUMNS - 1)) * 2 - 1; // -1 to +1
      const rank = i % 2; // 0 = Castor (Front), 1 = Pollux (Back)
      const baseX = normX * 5.25;
      const baseZ = (rank === 0 ? 0.42 : -0.42) + Math.cos(normX * Math.PI * 0.5) * 0.25;

      const colGroup = new THREE.Group();
      colGroup.position.set(baseX, 0, baseZ);

      // 1. Hexagonal Machined Prism Shaft
      const shaftGeom = new THREE.CylinderGeometry(0.235, 0.235, 2.35, 6);
      const shaftMat = i % 3 === 0 ? matObsidian : i % 3 === 1 ? matPrussian : matAlabaster;
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      colGroup.add(shaft);

      // 2. Brushed-Brass Vernier Collar
      const collarGeom = new THREE.CylinderGeometry(0.275, 0.275, 0.16, 6);
      const collar = new THREE.Mesh(collarGeom, matBrass);
      collar.position.y = 0.68;
      collar.castShadow = true;
      colGroup.add(collar);

      // 3. Lower Brass Plinth Ring
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.285, 0.14, 6), matBrass);
      plinth.position.y = -1.12;
      colGroup.add(plinth);

      // 4. Faceted Dichroic Crystal Crown Finial
      const crownGeom = new THREE.OctahedronGeometry(0.23, 0);
      const crown = new THREE.Mesh(crownGeom, i % 2 === 0 ? matCinnabar : matBrass);
      crown.position.y = 1.48;
      crown.castShadow = true;
      colGroup.add(crown);

      stageGroup.add(colGroup);
      columns.push({
        group: colGroup,
        shaft,
        collar,
        crown,
        index: i,
        normX,
        rank,
      });
    }

    // Soft elongated architectural floor shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(256, 128, 22, 256, 128, 248);
      grad.addColorStop(0, 'rgba(18, 19, 22, 0.26)');
      grad.addColorStop(0.6, 'rgba(18, 19, 22, 0.09)');
      grad.addColorStop(1, 'rgba(18, 19, 22, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 512, 256);
    }
    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(13.5, 4.4),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(shadowCanvas),
        transparent: true,
        depthWrite: false,
      })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.set(0, -1.72, 0);
    scene.add(floorShadow);

    const resize = () => {
      const w = Math.max(host.clientWidth, 280);
      const h = Math.max(host.clientHeight, 220);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.z = w < 600 ? 15.2 : w < 960 ? 11.4 : 9.15;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let userYaw = -0.12;
    let userPitch = 0.06;
    let curYaw = -0.12;
    let curPitch = 0.06;
    let pointerNormX = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      host.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointerNormX = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      if (!dragging) return;
      userYaw += (e.clientX - lastX) * 0.007;
      userPitch = Math.max(-0.32, Math.min(0.42, userPitch + (e.clientY - lastY) * 0.005));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
    };

    host.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: '150px' }
    );
    io.observe(host);

    let waveAmp = 0.48;
    let twistFactor = 0.55;
    let frameId = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      frameId = window.requestAnimationFrame(animate);
      if (!visible || document.hidden) return;

      const elapsed = reducedMotion ? 1.6 : (now - startTime) * 0.001;
      const curMode = modeRef.current;

      const targetAmp =
        curMode === 'INERT_18V' ? 0.14 : curMode === 'SUPERCRITICAL_1048V' ? 0.85 : 0.48;
      const targetTwist =
        curMode === 'INERT_18V' ? 0.18 : curMode === 'SUPERCRITICAL_1048V' ? 1.3 : 0.65;
      const speed =
        curMode === 'INERT_18V' ? 0.45 : curMode === 'SUPERCRITICAL_1048V' ? 1.55 : 0.95;

      waveAmp += (targetAmp - waveAmp) * (reducedMotion ? 1 : 0.07);
      twistFactor += (targetTwist - twistFactor) * (reducedMotion ? 1 : 0.07);

      curYaw += (userYaw + pointerNormX * 0.1 - curYaw) * 0.08;
      curPitch += (userPitch - curPitch) * 0.08;

      stageGroup.rotation.y = curYaw + (reducedMotion ? 0 : Math.sin(elapsed * 0.22) * 0.05);
      stageGroup.rotation.x = curPitch;

      columns.forEach((col) => {
        const phase = col.normX * Math.PI * 1.45 + (col.rank === 0 ? 0 : Math.PI * 0.38);
        const wave = Math.sin(elapsed * 1.25 * speed - phase) * waveAmp;
        const arch = Math.cos(col.normX * Math.PI * 0.5) * 0.34 * waveAmp;

        col.group.position.y = wave * 0.46 + arch - 0.08;
        col.group.rotation.y = col.normX * twistFactor * 0.65 + elapsed * 0.25 * speed;
        col.group.rotation.z = Math.sin(col.normX * Math.PI) * 0.08 * twistFactor;

        const scaleY = Math.max(0.58, 0.9 + (wave + 0.5) * 0.28);
        col.shaft.scale.set(1, scaleY, 1);
        col.collar.position.y = 0.68 * scaleY;
        col.crown.position.y = 1.16 * scaleY + 0.28 + Math.abs(wave) * 0.16;
        col.crown.rotation.y = -elapsed * 1.1 * speed + col.index * 0.4;
      });

      renderer.render(scene, camera);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      renderer.dispose();
      envTarget.dispose();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={hostRef}
      className="argon-hero-sculpture"
      role="img"
      aria-label="Gemini 4 Argon 十八階雙子六角分光稜柱陣列 3D 實體雕塑（可拖曳旋轉）"
    />
  );
};
