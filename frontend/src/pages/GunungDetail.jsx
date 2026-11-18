import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PageHeader from '../component/PageHeader.jsx';
import { fetchMagmaRealtimeData } from '../services/magmaApi.js';
import riwayat from '../data/riwayat.json';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]';

const tombolUtama = `inline-flex items-center rounded-md bg-[#d9651b] px-6 py-3 font-semibold text-white transition-all hover:bg-[#e8742a] active:scale-[0.97] ${focusRing}`;
const tombolLine = `inline-flex items-center gap-2 rounded-md border border-[#f1efe8]/70 px-6 py-3 font-semibold text-[#f1efe8] transition-all hover:bg-[#f1efe8]/10 active:scale-[0.97] ${focusRing}`;

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay },
});

const LEVEL_URUT = ['Normal', 'Waspada', 'Siaga', 'Awas'];
const ROMAWI = ['I', 'II', 'III', 'IV'];

function buatMarker(warna) {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${warna};border:2px solid #fff;box-shadow:0 0 0 2px ${warna}66"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function MiniVolcanoChamber({ warnaStatus }) {
  const meshRef = useRef();
  const smokeGroup = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
    if (smokeGroup.current) {
      smokeGroup.current.children.forEach((p, i) => {
        p.position.y += delta * (0.3 + (i % 3) * 0.1);
        if (p.position.y > 1.8) p.position.y = 0.5;
      });
    }
  });

  return (
    <group position={[0, -0.4, 0]} ref={meshRef}>
      {/* Kerucut Gunung Api */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[1.6, 1.4, 32]} />
        <meshStandardMaterial color="#3e3935" roughness={0.8} />
      </mesh>

      {/* Rim Kawah */}
      <mesh position={[0, 0.7, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.3, 0.08, 16, 32]} />
        <meshStandardMaterial color="#24201d" />
      </mesh>

      {/* Danau Lava / Kawah Glow */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.28, 0.01, 0.1, 16]} />
        <meshBasicMaterial color={warnaStatus || '#d9651b'} />
      </mesh>

      {/* Smoke Particles */}
      <group ref={smokeGroup}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * 0.3, 0.7 + i * 0.08, (Math.random() - 0.5) * 0.3]}>
            <sphereGeometry args={[0.08 + Math.random() * 0.06, 8, 8]} />
            <meshBasicMaterial color="#7a7e80" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Baris({ label, children, last = false }) {
  return (
    <li
      className={`grid gap-1 border-t border-[#343c41] py-5 md:grid-cols-[9rem_1fr] md:gap-8 ${
        last ? 'border-b' : ''
      }`}
    >
      <span className="text-sm font-semibold text-[#f1efe8]">{label}</span>
      <span className="max-w-prose leading-relaxed text-[#a9ada9]">{children}</span>
    </li>
  );
}

