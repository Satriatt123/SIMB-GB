import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import GUNUNG from '../data/gunung.json';

const LEVEL = [
  { romawi: 'IV',  nama: 'Awas',    jumlah: 0,  warna: '#d6322c', arti: '...', gunung: [] },
  { romawi: 'III', nama: 'Siaga',   jumlah: 5,  warna: '#e8801f', arti: '...', gunung: [] },
  { romawi: 'II',  nama: 'Waspada', jumlah: 22, warna: '#d9b72b', arti: '...', gunung: [] },
  { romawi: 'I',   nama: 'Normal',  jumlah: 42, warna: '#3f9b5f', arti: '...', gunung: [] },
].map((l) => ({
  ...l,
  gunung: GUNUNG.filter((g) => g.status.startsWith(l.nama)),
}));

const MODEL_URL = '/asset/Volcano8.glb';
const HIDE_PATTERN = /ico|smoke|asap|domain|sphere/i;
const LAVA_PATTERN = /lava|magma/i;
const FALLBACK_TINT = true; 
const FALLBACK_COLOR = '#6b4a3a';
const LAVA_GLOW = 1.4;
const LAVA_SCALE = 6.0;
const LAVA_SPEED = 0.35;

const HERO_MEDIA = '/asset/magma.mp4';

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap');
.simb { font-family: 'Archivo', system-ui, sans-serif; }
.simb-display { font-stretch: 70%; font-weight: 800; letter-spacing: -0.015em; }
.simb-num { font-stretch: 78%; font-weight: 700; font-variant-numeric: tabular-nums; }
`;

function Smoke({ position = [0, 1.5, 0], count = 28 }) {
  const refs = useRef([]);

  const seeds = useMemo(
    ()=>
      Array.from({ length: count }, () =>({
        ox: (Math.random() -  0.5) * 0.25,
        oz: (Math.random() - 0.5) * 0.25,
        drift: 0.5 * Math.random() * 0.5,
        rot: (Math.random() - 0.5) * 0.6,
        phase: Math.random(),
        size: 0.8 * Math.random() * 0.6,
      })),
    [count]
  );

  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    for (let k = 0; k < 7; k++) {
      const x = 128 + (Math.random() - 0.5) * 90;
      const y = 128 + (Math.random() - 0.5) * 90;
      const r = 50 + Math.random() * 40;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.35)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(c);
  }, []);

  const warm = useMemo(() => new THREE.Color('#ff9a5a'), []);
  const cool = useMemo(() => new THREE.Color('#8d9399'), []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    seeds.forEach((s, i) => {
      const sp = refs.current[i];
      if (!sp) return;
      const t = (time * 0.08 + s.phase) % 1;
      sp.position.set(
        s.ox + t * s.drift * 0.9 + Math.sin(time * 0.5 + i) * 0.05 * t,
        t * 3.2,
        s.oz + Math.cos(time * 0.4 + i) * 0.05 * t
      );
      sp.scale.setScalar(s.size * (0.6 + t * 2.4));
      sp.material.opacity = Math.min(1, t * 6) * Math.pow(1 - t, 1.5) * 0.55;
      sp.material.rotation = s.rot * time * 0.3;
      sp.material.color.lerpColors(warm, cool, Math.min(1, t * 2.5));
    });
  });

  return (
    <group position={position}>
      {seeds.map((_, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el; }}>
          <spriteMaterial map={texture} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

function Callout({ position, title, detail, side = 'right' }) {
  const right = side === 'right';
  return (
    <Html position={position} distanceFactor={10} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div
        className={`flex items-center gap-2 whitespace-nowrap ${right ? '' : 'flex-row-reverse'}`}
        style={{ transform: `translate(${right ? '-3px' : 'calc(-100% + 3px)'}, -50%)` }}
      >
        <span className="block w-1.5 h-1.5 rounded-full bg-[#f1efe8]" />
        <span className="block w-10 h-px bg-[#f1efe8]/70" />
        <span className={right ? 'text-left' : 'text-right'} style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}>
          <span className="block text-[13px] font-semibold text-[#f1efe8]">{title}</span>
          <span className="block text-[11px] text-[#b9bcb8]">{detail}</span>
        </span>
      </div>
    </Html>
  );
}

function VolcanoModel() {
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, scene);
  const uTime = useRef({ value: 0 });
  const group = useRef();
  useFrame(({ clock }) => {
    uTime.current.value  = clock.elapsedTime;
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.25;
  });

  useEffect(() => {
    Object.values(actions).forEach((a) => a?.reset().play());
    return () => Object.values(actions).forEach((a) => a?.stop());
  }, [actions]);

  useLayoutEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;
      const name = child.name.toLowerCase();
      const matName = (child.material?.name || '').toLowerCase();

      if (HIDE_PATTERN.test(name)) {
        child.visible = false;
        return;
      }

      if (LAVA_PATTERN.test(matName) || LAVA_PATTERN.test(name)) {
        const mat = child.material.clone();
        mat.vertexColors = false;
        mat.emissiveMap = null;
        mat.map = null;
        mat.color.set('#2a0800');
        mat.customProgramCacheKey = () => 'lava-flow';

        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = uTime.current;

          shader.vertexShader =
            'varying vec3 vLavaPos;\n' +
            shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLavaPos = position;');

          shader.fragmentShader =
            `
            uniform float uTime;
            varying vec3 vLavaPos;

            float lavaHash(vec3 p) {
              p = 50.0 * fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
              return -1.0 + 2.0 * fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }
            float lavaNoise(vec3 x) {
              vec3 i = floor(x);
              vec3 f = fract(x);
              f = f * f * (3.0 - 2.0 * f);
              return mix(
                mix(mix(lavaHash(i + vec3(0,0,0)), lavaHash(i + vec3(1,0,0)), f.x),
                    mix(lavaHash(i + vec3(0,1,0)), lavaHash(i + vec3(1,1,0)), f.x), f.y),
                mix(mix(lavaHash(i + vec3(0,0,1)), lavaHash(i + vec3(1,0,1)), f.x),
                    mix(lavaHash(i + vec3(0,1,1)), lavaHash(i + vec3(1,1,1)), f.x), f.y),
                f.z);
            }
            float lavaFbm(vec3 p) {
              float a = 0.5; float s = 0.0;
              for (int k = 0; k < 4; k++) { s += a * lavaNoise(p); p *= 2.03; a *= 0.5; }
              return s;
            }
            ` +
            shader.fragmentShader.replace(
              '#include <emissivemap_fragment>',
              `
              #include <emissivemap_fragment>
              vec3 lp = vLavaPos * ${LAVA_SCALE.toFixed(1)} + vec3(0.0, uTime * ${LAVA_SPEED.toFixed(2)}, 0.0);
              float n = lavaFbm(lp) * 0.5 + 0.5;
              vec3 lavaCol = mix(vec3(0.30, 0.01, 0.0), vec3(1.0, 0.22, 0.02), smoothstep(0.30, 0.65, n));
              lavaCol = mix(lavaCol, vec3(1.0, 0.55, 0.10), smoothstep(0.65, 0.95, n));
              totalEmissiveRadiance = lavaCol * ${LAVA_GLOW.toFixed(2)};
              `
            );
        };

        mat.needsUpdate = true;
        child.material = mat;
        return;
      }

      if (FALLBACK_TINT && child.material?.color && !child.material.map) {
        const { r, g, b } = child.material.color;
        if (r > 0.85 && g > 0.85 && b > 0.85) {
          child.material = child.material.clone();
          child.material.color.set(FALLBACK_COLOR);
        }
      }
    });
  }, [scene]);

  useFrame(({ clock }) => {
    uTime.current.value = clock.elapsedTime;
  });

  return (
    <group ref={group} position={[0, -1, 0]}>
      <primitive object={scene} />
      <Smoke position={[0, 1.5, 0]} />

      <Callout position={[0, 2.5, 0]} title="Kawah aktif" detail="Titik keluarnya material erupsi" side="right" />
      <Callout position={[0.4, 1.2, 0.3]} title="Aliran lava" detail="Jalur lelehan di lereng" side="left" />
      <Callout position={[-0.8, 0.4, 0.6]} title="Zona KRB III" detail="Paling dekat dengan kawah" side="left" />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]';

export default function Beranda() {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ringkasan = STATUS.level.map((l) => `${l.jumlah} ${l.nama}`).join(', ');

  return (
    <div className="simb min-h-screen bg-[#1c2226] text-[#dcd9d0]">
      <style>{FONT_CSS}</style>

      <section className="relative min-h-[100svh] overflow-hidden">
        {HERO_MEDIA && !reduceMotion && (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            src={HERO_MEDIA}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        )}

        <div
          className="absolute inset-x-0 top-0 h-[58svh] lg:h-full lg:right-auto lg:w-[62%]"
          role="img"
          aria-label="Model 3D gunung api dengan aliran lava dan asap dari kawah"
        >
          <Canvas camera={{ position: [6, 4, 6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: false }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 15, 10]} intensity={1.2} />
            <directionalLight position={[-10, -5, -10]} intensity={0.3} />

            <Suspense fallback={null}>
              <VolcanoModel />
            </Suspense>

            <OrbitControls enableZoom={false} enablePan={false}  minAzimuthAngle={-Math.PI / 4} maxAzimuthAngle={Math.PI / 4} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2.2} />

            <EffectComposer multisampling={0}>
              <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.5} luminanceSmoothing={0.2} radius={0.6} />
              <ToneMapping />
            </EffectComposer>
          </Canvas>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c2226] via-transparent to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block bg-gradient-to-l from-[#1c2226]/85 via-transparent to-transparent" />

        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1920px] items-end justify-end px-6 pb-12 pt-28 lg:items-center lg:px-12 xl:px-16 lg:pb-0">
          <div className="pointer-events-auto w-full lg:w-5/12 lg:text-right">
            <h1 className="simb-display uppercase text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl leading-[1.02] text-[#f1efe8]">
              Kenali gunung api sebelum ia meletus
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#d2d0c8] lg:ml-auto max-w-md 2xl:max-w-lg">
              {STATUS.dipantau} dari {STATUS.aktif} gunung api aktif di Indonesia dipantau terus-menerus. Lihat statusnya, kawasan rawan bencana di sekitar kawah, dan apa yang perlu dilakukan saat status naik.
            </p>
            <div className="mt-7 flex flex-wrap gap-4 lg:justify-end">
              <Link
                to="/peta"
                className={`bg-[#d9651b] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#e8742a] transition-colors ${focusRing}`}
              >Buka peta KRB
              </Link>
              <Link
                to="/ensiklo"
                className={`border border-[#f1efe8]/70 text-[#f1efe8] font-semibold px-6 py-3 rounded-md hover:bg-[#f1efe8]/10 transition-colors ${focusRing}`}
              >Jelajahi ensiklopedia
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <h2 className="simb-display text-4xl lg:text-5xl text-[#f1efe8] leading-none">Status gunung api</h2>
          <p className="mt-4 text-[#a9ada9] leading-relaxed max-w-sm">
            Data per {STATUS.tanggal}. Status bisa berubah sewaktu-waktu mengikuti pemantauan PVMBG. Untuk yang paling baru, buka{' '}
            <a
              href="https://magma.esdm.go.id/"
              target="_blank"
              rel="noreferrer"
              className={`text-[#f1efe8] underline underline-offset-4 decoration-[#5b666c] hover:decoration-[#dcd9d0] ${focusRing}`}
            >
              MAGMA Indonesia
            </a>
            .
          </p>
        </div>

        <div className="lg:col-span-8">
          <div
            role="img"
            aria-label={`Dari ${STATUS.dipantau} gunung api yang dipantau: ${ringkasan}`}
            className="flex h-3 w-full gap-[2px]"
          >
            {STATUS.level
              .filter((l) => l.jumlah > 0)
              .map((l) => (
                <span key={l.nama} style={{ flexGrow: l.jumlah, background: l.warna }} className="block rounded-[1px]" />
              ))}
          </div>

          <ul className="mt-8 m-0 p-0 list-none">
  {STATUS.level.map((l) => {
    const kalem = l.nama === 'Normal' || l.jumlah === 0;
    return (
      <li
        key={l.nama}
        className="grid grid-cols-[3.5rem_1fr_auto] md:grid-cols-[7rem_1fr_auto] gap-x-5 items-baseline py-6 border-t border-[#343c41] last:border-b"
      >
        <span className="simb-num text-3xl" style={{ color: kalem ? '#5b666c' : l.warna }}>
          {l.romawi}
        </span>

        <div>
          <p className={`text-xl font-semibold ${kalem ? 'text-[#a9ada9]' : 'text-[#f1efe8]'}`}>
            {l.nama}
          </p>
          <p className="mt-1 text-[#a9ada9] leading-relaxed max-w-prose">{l.arti}</p>
          {l.gunung.length > 0 && (
            <p className="mt-3 text-[15px] text-[#f1efe8] leading-relaxed">
              {l.gunung.join(' · ')}
            </p>
          )}
        </div>

        <p className={`simb-num text-5xl leading-none ${kalem ? 'text-[#5b666c]' : 'text-[#f1efe8]'}`}>
          {l.jumlah}
        </p>
      </li>
    );
  })}
</ul>
        </div>
      </section>
    </div>
  );
}