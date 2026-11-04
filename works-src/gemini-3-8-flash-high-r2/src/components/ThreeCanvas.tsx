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

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / Math.max(height, 1), 0.1, 1000);
    camera.position.z = 7.0;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Root Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 1. Central Icosahedron Wireframe
    const innerGeo = new THREE.IcosahedronGeometry(1.65, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // 2. High-Energy Nucleus (Glowing core)
    const nucleusGeo = new THREE.SphereGeometry(0.72, 32, 32);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0xe09f3e,
      transparent: true,
      opacity: 0.9,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleusMesh);

    // 3. Outer Octahedral Resonator
    const outerGeo = new THREE.OctahedronGeometry(2.45, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerMesh);

    // 4. Dual Gyroscopic Orbital Rings
    const ringGeo = new THREE.RingGeometry(2.85, 2.9, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.8;
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
    ring2.rotation.x = -Math.PI / 3.2;
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // 5. Dynamic Synaptic Plexus (Neural Thought Nodes + Interconnecting Filaments)
    const nodeCount = 90;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const radius = 2.0 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      nodePositions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      nodePositions[i * 3 + 1] = radius * Math.sin(phi);
      nodePositions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    coreGroup.add(nodePoints);

    // Synaptic Connecting Filaments
    const maxLines = 160;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    coreGroup.add(lineSegments);

    // 6. Ambient Particle Dust (Token Galaxy)
    const dustCount = 420;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const radius = 2.8 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      dustPos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      dustPos[i * 3 + 1] = radius * Math.sin(phi);
      dustPos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const cType = Math.random();
      if (cType < 0.5) {
        dustColors[i * 3] = 0.22; dustColors[i * 3 + 1] = 0.74; dustColors[i * 3 + 2] = 0.97;
      } else if (cType < 0.8) {
        dustColors[i * 3] = 0.98; dustColors[i * 3 + 1] = 0.75; dustColors[i * 3 + 2] = 0.14;
      } else {
        dustColors[i * 3] = 0.66; dustColors[i * 3 + 1] = 0.33; dustColors[i * 3 + 2] = 0.97;
      }
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    coreGroup.add(dust);

    // Mouse coordinates interaction with inertia
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.5;
      targetY = y * 0.5;
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

      let rotSpeed = 0.35 * speedMultiplier;
      let pulseSpeed = 2.0;

      if (thinkingLevel === 'high') {
        rotSpeed = 0.85 * speedMultiplier;
        pulseSpeed = 4.2;
        nucleusMat.color.setHex(0xe09f3e);
        innerMat.color.setHex(0x38bdf8);
        nodeMat.color.setHex(0xfbbf24);
        lineMat.color.setHex(0x38bdf8);
      } else if (thinkingLevel === 'medium') {
        rotSpeed = 0.45 * speedMultiplier;
        pulseSpeed = 2.5;
        nucleusMat.color.setHex(0x38bdf8);
        innerMat.color.setHex(0x818cf8);
        nodeMat.color.setHex(0x38bdf8);
        lineMat.color.setHex(0x818cf8);
      } else {
        rotSpeed = 0.22 * speedMultiplier;
        pulseSpeed = 1.2;
        nucleusMat.color.setHex(0x64748b);
        innerMat.color.setHex(0x38bdf8);
        nodeMat.color.setHex(0x94a3b8);
        lineMat.color.setHex(0x475569);
      }

      // Smooth inertia
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      coreGroup.rotation.y += rotSpeed * delta;
      coreGroup.rotation.x = mouseY * 0.65;
      coreGroup.rotation.z = mouseX * 0.45;

      ring1.rotation.z += 0.4 * speedMultiplier * delta;
      ring2.rotation.z -= 0.5 * speedMultiplier * delta;
      outerMesh.rotation.y -= 0.22 * speedMultiplier * delta;
      dust.rotation.y += 0.12 * speedMultiplier * delta;

      // Nucleus breathing
      const scale = 1.0 + Math.sin(time * pulseSpeed) * 0.15;
      nucleusMesh.scale.set(scale, scale, scale);

      // Update Synaptic Node positions & compute line filaments
      const posAttr = nodeGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const linePosAttr = lineGeo.attributes.position as THREE.BufferAttribute;
      const lPositions = linePosAttr.array as Float32Array;

      let lineCount = 0;
      const connectionDist = 1.15;

      for (let i = 0; i < nodeCount; i++) {
        // Subtle drift
        positions[i * 3] += nodeVelocities[i].x * speedMultiplier;
        positions[i * 3 + 1] += nodeVelocities[i].y * speedMultiplier;
        positions[i * 3 + 2] += nodeVelocities[i].z * speedMultiplier;

        // Bounce within spherical shell
        const dist = Math.sqrt(
          positions[i * 3] ** 2 +
          positions[i * 3 + 1] ** 2 +
          positions[i * 3 + 2] ** 2
        );
        if (dist > 3.6 || dist < 1.8) {
          nodeVelocities[i].x *= -1;
          nodeVelocities[i].y *= -1;
          nodeVelocities[i].z *= -1;
        }

        // Connect adjacent nodes
        if (lineCount < maxLines) {
          for (let j = i + 1; j < nodeCount; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (d < connectionDist) {
              lPositions[lineCount * 6] = positions[i * 3];
              lPositions[lineCount * 6 + 1] = positions[i * 3 + 1];
              lPositions[lineCount * 6 + 2] = positions[i * 3 + 2];
              lPositions[lineCount * 6 + 3] = positions[j * 3];
              lPositions[lineCount * 6 + 4] = positions[j * 3 + 1];
              lPositions[lineCount * 6 + 5] = positions[j * 3 + 2];
              lineCount++;
              if (lineCount >= maxLines) break;
            }
          }
        }
      }

      // Zero out unused lines
      for (let k = lineCount * 6; k < maxLines * 6; k++) {
        lPositions[k] = 0;
      }

      posAttr.needsUpdate = true;
      linePosAttr.needsUpdate = true;

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
      innerGeo.dispose();
      innerMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, [thinkingLevel]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden pointer-events-auto ${className}`}
      style={{ touchAction: 'pan-y' }}
      aria-label="Gemini 3.8 Flash 3D 量子神經思維核心視覺"
    />
  );
};
