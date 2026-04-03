import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  color?: string;
  size?: number;
};

export default function StatsSpark({ color = '#0ea5e9', size = 120 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 50;

    const geometry = new THREE.BufferGeometry();
    const count = 60;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 18;
      positions[i * 3 + 0] = Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.sin(theta) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({ color, size: 3, sizeAttenuation: true, transparent: true, opacity: 0.9 });
    const points = new THREE.Points(geometry, mat);
    scene.add(points);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const clock = new THREE.Clock();

    const onResize = () => {
      const w = el.clientWidth || size;
      const h = el.clientHeight || size;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    onResize();
    window.addEventListener('resize', onResize);

    const loop = () => {
      const t = clock.getElapsedTime();
      points.rotation.z = t * 0.2;
      points.rotation.y = Math.sin(t * 0.3) * 0.1;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
    };
  }, [color, size]);

  return <div ref={ref} style={{ width: size, height: size, position: 'absolute', right: -18, bottom: -18, pointerEvents: 'none', opacity: 0.9 }} />;
}