export default function GunungDetail() {
  const { id } = useParams();
  const [gunung, setGunung] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let batal = false;
    setLoading(true);
    fetchMagmaRealtimeData().then((data) => {
      if (batal) return;
      setGunung(data.find((g) => g.id === id) ?? null);
      setLoading(false);
    });
    return () => {
      batal = true;
    };
  }, [id]);

  useEffect(() => {
    document.title = gunung ? `${gunung.nama} | SIMB-GB` : 'Detail Gunung | SIMB-GB';
  }, [gunung]);

  if (loading) {
    return (
      <>
        <PageHeader title="Detail Gunung Api" description="Memuat data gunung api…" />
        <div className="simb mx-auto max-w-[1920px] px-6 py-16 lg:px-12 xl:px-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded bg-[#232a2f]" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <div className="h-80 animate-pulse rounded-md bg-[#232a2f]" />
          </div>
        </div>
      </>
    );
  }

  if (!gunung) {
    return (
      <>
        <PageHeader title="Gunung tidak ditemukan" description="Data untuk gunung api ini tidak tersedia." />
        <main className="simb mx-auto max-w-[1920px] px-6 py-16 lg:px-12 lg:py-24 xl:px-16">
          <p className="max-w-prose text-lg leading-relaxed text-[#a9ada9]">
            Gunung dengan kode “{id}” tidak ada dalam daftar pemantauan. Periksa kembali tautannya atau pilih dari peta.
          </p>
          <div className="mt-8">
            <Link to="/peta" className={tombolUtama}>
              Kembali ke peta KRB
            </Link>
          </div>
        </main>
      </>
    );
  }

  const adaRadius = gunung.radiusBahaya > 0;
  const levelIdx = LEVEL_URUT.findIndex((n) => gunung.status.startsWith(n));
  const letusan = riwayat.letusan2026[gunung.id];
  const wilayah = gunung.pulau ? gunung.pulau.replace('-', ' & ') : 'Tidak tercatat';

  return (
    <>
      <PageHeader
        title={gunung.nama}
        description={`Status ${gunung.status}. Data dari laporan pemantauan PVMBG.`}
      />

      <main className="simb mx-auto max-w-[1920px] bg-[#1c2226] px-6 py-16 text-[#dcd9d0] lg:px-12 lg:py-24 xl:px-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <motion.section {...reveal()}>
            <div aria-hidden="true" className="mb-4 h-px w-8" style={{ background: gunung.warna }} />
            <p
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
              style={{ color: gunung.warna, borderColor: `${gunung.warna}66` }}
            >
              <span aria-hidden="true" className="block h-2 w-2 rounded-full" style={{ background: gunung.warna }} />
              {gunung.status}
            </p>

            {levelIdx >= 0 && (
              <div
                role="img"
                aria-label={`Level ${levelIdx + 1} dari 4: ${gunung.status}`}
                className="mt-5 flex max-w-sm gap-1"
              >
                {LEVEL_URUT.map((n, i) => (
                  <div key={n} className="flex-1">
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 * i, ease: [0.25, 0.1, 0.25, 1] }}
                      style={{ transformOrigin: 'left', background: i <= levelIdx ? gunung.warna : '#343c41' }}
                      className="block h-1.5 rounded-[1px]"
                    />
                    <span className="simb-num mt-1.5 block text-xs text-[#8a908d]">{ROMAWI[i]}</span>
                  </div>
                ))}
              </div>
            )}

            <ul className="m-0 mt-8 list-none p-0">
              <Baris label="Radius bahaya">
                {adaRadius ? `${gunung.radiusBahaya / 1000} km dari kawah` : 'Tidak ada zona steril aktif'}
              </Baris>
              <Baris label="Wilayah">{wilayah}</Baris>
              <Baris label="Koordinat">
                <span className="simb-num">
                  {gunung.koordinat[0].toFixed(3)}, {gunung.koordinat[1].toFixed(3)}
                </span>
              </Baris>
              {letusan !== undefined && (
                <Baris label="Letusan 2026">
                  <span className="simb-num text-[#f1efe8]">{letusan.toLocaleString('id-ID')}</span> kejadian letusan
                  terekam {riwayat.periode}.
                  <span className="mt-1 block text-sm text-[#8a908d]">
                    {riwayat.sumber}. Untuk data terbaru, buka MAGMA Indonesia.
                  </span>
                </Baris>
              )}
              <Baris label="Diperbarui" last>
                {gunung.waktuUpdate}
              </Baris>
            </ul>
          </motion.section>

          <motion.section {...reveal(0.1)} className="flex flex-col gap-6">
            <div className="h-72 overflow-hidden rounded-md border border-[#343c41]">
              <MapContainer
                center={gunung.koordinat}
                zoom={adaRadius ? 10 : 11}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                keyboard={false}
                attributionControl={false}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  noWrap
                />
                {adaRadius && (
                  <>
                    <Circle
                      center={gunung.koordinat}
                      radius={gunung.radiusBahaya}
                      pathOptions={{ color: gunung.warna, fillColor: gunung.warna, fillOpacity: 0.2, weight: 1.5 }}
                    />
                    <Circle
                      center={gunung.koordinat}
                      radius={gunung.radiusBahaya * 2.5}
                      pathOptions={{ color: gunung.warna, fillColor: gunung.warna, fillOpacity: 0.08, weight: 1, dashArray: '4 4' }}
                    />
                  </>
                )}
                <Marker position={gunung.koordinat} icon={buatMarker(gunung.warna)} interactive={false} />
              </MapContainer>
            </div>

            {/* 3D Micro-Chamber View */}
            <div className="h-48 overflow-hidden rounded-md border border-[#343c41] bg-[#161a1d] relative">
              <div className="absolute top-2 left-3 z-10 text-xs text-[#a9ada9]">
                Model Kawah 3D Interaktif ({gunung.status.split(' ')[0]})
              </div>
              <Canvas camera={{ position: [0, 1.2, 3.2], fov: 45 }} dpr={[1, 1.5]}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[4, 5, 2]} intensity={1} />
                <MiniVolcanoChamber warnaStatus={gunung.warna} />
              </Canvas>
            </div>
          </motion.section>
        </div>

        <motion.section {...reveal()} className="mt-16 border-t border-[#343c41] pt-14 lg:mt-24 lg:pt-20">
          <h2 className="simb-display text-3xl leading-none text-[#f1efe8] lg:text-4xl">Laporan visual</h2>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-[#a9ada9]">{gunung.visual}</p>
          {gunung.rekomendasi && (
            <p className="mt-4 max-w-prose leading-relaxed text-[#8a908d]">{gunung.rekomendasi}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/peta" className={tombolUtama}>
              Lihat di peta KRB
            </Link>
            <a href="https://magma.esdm.go.id/" target="_blank" rel="noreferrer" className={tombolLine}>
              Sumber: MAGMA Indonesia
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </motion.section>
      </main>
    </>
  );
}