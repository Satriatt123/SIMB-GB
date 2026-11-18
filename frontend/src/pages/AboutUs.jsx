import React, { useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import PageHeader from '../component/PageHeader.jsx';

const TEAM_MEMBERS = [
  { nama: 'Vanessa Putri Anazwa',       nim: '124250061', peran: 'UI/3D Designer & Report Compiler' },
  { nama: 'Satria Anjasmara Hammam',    nim: '124250063', peran: 'Lead Web Developer & QA' },
  { nama: 'Chairil Fikri Maulidi',      nim: '124250055', peran: 'GIS & Map Developer' },
  { nama: 'Ajeng Marganingtyas',        nim: '124250059', peran: 'Backend, Database & System Analyst' },
  { nama: 'Nabila Tata Arinda',         nim: '124250060', peran: 'Content Integrator & Technical Writer' },
];

const TECH_STACK = [
  { nama: 'React', deskripsi: 'Antarmuka pengguna dan routing SPA' },
  { nama: 'Three.js / R3F', deskripsi: 'Visualisasi 3D prosedural gunung api & simulasi tektonik' },
  { nama: 'Leaflet', deskripsi: 'Peta interaktif Kawasan Rawan Bencana' },
  { nama: 'Tailwind CSS', deskripsi: 'Styling utility-first dan design system' },
  { nama: 'Express.js', deskripsi: 'Backend API dan integrasi data' },
];

const DATA_SOURCES = [
  {
    nama: 'PVMBG',
    deskripsi: 'Pusat Vulkanologi dan Mitigasi Bencana Geologi',
    url: 'https://vsi.esdm.go.id/',
  },
  {
    nama: 'MAGMA Indonesia',
    deskripsi: 'Multiplatform Application for Geohazard Mitigation and Assessment',
    url: 'https://magma.esdm.go.id/',
  },
];

const HOTSPOTS = [
  { id: 'merapi', nama: 'Merapi', status: 'Siaga (III)', lat: -7.5, lon: 110.4 },
  { id: 'krakatau', nama: 'Anak Krakatau', status: 'Siaga (III)', lat: -6.1, lon: 105.4 },
  { id: 'semeru', nama: 'Semeru', status: 'Siaga (III)', lat: -8.1, lon: 112.9 },
  { id: 'sinabung', nama: 'Sinabung', status: 'Siaga (III)', lat: 3.1, lon: 98.3 },
  { id: 'lewotobi', nama: 'Lewotobi Laki-laki', status: 'Siaga (III)', lat: -8.5, lon: 122.7 },
];

// Tekstur Peta Benua & Indonesia Prosedural (Dibuat lewat Canvas 2D murni)
function generateProceduralEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Lautan (Gelap)
  ctx.fillStyle = '#182026';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Garis Bujur / Lintang Tipis
  ctx.strokeStyle = '#28343e';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Siluet Benua & Kepulauan Indonesia Prosedural
  ctx.fillStyle = '#34434d';
  
  // Asia & Eurasia
  ctx.beginPath();
  ctx.ellipse(700, 180, 180, 100, 0, 0, Math.PI * 2);
  ctx.fill();

  // Australia
  ctx.beginPath();
  ctx.ellipse(820, 380, 80, 55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Kepulauan Indonesia (Sorotan Utama - Warna Aksen)
  ctx.fillStyle = '#4a5d6a';
  // Sumatra & Jawa
  ctx.fillRect(720, 270, 70, 12);
  ctx.fillRect(770, 285, 65, 10);
  // Kalimantan & Sulawesi
  ctx.fillRect(775, 245, 35, 30);
  ctx.fillRect(810, 250, 25, 30);
  // Papua
  ctx.fillRect(850, 265, 50, 20);

  return new THREE.CanvasTexture(canvas);
}

function HologramEarth() {
  const globeGroup = useRef();
  const ringRef = useRef();
  const [hoveredSpot, setHoveredSpot] = useState(null);

  const earthTexture = useMemo(() => generateProceduralEarthTexture(), []);

  useFrame((state, delta) => {
    if (globeGroup.current) {
      globeGroup.current.rotation.y += delta * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.12;
    }
  });

  const hotspots3D = useMemo(() => {
    return HOTSPOTS.map((spot) => {
      const phi = (90 - spot.lat) * (Math.PI / 180);
      const theta = (spot.lon + 180) * (Math.PI / 180);
      const r = 1.82;
      const pos = new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      return { ...spot, pos };
    });
  }, []);

  // Garis Palung Subduksi Lempeng Indo-Australia
  const subductionCurve = useMemo(() => {
    const points = [];
    for (let lon = 95; lon <= 140; lon += 3) {
      const lat = -10 + Math.sin((lon - 95) * 0.08) * 3.5;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const r = 1.83;
      points.push(
        new THREE.Vector3(
          -(r * Math.sin(phi) * Math.cos(theta)),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        )
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  return (
    <group position={[0, 0, 0]}>
      <group ref={globeGroup}>
        {/* Globe 3D dengan Tekstur Peta Peta Bumi */}
        <mesh>
          <sphereGeometry args={[1.8, 48, 48]} />
          <meshStandardMaterial map={earthTexture} roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Atmosphere Glow */}
        <mesh>
          <sphereGeometry args={[1.83, 32, 32]} />
          <meshBasicMaterial color="#d9651b" transparent opacity={0.06} />
        </mesh>

        {/* Garis Palung Subduksi Tektonik */}
        <mesh>
          <tubeGeometry args={[subductionCurve, 64, 0.018, 8, false]} />
          <meshBasicMaterial color="#e8801f" />
        </mesh>

        {/* Titik Gunung Api Interaktif */}
        {hotspots3D.map((spot) => {
          const isHovered = hoveredSpot?.id === spot.id;
          return (
            <group key={spot.id} position={spot.pos}>
              <mesh
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredSpot(spot);
                }}
                onPointerOut={() => setHoveredSpot(null)}
              >
                <sphereGeometry args={[isHovered ? 0.08 : 0.05, 16, 16]} />
                <meshBasicMaterial color={isHovered ? '#ffffff' : '#ff3b00'} />
              </mesh>

              {/* Tooltip HANYA Muncul Saat Di-Hover (Rapi & Tidak Menumpuk) */}
              {isHovered && (
                <Html distanceFactor={6} zIndexRange={[100, 0]}>
                  <div className="pointer-events-none rounded border border-[#ff3b00] bg-[#161a1d]/95 px-2.5 py-1 text-xs whitespace-nowrap shadow-lg backdrop-blur">
                    <p className="font-bold text-[#f1efe8]">{spot.nama}</p>
                    <p className="text-[11px] text-[#ff9a5a]">{spot.status}</p>
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>

      {/* Orbit Ring (Sabuk Cincin Api / Radar) */}
      <mesh ref={ringRef} rotation-x={Math.PI / 3.5}>
        <ringGeometry args={[2.2, 2.22, 64]} />
        <meshBasicMaterial color="#d9651b" side={THREE.DoubleSide} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function AboutUs() {
  const [bukaInfo, setBukaInfo] = useState(false);

  return (
    <>
      <PageHeader
        title="Tentang Kami"
        description="Tim mahasiswa di balik SIMB-GB — Sistem Informasi Manajemen Bencana Gunung Berapi."
      />

      <main className="mx-auto max-w-[1920px] px-6 lg:px-12 xl:px-16 py-16 lg:py-24">
        <section className="border-b border-[#343c41] pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
              className="simb-display text-3xl lg:text-4xl leading-none text-[#f1efe8]"
            >
              Tentang SIMB-GB
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-6 max-w-prose space-y-4 text-lg leading-relaxed text-[#a9ada9]"
            >
              <p>
                <strong className="text-[#dcd9d0]">SIMB-GB</strong> (Sistem
                Informasi Manajemen Bencana Gunung Berapi) adalah platform
                informasi kebencanaan vulkanik di Indonesia. Sistem ini dirancang
                untuk menyajikan data gunung berapi secara interaktif melalui
                visualisasi 3D, peta Kawasan Rawan Bencana (KRB), ensiklopedia
                gunung api, serta panduan mitigasi bencana.
              </p>
              <p>
                Proyek ini dikembangkan sebagai tugas semester oleh mahasiswa
                Sistem Informasi, Universitas Pembangunan Nasional. Seluruh data
                bersumber dari lembaga resmi pemerintah Indonesia.
              </p>
            </motion.div>
          </div>

          {/* 3D Globe Visualizer */}
          <div className="lg:col-span-5 h-[380px] rounded-md border border-[#343c41] bg-[#161a1d] overflow-hidden relative">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#f1efe8]">Pemantauan Vulkanik Cincin Api 3D</span>
              <button
                type="button"
                onClick={() => setBukaInfo(!bukaInfo)}
                className="text-[#a9ada9] hover:text-[#f1efe8] transition-colors"
                title="Petunjuk Model 3D"
              >
                <Info size={15} />
              </button>
            </div>

            {/* Legenda Ringkas */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-3 text-[11px] bg-[#1c2226]/85 backdrop-blur px-3 py-2 rounded border border-[#343c41]">
              <span className="flex items-center gap-1.5 text-[#dcd9d0]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b00]" /> Titik Gunung Api (Arahkan kursor)
              </span>
              <span className="flex items-center gap-1.5 text-[#dcd9d0]">
                <span className="w-3 h-0.5 bg-[#e8801f]" /> Subduksi Lempeng
              </span>
            </div>

            {bukaInfo && (
              <div className="absolute inset-0 z-20 bg-[#161a1d]/95 p-6 text-sm text-[#dcd9d0] flex flex-col justify-center gap-3">
                <h3 className="font-semibold text-[#f1efe8]">Model 3D Ring of Fire</h3>
                <p className="text-xs text-[#a9ada9] leading-relaxed">
                  Visualisasi 3D ini menyimulasikan posisi kawah gunung api aktif Indonesia di sepanjang garis penunjaman (subduksi) lempeng tektonik Eurasia & Indo-Australia.
                </p>
                <p className="text-xs text-[#8a908d]">
                  💡 <i>Gunakan mouse/sentuhan untuk memutar bola dunia. Arahkan kursor ke titik merah untuk melihat nama gunung.</i>
                </p>
                <button
                  type="button"
                  onClick={() => setBukaInfo(false)}
                  className="mt-2 self-start rounded bg-[#d9651b] px-3 py-1 text-xs font-semibold text-white"
                >
                  Mengerti
                </button>
              </div>
            )}

            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 3, 5]} intensity={1.2} />
              <HologramEarth />
              <OrbitControls enableZoom={false} autoRotate={false} rotateSpeed={0.5} />
            </Canvas>
          </div>
        </section>

        <section className="border-b border-[#343c41] py-16">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            className="simb-display text-3xl lg:text-4xl leading-none text-[#f1efe8]"
          >
            Tech Stack
          </motion.h2>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-8 m-0 p-0 list-none"
          >
            {TECH_STACK.map((tech) => (
              <motion.li
                key={tech.nama}
                variants={fadeUp}
                className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-8 gap-y-1 py-4 border-t border-[#343c41] last:border-b"
              >
                <span className="simb font-semibold text-[#f1efe8]">
                  {tech.nama}
                </span>
                <span className="text-[#a9ada9]">{tech.deskripsi}</span>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        <section className="border-b border-[#343c41] py-16">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            className="simb-display text-3xl lg:text-4xl leading-none text-[#f1efe8]"
          >
            Anggota Tim
          </motion.h2>

          <p className="mt-3 text-[#8a908d]">Kelompok 2</p>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-8 m-0 p-0 list-none"
          >
            {TEAM_MEMBERS.map((member) => (
              <motion.li
                key={member.nim}
                variants={fadeUp}
                className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-baseline gap-x-8 gap-y-1 py-5 border-t border-[#343c41] last:border-b"
              >
                <div className="min-w-0">
                  <h4 className="simb text-base font-semibold text-[#f1efe8] leading-snug">
                    {member.nama}
                  </h4>
                  <p className="mt-0.5 text-sm text-[#8a908d] simb-num">
                    NIM {member.nim}
                  </p>
                </div>
                <span className="text-sm text-[#a9ada9] sm:text-right">{member.peran}</span>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        <section className="pt-16">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            className="simb-display text-3xl lg:text-4xl leading-none text-[#f1efe8]"
          >
            Sumber Data
          </motion.h2>

          <p className="mt-3 max-w-prose text-[#a9ada9]">
            Data gunung berapi dan status kebencanaan bersumber dari lembaga
            resmi pemerintah Indonesia berikut.
          </p>

          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-8 m-0 p-0 list-none"
          >
            {DATA_SOURCES.map((src) => (
              <motion.li
                key={src.nama}
                variants={fadeUp}
                className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] items-center gap-x-8 gap-y-1 py-4 border-t border-[#343c41] last:border-b"
              >
                <span className="simb font-semibold text-[#f1efe8]">
                  {src.nama}
                </span>
                <span className="text-[#a9ada9] text-sm sm:text-base">
                  {src.deskripsi}
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#f1efe8] underline underline-offset-4 decoration-[#5b666c] hover:decoration-[#dcd9d0] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]"
                >
                  Kunjungi
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </section>
      </main>
    </>
  );
}