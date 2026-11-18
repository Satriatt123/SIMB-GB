import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown, Crosshair } from 'lucide-react';
import PageHeader from '../component/PageHeader.jsx';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchMagmaRealtimeData } from '../services/magmaApi.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '', iconRetinaUrl: '' });

const MARKER_CSS = `
@keyframes krb-ping {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.6; }
  80%  { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
}
.leaflet-marker-icon.krb-wrap {
  position: absolute !important;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible !important;
  background: transparent;
  border: none;
}
.krb-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 50%;
  pointer-events: none;
  transform-origin: center center;
  animation: krb-ping 2s cubic-bezier(0,0,0.2,1) infinite;
}
.krb-dot {
  position: relative;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.6);
  flex-shrink: 0;
}
`;

function buatIcon(warna, aktif, pulse) {
  const dotSize = aktif ? 14 : 8;
  const wrapSize = 40; 
  const ringHtml = pulse
    ? `<span class="krb-ring" style="background:${warna};width:${dotSize}px;height:${dotSize}px"></span>`
    : '';
  const border = aktif ? `border:2px solid #fff;box-shadow:0 0 0 2px ${warna}40` : `border:1.5px solid rgba(255,255,255,0.5)`;
  return L.divIcon({
    className: 'krb-wrap',
    html: `${ringHtml}<span class="krb-dot" style="width:${dotSize}px;height:${dotSize}px;background:${warna};${border}"></span>`,
    iconSize: [wrapSize, wrapSize],
    iconAnchor: [wrapSize / 2, wrapSize / 2],
    popupAnchor: [0, -(wrapSize / 2)],
  });
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]';

function jarakKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const ikonLokasi = L.divIcon({
  className: '',
  html: '<span style="display:block;width:14px;height:14px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const LEVEL_ORDER = [
  { nama: 'Awas', warna: '#d6322c', romawi: 'IV' },
  { nama: 'Siaga', warna: '#e8801f', romawi: 'III' },
  { nama: 'Waspada', warna: '#d9b72b', romawi: 'II' },
  { nama: 'Normal', warna: '#3f9b5f', romawi: 'I' },
];

const WILAYAH_FILTER = [
  { label: 'Semua Wilayah', value: null, bounds: null },
  { label: 'Sumatra', value: 'Sumatra', bounds: [[-6, 95], [6, 108]] },
  { label: 'Jawa & Bali', value: 'Jawa-Bali', bounds: [[-9, 105], [-5, 116]] },
  { label: 'Nusa Tenggara', value: 'Nusa Tenggara', bounds: [[-10, 115], [-5, 126]] },
  { label: 'Sulawesi', value: 'Sulawesi', bounds: [[-5, 118], [4, 128]] },
  { label: 'Maluku & Papua', value: 'Maluku-Papua', bounds: [[-8, 124], [4, 141]] },
];

function MapUpdater({ koordinat }) {
  const map = useMap();
  useEffect(() => {
    if (koordinat) {
      map.flyTo(koordinat, 11, { duration: 1.5 });
    }
  }, [koordinat, map]);
  return null;
}

function WilayahUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
    } else {
      map.flyTo([-2.5489, 118.0149], 5, { duration: 1.2 });
    }
  }, [bounds, map]);
  return null;
}

