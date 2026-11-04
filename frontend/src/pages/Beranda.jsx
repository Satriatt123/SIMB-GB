import React, { Suspense, createRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import GUNUNG from '../data/gunung.json';

const STATUS = { dipantau: 69, aktif: 127 };

const LEVEL = [
  { romawi: 'IV', nama: 'Awas', jumlah: 0, warna: '#d6322c', arti: 'Erupsi sedang berlangsung atau diperkirakan segera terjadi.' },
  { romawi: 'III', nama: 'Siaga', jumlah: 5, warna: '#e8801f', arti: 'Peningkatan aktivitas makin nyata, atau gunung sudah mengalami erupsi.' },
  { romawi: 'II', nama: 'Waspada', jumlah: 22, warna: '#d9b72b', arti: 'Aktivitas naik di atas normal, misalnya gempa vulkanik dangkal atau gas keluar dari kawah.' },
  { romawi: 'I', nama: 'Normal', jumlah: 42, warna: '#3f9b5f', arti: 'Tidak ada gejala yang menuju letusan. Pemantauan rutin tetap berjalan.' },
].map((l) => ({ ...l, gunung: GUNUNG.filter((g) => g.status.startsWith(l.nama)) }));
const TANGGAL = GUNUNG[0]?.waktuUpdate;

const MODEL_URL = '/asset/Volcano8.glb';
const HIDE_PATTERN = /ico|smoke|asap|domain|sphere/i;
const LAVA_PATTERN = /lava|magma/i;
const FALLBACK_TINT = true;
const FALLBACK_COLOR = '#6b4a3a';
const LAVA_SCALE = 6.0;
const LAVA_SPEED = 0.35;
const CRATER_Y = 1.5; 
const GROUND_Y = 0.05; 

const HERO_MEDIA = '/asset/magma.mp4';

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap');
.simb { font-family: 'Archivo', system-ui, sans-serif; }
.simb-display { font-stretch: 70%; font-weight: 800; letter-spacing: -0.015em; }
.simb-num { font-stretch: 78%; font-weight: 700; font-variant-numeric: tabular-nums; }
.simb-abu { background: radial-gradient(ellipse at 50% 85%, rgba(120,45,10,.3), rgba(12,15,17,.96) 75%); opacity: var(--abu, 0); }
`;

const sim = { p: 0, vei: 3 };
const fase = { gempa: 0, erupsi: 0, awan: 0 };
const lavaU = { uTime: { value: 0 }, uGlow: { value: 1 } };
const bloomRef = createRef();

const ss = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);
const fases = (p) => ({
  gempa: ss(0.2, 0.3, p) * (1 - ss(0.4, 0.48, p) * 0.6),
  erupsi: ss(0.42, 0.52, p),
  awan: ss(0.66, 0.8, p),
});

const RENTANG = [[-1, 0.2], [0.22, 0.42], [0.44, 0.66], [0.68, 2]];
const FADE = 0.04;

const ADEGAN = [
  {
    judul: 'Gempa vulkanik datang lebih dulu',
    isi: 'Magma yang naik mendorong batuan di sekitarnya dan memicu gempa vulkanik. Seismograf PVMBG merekam getaran ini, dan lonjakannya menjadi salah satu dasar menaikkan status gunung.',
  },
  {
    judul: 'Tekanan gas menembus kawah',
    isi: 'Saat tekanan melebihi kekuatan batuan penutup, gas dan magma menerobos keluar. Abu naik membentuk kolom, dan bongkahan pijar terlontar dari kawah. Geser skala letusan di kiri bawah untuk melihat bedanya.',
  },
  {
    judul: 'Awan panas dan lahar menyusul',
    isi: 'Material yang runtuh dari puncak meluncur sebagai awan panas, dan hujan berikutnya mengubah endapan abu menjadi lahar. Lingkaran menandai kawasan yang harus dikosongkan pada skala ini.',
    aksi: true,
  },
];

function Driver({ calm }) {
  const light = useRef();
  const halus = useRef(0);

  useFrame(({ camera, clock }, dt) => {
    halus.current = THREE.MathUtils.damp(halus.current, sim.p, 4, dt);
    const f = fases(halus.current);
    fase.gempa = f.gempa;
    fase.erupsi = f.erupsi;
    fase.awan = f.awan;

    const t = clock.elapsedTime;
    const k = 1 - 0.08 * f.gempa + 0.3 * f.awan;
    const sh = calm ? 0 : f.gempa * 0.05 + f.erupsi * 0.03;
    camera.position.set(
      6 * k + Math.sin(t * 47) * sh,
      4 * k + 1.2 * f.awan + Math.sin(t * 53 + 1) * sh,
      6 * k + Math.sin(t * 41 + 2) * sh
    );
    camera.lookAt(0, 0.8 - 0.5 * f.awan, 0);

    lavaU.uTime.value += dt * (1 + 2 * f.erupsi);
    lavaU.uGlow.value = 0.9 + 1.5 * f.erupsi;

    if (light.current) {
      light.current.intensity = (0.3 + 5 * f.erupsi) * (0.85 + 0.15 * Math.sin(t * 12) * Math.sin(t * 7.3));
    }
    if (bloomRef.current) bloomRef.current.intensity = 0.7 + 1.0 * f.erupsi;
  });

  return <pointLight ref={light} position={[0, CRATER_Y - 1, 0]} color="#ff6a1a" distance={9} decay={2} />;
}

function Smoke({ position = [0, CRATER_Y, 0], count = 36 }) {
  const refs = useRef([]);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        ox: (Math.random() - 0.5) * 0.25,
        oz: (Math.random() - 0.5) * 0.25,
        drift: 0.5 + Math.random() * 0.5,
        rot: (Math.random() - 0.5) * 0.6,
        phase: Math.random(),
        size: 0.8 + Math.random() * 0.6,
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
  const ash = useMemo(() => new THREE.Color('#34373a'), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const tinggi = 3.2 * (1 + fase.erupsi * (0.2 + 0.2 * sim.vei));
    const lebar = 0.7 + 0.5 * fase.erupsi;
    const pekat = 0.3 + 0.7 * fase.erupsi;
    tmp.copy(cool).lerp(ash, fase.awan);

    seeds.forEach((s, i) => {
      const sp = refs.current[i];
      if (!sp) return;
      const t = (time * 0.08 + s.phase) % 1;
      sp.position.set(
        s.ox + t * s.drift * 0.9 + Math.sin(time * 0.5 + i) * 0.05 * t,
        t * tinggi,
        s.oz + Math.cos(time * 0.4 + i) * 0.05 * t
      );
      sp.scale.setScalar(s.size * (0.6 + t * 2.4) * lebar);
      sp.material.opacity = Math.min(1, t * 6) * Math.pow(1 - t, 1.5) * 0.55 * pekat;
      sp.material.rotation = s.rot * time * 0.3;
      sp.material.color.lerpColors(warm, tmp, Math.min(1, t * 2.5));
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

function Bombs({ count = 140 }) {
  const mesh = useRef();
  const o = useMemo(() => new THREE.Object3D(), []);
  const warna = useMemo(() => new THREE.Color(3, 1.1, 0.25), []);
  const seed = useMemo(
    () => Array.from({ length: count }, () => ({ a: Math.random() * 6.28, r: 0.3 + Math.random(), v: 2 + Math.random() * 2, ph: Math.random() })),
    [count]
  );

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.visible = fase.erupsi > 0.02;
    if (!mesh.current.visible) return;
    const kuat = 0.6 + 0.2 * sim.vei;
    seed.forEach((s, i) => {
      const t = ((clock.elapsedTime * 0.4 + s.ph) % 1) * 2;
      const x = Math.cos(s.a) * s.r * t * kuat;
      const y = s.v * kuat * t - 1.5 * t * t;
      const z = Math.sin(s.a) * s.r * t * kuat;
      o.position.set(x, y, z);
      o.scale.setScalar(y > -0.2 ? 0.045 * fase.erupsi * kuat : 0);
      o.updateMatrix();
      mesh.current.setMatrixAt(i, o.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]} frustumCulled={false} position={[0, CRATER_Y, 0]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={warna} toneMapped={false} />
    </instancedMesh>
  );
}

function ZonaBahaya() {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.visible = fase.awan > 0.01;
    ref.current.scale.setScalar((1.2 + sim.vei * 0.45) * (0.5 + 0.5 * fase.awan));
    ref.current.material.opacity = 0.75 * fase.awan;
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position-y={GROUND_Y}>
      <ringGeometry args={[0.96, 1, 96]} />
      <meshBasicMaterial color="#d9651b" transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
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
  const group = useRef();

  useFrame(({ clock }) => {
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
          shader.uniforms.uTime = lavaU.uTime;
          shader.uniforms.uGlow = lavaU.uGlow;

          shader.vertexShader =
            'varying vec3 vLavaPos;\n' +
            shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLavaPos = position;');

          shader.fragmentShader =
            `
            uniform float uTime;
            uniform float uGlow;
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
              totalEmissiveRadiance = lavaCol * uGlow;
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

  return (
    <group ref={group} position={[0, -1, 0]}>
      <primitive object={scene} />
      <Smoke />
      <Bombs />
      <ZonaBahaya />

      <Callout position={[0, 2.5, 0]} title="Kawah aktif" detail="Titik keluarnya material erupsi" side="right" />
      <Callout position={[0.4, 1.2, 0.3]} title="Aliran lava" detail="Jalur lelehan di lereng" side="left" />
      <Callout position={[-0.8, 0.4, 0.6]} title="Zona KRB III" detail="Paling dekat dengan kawah" side="left" />
    </group>
  );
}

