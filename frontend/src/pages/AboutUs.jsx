import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
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
  { nama: 'Three.js', deskripsi: 'Visualisasi 3D model gunung berapi' },
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

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
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
  return (
    <>
      <PageHeader
        title="Tentang Kami"
        description="Tim mahasiswa di balik SIMB-GB — Sistem Informasi Manajemen Bencana Gunung Berapi."
      />

      <main className="mx-auto max-w-[1920px] px-6 lg:px-12 xl:px-16 py-16 lg:py-24">
        <section className="border-b border-[#343c41] pb-16">
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
              Teknik Geomatika, Institut Teknologi Sumatera. Seluruh data
              bersumber dari lembaga resmi pemerintah Indonesia.
            </p>
          </motion.div>
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

          <p className="mt-3 text-[#8a908d]">Kelompok 2 — Teknik Geomatika, ITERA</p>

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
