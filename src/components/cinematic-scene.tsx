import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { VehicleModel } from './vehicle-model';

export type CameraRig = {
  x: number; y: number; z: number; tx: number; ty: number; tz: number;
  fov: number; energy: number; motion: number; value: number;
};

function Atmosphere({ rig }: { rig: CameraRig }) {
  const beamA = useRef<THREE.Mesh>(null);
  const beamB = useRef<THREE.Mesh>(null);
  const haze = useRef<THREE.Points>(null);
  const dust = useMemo(() => {
    const positions = new Float32Array(330);
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (Math.random() - 0.5) * 18;
      positions[i + 1] = Math.random() * 5 - 1.5;
      positions[i + 2] = (Math.random() - 0.5) * 13;
    }
    return positions;
  }, []);
  useFrame(() => {
    if (beamA.current) beamA.current.rotation.y = -0.26 + rig.energy * 0.4;
    if (beamB.current) beamB.current.rotation.y = 0.5 - rig.energy * 0.66;
    if (haze.current) haze.current.rotation.y = rig.motion * -0.14;
  });
  return (
    <group>
      <points ref={haze}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#b8c4c3" size={0.018} transparent opacity={0.2} sizeAttenuation depthWrite={false} />
      </points>
      <mesh ref={beamA} position={[-1, 2.3, -2.8]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[8, 0.025, 0.025]} />
        <meshBasicMaterial color="#91a5a7" transparent opacity={0.12} />
      </mesh>
      <mesh ref={beamB} position={[0, 1.8, 2.9]} rotation={[0, 0, 0.22]}>
        <boxGeometry args={[7, 0.018, 0.018]} />
        <meshBasicMaterial color="#c0c8c7" transparent opacity={0.1} />
      </mesh>
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[18, 80]} />
        <meshStandardMaterial color="#111416" metalness={0.68} roughness={0.34} />
      </mesh>
      <gridHelper args={[32, 32, '#303738', '#202526']} position={[0, -0.105, 0]} />
      <fog attach="fog" args={['#111416', 8, 23]} />
    </group>
  );
}

function Stage({ rig }: { rig: CameraRig }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.set(rig.x, rig.y, rig.z);
    camera.lookAt(rig.tx, rig.ty, rig.tz);
    if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - rig.fov) > 0.05) {
      camera.fov = rig.fov;
      camera.updateProjectionMatrix();
    }
  });
  return (
    <>
      <ambientLight intensity={0.16} color="#aeb8bb" />
      <hemisphereLight args={['#bdc8cb', '#080a0b', 0.35]} />
      <directionalLight position={[1, 6, 3]} intensity={1.5} color="#ccd3d2" />
      <pointLight position={[-4, 2.5, -3]} color="#a8c1c5" intensity={rig.energy * 3.1} distance={12} />
      <pointLight position={[4, 1.1, 5]} color="#d7dbd6" intensity={0.3 + rig.energy * 1.3} distance={9} />
      <spotLight position={[-2, 5, 4]} angle={0.55} penumbra={0.85} intensity={1.9} color="#c7d2d1" castShadow shadow-mapSize={[512, 512]} />
      <Atmosphere rig={rig} />
      <VehicleModel progress={rig} />
    </>
  );
}

export function CinematicScene({ rig, onReady }: { rig: CameraRig; onReady: () => void }) {
  return (
    <div className="film-canvas" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 2, 8], fov: 37 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} shadows onCreated={onReady}>
        <color attach="background" args={['#111416']} />
        <Stage rig={rig} />
      </Canvas>
    </div>
  );
}
