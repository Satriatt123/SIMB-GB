import React from 'react';

const TEAM_MEMBERS = [
  {
    nama: 'Vanessa Putri Anazwa',
    nim: 'NIM 124250061',
    peran: 'UI/3D Designer & Report Compiler',
    foto: ''
  },
  {
    nama: 'Satria Anjasmara Hammam',
    nim: 'NIM 124250063',
    peran: 'Lead Web Developer & QA',
    foto: ''
  },
  {
    nama: 'Chairil Fikri Maulidi',
    nim: 'NIM 124250055',
    peran: 'GIS & Map Developer',
    foto: ''
  },
  {
    nama: 'Ajeng Marganingtyas',
    nim: 'NIM 124250059',
    peran: 'Backend, Database & System Analyst',
    foto: ''
  },
  {
    nama: 'Nabila Tata Arinda',
    nim: 'NIM 124250060',
    peran: 'Content Integrator & Technical Writer',
    foto: ''
  }
];

export default function AboutUs() {
  return (
    <div className="p-8 max-w-6xl mx-auto min-h-[80vh] flex flex-col justify-center">
      
      <div className="flex items-center gap-4 mb-12 border-b border-neutral-700 pb-4">
        <div className="text-orange-500 text-4xl">👥</div>
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider">
          Tentang Kami - Kelompok 2
        </h2>
      </div>

      <div className="flex flex-col gap-8 items-center">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {TEAM_MEMBERS.slice(0, 3).map((member, idx) => (
            <div key={idx} className="bg-neutral-800/80 border border-neutral-700 p-6 rounded-xl flex flex-col items-center text-center shadow-lg transition hover:border-orange-500/50">
              <div className="flex items-center gap-4 mb-4 w-full justify-start">
                <img src={member.foto} alt={member.nama} className="w-16 h-16 rounded-full bg-neutral-700" />
                <div className="text-left">
                  <h3 className="text-white font-bold text-[15px]">{member.nama}</h3>
                  <p className="text-neutral-400 text-sm">({member.nim})</p>
                </div>
              </div>
              <p className="text-orange-400 text-sm font-medium w-full text-left border-t border-neutral-700 pt-3">
                {member.peran}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-2/3">
          {TEAM_MEMBERS.slice(3, 5).map((member, idx) => (
            <div key={idx} className="bg-neutral-800/80 border border-neutral-700 p-6 rounded-xl flex flex-col items-center text-center shadow-lg transition hover:border-orange-500/50">
              <div className="flex items-center gap-4 mb-4 w-full justify-start">
                <img src={member.foto} alt={member.nama} className="w-16 h-16 rounded-full bg-neutral-700" />
                <div className="text-left">
                  <h3 className="text-white font-bold text-[15px]">{member.nama}</h3>
                  <p className="text-neutral-400 text-sm">({member.nim})</p>
                </div>
              </div>
              <p className="text-orange-400 text-sm font-medium w-full text-left border-t border-neutral-700 pt-3">
                {member.peran}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}