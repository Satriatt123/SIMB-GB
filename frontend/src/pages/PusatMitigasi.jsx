import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  HardHat,
  ChevronDown,
  Package,
  Radio,
  Eye,
  Droplets,
  Wind,
  Heart,
  BookOpen,
} from 'lucide-react';
import PageHeader from '../component/PageHeader.jsx';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]';

const FASE = [
  {
    id: 'pra-bencana',
    nomor: 1,
    nama: 'Pra-Bencana',
    label: 'Kesiapsiagaan',
    waktu: 'Sebelum erupsi terjadi',
    ikon: Shield,
    langkah: [
      {
        judul: 'Pantau status gunung api secara rutin',
        isi: 'Periksa status aktivitas (Normal, Waspada, Siaga, Awas) melalui situs resmi PVMBG atau aplikasi MAGMA Indonesia. Biasakan cek minimal seminggu sekali jika tinggal di radius rawan.',
      },
      {
        judul: 'Kenali Kawasan Rawan Bencana (KRB)',
        isi: 'Ketahui apakah rumah, sekolah, atau tempat kerja berada di KRB I, II, atau III. Peta KRB tersedia di kantor BPBD setempat dan di situs PVMBG.',
      },
      {
        judul: 'Siapkan tas siaga bencana',
        isi: 'Kemas perlengkapan darurat: masker N95, kacamata pelindung, air minum kemasan, obat-obatan pribadi, senter, dokumen penting dalam kantong kedap air, dan makanan tahan lama.',
      },
      {
        judul: 'Tentukan jalur dan titik evakuasi',
        isi: 'Diskusikan dengan keluarga ke mana harus pergi saat alarm berbunyi. Hafalkan rute evakuasi dan lokasi posko yang ditetapkan BPBD.',
      },
      {
        judul: 'Ikut simulasi dan sosialisasi',
        isi: 'Ikuti latihan evakuasi yang diselenggarakan desa atau BPBD. Simulasi membantu mengurangi kepanikan saat bencana nyata terjadi.',
      },
      {
        judul: 'Pastikan komunikasi cadangan',
        isi: 'Simpan nomor darurat BPBD, PVMBG, dan RT/RW. Siapkan radio FM portabel karena sinyal seluler bisa hilang saat erupsi besar.',
      },
    ],
  },
  {
    id: 'saat-erupsi',
    nomor: 2,
    nama: 'Saat Erupsi',
    label: 'Tanggap darurat',
    waktu: 'Ketika erupsi sedang berlangsung',
    ikon: AlertTriangle,
    langkah: [
      {
        judul: 'Jauhi lereng, lembah, dan aliran sungai',
        isi: 'Awan panas dan lahar mengalir mengikuti lembah dan sungai. Evakuasi ke arah tegak lurus dari aliran, bukan searah atau berlawanan.',
      },
      {
        judul: 'Gunakan pelindung diri',
        isi: 'Kenakan masker atau kain basah untuk menutup hidung dan mulut. Pakai kacamata pelindung, baju lengan panjang, dan celana panjang untuk melindungi kulit dari abu panas.',
      },
      {
        judul: 'Berlindung saat hujan abu',
        isi: 'Jika terjebak di luar, cari tempat teduh yang kokoh. Tutup wajah, tundukkan badan, dan hindari bangunan beratap datar karena abu bisa menumpuk dan merobohkan atap.',
      },
      {
        judul: 'Jangan menyeberangi aliran lahar',
        isi: 'Lahar bisa datang tiba-tiba lewat sungai, bahkan saat cuaca cerah. Jangan menyeberangi jembatan yang sudah dinyatakan tidak aman.',
      },
      {
        judul: 'Ikuti arahan petugas evakuasi',
        isi: 'Dengarkan sirine, kentongan, atau pengumuman dari BPBD. Segera menuju posko evakuasi yang sudah ditentukan tanpa menunggu perintah kedua.',
      },
      {
        judul: 'Matikan listrik dan gas di rumah',
        isi: 'Sebelum meninggalkan rumah, cabut MCB listrik dan tutup keran gas. Ini mencegah kebakaran atau ledakan jika terjadi kerusakan instalasi.',
      },
    ],
  },
  {
    id: 'pasca-erupsi',
    nomor: 3,
    nama: 'Pasca Erupsi',
    label: 'Pemulihan',
    waktu: 'Setelah erupsi mereda',
    ikon: HardHat,
    langkah: [
      {
        judul: 'Tetap di posko hingga status diturunkan',
        isi: 'Jangan kembali ke rumah sebelum BPBD atau PVMBG menurunkan status gunung. Erupsi susulan bisa terjadi tanpa peringatan.',
      },
      {
        judul: 'Lindungi sumber air dan makanan',
        isi: 'Abu vulkanik mengandung mineral berbahaya. Tutup penampungan air, buang makanan yang terpapar abu, dan gunakan air kemasan sampai sumber air dinyatakan aman.',
      },
      {
        judul: 'Bersihkan abu dari atap secara bertahap',
        isi: 'Abu yang menumpuk bisa menyebabkan atap ambruk. Bersihkan sedikit demi sedikit, kenakan masker, dan siram dengan air agar abu tidak beterbangan.',
      },
      {
        judul: 'Hindari berkendara di jalan berdebu tebal',
        isi: 'Abu vulkanik merusak filter udara mesin, mengurangi jarak pandang, dan membuat jalan sangat licin. Gunakan kendaraan hanya jika sangat mendesak.',
      },
      {
        judul: 'Periksa kondisi kesehatan',
        isi: 'Segera ke pos kesehatan jika mengalami sesak napas, iritasi mata, atau batuk berkepanjangan. Abu halus bisa menyebabkan gangguan pernapasan serius.',
      },
      {
        judul: 'Waspadai lahar hujan',
        isi: 'Material vulkanik yang menumpuk di lereng bisa terbawa hujan deras menjadi lahar dingin. Ancaman ini berlangsung bertahun-tahun setelah erupsi, terutama saat musim hujan.',
      },
    ],
  },
];