export default function PetaKRB() {
  const [daftarGunung, setDaftarGunung] = useState([]);
  const [selectedVolcano, setSelectedVolcano] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openLevel, setOpenLevel] = useState('Siaga');
  const [filterWilayah, setFilterWilayah] = useState(null);
  const [lokasi, setLokasi] = useState(null);
  const [terdekat, setTerdekat] = useState([]);
  const [dalamRadius, setDalamRadius] = useState([]);
  const [geo, setGeo] = useState('diam');

  useEffect(() => {
    document.title = 'Peta KRB | SIMB-GB';
  }, []);

  useEffect(() => {
    fetchMagmaRealtimeData().then((data) => {
      setDaftarGunung(data);
      setSelectedVolcano(data[0] ?? null);
      setLoading(false);
    });
  }, []);

  const gunungTerfilter = useMemo(() => {
    if (!filterWilayah) return daftarGunung;
    return daftarGunung.filter((g) => g.pulau === filterWilayah);
  }, [daftarGunung, filterWilayah]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return daftarGunung.filter((g) =>
      g.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, daftarGunung]);

  const grouped = useMemo(() => {
    return LEVEL_ORDER.map((level) => ({
      ...level,
      gunung: gunungTerfilter.filter((g) => g.status.startsWith(level.nama)),
    })).filter((l) => l.gunung.length > 0);
  }, [gunungTerfilter]);

  const statWilayah = useMemo(() => {
    return LEVEL_ORDER.map((l) => ({
      ...l,
      jumlah: gunungTerfilter.filter((g) => g.status.startsWith(l.nama)).length,
    }));
  }, [gunungTerfilter]);

  const handleSelectVolcano = (gunung) => {
    setSelectedVolcano(gunung);
    setSearchQuery('');
  };

  const cariTerdekat = () => {
    if (!navigator.geolocation) {
      setGeo('gagal');
      return;
    }
    setGeo('memuat');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const titik = [pos.coords.latitude, pos.coords.longitude];
        const urut = daftarGunung
          .map((g) => ({ gunung: g, jarak: jarakKm(titik, g.koordinat) }))
          .sort((a, b) => a.jarak - b.jarak);
        setLokasi(titik);
        setTerdekat(urut.slice(0, 3));
        setDalamRadius(urut.filter((u) => u.gunung.radiusBahaya > 0 && u.jarak * 1000 <= u.gunung.radiusBahaya));
        setGeo('ok');
        if (urut[0]) setSelectedVolcano(urut[0].gunung);
      },
      () => setGeo('gagal'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Peta Kawasan Rawan Bencana"
          description="Pemantauan radius bahaya, zona steril, dan level siaga gunung api secara interaktif."
        />
        <div className="px-6 lg:px-12 xl:px-16 py-10 lg:py-16 max-w-[1920px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[22rem_1fr] gap-8">
            {/* Skeleton sidebar */}
            <aside className="flex flex-col gap-5">
              <div className="h-11 rounded-md bg-[#232a2f] animate-pulse" />
              <div className="border-t border-[#343c41] pt-5 flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded bg-[#232a2f] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </aside>
            {/* Skeleton peta */}
            <div className="h-[550px] lg:h-[calc(100vh-12rem)] min-h-[500px] rounded-md bg-[#232a2f] animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{MARKER_CSS}</style>
      <PageHeader
        title="Peta Kawasan Rawan Bencana"
        description="Pemantauan radius bahaya, zona steril, dan level siaga gunung api secara interaktif."
      />

      <div className="px-6 lg:px-12 xl:px-16 py-10 lg:py-16 max-w-[1920px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[22rem_1fr] gap-8">
          <aside className="flex flex-col gap-6">
            {/* ── Filter Wilayah ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#8a908d]">Filter wilayah</p>
                <AnimatePresence>
                  {filterWilayah && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      type="button"
                      onClick={() => setFilterWilayah(null)}
                      className={`text-xs text-[#d9651b] hover:text-[#e8742a] transition-colors ${focusRing}`}
                    >
                      Reset ✕
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {WILAYAH_FILTER.map((w) => (
                  <button
                    key={w.value ?? 'semua'}
                    type="button"
                    onClick={() => setFilterWilayah(w.value)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${focusRing} ${
                      filterWilayah === w.value
                        ? 'bg-[#d9651b] border-[#d9651b] text-white'
                        : 'border-[#343c41] text-[#a9ada9] hover:border-[#5b666c] hover:text-[#dcd9d0]'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5b666c]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari gunung api…"
                  className={`w-full bg-transparent border border-[#343c41] rounded-md pl-10 pr-4 py-3 text-[#dcd9d0] placeholder:text-[#5b666c] transition-colors focus:border-[#d9651b] focus:outline-none ${focusRing}`}
                />
              </div>

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 w-full bg-[#1c2226] border border-[#343c41] mt-1 rounded-md max-h-56 overflow-y-auto"
                  >
                    {searchResults.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectVolcano(g)}
                          className={`w-full text-left px-4 py-3 border-b border-[#343c41] last:border-b-0 transition-colors hover:bg-[#f1efe8]/5 ${focusRing}`}
                        >
                          <span className="text-[#f1efe8] font-medium">{g.nama}</span>
                          <span className="block text-sm mt-0.5" style={{ color: g.warna }}>
                            {g.status}
                          </span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <div>
              <button
                type="button"
                onClick={cariTerdekat}
                disabled={geo === 'memuat'}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#f1efe8]/70 px-4 py-2.5 text-sm font-semibold text-[#f1efe8] transition-all hover:bg-[#f1efe8]/10 active:scale-[0.97] disabled:opacity-60 ${focusRing}`}
              >
                <Crosshair size={16} aria-hidden="true" />
                {geo === 'memuat' ? 'Mencari lokasimu…' : 'Gunung terdekat dari lokasiku'}
              </button>
              <p className="mt-2 text-xs text-[#8a908d]">Lokasi hanya dipakai di browser dan tidak disimpan.</p>

              {geo === 'gagal' && (
                <p role="status" className="mt-2 text-sm text-[#d9b72b]">
                  Lokasi tidak bisa dibaca. Periksa izin lokasi di browser, lalu coba lagi.
                </p>
              )}

              <AnimatePresence>
                {geo === 'ok' && terdekat.length > 0 && (
                  <motion.div
                    role="status"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4"
                  >
                    {dalamRadius.length > 0 && (
                      <p className="mb-3 border-l-2 border-[#d6322c] pl-3 text-sm leading-relaxed text-[#f1efe8]">
                        Perkiraan lokasimu berada di dalam radius bahaya {dalamRadius.map((u) => u.gunung.nama).join(', ')}.
                        Ikuti arahan BPBD setempat.
                      </p>
                    )}
                    <p className="mb-1 text-sm text-[#8a908d]">Terdekat dari lokasimu</p>
                    <ul className="m-0 list-none p-0">
                      {terdekat.map(({ gunung, jarak }) => (
                        <li key={gunung.id} className="border-t border-[#343c41] last:border-b">
                          <button
                            type="button"
                            onClick={() => handleSelectVolcano(gunung)}
                            className={`flex w-full items-baseline justify-between gap-3 py-2.5 text-left transition-colors hover:bg-[#f1efe8]/5 ${focusRing}`}
                          >
                            <span>
                              <span className="font-semibold text-[#f1efe8]">{gunung.nama}</span>
                              <span className="ml-2 text-sm" style={{ color: gunung.warna }}>
                                {gunung.status.split(' ')[0]}
                              </span>
                            </span>
                            <span className="simb-num text-[#a9ada9]">{Math.round(jarak).toLocaleString('id-ID')} km</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {selectedVolcano && (
                <motion.div
                  key={selectedVolcano.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-[#343c41] pt-5"
                >
                  <div
                    aria-hidden="true"
                    className="mb-4 h-px w-8"
                    style={{ background: selectedVolcano.warna }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="simb-display text-2xl text-[#f1efe8] leading-tight">
                        {selectedVolcano.nama}
                      </h3>
                      <p className="mt-1 text-lg font-semibold" style={{ color: selectedVolcano.warna }}>
                        {selectedVolcano.status}
                      </p>
                    </div>
                    <MapPin size={20} className="text-[#5b666c] mt-1 shrink-0" aria-hidden="true" />
                  </div>

                  <ul className="mt-5 m-0 p-0 list-none">
                    <li className="grid gap-1 border-t border-[#343c41] py-4 md:grid-cols-[7rem_1fr] md:gap-6">
                      <span className="text-sm font-semibold text-[#f1efe8]">Radius bahaya</span>
                      <span className="text-[#a9ada9]">
                        {selectedVolcano.radiusBahaya > 0
                          ? `${selectedVolcano.radiusBahaya / 1000} km dari kawah`
                          : 'Tidak ada zona steril aktif'}
                      </span>
                    </li>
                    <li className="grid gap-1 border-t border-[#343c41] py-4 md:grid-cols-[7rem_1fr] md:gap-6">
                      <span className="text-sm font-semibold text-[#f1efe8]">Kondisi visual</span>
                      <span className="text-[#a9ada9] leading-relaxed">{selectedVolcano.visual}</span>
                    </li>
                    <li className="grid gap-1 border-t border-b border-[#343c41] py-4 md:grid-cols-[7rem_1fr] md:gap-6">
                      <span className="text-sm font-semibold text-[#f1efe8]">Diperbarui</span>
                      <span className="text-[#8a908d]">{selectedVolcano.waktuUpdate}</span>
                    </li>
                  </ul>

                  <Link
                    to={`/gunung/${selectedVolcano.id}`}
                    className={`mt-5 inline-flex items-center rounded-md border border-[#f1efe8]/70 px-5 py-2.5 text-sm font-semibold text-[#f1efe8] transition-all hover:bg-[#f1efe8]/10 active:scale-[0.97] ${focusRing}`}
                  >
                    Lihat detail →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t border-[#343c41] pt-5">
              <p className="mb-3 text-sm text-[#8a908d]">Status aktif</p>
              <div className="flex flex-col gap-0">
                {grouped.map((level) => (
                  <div key={level.nama} className="border-t border-[#343c41] last:border-b">
                    <button
                      type="button"
                      onClick={() => setOpenLevel(openLevel === level.nama ? '' : level.nama)}
                      className={`w-full flex items-center justify-between py-3 text-left transition-colors hover:text-[#f1efe8] ${focusRing}`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="block h-2 w-2 shrink-0 rounded-full"
                          style={{ background: level.warna }}
                        />
                        <span className="simb-num text-lg" style={{ color: level.warna }}>
                          {level.romawi}
                        </span>
                        <span className="font-semibold text-[#f1efe8]">{level.nama}</span>
                        <span className="text-sm text-[#5b666c]">{level.gunung.length}</span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-[#5b666c] transition-transform ${
                          openLevel === level.nama ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {openLevel === level.nama && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <ul className="m-0 p-0 list-none pb-3 pl-8">
                            {level.gunung.map((g) => (
                              <li key={g.id}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectVolcano(g)}
                                  className={`w-full text-left py-1.5 text-[15px] transition-colors ${
                                    selectedVolcano?.id === g.id
                                      ? 'text-[#f1efe8] font-semibold'
                                      : 'text-[#a9ada9] hover:text-[#f1efe8]'
                                  } ${focusRing}`}
                                >
                                  {g.nama}
                                  {g.radiusBahaya > 0 && (
                                    <span className="ml-2 text-[#5b666c] text-sm">
                                      {g.radiusBahaya / 1000} km
                                    </span>
                                  )}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="relative z-0 h-[550px] lg:h-[calc(100vh-12rem)] min-h-[500px] border border-[#343c41] rounded-md overflow-hidden">
            <MapContainer
              center={[-2.5489, 118.0149]}
              zoom={5}
              minZoom={4}
              maxZoom={13}
              maxBounds={[[-15, 90], [10, 145]]}
              maxBoundsViscosity={0.9}
              className="h-full w-full"
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
                noWrap={true}
              />

              {selectedVolcano && <MapUpdater koordinat={selectedVolcano.koordinat} />}
              <WilayahUpdater bounds={WILAYAH_FILTER.find((w) => w.value === filterWilayah)?.bounds ?? null} />
              {lokasi && <Marker position={lokasi} icon={ikonLokasi} interactive={false} />}

              {gunungTerfilter.map((gunung) => {
                const aktif = selectedVolcano?.id === gunung.id;
                const pulse = gunung.status.startsWith('Siaga') || gunung.status.startsWith('Awas');
                return (
                  <React.Fragment key={gunung.id}>
                    {gunung.radiusBahaya > 0 && (
                      <>
                        <Circle
                          center={gunung.koordinat}
                          pathOptions={{ color: gunung.warna, fillColor: gunung.warna, fillOpacity: 0.2, weight: 1.5 }}
                          radius={gunung.radiusBahaya}
                        />
                        <Circle
                          center={gunung.koordinat}
                          pathOptions={{ color: gunung.warna, fillColor: gunung.warna, fillOpacity: 0.08, weight: 1, dashArray: '4 4' }}
                          radius={gunung.radiusBahaya * 2.5}
                        />
                      </>
                    )}

                    <Marker
                      position={gunung.koordinat}
                      icon={buatIcon(gunung.warna, aktif, pulse)}
                      eventHandlers={{ click: () => setSelectedVolcano(gunung) }}
                    >
                      <Popup>
                        <strong>{gunung.nama}</strong>
                        <br />
                        <span style={{ color: gunung.warna }}>{gunung.status}</span>
                        {gunung.radiusBahaya > 0 && (
                          <><br /><span style={{ color: '#888' }}>Radius: {gunung.radiusBahaya / 1000} km</span></>
                        )}
                        <br />
                        <Link to={`/gunung/${gunung.id}`} style={{ color: '#d9651b', fontWeight: 600 }}>
                          Detail →
                        </Link>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>

            <div className="absolute bottom-4 right-4 z-[1000] max-w-[16rem] rounded-md border border-[#343c41] bg-[#1c2226]/90 px-4 py-3 text-sm">
              <h4 className="mb-2 border-b border-[#343c41] pb-2 font-semibold text-[#f1efe8]">Keterangan peta</h4>
              <p className="mb-1.5 text-xs text-[#8a908d]">Warna lingkaran = status gunung</p>
              <ul className="m-0 mb-3 flex list-none flex-wrap gap-x-3 gap-y-1 p-0">
                {LEVEL_ORDER.map((l) => (
                  <li key={l.nama} className="flex items-center gap-1.5 text-[#dcd9d0]">
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: l.warna }} />
                    {l.nama}
                  </li>
                ))}
              </ul>
              <ul className="m-0 flex list-none flex-col gap-1.5 border-t border-[#343c41] p-0 pt-3">
                <li className="flex items-center gap-2.5 text-[#dcd9d0]">
                  <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full border-2 border-[#dcd9d0]" />
                  Radius bahaya (PVMBG)
                </li>
                <li className="flex items-center gap-2.5 text-[#dcd9d0]">
                  <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full border border-dashed border-[#dcd9d0]" />
                  Area sekitar, 2,5× radius (ilustrasi)
                </li>
              </ul>
              <p className="mt-3 text-xs leading-snug text-[#8a908d]">Batas resmi KRB I–III ada di peta PVMBG.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#343c41] pt-8">
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
            <h3 className="simb-display text-xl text-[#f1efe8]">
              Statistik{filterWilayah ? ` — ${filterWilayah.replace('-', ' & ')}` : ' Nasional'}
            </h3>
            <p className="text-sm text-[#8a908d]">
              {gunungTerfilter.length} gunung api dipantau
            </p>
          </div>

          {/* Panel statistik per level */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statWilayah.map((l) => (
              <div
                key={l.nama}
                className="border border-[#343c41] rounded-md p-4"
                style={{ borderLeftColor: l.warna, borderLeftWidth: '3px' }}
              >
                <p className="simb-num text-4xl leading-none text-[#f1efe8]">{l.jumlah}</p>
                <p className="mt-2 text-sm font-semibold" style={{ color: l.warna }}>{l.nama}</p>
                <p className="simb-num text-xs text-[#5b666c] mt-1">
                  {gunungTerfilter.length > 0
                    ? `${Math.round((l.jumlah / gunungTerfilter.length) * 100)}%`
                    : '—'}
                </p>
              </div>
            ))}
          </div>

          {/* Penjelasan level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1c2226] border border-[#343c41] p-5 rounded-md transition-colors hover:border-[#e8801f]">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e8801f]/20 text-[#e8801f] font-bold">III</span>
                <h4 className="font-semibold text-[#f1efe8]">Siaga</h4>
              </div>
              <p className="text-sm text-[#a9ada9] leading-relaxed">
                Peningkatan aktivitas seismik dan vulkanik. Masyarakat di wilayah ancaman harus bersiap evakuasi.
              </p>
            </div>
            <div className="bg-[#1c2226] border border-[#343c41] p-5 rounded-md transition-colors hover:border-[#d9b72b]">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#d9b72b]/20 text-[#d9b72b] font-bold">II</span>
                <h4 className="font-semibold text-[#f1efe8]">Waspada</h4>
              </div>
              <p className="text-sm text-[#a9ada9] leading-relaxed">
                Ada aktivitas di atas level normal. Potensi ancaman bahaya masih terbatas di sekitar area kawah.
              </p>
            </div>
            <div className="bg-[#1c2226] border border-[#343c41] p-5 rounded-md transition-colors hover:border-[#3f9b5f]">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#3f9b5f]/20 text-[#3f9b5f] font-bold">I</span>
                <h4 className="font-semibold text-[#f1efe8]">Normal</h4>
              </div>
              <p className="text-sm text-[#a9ada9] leading-relaxed">
                Tidak ada gejala aktivitas tekanan magma yang signifikan. Aman untuk aktivitas di luar kawah.
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}