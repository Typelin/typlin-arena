import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThinkingLevel } from '../types';

interface ThreeCanvasProps {
  thinkingLevel: ThinkingLevel;
  className?: string;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ thinkingLevel, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene, Camera, High-Precision WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / Math.max(height, 1), 0.1, 1000);
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Root Monolith Group
    const monolithGroup = new THREE.Group();
    scene.add(monolithGroup);

    // 1. Central Prismatic Crystal (Faceted Refractor)
    // Using a faceted Dodecahedron & Icosahedron hybrid
    const prismGeo = new THREE.DodecahedronGeometry(1.7, 1);
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: 0x111622,
      emissive: 0x050811,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.85,
      ior: 1.52,
      thickness: 1.2,
      wireframe: false,
      transparent: true,
      opacity: 0.88,
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    monolithGroup.add(prismMesh);

    // Facet Wireframe Overlay (Laser-etched precision edges)
    const wireGeo = new THREE.WireframeGeometry(prismGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    monolithGroup.add(wireframe);

    // 2. High-Temperature Reasoning Plasma Core (The 60,000 reasoning tokens source)
    const coreGeo = new THREE.IcosahedronGeometry(0.72, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    monolithGroup.add(coreMesh);

    // 3. Spectral Chromatic Dispersion Sheets (Rainbow Caustic Rays)
    const spectralGroup = new THREE.Group();
    monolithGroup.add(spectralGroup);

    const rayColors = [0xf43f5e, 0xf59e0b, 0xeab308, 0x10b981, 0x06b6d4, 0x3b82f6, 0x8b5cf6];
    const rayCount = rayColors.length;

    for (let r = 0; r < rayCount; r++) {
      const rayGeo = new THREE.PlaneGeometry(0.12, 5.2);
      const rayMat = new THREE.MeshBasicMaterial({
        color: rayColors[r],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const rayMesh = new THREE.Mesh(rayGeo, rayMat);
      const angle = (r / rayCount) * Math.PI * 2;
      rayMesh.rotation.z = angle;
      rayMesh.rotation.x = Math.PI / 4;
      rayMesh.position.set(Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, 0);
      spectralGroup.add(rayMesh);
    }

    // 4. Precision Vernier Micrometric Rings (Gimbal Coordinates)
    const vernierGeo1 = new THREE.RingGeometry(2.7, 2.72, 80);
    const vernierMat1 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const vernierRing1 = new THREE.Mesh(vernierGeo1, vernierMat1);
    vernierRing1.rotation.x = Math.PI / 2.3;
    monolithGroup.add(vernierRing1);

    const vernierGeo2 = new THREE.RingGeometry(2.95, 2.97, 80);
    const vernierMat2 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const vernierRing2 = new THREE.Mesh(vernierGeo2, vernierMat2);
    vernierRing2.rotation.y = Math.PI / 3;
    monolithGroup.add(vernierRing2);

    // 5. Quantum Logic Sparks (Tokens in Flight)
    const sparkCount = 280;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      const radius = 2.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      sparkPos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      sparkPos[i * 3 + 1] = radius * Math.sin(phi);
      sparkPos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      // Amber, bone-white, and cyan sparks
      const rnd = Math.random();
      if (rnd < 0.6) {
        sparkColors[i * 3] = 0.96; sparkColors[i * 3 + 1] = 0.62; sparkColors[i * 3 + 2] = 0.04; // Amber #f59e0b
      } else if (rnd < 0.85) {
        sparkColors[i * 3] = 0.95; sparkColors[i * 3 + 1] = 0.95; sparkColors[i * 3 + 2] = 0.98; // Bone white
      } else {
        sparkColors[i * 3] = 0.22; sparkColors[i * 3 + 1] = 0.74; sparkColors[i * 3 + 2] = 0.97; // Cyan
      }
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    monolithGroup.add(sparks);

    // Ambient and Point Lights for physical dielectric material
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0xf59e0b, 4.5, 18);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 3.0, 16);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    // Mouse tracking with fluid inertia
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.65;
      targetY = y * 0.65;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const speedMultiplier = prefersReducedMotion ? 0.08 : 1.0;

      // Dynamics based on thinkingLevel
      let rotSpeed = 0.35 * speedMultiplier;
      let pulseSpeed = 2.4;

      if (thinkingLevel === 'high') {
        rotSpeed = 0.75 * speedMultiplier;
        pulseSpeed = 4.8;
        keyLight.intensity = 6.0;
        coreMat.color.setHex(0xf59e0b);
        wireMat.color.setHex(0xfbbf24);
      } else if (thinkingLevel === 'medium') {
        rotSpeed = 0.42 * speedMultiplier;
        pulseSpeed = 2.6;
        keyLight.intensity = 3.5;
        coreMat.color.setHex(0x38bdf8);
        wireMat.color.setHex(0x38bdf8);
      } else {
        rotSpeed = 0.2 * speedMultiplier;
        pulseSpeed = 1.2;
        keyLight.intensity = 1.5;
        coreMat.color.setHex(0x64748b);
        wireMat.color.setHex(0x475569);
      }

      // Smooth inertia
      mouseX += (targetX - mouseX) * 0.045;
      mouseY += (targetY - mouseY) * 0.045;

      monolithGroup.rotation.y += rotSpeed * delta;
      monolithGroup.rotation.x = mouseY * 0.75;
      monolithGroup.rotation.z = mouseX * 0.55;

      // Vernier counter-rotations
      vernierRing1.rotation.z += 0.35 * speedMultiplier * delta;
      vernierRing2.rotation.z -= 0.45 * speedMultiplier * delta;
      spectralGroup.rotation.z -= 0.6 * speedMultiplier * delta;
      sparks.rotation.y += 0.15 * speedMultiplier * delta;

      // Plasma Core breathing
      const scale = 1.0 + Math.sin(time * pulseSpeed) * 0.18;
      coreMesh.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      prismGeo.dispose();
      prismMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      vernierGeo1.dispose();
      vernierMat1.dispose();
      vernierGeo2.dispose();
      vernierMat2.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
    };
  }, [thinkingLevel]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden pointer-events-auto ${className}`}
      style={{ touchAction: 'pan-y' }}
      aria-label="Gemini 3.8 Flash 光學稜鏡與超驗思維核心 3D 視覺"
    />
  );
};
