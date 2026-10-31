import React, { useState, useEffect } from 'react';
import PageHeader from '../component/PageHeader.jsx';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import dataGunung from '../data/gunung.json';


import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({ 
  iconRetinaUrl: iconRetina, 
  iconUrl: iconUrl, 
  shadowUrl: shadowUrl 
});

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
  
  // State untuk fitur pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setDaftarGunung(dataGunung);
    setSelectedVolcano(dataGunung[0]);
    setLoading(false);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = daftarGunung.filter((gunung) =>
        gunung.nama.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  const handleSelectVolcano = (gunung) => {
    setSelectedVolcano(gunung);
    setSearchQuery(''); 
    setSearchResults([]); 
  };

  if (loading) return <div className="text-center text-white mt-20">Memuat Peta...</div>;

  return (
    <>
      <PageHeader 
        title="Peta Kawasan Rawan Bencana" 
        description="Pemantauan radius bahaya, zona steril, dan level siaga gunung api secara interaktif."
      />

      <div className="px-6 lg:px-12 py-10 max-w-[1920px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1 bg-neutral-900 border border-neutral-700 p-6 rounded-xl flex flex-col gap-5 shadow-lg">
            
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Cari Gunung (Cth: Merapi)..." 
                className="w-full bg-neutral-800 border border-neutral-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-orange-500 shadow-inner"
              />

              {searchResults.length > 0 && (
                <ul className="absolute z-50 w-full bg-neutral-800 border border-neutral-600 mt-1 rounded-md max-h-48 overflow-y-auto shadow-2xl">
                  {searchResults.map((hasil) => (
                    <li 
                      key={hasil.id}
                      onClick={() => handleSelectVolcano(hasil)}
                      className="px-4 py-3 hover:bg-orange-600 cursor-pointer text-sm text-neutral-200 transition border-b border-neutral-700 last:border-0"
                    >
                      {hasil.nama} <span className="text-xs text-neutral-400 block mt-1">{hasil.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {selectedVolcano && (
              <div className="mt-2">
                <h3 className="text-2xl font-bold text-white mb-1">{selectedVolcano.nama}</h3>
                <p className="font-semibold mb-4 text-lg" style={{ color: selectedVolcano.warna }}>
                  {selectedVolcano.status}
                </p>
                
                <div className="text-sm text-neutral-300 space-y-4 mb-6 bg-neutral-800/80 p-4 rounded-lg border border-neutral-700 shadow-inner">
                  <p>
                    <strong className="text-white block mb-1 text-base">Jarak Steril:</strong>
                    Radius Bahaya <span className="text-red-400 font-bold">{selectedVolcano.radiusBahaya / 1000} km</span>
                  </p>
                  <p>
                    <strong className="text-white block mb-1 text-base">Status Visual & Rekomendasi:</strong>
                    <span className="leading-relaxed">{selectedVolcano.visual}</span>
                  </p>
                  <p className="text-xs text-neutral-500 italic mt-4 pt-4 border-t border-neutral-700">
                    Update: {selectedVolcano.waktuUpdate}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden relative z-0 h-[600px] lg:h-[700px] shadow-lg">
            <MapContainer center={[-2.5489, 118.0149]} zoom={5} className="h-full w-full">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />

              {selectedVolcano && <MapUpdater koordinat={selectedVolcano.koordinat} />}

              {daftarGunung.map((gunung) => (
                <React.Fragment key={gunung.id}>
                  {gunung.radiusBahaya > 0 && (
                    <>
                      <Circle 
                        center={gunung.koordinat}
                        pathOptions={{ color: 'red', fillColor: '#ef4444', fillOpacity: 0.4 }}
                        radius={gunung.radiusBahaya}
                      />
                      <Circle 
                        center={gunung.koordinat}
                        pathOptions={{ color: 'yellow', fillColor: '#eab308', fillOpacity: 0.2 }}
                        radius={gunung.radiusBahaya * 2}
                      />
                      <Circle 
                        center={gunung.koordinat}
                        pathOptions={{ color: 'green', fillColor: '#22c55e', fillOpacity: 0.1 }}
                        radius={gunung.radiusBahaya * 3.5}
                      />
                    </>
                  )}
                  
                  <Marker position={gunung.koordinat} eventHandlers={{ click: () => setSelectedVolcano(gunung) }}>
                    <Popup>
                      <strong>Gunung {gunung.nama}</strong><br/>
                      Status: <span style={{ color: gunung.warna, fontWeight: 'bold' }}>{gunung.status}</span>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}
            </MapContainer>
            
            <div className="absolute bottom-6 right-6 bg-black/85 p-4 rounded-lg border border-neutral-700 z-[1000] text-sm text-white shadow-2xl backdrop-blur-sm">
              <h4 className="font-bold text-neutral-300 mb-3 border-b border-neutral-600 pb-2">Legenda Zona</h4>
              <div className="flex items-center gap-3 mb-2"><span className="w-4 h-4 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span> KRB III (Pusat/Merah)</div>
              <div className="flex items-center gap-3 mb-2"><span className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span> KRB II (Tengah/Kuning)</div>
              <div className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span> KRB I (Luar/Hijau)</div>
            </div>
          </div>

        </div>
      </div>
    </>
  )};