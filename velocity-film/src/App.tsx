import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Car() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.08;
  });

  const wheel = (x: number, z: number) => (
    <mesh position={[x, 0.28, z]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.28, 0.28, 0.18, 32]} />
      <meshStandardMaterial color="#090a0d" metalness={0.85} roughness={0.22} />
    </mesh>
  );

  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.18}>
      <group ref={group} position={[0, -0.35, 0]}>
        <mesh castShadow position={[0, 0.58, 0]} scale={[2.35, 0.36, 0.92]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial color="#c8cbd0" metalness={0.95} roughness={0.16} clearcoat={1} />
        </mesh>
        <mesh castShadow position={[0.18, 0.92, 0]} scale={[1.2, 0.34, 0.78]} rotation={[0, 0, -0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial color="#15171b" metalness={0.55} roughness={0.12} transmission={0.18} clearcoat={1} />
        </mesh>
        <mesh position={[0.86, 0.68, 0.01]} scale={[0.48, 0.08, 0.58]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f2f4f7" emissive="#dbe4ef" emissiveIntensity={2.4} />
        </mesh>
        <mesh position={[-1.05, 0.68, 0.01]} scale={[0.24, 0.07, 0.58]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ff2d3f" emissive="#ff1028" emissiveIntensity={1.6} />
        </mesh>
        {wheel(-0.92, 0.62)}
        {wheel(0.92, 0.62)}
        {wheel(-0.92, -0.62)}
        {wheel(0.92, -0.62)}
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
      <PerspectiveCamera makeDefault position={[3.8, 2.25, 5.2]} fov={36} />
      <ambientLight intensity={0.55} />
      <spotLight position={[3, 5, 4]} intensity={55} angle={0.38} penumbra={1} castShadow />
      <spotLight position={[-4, 2, -2]} intensity={25} angle={0.55} color="#577dff" />
      <pointLight position={[1, 0.5, 3]} intensity={18} color="#ffffff" />
      <Car />
      <Environment preset="city" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#07080a" roughness={0.42} metalness={0.6} />
      </mesh>
    </Canvas>
  );
}

export default function App() {
  return (
    <main className="site-shell">
      <div className="noise" />
      <header className="nav">
        <div className="brand"><span className="brand-mark" />VELOCITY</div>
        <nav><a href="#experience">Experience</a><a href="#specs">Specifications</a><a href="#reserve">Reserve</a></nav>
        <button className="menu" aria-label="Open menu"><span /><span /></button>
      </header>

      <section className="hero" id="experience">
        <div className="hero-copy">
          <p className="eyebrow">V / 01 — THE ART OF MOTION</p>
          <h1>BUILT TO<br /><em>BE REMEMBERED.</em></h1>
          <p className="lede">A sculpted machine where precision engineering meets uncompromising design.</p>
          <a className="cta" href="#specs"><span>Explore the machine</span><b>↗</b></a>
        </div>
        <div className="scene"><Scene /></div>
        <div className="hero-meta"><span>01</span><span>SCROLL TO DISCOVER</span><span>EST. 2026</span></div>
      </section>

      <section className="spec-section" id="specs">
        <div className="section-label">02 / ENGINEERED FOR THE SENSES</div>
        <div className="spec-grid">
          <article><strong>3.2<span>S</span></strong><small>0—100 KM/H</small></article>
          <article><strong>620<span>HP</span></strong><small>PEAK OUTPUT</small></article>
          <article><strong>315<span>KM/H</span></strong><small>TOP SPEED</small></article>
        </div>
        <div className="statement"><p>“Speed is not the destination. <em>It is the language.</em>”</p></div>
      </section>

      <section className="reserve" id="reserve">
        <div><p className="eyebrow">03 — YOUR TURN</p><h2>FEEL THE<br /><em>DIFFERENCE.</em></h2></div>
        <a className="reserve-btn" href="mailto:hello@example.com?subject=Velocity%20Experience">Request an experience <span>→</span></a>
      </section>

      <footer><span>VELOCITY / 2026</span><span>THE ART OF MOTION</span><span>© ALL RIGHTS RESERVED</span></footer>
    </main>
  );
}
