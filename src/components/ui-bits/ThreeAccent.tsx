import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeAccent({ size = 320 }: { size?: number }) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (typeof window === 'undefined') return;

    const container = canvasRef.current;
    const w = container.clientWidth || size;
    const h = container.clientHeight || size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 0, 180);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0x86efac, 0.9);
    light.position.set(200, 100, 100);
    scene.add(light);

    const amb = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(amb);

    const geom = new THREE.IcosahedronGeometry(48, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0ea5ff, metalness: 0.2, roughness: 0.35, emissive: 0x0b5670, emissiveIntensity: 0.12 });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);

    // soft particle/point cloud around
    const ptsGeom = new THREE.BufferGeometry();
    const count = 180;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 320;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    ptsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const ptsMat = new THREE.PointsMaterial({ color: 0x7dd3fc, size: 2, transparent: true, opacity: 0.9 });
    const points = new THREE.Points(ptsGeom, ptsMat);
    scene.add(points);

    function onResize() {
      const nw = container.clientWidth || size;
      const nh = container.clientHeight || size;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }

    let last = 0;
    function animate(t: number) {
      const dt = (t - last) * 0.001;
      last = t;
      mesh.rotation.y += 0.6 * dt;
      mesh.rotation.x += 0.2 * dt;
      points.rotation.y -= 0.12 * dt;
      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', onResize);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      // remove canvas
      if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [size]);

  return <div ref={canvasRef} style={{ width: '100%', height: size, minHeight: size, overflow: 'hidden', borderRadius: 12 }} aria-hidden />;
}