useGLTF.preload(MODEL_URL);

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]';
const tombolUtama = `bg-[#d9651b] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#e8742a] transition-colors ${focusRing}`;
const tombolLine = `border border-[#f1efe8]/70 text-[#f1efe8] font-semibold px-6 py-3 rounded-md hover:bg-[#f1efe8]/10 transition-colors ${focusRing}`;

const LABEL_ADEGAN = ['', 'GEMPA VULKANIK', 'ERUPSI', 'AWAN PANAS'];

export default function Beranda() {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [vei, setVei] = useState(3);
  const stageRef = useRef(null);
  const sceneRefs = useRef([]);
  const hintRef = useRef(null);
  const videoRef = useRef(null);
  const labelRef = useRef(null);
  const indicatorRefs = useRef([]);

  const ringkasan = LEVEL.map((l) => `${l.jumlah} ${l.nama}`).join(', ');

  useEffect(() => {
    const el = stageRef.current;
    const terapkan = () => {
      const max = el.offsetHeight - window.innerHeight;
      const p = THREE.MathUtils.clamp(-el.getBoundingClientRect().top / max, 0, 1);
      sim.p = p;
      const f = fases(p);
      el.style.setProperty('--abu', (f.erupsi * (0.45 + 0.4 * f.awan)).toFixed(3));

      let aktifIdx = 0;
      let maxO = 0;
      sceneRefs.current.forEach((s, i) => {
        if (!s) return;
        const [a, b] = RENTANG[i];
        const o = ss(a, a + FADE, p) * (1 - ss(b - FADE, b, p));
        s.style.opacity = o.toFixed(3);
        s.style.transform = `translateY(${((1 - o) * 16).toFixed(1)}px)`;
        s.style.visibility = o > 0.02 ? 'visible' : 'hidden';
        s.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
        if (o > maxO) { maxO = o; aktifIdx = i; }
      });

      if (labelRef.current) {
        const teks = LABEL_ADEGAN[aktifIdx] || '';
        labelRef.current.textContent = teks;
        labelRef.current.style.opacity = teks ? '1' : '0';
      }

      indicatorRefs.current.forEach((el, i) => {
        if (!el) return;
        const aktif = i === aktifIdx;
        el.style.color = aktif ? '#f1efe8' : '#5b666c';
        el.style.borderRightColor = aktif ? '#d9651b' : 'transparent';
      });

      if (hintRef.current) hintRef.current.style.opacity = (1 - ss(0, 0.05, p)).toFixed(3);
      if (videoRef.current) videoRef.current.style.opacity = (0.35 + 0.35 * f.erupsi).toFixed(3);
    };
    terapkan();
    window.addEventListener('scroll', terapkan, { passive: true });
    window.addEventListener('resize', terapkan);
    return () => {
      window.removeEventListener('scroll', terapkan);
      window.removeEventListener('resize', terapkan);
    };
  }, []);

  const ubahVei = (e) => {
    const v = Number(e.target.value);
    sim.vei = v;
    setVei(v);
  };

  return (
    <div className="simb min-h-screen bg-[#1c2226] text-[#dcd9d0]">
      <style>{FONT_CSS}</style>

      <section ref={stageRef} className="relative h-[420svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {HERO_MEDIA && !reduceMotion && (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: 0.35 }}
              src={HERO_MEDIA}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
          )}
          <div aria-hidden="true" className="simb-abu pointer-events-none absolute inset-0" />

          <div
            className="absolute inset-x-0 top-0 h-[58svh] lg:h-full lg:right-auto lg:w-[62%]"
            role="img"
            aria-label="Simulasi 3D gunung api: gempa vulkanik, erupsi, lalu awan panas dan zona bahaya, mengikuti gulir halaman"
          >
            <Canvas camera={{ position: [6, 4, 6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: false }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 15, 10]} intensity={1.2} />
              <directionalLight position={[-10, -5, -10]} intensity={0.3} />

              <Driver calm={reduceMotion} />
              <Suspense fallback={null}>
                <VolcanoModel />
              </Suspense>

              <EffectComposer multisampling={0}>
                <Bloom ref={bloomRef} mipmapBlur intensity={0.7} luminanceThreshold={0.5} luminanceSmoothing={0.2} radius={0.6} />
                <ToneMapping />
              </EffectComposer>
            </Canvas>
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c2226] via-transparent to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block bg-gradient-to-l from-[#1c2226]/85 via-transparent to-transparent" />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-14 right-3 z-20 flex flex-col items-end gap-3"
          >
            {['01', '02', '03', '04'].map((n, i) => (
              <span
                key={n}
                ref={(el) => { indicatorRefs.current[i] = el; }}
                className="simb-num text-[11px] border-r-2 pr-2 transition-colors duration-300"
                style={{
                  color: i === 0 ? '#f1efe8' : '#5b666c',
                  borderRightColor: i === 0 ? '#d9651b' : 'transparent',
                }}
              >
                {n}
              </span>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 z-10 mx-auto flex max-w-[1920px] items-end justify-end px-6 pb-24 pt-28 lg:items-center lg:px-12 xl:px-16 lg:pb-0">
            <div className="grid w-full lg:w-5/12 lg:text-right">
              <div
                ref={(el) => { sceneRefs.current[0] = el; }}
                className="col-start-1 row-start-1"
                style={{ opacity: 1 }}
              >
                <h1 className="simb-display uppercase text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl leading-[1.02] text-[#f1efe8]">
                  Kenali gunung api sebelum ia meletus
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-[#d2d0c8] lg:ml-auto max-w-md 2xl:max-w-lg">
                  {STATUS.dipantau} dari {STATUS.aktif} gunung api aktif di Indonesia dipantau terus-menerus. Lihat statusnya, kawasan rawan bencana di sekitar kawah, dan apa yang perlu dilakukan saat status naik.
                </p>
                <div className="mt-7 flex flex-wrap gap-4 lg:justify-end">
                  <Link to="/peta" className={tombolUtama}>Buka peta KRB</Link>
                  <Link to="/ensiklo" className={tombolLine}>Jelajahi ensiklopedia →</Link>
                </div>

                <div className="mt-8 flex gap-8 lg:justify-end" aria-hidden="true">
                  <div className="lg:text-right">
                    <p className="simb-num text-3xl leading-none text-[#f1efe8]">{STATUS.dipantau}</p>
                    <p className="mt-1.5 text-sm text-[#8a908d]">dipantau aktif</p>
                  </div>
                  <div className="lg:text-right">
                    <p className="simb-num text-3xl leading-none" style={{ color: '#e8801f' }}>
                      {LEVEL.find((l) => l.nama === 'Siaga')?.jumlah ?? 0}
                    </p>
                    <p className="mt-1.5 text-sm text-[#8a908d]">Siaga saat ini</p>
                  </div>
                </div>
              </div>

              {ADEGAN.map((a, i) => (
                <div
                  key={a.judul}
                  ref={(el) => { sceneRefs.current[i + 1] = el; }}
                  className="col-start-1 row-start-1"
                  style={{ opacity: 0, visibility: 'hidden' }}
                >

                  <h2 className="simb-display uppercase text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl leading-[1.02] text-[#f1efe8]">
                    {a.judul}
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-[#d2d0c8] lg:ml-auto max-w-md 2xl:max-w-lg">{a.isi}</p>
                  {a.aksi && (
                    <>
                      <div className="mt-7 flex flex-wrap gap-4 lg:justify-end">
                        <Link to="/peta" className={tombolUtama}>Buka peta KRB</Link>
                        <Link to="/ensiklo" className={tombolLine}>Pelajari penyebabnya →</Link>
                      </div>
                      <p className="mt-4 text-sm text-[#8a908d] lg:ml-auto max-w-md">
                        Ilustrasi skenario. Status dan radius resmi hanya dari PVMBG.
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p
            ref={labelRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-6 top-1/2 z-20 -translate-y-1/2 text-[11px] font-semibold tracking-[0.2em] text-[#8a908d] transition-opacity duration-300 lg:left-12 xl:left-16"
            style={{ opacity: 0, writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}
          />

          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-6 pb-5 lg:px-12 xl:px-16">
            <label className="flex items-center gap-3 text-sm text-[#a9ada9]">
              Skala letusan (VEI)
              <span className="simb-num w-3 text-base text-[#f1efe8]">{vei}</span>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={vei}
                onChange={ubahVei}
                className="w-32 accent-[#d9651b] sm:w-40"
              />
            </label>
            <p ref={hintRef} className="hidden text-sm text-[#a9ada9] sm:block">Gulir untuk melihat letusannya</p>
          </div>
        </div>
      </section>

      <section className="max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 className="simb-display text-4xl lg:text-5xl text-[#f1efe8] leading-none">Status gunung api</h2>
          <p className="mt-4 text-[#a9ada9] leading-relaxed max-w-sm">
            Diperbarui {TANGGAL}. Status bisa berubah sewaktu-waktu mengikuti pemantauan PVMBG. Untuk yang paling baru, buka{' '}
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

          <div className="mt-8 grid grid-cols-2 gap-x-6 border-t border-[#343c41] pt-6">
            <div>
              <p className="simb-num text-4xl leading-none text-[#f1efe8]">{STATUS.dipantau}</p>
              <p className="mt-1.5 text-sm text-[#8a908d]">dipantau aktif</p>
            </div>
            <div>
              <p className="simb-num text-4xl leading-none text-[#5b666c]">{STATUS.aktif}</p>
              <p className="mt-1.5 text-sm text-[#8a908d]">gunung api di Indonesia</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div
            role="img"
            aria-label={`Dari ${STATUS.dipantau} gunung api yang dipantau: ${ringkasan}`}
            className="flex h-1.5 w-full gap-[2px]"
          >
            {LEVEL.filter((l) => l.jumlah > 0).map((l) => (
              <span key={l.nama} style={{ flexGrow: l.jumlah, background: l.warna }} className="block rounded-[1px]" />
            ))}
          </div>

          <ul className="mt-8 m-0 p-0 list-none">
            {LEVEL.map((l) => {
              const kalem = l.nama === 'Normal' || l.jumlah === 0;
              const tampil = l.nama === 'Siaga' || l.nama === 'Waspada';
              const sisa = l.jumlah - l.gunung.length;

              return (
                <li
                  key={l.nama}
                  className="grid grid-cols-[3rem_1fr_auto] md:grid-cols-[5.5rem_1fr_auto] gap-x-5 md:gap-x-6 items-baseline py-5 border-t border-[#343c41] last:border-b"
                >
                  <span
                    className="simb-num text-2xl md:text-3xl"
                    style={{ color: kalem ? '#5b666c' : l.warna }}
                  >
                    {l.romawi}
                  </span>

                  <div>
                    <p className={`font-semibold ${kalem ? 'text-[#a9ada9]' : 'text-[#f1efe8]'} ${kalem ? 'text-base' : 'text-xl'}`}>
                      {l.nama}
                    </p>
                    <p className={`mt-1 leading-relaxed max-w-prose ${kalem ? 'text-[#5b666c] text-sm' : 'text-[#a9ada9]'}`}>
                      {l.arti}
                    </p>

                    {tampil && l.gunung.length > 0 && (
                      <ul className="mt-3 m-0 p-0 list-none flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
                        {l.gunung.map((g) => (
                          <li key={g.id} className="text-[#f1efe8]">
                            {g.nama}
                            {l.nama === 'Siaga' && g.radiusBahaya > 0 && (
                              <span className="ml-1.5 text-[#8a908d]">{g.radiusBahaya / 1000} km</span>
                            )}
                          </li>
                        ))}
                        {sisa > 0 && <li className="text-[#8a908d]">+{sisa} lainnya</li>}
                      </ul>
                    )}
                  </div>

                  <p
                    className={`simb-num leading-none tabular-nums ${
                      kalem
                        ? 'text-3xl text-[#5b666c]'
                        : l.nama === 'Siaga'
                        ? 'text-5xl text-[#f1efe8]'
                        : 'text-4xl text-[#f1efe8]'
                    }`}
                  >
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