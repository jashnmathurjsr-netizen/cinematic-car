import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type ModelProgress = { value: number; motion?: number };
type Point3 = [number, number, number];

function buildLowerBody() {
  const shape = new THREE.Shape();
  shape.moveTo(-2.48, 0.08);
  shape.lineTo(-2.42, 0.24);
  shape.quadraticCurveTo(-2.18, 0.39, -1.91, 0.39);
  shape.quadraticCurveTo(-1.55, 0.36, -1.19, 0.3);
  shape.lineTo(-0.58, 0.29);
  shape.quadraticCurveTo(0.06, 0.37, 0.66, 0.39);
  shape.quadraticCurveTo(1.28, 0.4, 1.76, 0.3);
  shape.quadraticCurveTo(2.18, 0.21, 2.48, 0.08);
  shape.lineTo(2.15, -0.07);
  shape.lineTo(1.91, -0.07);
  shape.quadraticCurveTo(1.8, 0.58, 1.36, 0.65);
  shape.quadraticCurveTo(0.92, 0.58, 0.81, -0.07);
  shape.lineTo(-0.81, -0.07);
  shape.quadraticCurveTo(-0.92, 0.58, -1.36, 0.65);
  shape.quadraticCurveTo(-1.8, 0.58, -1.91, -0.07);
  shape.lineTo(-2.19, -0.07);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1.44,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.045,
    bevelThickness: 0.055,
    curveSegments: 18,
  });
  geometry.translate(0, 0, -0.72);
  geometry.computeVertexNormals();
  return geometry;
}

function buildCanopy() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.47, 0.34);
  shape.quadraticCurveTo(-1.29, 0.64, -1.02, 0.91);
  shape.quadraticCurveTo(-0.72, 1.19, -0.31, 1.22);
  shape.quadraticCurveTo(0.12, 1.2, 0.42, 0.99);
  shape.quadraticCurveTo(0.73, 0.72, 0.94, 0.35);
  shape.lineTo(-1.47, 0.34);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.94,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    curveSegments: 18,
  });
  geometry.translate(0, 0, -0.47);
  geometry.computeVertexNormals();
  return geometry;
}

function buildSideWindow() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.28, 0.41);
  shape.quadraticCurveTo(-1.03, 0.79, -0.75, 0.98);
  shape.quadraticCurveTo(-0.34, 1.12, 0.01, 1.03);
  shape.quadraticCurveTo(0.42, 0.87, 0.72, 0.42);
  shape.quadraticCurveTo(0.05, 0.48, -0.45, 0.45);
  shape.closePath();
  return new THREE.ShapeGeometry(shape, 24);
}

function buildQuad(points: Point3[]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(points.flat(), 3),
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return geometry;
}

function buildSideIntake() {
  const shape = new THREE.Shape();
  shape.moveTo(0.78, 0.31);
  shape.quadraticCurveTo(0.42, 0.2, 0.04, 0.15);
  shape.quadraticCurveTo(-0.36, 0.11, -0.62, 0.04);
  shape.quadraticCurveTo(-0.43, 0.27, -0.08, 0.34);
  shape.quadraticCurveTo(0.4, 0.42, 0.78, 0.31);
  return new THREE.ShapeGeometry(shape, 18);
}

function buildTube(points: Point3[], radius: number) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  return new THREE.TubeGeometry(curve, 32, radius, 8, false);
}

function Wheel({
  x,
  side,
  progress,
}: {
  x: number;
  side: number;
  progress: ModelProgress;
}) {
  const turning = useRef<THREE.Group>(null);

  useFrame(() => {
    if (turning.current) {
      turning.current.rotation.y = progress.value * (x > 0 ? 0.48 : 0.29);
    }
  });

  return (
    <group position={[x, 0.26, side * 0.75]} rotation={[side * Math.PI / 2, 0, 0]}>
      <group ref={turning}>
        <mesh castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.25, 48]} />
          <meshStandardMaterial color="#080a0c" metalness={0.28} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.135, 0]}>
          <cylinderGeometry args={[0.276, 0.276, 0.025, 40]} />
          <meshStandardMaterial color="#24292c" metalness={0.88} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0.153, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.291, 0.022, 10, 48]} />
          <meshStandardMaterial color="#9da4a3" metalness={0.96} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.153, 0]}>
          <cylinderGeometry args={[0.235, 0.235, 0.014, 36]} />
          <meshStandardMaterial color="#747b7c" metalness={0.84} roughness={0.31} />
        </mesh>
        {Array.from({ length: 10 }, (_, index) => (
          <mesh
            key={index}
            position={[0, 0.169, 0]}
            rotation={[0, (index / 10) * Math.PI * 2, 0]}
          >
            <boxGeometry args={[0.027, 0.025, 0.245]} />
            <meshStandardMaterial color="#c0c7c5" metalness={0.92} roughness={0.21} />
          </mesh>
        ))}
        <mesh position={[0, 0.177, 0]}>
          <cylinderGeometry args={[0.074, 0.074, 0.04, 28]} />
          <meshStandardMaterial color="#c6ccca" metalness={0.95} roughness={0.19} />
        </mesh>
        <mesh position={[0.17, 0.14, 0]}>
          <boxGeometry args={[0.075, 0.12, 0.08]} />
          <meshStandardMaterial color="#f07832" metalness={0.52} roughness={0.32} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Hand-built McLaren 720S visual model. This stays behind the same root
 * transform contract as a future GLB replacement, so the film rig is unchanged.
 */
