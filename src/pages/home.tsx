import { lazy, Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { CameraRig } from '@/components/cinematic-scene';

gsap.registerPlugin(ScrollTrigger);
const CinematicScene = lazy(() => import('@/components/cinematic-scene').then((module) => ({ default: module.CinematicScene })));

const chapters = [
  { number: '01', name: 'THE ARRIVAL', align: 'left', eyebrow: 'McLaren 720S / Papaya orange', title: <>ENGINEERED<br />TO MOVE</>,
    copy: 'Before motion, a line. Before the line, a silence. The shape waits for light to find it.', tags: ['AERODYNAMIC FORM', '01 / 06'] },
  { number: '02', name: 'THE FORM', align: 'right', eyebrow: 'Chapter two / surfaces', title: <>SCULPTED<br />BY AIR</>,
    copy: 'Every plane turns the atmosphere into an instrument. Nothing added. Nothing left standing still.', tags: ['PRECISION SURFACES', 'ACTIVE DESIGN'] },
  { number: '03', name: 'THE DETAILS', align: 'left', eyebrow: 'Chapter three / close study', title: <>NOTHING<br />IS INCIDENTAL</>,
    copy: 'A blade of light. A measured intake. Ten spokes held around a quiet center. Precision lives in the details.', tags: ['LIGHT SIGNATURE', 'PERFORMANCE SYSTEM'] },
  { number: '04', name: 'THE MACHINE', align: 'right', eyebrow: 'Chapter four / material', title: <>FORM MEETS<br />FUNCTION</>,
    copy: 'Air moves across the body. Light traces its architecture. Engineering, made visible without a word.', tags: ['ENGINEERED SURFACES', 'CONTROLLED FORCE'] },
  { number: '05', name: 'THE MOTION', align: 'left', eyebrow: 'Chapter five / release', title: <>MADE FOR<br />THE IN-BETWEEN</>,
    copy: 'Stillness gives way. The world begins to move around a machine that was always looking ahead.', tags: ['FORWARD MOMENTUM', 'NO FIXED POINT'] },
  { number: '06', name: 'THE REVEAL', align: 'center', eyebrow: 'Chapter six / complete', title: <>BUILT TO<br />MOVE.</>,
    copy: 'The whole form, held in a single frame. A quiet answer to the question of what comes next.', tags: ['THE NEXT FORM OF PERFORMANCE'] },
];

const initialRig: CameraRig = { x: 0.1, y: 2.05, z: 9.7, tx: 0, ty: 0.16, tz: 0, fov: 37, energy: 0.22, motion: 0, value: 0 };

const chapterAnchors = [
  { at: 0, x: 0.1, y: 2.05, z: 9.7, tx: 0, ty: 0.12, tz: 0, fov: 37, energy: 0.16, motion: 0 },
  { at: 0.16, x: 4.35, y: 2.05, z: 5.9, tx: 0, ty: 0.12, tz: 0, fov: 34, energy: 0.78, motion: 0.04 },
  { at: 0.32, x: 2.05, y: 0.66, z: 4.35, tx: 1.35, ty: 0.04, tz: 0.28, fov: 30, energy: 0.94, motion: 0.06 },
  { at: 0.39, x: 2.95, y: 0.48, z: 3.72, tx: 2.05, ty: 0.12, tz: 0.48, fov: 28, energy: 1, motion: 0.08 },
  { at: 0.46, x: 1.18, y: 0.45, z: 2.65, tx: 1.35, ty: -0.14, tz: 0.78, fov: 27, energy: 0.9, motion: 0.11 },
  { at: 0.52, x: -3.3, y: 0.85, z: 2.35, tx: -1.45, ty: 0.1, tz: 0.3, fov: 29, energy: 0.85, motion: 0.12 },
  { at: 0.62, x: -4.55, y: 1.75, z: 4.7, tx: 0, ty: 0.15, tz: 0, fov: 34, energy: 0.7, motion: 0.16 },
  { at: 0.77, x: 3.25, y: 2.9, z: 6.9, tx: 0, ty: 0.1, tz: 0, fov: 39, energy: 0.96, motion: 0.75 },
  { at: 0.86, x: 4.2, y: 2.4, z: 7.1, tx: 0, ty: 0.12, tz: 0, fov: 36, energy: 0.72, motion: 0.62 },
  { at: 1, x: 0.25, y: 4.05, z: 12.1, tx: 0, ty: 0.1, tz: 0, fov: 39, energy: 0.48, motion: 0.08 },
];

function FallbackCar() {
  return (
    <div className="fallback-scene" aria-hidden="true">
      <div className="fallback-car">
        <span className="fallback-intake" />
        <span className="fallback-door-seam" />
        <span className="fallback-wing" />
        <span className="fallback-wheel rear"><i /></span>
        <span className="fallback-wheel front"><i /></span>
        <i className="fallback-taillight" />
        <i className="fallback-light" />
      </div>
      <div className="fallback-ground" />
    </div>
  );
}

export default function Home() {
  const rig = useRef<CameraRig>({ ...initialRig });
  const scroller = useRef<HTMLDivElement>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [webglReady, setWebglReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const chapterNodes = useRef<(HTMLElement | null)[]>([]);
  const progressLine = useRef<HTMLDivElement>(null);
  const anchors = useMemo(() => chapterAnchors, []);

  useLayoutEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const detect = () => {
      setReduced(preference.matches);
      try {
        const canvas = document.createElement('canvas');
        const supported = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
        setWebglReady(supported && !preference.matches && window.innerWidth > 520 && (navigator.hardwareConcurrency || 8) > 2);
      } catch {
        setWebglReady(false);
      }
    };
    detect();
    preference.addEventListener('change', detect);
    return () => preference.removeEventListener('change', detect);
  }, []);

  useLayoutEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            const index = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
            setChapterIndex(index);
            progressLine.current?.style.setProperty('transform', `scaleX(${self.progress})`);
          },
        },
      });
      const first = anchors[0];
      const { at: firstAt, ...firstPose } = first;
      timeline.set(rig.current, { ...firstPose, value: firstAt });
      anchors.slice(1).forEach((anchor) => {
        const { at, ...pose } = anchor;
        timeline.to(rig.current, { ...pose, value: at, duration: at - Number(timeline.duration()), ease: 'none' });
      });
      return () => timeline.scrollTrigger?.kill();
    }, root);
    return () => ctx.revert();
  }, [anchors]);

  const navigateTo = (index: number) => {
    const node = chapterNodes.current[index];
    if (node) node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <main className="film-shell" aria-label="Velocity — interactive automotive film">
      {webglReady && <Suspense fallback={null}><CinematicScene rig={rig.current} onReady={() => setSceneReady(true)} /></Suspense>}
      {(!webglReady || !sceneReady) && <FallbackCar />}
      <div className="film-grain" aria-hidden="true" />
      <header className="film-topbar">
        <a className="brand-mark" href="#chapter-01" aria-label="McLaren 720S film, beginning" data-testid="link-film-start" onClick={(event) => { event.preventDefault(); navigateTo(0); }}>
          <span className="brand-symbol" aria-hidden="true" /> <span>MCLAREN 720S / STUDY 01</span>
        </a>
        <div className="chapter-count" aria-live="polite"><b>{String(chapterIndex + 1).padStart(2, '0')}</b> &nbsp;—&nbsp; 06</div>
      </header>
      <nav className="scroll-track" aria-label="Film chapters">
        {chapters.map((chapter, index) => (
          <button key={chapter.number} className="chapter-dot" type="button" data-label={chapter.name} aria-label={`Go to chapter ${chapter.number}: ${chapter.name}`} aria-current={chapterIndex === index} data-testid={`button-chapter-${chapter.number}`} onClick={() => navigateTo(index)} />
        ))}
      </nav>
      <div ref={scroller} id="film-scroll">
        {chapters.map((chapter, index) => (
          <section
            key={chapter.number}
            ref={(node) => { chapterNodes.current[index] = node; }}
            id={`chapter-${chapter.number}`}
            className="chapter"
            data-align={chapter.align}
            aria-labelledby={`chapter-title-${chapter.number}`}
          >
            <div className="chapter-inner">
              <div className="eyebrow"><span>{chapter.number}</span>{chapter.eyebrow}</div>
              {index === 0 ? <h1 id={`chapter-title-${chapter.number}`}>{chapter.title}</h1> : <h2 id={`chapter-title-${chapter.number}`}>{chapter.title}</h2>}
              <p>{chapter.copy}</p>
              <div className="micro-label">{chapter.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            {index === 0 && <div className="scroll-prompt" aria-hidden="true"><i />SCROLL TO EXPLORE<i /></div>}
          </section>
        ))}
      </div>
      <footer className="film-footer">
        <span>VELOCITY / A CONTINUOUS STUDY</span>
        <span aria-live="polite">{chapters[chapterIndex].name} &nbsp;·&nbsp; {String(chapterIndex + 1).padStart(2, '0')} / 06</span>
        <button type="button" className="footer-replay" data-testid="button-return-to-start" onClick={() => navigateTo(0)}>RETURN TO BEGINNING ↑</button>
      </footer>
      <div ref={progressLine} className="progress-line" aria-hidden="true" />
      {!webglReady && <span className="sr-only" role="status">{reduced ? 'Reduced motion mode. A static visual fallback is active.' : 'A simplified visual fallback is active on this device.'}</span>}
    </main>
  );
}
