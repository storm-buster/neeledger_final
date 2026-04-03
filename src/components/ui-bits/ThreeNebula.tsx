import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;

  // Simple hash and noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    for(int i=0;i<5;i++){
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main(){
    vec2 uv = vUv * uResolution.xy / min(uResolution.x, uResolution.y);
    vec2 p = uv * 0.9;
    float t = uTime * 0.08;
    float q = fbm(p + vec2(0.0, t));
    float r = fbm(p * 1.6 - vec2(t*0.5, t*0.3));
    float c = smoothstep(0.12, 0.7, q*0.6 + r*0.4);
    vec3 colA = vec3(0.03, 0.12, 0.22);
    vec3 colB = vec3(0.04, 0.45, 0.78);
    vec3 colC = vec3(0.78, 0.33, 0.66);
    vec3 color = mix(colA, colB, c);
    color = mix(color, colC, pow(max(0.0, q), 2.0)*0.12);
    float vignette = smoothstep(0.95, 0.3, distance(vUv, vec2(0.5)));
    color *= 1.0 - (1.0 - vignette)*0.45;
    gl_FragColor = vec4(color, 0.9 * (0.45 + 0.55 * c));
  }
`;

export default function ThreeNebula({ height = 360 }: { height?: number }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const width = el.clientWidth || window.innerWidth;
    const heightPx = height;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, heightPx);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = `${heightPx}px`;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, heightPx / 2, -heightPx / 2, -1000, 1000);
    camera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(width, heightPx);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, heightPx) }
      }
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function onResize() {
      const w = el.clientWidth || window.innerWidth;
      const h = heightPx;
      renderer.setSize(w, h);
      (material.uniforms.uResolution.value as THREE.Vector2).set(w, h);
      camera.left = -w/2; camera.right = w/2; camera.top = h/2; camera.bottom = -h/2; camera.updateProjectionMatrix();
    }

    let start = performance.now();
    function animate(now: number) {
      const t = (now - start) * 0.001;
      material.uniforms.uTime.value = t;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      try { el.removeChild(renderer.domElement); } catch (e) {}
    };
  }, [height]);

  return (
    <div ref={mountRef} style={{ width: '100%', height, position: 'relative', zIndex: -12 }} aria-hidden />
  );
}
