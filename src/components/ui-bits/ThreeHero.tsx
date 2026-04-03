import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHero({ width = 320, height = 160 }: { width?: number; height?: number }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // particles
    const geom = new THREE.BufferGeometry();
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({ size: 1.4, color: 0xffffff, transparent: true, opacity: 0.9 });
    const points = new THREE.Points(geom, mat);
    scene.add(points);

    const light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    let frameId: number;

    const animate = () => {
      points.rotation.y += 0.002;
      points.rotation.x += 0.001;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const w = width;
      const h = height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geom.dispose();
      mat.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [width, height]);

  return <div ref={mountRef} className="rounded overflow-hidden" style={{ width, height }} />;
}