const TAS_SIAGA = [
  { nama: 'Masker N95 atau masker kain tebal', ikon: Wind, keterangan: 'Melindungi pernapasan dari abu vulkanik halus. Sediakan minimal 2 per orang.' },
  { nama: 'Kacamata pelindung (goggle)', ikon: Eye, keterangan: 'Mencegah iritasi mata akibat abu dan partikel tajam.' },
  { nama: 'Air minum kemasan', ikon: Droplets, keterangan: 'Minimal 3 liter per orang untuk 3 hari. Simpan di tempat yang mudah dijangkau.' },
  { nama: 'Makanan tahan lama', ikon: Package, keterangan: 'Biskuit, sarden kaleng, mie instan, dan makanan yang tidak perlu dimasak.' },
  { nama: 'Kotak P3K dan obat pribadi', ikon: Heart, keterangan: 'Perban, antiseptik, obat penurun panas, dan obat resep yang sedang dikonsumsi.' },
  { nama: 'Senter dan baterai cadangan', ikon: Eye, keterangan: 'Listrik bisa padam. Senter LED hemat baterai adalah pilihan terbaik.' },
  { nama: 'Radio FM portabel', ikon: Radio, keterangan: 'Sumber informasi cadangan saat jaringan seluler dan internet mati.' },
  { nama: 'Dokumen penting dalam plastik kedap', ikon: BookOpen, keterangan: 'KTP, KK, akta, ijazah, dan buku rekening. Simpan juga salinan digitalnya di ponsel.' },
  { nama: 'Pakaian ganti dan jas hujan', ikon: HardHat, keterangan: 'Pakaian lengan panjang dan celana panjang untuk perlindungan. Jas hujan berguna saat hujan abu.' },
  { nama: 'Uang tunai secukupnya', ikon: Shield, keterangan: 'ATM dan pembayaran digital mungkin tidak berfungsi. Siapkan pecahan kecil.' },
];

