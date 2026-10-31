import React, { useState } from 'react';
import PageHeader from '../component/PageHeader.jsx';

const KLASIFIKASI_GUNUNG = [
  {
    tipe: 'Tipe A (76 Gunung)',
    deskripsi: 'Gunung api yang memiliki catatan sejarah letusan sejak tahun 1600.',
  },
  {
    tipe: 'Tipe B (30 Gunung)',
    deskripsi: 'Gunung api yang memiliki catatan sejarah letusan sebelum tahun 1600.',
  },
  {
    tipe: 'Tipe C (21 Gunung)',
    deskripsi: 'Gunung api yang tidak memiliki catatan sejarah letusan, namun masih memperlihatkan jejak aktivitas vulkanik (seperti solfatara/fumarola).',
  }
];

export default function Ensiklo() {
  const [activeTab, setActiveTab] = useState('internal');

  return (
    <>
      <PageHeader 
        title="Pengetahuan Vulkanologi" 
        description="Pahami penyebab terjadinya erupsi dan klasifikasi tipe gunung api di Indonesia."
      />

      <div className="px-6 lg:px-12 py-10 max-w-[1920px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-700 p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Mengapa Gunung Meletus?</h2>
            
            {/* Navigasi Tab */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={() => setActiveTab('internal')}
                className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${
                  activeTab === 'internal' 
                    ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                Geologis Internal
              </button>
              <button 
                onClick={() => setActiveTab('eksternal')}
                className={`px-8 py-3 rounded-lg font-bold transition-all duration-300 ${
                  activeTab === 'eksternal' 
                    ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                Faktor Eksternal
              </button>
            </div>

            {/* Area Konten Tab & Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50">
              
              <div className="bg-black/40 rounded-xl h-[300px] flex items-center justify-center border border-neutral-700 relative overflow-hidden group">
                <div className="text-center p-4">
                  <span className="text-5xl block mb-3 opacity-50 group-hover:opacity-100 transition"></span>
                </div>
              </div>

              <div className="text-neutral-300 space-y-4">
                {activeTab === 'internal' ? (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-orange-400 mb-3 border-b border-neutral-700 pb-2">Geologis Internal</h3>
                    <ul className="list-disc pl-5 space-y-3 marker:text-orange-500">
                      <li><strong>Peningkatan Tekanan Magma:</strong> Magma di dalam dapur magma terakumulasi dan menghasilkan gas dengan tekanan tinggi.</li>
                      <li><strong>Pergerakan Lempeng Tektonik (Subduksi):</strong> Tumbukan antar lempeng bumi menyebabkan pelelehan batuan menjadi magma baru yang naik ke permukaan.</li>
                      <li><strong>Sumbatan Kawah:</strong> Tekanan dari bawah yang menghancurkan kubah lava atau sumbatan material padat di leher vulkanik.</li>
                    </ul>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-orange-400 mb-3 border-b border-neutral-700 pb-2">Faktor Eksternal</h3>
                    <ul className="list-disc pl-5 space-y-3 marker:text-orange-500">
                      <li><strong>Gempa Tektonik Lokal:</strong> Guncangan gempa bumi di sekitar gunung api dapat merusak kestabilan dapur magma dan memicu erupsi.</li>
                      <li><strong>Curah Hujan Tinggi:</strong> Air hujan yang masuk ke dalam rekahan kawah dangkal dapat mendidih tiba-tiba, memicu letusan freatik (uap).</li>
                      <li><strong>Longsoran Badan Gunung:</strong> Hilangnya material penahan di lereng gunung secara masif dapat melepaskan tekanan magma secara mendadak.</li>
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-white mb-1">Klasifikasi Gunung Api</h3>
            
            {KLASIFIKASI_GUNUNG.map((item, index) => (
              <div 
                key={index} 
                className="bg-neutral-900 border border-neutral-700 p-5 rounded-2xl flex items-start gap-4 hover:border-orange-500/50 transition-colors shadow-lg group"
              >
                <div className="text-4xl bg-neutral-800 p-3 rounded-xl border border-neutral-700 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                    {item.tipe}
                  </h4>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </>
  );
}