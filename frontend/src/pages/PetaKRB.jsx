import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import PageHeader from '../component/PageHeader.jsx';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import dataGunung from '../data/gunung.json';

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

const LEVEL_ORDER = [
  { nama: 'Awas', warna: '#d6322c', romawi: 'IV' },
  { nama: 'Siaga', warna: '#e8801f', romawi: 'III' },
  { nama: 'Waspada', warna: '#d9b72b', romawi: 'II' },
  { nama: 'Normal', warna: '#3f9b5f', romawi: 'I' },
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

export default function PetaKRB() {
  const [daftarGunung, setDaftarGunung] = useState([]);
  const [selectedVolcano, setSelectedVolcano] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openLevel, setOpenLevel] = useState('Siaga');

  useEffect(() => {
    setDaftarGunung(dataGunung);
    setSelectedVolcano(dataGunung[0]);
    setLoading(false);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return daftarGunung.filter((g) =>
      g.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, daftarGunung]);

  const grouped = useMemo(() => {
    return LEVEL_ORDER.map((level) => ({
      ...level,
      gunung: daftarGunung.filter((g) => g.status.startsWith(level.nama)),
    })).filter((l) => l.gunung.length > 0);
  }, [daftarGunung]);

  const handleSelectVolcano = (gunung) => {
    setSelectedVolcano(gunung);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#a9ada9]">
        Memuat peta…
      </div>
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

              {daftarGunung.map((gunung) => {
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
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>

            <div className="absolute bottom-4 right-4 bg-[#1c2226]/90 border border-[#343c41] rounded-md px-4 py-3 z-[1000] text-sm">
              <h4 className="font-semibold text-[#f1efe8] mb-2 pb-2 border-b border-[#343c41]">
                Zona bahaya
              </h4>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5 text-[#dcd9d0]">
                  <span className="w-3 h-3 rounded-full bg-[#d6322c]" />
                  KRB III — terdekat kawah
                </div>
                <div className="flex items-center gap-2.5 text-[#dcd9d0]">
                  <span className="w-3 h-3 rounded-full bg-[#d9b72b]" />
                  KRB II — zona tengah
                </div>
                <div className="flex items-center gap-2.5 text-[#dcd9d0]">
                  <span className="w-3 h-3 rounded-full bg-[#3f9b5f]" />
                  KRB I — zona luar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}