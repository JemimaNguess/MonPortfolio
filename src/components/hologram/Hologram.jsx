'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { buildParticles } from './buildParticles';
import { faceVertex, faceFragment, discFragment, beamFragment, basicVertex } from './shaders';

// Où se place l'hologramme selon la scène (x, y, échelle). Mobile : toujours centré.
// fx = position horizontale en fraction de la largeur visible
const LAYOUTS = {
  center: { fx: 0, y: 0, s: 1 },
  left: { fx: -0.31, y: 0, s: 0.85 },
  right: { fx: 0.33, y: 0.4, s: 0.5 },
  small: { fx: 0, y: 0.15, s: 0.62 },
  corner: { fx: 0.36, y: -0.2, s: 0.55 },
  hidden: { fx: 0, y: -0.6, s: 0.001 },
};

function Face({ image, speaking, glitchAt, assembleKey }) {
  const { size, gl } = useThree();
  const [geometry, setGeometry] = useState(null);
  const [spacing, setSpacing] = useState(0.02);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uProgress: { value: 0 }, uSize: { value: 4 }, uGlitch: { value: 0 }, uSpeak: { value: 0 },
  }), []);
  const state = useRef({ start: performance.now(), glitchUntil: 0, nextAuto: performance.now() + 4000 });
  const mat = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      const rows = window.innerWidth < 700 ? 150 : 200;
      const { geometry: g, spacing: sp } = buildParticles(img, { rows });
      setGeometry((old) => { old?.dispose(); return g; });
      setSpacing(sp);
      state.current.start = performance.now();
    };
    img.src = image;
    return () => { cancelled = true; };
  }, [image]);

  useEffect(() => { state.current.start = performance.now(); }, [assembleKey]);
  useEffect(() => { if (glitchAt) state.current.glitchUntil = performance.now() + 450; }, [glitchAt]);

  useEffect(() => {
    // Taille des points : proportionnelle à l'espacement et à la hauteur de l'écran
    const pxPerUnit = (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(38 / 2)) * 5);
    uniforms.uSize.value = Math.max(1.5, spacing * pxPerUnit * 1.05);
    if (mat.current) mat.current.uniforms.uSize.value = uniforms.uSize.value;
  }, [size.height, spacing, gl, uniforms, geometry]);

  useFrame(({ clock }) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    const now = performance.now();
    const s = state.current;
    u.uTime.value = clock.elapsedTime;
    u.uProgress.value = Math.min(1, (now - s.start) / 3200);
    if (now > s.nextAuto) { s.glitchUntil = now + 140 + Math.random() * 160; s.nextAuto = now + 3500 + Math.random() * 5000; }
    u.uGlitch.value = now < s.glitchUntil ? 1 : 0;
    u.uSpeak.value += ((speaking ? 1 : 0) - u.uSpeak.value) * 0.1;
    u.uSize.value = uniforms.uSize.value;
  });

  if (!geometry) return null;
  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={faceVertex}
        fragmentShader={faceFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Projector() {
  const ring = useRef();
  const ring2 = useRef();
  const dust = useRef();
  const discMat = useRef();
  const beamMat = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const count = 320;
  const { positions, speeds } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * 1.5;
      p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = Math.random() * 3.8; p[i * 3 + 2] = Math.sin(a) * r;
      sp[i] = 0.08 + Math.random() * 0.25;
    }
    return { positions: p, speeds: sp };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (discMat.current) discMat.current.uniforms.uTime.value = t;
    if (beamMat.current) beamMat.current.uniforms.uTime.value = t;
    if (ring.current) { ring.current.rotation.z = t * 0.3; ring.current.material.opacity = 0.75 + 0.25 * Math.sin(t * 2); }
    if (ring2.current) ring2.current.rotation.z = -t * 0.45;
    if (dust.current) {
      const arr = dust.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] += speeds[i] * 0.008;
        if (arr[i * 3 + 1] > 3.8) arr[i * 3 + 1] = 0;
      }
      dust.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, -1.55, 0]}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.012, 8, 128]} />
        <meshBasicMaterial color="#b9a7ff" transparent opacity={0.9} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.008, 8, 128]} />
        <meshBasicMaterial color="#ffb4a2" transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <circleGeometry args={[1.25, 64]} />
        <shaderMaterial ref={discMat} vertexShader={basicVertex} fragmentShader={discFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[1.55, 0.95, 3.6, 64, 1, true]} />
        <shaderMaterial ref={beamMat} vertexShader={basicVertex} fragmentShader={beamFragment} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#d9ceff" size={0.022} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

function Rig({ layout, children }) {
  const group = useRef();
  const pointer = useRef({ x: 0, y: 0 });
  const { size, camera } = useThree();
  const mobile = size.width < 900;

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const target = LAYOUTS[layout] || LAYOUTS.center;
    // largeur visible au plan z = 0
    const visibleW = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
    const tx = mobile ? 0 : target.fx * visibleW;
    const ts = mobile && layout !== 'hidden' ? Math.min(target.s, 0.95) : target.s;
    const hiding = layout === 'hidden';
    const dt = Math.min(delta, 0.1);
    const k = 1 - Math.exp(-dt * (hiding ? 10 : 3));
    g.position.x += (tx - g.position.x) * k;
    g.position.y += (target.y - 0.2 + Math.sin(t * 0.9) * 0.03 - g.position.y) * k;
    const s = g.scale.x + (ts - g.scale.x) * (1 - Math.exp(-dt * (hiding ? 12 : 3.5)));
    g.scale.setScalar(Math.max(0.001, s));
    g.visible = s > 0.04;
    g.rotation.y += (pointer.current.x * 0.7 + Math.sin(t * 0.35) * 0.12 - g.rotation.y) * k;
    g.rotation.x += (pointer.current.y * 0.25 - g.rotation.x) * k;
  });

  return <group ref={group} position={[0, -0.2, 0]}>{children}</group>;
}

function CameraSetup() {
  const { camera, size } = useThree();
  useEffect(() => {
    const portrait = size.height > size.width;
    const ty = portrait ? -1.25 : -0.95;
    camera.position.set(0, ty + 0.25, portrait ? 8.2 : 6.2);
    camera.lookAt(0, ty, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function Hologram({ image = '/holo/portrait.png', layout = 'center', speaking = false, glitchAt = 0, assembleKey = 0 }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 38, near: 0.1, far: 100, position: [0, 0, 6] }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      aria-hidden="true"
    >
      <color attach="background" args={['#07060d']} />
      <fogExp2 attach="fog" args={['#07060d', 0.03]} />
      <CameraSetup />
      <Rig layout={layout}>
        <group position={[0, -0.1, 0]}>
          <Face image={image} speaking={speaking} glitchAt={glitchAt} assembleKey={assembleKey} />
        </group>
        <Projector />
      </Rig>
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.2} luminanceSmoothing={0.45} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
