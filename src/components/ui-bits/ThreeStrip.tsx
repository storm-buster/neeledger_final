import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeStrip({ height = 120 }: { height?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = ref.current;
    if (!container) return;

    const w = container.clientWidth || 800;
    const h = typeof height === 'number' && height > 0 ? height : 120;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 0, 120);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(Math.max(1, w), Math.max(1, h));
      container.appendChild(renderer.domElement);
    } catch (err) {
      // fail gracefully if WebGL isn't available or container is invalid
      // eslint-disable-next-line no-console
      console.warn('ThreeStrip: renderer init failed', err);
      return;
    }

    const ptsGeom = new THREE.BufferGeometry();
    const count = 220;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * w * 0.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * h * 0.45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    ptsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const ptsMat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 1.6, transparent: true, opacity: 0.9 });
    const points = new THREE.Points(ptsGeom, ptsMat);
    scene.add(points);

    // soft moving waves - a thin plane with subtle vertex displacement
    const planeGeom = new THREE.PlaneGeometry(w * 0.9, h * 0.9, 32, 8);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0x072033, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.x = Math.PI;
    plane.position.z = -20;
    scene.add(plane);

    function onResize() {
      const nw = container.clientWidth || 800;
      camera.aspect = nw / h;
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(1, nw), Math.max(1, h));
    }

    let last = performance.now();
    function animate(t: number) {
      const dt = (t - last) * 0.001;
      last = t;
      points.rotation.z += 0.01 * dt * 60;
      const posAttr = ptsGeom.getAttribute('position') as THREE.BufferAttribute;
      // update Y values directly on the underlying array for compatibility
      const arr = posAttr.array as Float32Array;
      const itemSize = posAttr.itemSize || 3;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const idx = i * itemSize + 1; // Y component
        arr[idx] = arr[idx] + Math.sin((t * 0.002) + i) * 0.0008;
      }
      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', onResize);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [height]);

  return (
    <div ref={ref} style={{ width: '100%', height, overflow: 'hidden', borderRadius: 12 }} aria-hidden />
  );
}