const KONTAK_DARURAT = [
  { instansi: 'BPBD (Badan Penanggulangan Bencana Daerah)', nomor: '119 ext 8', keterangan: 'Pusat komando tanggap bencana di tingkat daerah.' },
  { instansi: 'PVMBG / MAGMA Indonesia', nomor: '(022) 7272606', keterangan: 'Pemantauan aktivitas vulkanik dan peringatan dini erupsi.' },
  { instansi: 'Basarnas (SAR)', nomor: '115', keterangan: 'Pencarian dan pertolongan korban bencana.' },
  { instansi: 'Ambulans / Gawat Darurat', nomor: '118 / 119', keterangan: 'Layanan medis darurat 24 jam.' },
  { instansi: 'Polisi', nomor: '110', keterangan: 'Pengamanan, evakuasi, dan pengaturan lalu lintas darurat.' },
  { instansi: 'PLN (Gangguan Listrik)', nomor: '123', keterangan: 'Laporan gangguan dan pemadaman listrik pasca-erupsi.' },
];

function FaseAccordion({ fase, index }) {
  const [buka, setBuka] = useState(index === 0);
  const Ikon = fase.ikon;

  return (
    <motion.section
      id={fase.id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border-t border-[#343c41] last:border-b"
    >
      <button
        onClick={() => setBuka((p) => !p)}
        aria-expanded={buka}
        aria-controls={`panel-${fase.id}`}
        className={`group flex w-full items-start gap-5 py-8 text-left transition-colors hover:bg-[#f1efe8]/[0.02] lg:py-10 ${focusRing}`}
      >
        <span className="simb-num mt-0.5 shrink-0 text-4xl leading-none text-[#5b666c] lg:text-5xl">
          {String(fase.nomor).padStart(2, '0')}
        </span>

        <div className="flex-1 min-w-0">
          <h2 className="simb-display text-2xl leading-tight text-[#f1efe8] lg:text-3xl">
            {fase.nama}
          </h2>
          <p className="mt-1.5 text-[#8a908d]">{fase.waktu}</p>
        </div>

        <motion.span
          animate={{ rotate: buka ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="mt-2 shrink-0 text-[#5b666c] transition-colors group-hover:text-[#dcd9d0]"
          aria-hidden="true"
        >
          <ChevronDown size={22} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {buka && (
          <motion.div
            id={`panel-${fase.id}`}
            role="region"
            aria-labelledby={fase.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <ul className="m-0 list-none p-0 pb-8 pl-[3.75rem] lg:pb-10 lg:pl-[4.5rem]">
              {fase.langkah.map((l, i) => (
                <motion.li
                  key={l.judul}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="grid gap-1 border-t border-[#343c41] py-5 first:border-t-0 first:pt-0 md:grid-cols-[14rem_1fr] md:gap-8"
                >
                  <h3 className="text-[15px] font-semibold text-[#f1efe8]">{l.judul}</h3>
                  <p className="max-w-prose text-[15px] leading-relaxed text-[#a9ada9]">{l.isi}</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export default function PusatMitigasi() {
  return (
    <>
      <PageHeader
        title="Pusat Mitigasi Bencana"
        description="Panduan keselamatan langkah demi langkah menghadapi erupsi gunung berapi."
      />

      <main className="mx-auto max-w-[1920px] px-6 lg:px-12 xl:px-16 py-16 lg:py-24">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p className="text-xl leading-snug text-[#f1efe8] lg:text-2xl">
            Mitigasi bencana vulkanik terbagi dalam tiga fase berurutan. Setiap fase memiliki langkah-langkah yang berbeda, dan kesiapan di fase awal sangat menentukan keselamatan di fase berikutnya.
          </p>
          <p className="mt-4 max-w-prose leading-relaxed text-[#a9ada9]">
            Klik setiap fase untuk melihat langkah-langkah detailnya.
          </p>
        </motion.div>

        <div className="mt-12 lg:mt-16">
          {FASE.map((f, i) => (
            <FaseAccordion key={f.id} fase={f} index={i} />
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mt-20 scroll-mt-24 border-t border-[#343c41] pt-14 lg:mt-28 lg:pt-20"
          id="tas-siaga"
        >
          <div aria-hidden="true" className="mb-4 h-px w-8 bg-[#d9651b]" />
          <h2 className="simb-display text-3xl leading-none text-[#f1efe8] lg:text-4xl">
            Tas siaga bencana
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-[#a9ada9]">
            Siapkan tas ini jauh-jauh hari dan simpan di tempat yang mudah dijangkau seluruh anggota keluarga. Periksa isinya setiap 6 bulan, ganti makanan dan air yang sudah kedaluwarsa.
          </p>

          <ul className="m-0 mt-8 list-none p-0">
            {TAS_SIAGA.map((item, i) => {
              const ItemIcon = item.ikon;
              return (
                <motion.li
                  key={item.nama}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="grid gap-1 border-t border-[#343c41] py-5 last:border-b md:grid-cols-[1.25rem_14rem_1fr] md:items-baseline md:gap-x-4"
                >
                  <ItemIcon size={15} className="hidden text-[#5b666c] md:block" aria-hidden="true" />
                  <h3 className="text-[15px] font-semibold text-[#f1efe8]">{item.nama}</h3>
                  <p className="max-w-prose text-[15px] leading-relaxed text-[#a9ada9]">{item.keterangan}</p>
                </motion.li>
              );
            })}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mt-20 scroll-mt-24 border-t border-[#343c41] pt-14 lg:mt-28 lg:pt-20"
          id="kontak-darurat"
        >
          <div aria-hidden="true" className="mb-4 h-px w-8 bg-[#d9651b]" />
          <h2 className="simb-display text-3xl leading-none text-[#f1efe8] lg:text-4xl">
            Kontak darurat
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-[#a9ada9]">
            Simpan nomor-nomor ini di ponsel dan catat di kertas yang disimpan bersama tas siaga. Saat bencana, jaringan seluler bisa terganggu — usahakan menelepon, bukan mengirim pesan.
          </p>

          <ul className="m-0 mt-8 list-none p-0">
            {KONTAK_DARURAT.map((k, i) => (
              <motion.li
                key={k.instansi}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="grid gap-1 border-t border-[#343c41] py-5 last:border-b md:grid-cols-[14rem_7rem_1fr] md:items-baseline md:gap-x-8"
              >
                <h3 className="text-[15px] font-semibold text-[#f1efe8]">{k.instansi}</h3>
                <p className="simb-num text-lg leading-tight text-[#d9651b]">{k.nomor}</p>
                <p className="max-w-prose text-[15px] leading-relaxed text-[#a9ada9]">{k.keterangan}</p>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mt-20 border-t border-[#343c41] pt-14 lg:mt-28 lg:pt-20"
        >
          <h2 className="simb-display max-w-2xl text-3xl leading-tight text-[#f1efe8] lg:text-4xl">
            Informasi resmi dan langkah selanjutnya
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-[#a9ada9]">
            Status terbaru setiap gunung api ada di{' '}
            <a
              href="https://magma.esdm.go.id/"
              target="_blank"
              rel="noreferrer"
              className={`text-[#f1efe8] underline underline-offset-4 decoration-[#5b666c] hover:decoration-[#dcd9d0] transition-colors ${focusRing}`}
            >
              MAGMA Indonesia
            </a>
            . Untuk peta kawasan rawan bencana dan pengetahuan vulkanologi lebih lanjut, gunakan halaman di bawah.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/peta"
              className={`rounded-md bg-[#d9651b] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#e8742a] ${focusRing}`}
            >
              Buka peta KRB
            </Link>
            <Link
              to="/ensiklo"
              className={`rounded-md border border-[#f1efe8]/70 px-6 py-3 font-semibold text-[#f1efe8] transition-colors hover:bg-[#f1efe8]/10 ${focusRing}`}
            >
              Pelajari vulkanologi →
            </Link>
          </div>
        </motion.section>

      </main>
    </>
  );
}
