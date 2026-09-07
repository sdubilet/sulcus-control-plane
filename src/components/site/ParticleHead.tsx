import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function makeDotTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

/** Deform a unit-sphere direction into a stylized human head/neck silhouette. */
function headPoint(dir: THREE.Vector3, r: number) {
  const p = dir.clone();
  // cranium proportions: narrower across ears, longer front-to-back
  p.x *= 0.78;
  p.y *= 1.0;
  p.z *= 0.92;
  // jaw / chin taper below the equator
  if (p.y < 0) {
    const t = Math.min(1, -p.y);
    const taper = 1 - 0.42 * t * t;
    p.x *= taper;
    p.z *= taper * (p.z > 0 ? 1.06 : 0.9);
  }
  // slight flattening of the back of the skull
  if (p.z < -0.55) p.z *= 0.93;
  return p.multiplyScalar(r);
}

function buildPositions(count: number) {
  const pos = new Float32Array(count * 3);
  const rnd = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const v = new THREE.Vector3();

  const neckCount = Math.floor(count * 0.12);
  const headCount = count - neckCount;

  for (let i = 0; i < headCount; i++) {
    const y = 1 - (i / (headCount - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    v.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
    // slight shell thickness so it reads as a scan, not a shell
    const shell = 1 - Math.random() * Math.random() * 0.16;
    const p = headPoint(v, shell);
    pos[i * 3] = p.x;
    pos[i * 3 + 1] = p.y;
    pos[i * 3 + 2] = p.z;
    rnd[i] = Math.random();
  }

  for (let i = 0; i < neckCount; i++) {
    const idx = headCount + i;
    const a = Math.random() * Math.PI * 2;
    const rr = 0.34 * (0.9 + Math.random() * 0.1);
    const yy = -0.95 - Math.random() * 0.3;
    pos[idx * 3] = Math.cos(a) * rr;
    pos[idx * 3 + 1] = yy;
    pos[idx * 3 + 2] = Math.sin(a) * rr * 1.05;
    rnd[idx] = Math.random();
  }

  return { pos, rnd };
}

function HeadCloud({
  count,
  progressRef,
}: {
  count: number;
  progressRef: React.MutableRefObject<number>;
}) {
  const points = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const texture = useMemo(() => makeDotTexture(), []);
  const { pos, rnd } = useMemo(() => buildPositions(count), [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, [pos, rnd]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const p = progressRef.current;
    if (points.current) {
      points.current.rotation.y += delta * 0.12;
      points.current.rotation.x = 0.55;
      // dive: cloud opens up and drifts apart as the camera pushes through
      const s = 0.92 + p * 0.85;
      points.current.scale.setScalar(s);
      const mat = points.current.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, 0.8 - p * 1.0);
      mat.size = 0.019 + p * 0.012;
    }
    // camera dives forward through the head
    camera.position.z = 5.3 - p * 5.5;
    camera.position.y = 2.1 - p * 2.0;
    camera.position.x = -0.6;
    camera.lookAt(-0.6, p * 0.15, 0);
    state.camera.updateProjectionMatrix();
  });

  return (
    <points ref={points} geometry={geometry} position={[1.5, 0.1, 0]}>
      <pointsMaterial
        map={texture}
        size={0.019}
        sizeAttenuation
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={new THREE.Color("#ffffff")}
      />
    </points>
  );
}

export function ParticleHead({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(16000);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const small = window.innerWidth < 768;
    setCount(small ? 6000 : 18000);
    setReady(true);
  }, []);

  if (!ready || reduced) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(38% 46% at 60% 42%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 45%, transparent 72%)",
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [-0.6, 2.1, 5.3], fov: 45 }}
      >
        <HeadCloud count={count} progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