export function VehicleModel({ progress }: { progress: ModelProgress }) {
  const root = useRef<THREE.Group>(null);
  const activeWing = useRef<THREE.Group>(null);

  const bodyGeometry = useMemo(buildLowerBody, []);
  const canopyGeometry = useMemo(buildCanopy, []);
  const windowGeometry = useMemo(buildSideWindow, []);
  const intakeGeometry = useMemo(buildSideIntake, []);
  const windshieldGeometry = useMemo(
    () =>
      buildQuad([
        [0.84, 0.39, -0.57],
        [0.84, 0.39, 0.57],
        [0.34, 1.15, 0.405],
        [0.34, 1.15, -0.405],
      ]),
    [],
  );
  const rearGlassGeometry = useMemo(
    () =>
      buildQuad([
        [-1.29, 0.4, -0.55],
        [-1.29, 0.4, 0.55],
        [-0.48, 1.15, 0.405],
        [-0.48, 1.15, -0.405],
      ]),
    [],
  );
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ed6128',
        metalness: 0.68,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.13,
      }),
    [],
  );
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#10171a',
        metalness: 0.27,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const intakeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#06090a',
        metalness: 0.42,
        roughness: 0.46,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const detailGeometries = useMemo(
    () =>
      [-1, 1].map((side) => ({
        side,
        intake: intakeGeometry,
        doorSeam: buildTube(
          [
            [0.47, 0.35, side * 0.79],
            [0.17, 0.31, side * 0.79],
            [-0.46, 0.27, side * 0.79],
            [-0.78, 0.18, side * 0.79],
          ],
          0.007,
        ),
        shoulderLine: buildTube(
          [
            [1.62, 0.42, side * 0.69],
            [0.88, 0.44, side * 0.73],
            [0.04, 0.41, side * 0.74],
            [-0.93, 0.39, side * 0.69],
            [-1.75, 0.39, side * 0.61],
          ],
          0.009,
        ),
        headlight: buildTube(
          [
            [2.15, 0.35, side * 0.32],
            [2.24, 0.38, side * 0.43],
            [2.34, 0.35, side * 0.55],
            [2.39, 0.3, side * 0.59],
          ],
          0.012,
        ),
      })),
    [intakeGeometry],
  );

  useFrame(() => {
    if (root.current) {
      root.current.rotation.y = -0.025 + Math.sin(progress.value * Math.PI * 1.2) * 0.075;
    }
    if (activeWing.current) {
      const deployment = THREE.MathUtils.clamp((progress.motion ?? 0) * 1.35, 0, 1);
      activeWing.current.scale.y = 0.1 + deployment * 0.9;
    }
  });

  return (
    <group ref={root}>
      <mesh
        geometry={bodyGeometry}
        castShadow
        receiveShadow
        material={bodyMaterial}
      />
      <mesh
        geometry={canopyGeometry}
        castShadow
        receiveShadow
        material={glassMaterial}
      />

      {[-1, 1].map((side) => (
        <group key={`side-${side}`}>
          <mesh
            geometry={windowGeometry}
            position={[0, 0, side * 0.515]}
            material={glassMaterial}
          />
          <mesh
            geometry={intakeGeometry}
            position={[0, 0, side * 0.79]}
            material={intakeMaterial}
          />
          <mesh geometry={detailGeometries[side === 1 ? 1 : 0].doorSeam}>
            <meshBasicMaterial color="#171c1e" />
          </mesh>
          <mesh geometry={detailGeometries[side === 1 ? 1 : 0].shoulderLine}>
            <meshStandardMaterial
              color="#ffad68"
              emissive="#7a2f14"
              emissiveIntensity={0.28}
              metalness={0.76}
              roughness={0.2}
            />
          </mesh>
          <mesh geometry={detailGeometries[side === 1 ? 1 : 0].headlight}>
            <meshStandardMaterial
              color="#dae3e1"
              emissive="#a8c4c5"
              emissiveIntensity={1.1}
              metalness={0.45}
              roughness={0.18}
            />
          </mesh>
          <mesh
            position={[0.06, 0.01, side * 0.786]}
            rotation={[0, 0, -0.035]}
          >
            <boxGeometry args={[1.68, 0.075, 0.11]} />
            <meshStandardMaterial color="#101416" metalness={0.72} roughness={0.33} />
          </mesh>
          <mesh position={[0.35, 0.51, side * 0.57]} rotation={[0, side * 0.18, 0.12]}>
            <sphereGeometry args={[0.13, 20, 14]} />
            <meshPhysicalMaterial color="#252b2d" metalness={0.76} roughness={0.2} clearcoat={1} />
          </mesh>
          <mesh position={[-2.34, 0.24, side * 0.48]}>
            <boxGeometry args={[0.035, 0.035, 0.31]} />
            <meshStandardMaterial
              color="#f25b43"
              emissive="#b52219"
              emissiveIntensity={0.7}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}

      <mesh geometry={windshieldGeometry} material={glassMaterial} />
      <mesh geometry={rearGlassGeometry} material={glassMaterial} />

      {[-1, 1].map((side) => (
        <mesh
          key={`lamp-pocket-${side}`}
          position={[2.34, 0.22, side * 0.44]}
          rotation={[0, side * -0.18, side * -0.12]}
          scale={[0.15, 0.035, 0.22]}
        >
          <sphereGeometry args={[1, 28, 18]} />
          <meshStandardMaterial color="#080b0d" metalness={0.46} roughness={0.3} />
        </mesh>
      ))}

      <mesh position={[2.36, 0.025, 0]} castShadow>
        <boxGeometry args={[0.28, 0.045, 1.54]} />
        <meshStandardMaterial color="#111517" metalness={0.74} roughness={0.31} />
      </mesh>
      <mesh position={[2.39, 0.07, 0]}>
        <boxGeometry args={[0.09, 0.15, 0.72]} />
        <meshStandardMaterial color="#07090a" metalness={0.24} roughness={0.51} />
      </mesh>

      <mesh position={[-0.06, -0.045, 0]} castShadow>
        <boxGeometry args={[3.45, 0.075, 1.15]} />
        <meshStandardMaterial color="#090c0e" metalness={0.65} roughness={0.38} />
      </mesh>
      <mesh position={[-2.18, 0.015, 0]}>
        <boxGeometry args={[0.45, 0.1, 1.18]} />
        <meshStandardMaterial color="#0a0d0f" metalness={0.68} roughness={0.38} />
      </mesh>
      {[-0.46, -0.23, 0, 0.23, 0.46].map((z) => (
        <mesh key={`diffuser-${z}`} position={[-2.39, -0.015, z]}>
          <boxGeometry args={[0.18, 0.035, 0.024]} />
          <meshStandardMaterial color="#747d7e" metalness={0.86} roughness={0.28} />
        </mesh>
      ))}

      {[-1, 1].map((side) => (
        <mesh
          key={`exhaust-${side}`}
          position={[-2.42, 0.18, side * 0.24]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.073, 0.073, 0.085, 28]} />
          <meshStandardMaterial color="#a9afb0" metalness={0.94} roughness={0.22} />
        </mesh>
      ))}

      <group ref={activeWing} position={[-2.0, 0.37, 0]}>
        <mesh position={[0.02, 0.16, -0.39]}>
          <boxGeometry args={[0.055, 0.3, 0.05]} />
          <meshStandardMaterial color="#202628" metalness={0.82} roughness={0.25} />
        </mesh>
        <mesh position={[0.02, 0.16, 0.39]}>
          <boxGeometry args={[0.055, 0.3, 0.05]} />
          <meshStandardMaterial color="#202628" metalness={0.82} roughness={0.25} />
        </mesh>
        <mesh position={[-0.015, 0.31, 0]} castShadow>
          <boxGeometry args={[0.42, 0.045, 1.05]} />
          <meshStandardMaterial color="#22282a" metalness={0.82} roughness={0.26} />
        </mesh>
      </group>

      {[-1, 1].flatMap((side) =>
        [-1.36, 1.36].map((x) => (
          <Wheel
            key={`wheel-${side}-${x}`}
            x={x}
            side={side}
            progress={progress}
          />
        )),
      )}
    </group>
  );
}
