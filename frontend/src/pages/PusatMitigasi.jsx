import React from 'react';
import PageHeader from '../component/PageHeader.jsx';

const FASE = [
  {
    id: 'pra-bencana',
    nama: 'Pra-Bencana',
    waktu: 'Sebelum erupsi',
    warna: '#8a908d',
    langkah: [
      'Pantau status (Normal, Waspada, Siaga, Awas) melalui PVMBG.',
      'Ketahui Kawasan Rawan Bencana (KRB).',
      'Siapkan tas siaga bencana (masker, kacamata, air, P3K).',
    ],
  },
  {
    id: 'saat-erupsi',
    nama: 'Saat Erupsi',
    waktu: 'Ketika erupsi berlangsung',
    warna: '#d9651b',
    langkah: [
      'Jauhi lereng gunung, lembah, dan daerah aliran lahar.',
      'Gunakan masker, kacamata pelindung, dan pakaian tertutup.',
      'Berlindung dan tutup wajah jika terjadi hujan abu.',
    ],
  },
  {
    id: 'pasca-erupsi',
    nama: 'Pasca Erupsi',
    waktu: 'Setelah erupsi mereda',
    warna: '#8a908d',
    langkah: [
      'Tetap di posko evakuasi hingga status aman.',
      'Amankan sumber makanan dan minuman dari abu vulkanik.',
      'Hindari berkendara karena abu merusak mesin dan jarak pandang.',
    ],
  },
];

export default function PusatMitigasi() {
  return (
    <>
      <PageHeader
        title="Pusat Mitigasi Bencana"
        description="Panduan keselamatan langkah demi langkah menghadapi erupsi gunung berapi."
      />

      <main className="mx-auto max-w-[1920px] px-6 lg:px-12 xl:px-16 py-10 lg:py-14">
        {FASE.map((f) => (
          <section
            key={f.id}
            id={f.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-4 py-10 border-t border-[#343c41] last:border-b"
          >
            <div className="lg:col-span-4 flex gap-5">
              <span aria-hidden="true" className="block w-1 self-stretch rounded-full" style={{ background: f.warna }} />
              <div>
                <h2 className="simb-display text-3xl lg:text-4xl leading-none text-[#f1efe8]">{f.nama}</h2>
                <p className="mt-2 text-[#8a908d]">{f.waktu}</p>
              </div>
            </div>

            <ul className="lg:col-span-8 m-0 p-0 list-none">
              {f.langkah.map((l) => (
                <li
                  key={l}
                  className="py-4 first:pt-0 border-t first:border-t-0 border-[#343c41] text-lg leading-relaxed text-[#dcd9d0] max-w-prose"
                >
                  {l}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="mt-8 text-[#8a908d]">
          Status terbaru setiap gunung api ada di{' '}
          <a
            href="https://magma.esdm.go.id/"
            target="_blank"
            rel="noreferrer"
            className="text-[#f1efe8] underline underline-offset-4 decoration-[#5b666c] hover:decoration-[#dcd9d0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]"
          >
            MAGMA Indonesia
          </a>
          .
        </p>
      </main>
    </>
  );
}