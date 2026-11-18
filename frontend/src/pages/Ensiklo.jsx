import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useSpring, useInView } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FOTO = {
erupsi: new URL('../../asset/erupsi.jpg', import.meta.url).href,
kawah: new URL('../../asset/kawah.jpg', import.meta.url).href,
lava: new URL('../../asset/lava.jpg', import.meta.url).href,
};

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap');
.simb { font-family: 'Archivo', system-ui, sans-serif; }
.simb-display { font-stretch: 70%; font-weight: 800; letter-spacing: -0.015em; }
.simb-num { font-stretch: 78%; font-weight: 700; font-variant-numeric: tabular-nums; }
`;

const focusRing =
'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]';

const BAGIAN = [
{ id: 'pengertian', label: 'Apa itu erupsi' },
{ id: 'penyebab', label: 'Mengapa meletus' },
{ id: 'tanda', label: 'Tanda-tandanya' },
{ id: 'dampak', label: 'Dampak' },
{ id: 'sejarah', label: 'Letusan besar' },
{ id: 'klasifikasi', label: 'Tipe gunung api' },
{ id: 'kuis', label: 'Kuis' },
];

const MATERIAL = [
['Lava', 'Magma yang sudah sampai di permukaan. Mengalir pelan di lereng atau menumpuk di puncak sebagai kubah.'],
['Awan panas', 'Campuran gas, abu, dan batuan bersuhu tinggi yang meluncur cepat menuruni lereng. Di Merapi dikenal sebagai wedhus gembel.'],
['Abu dan batuan', 'Butiran halus sampai bongkah yang dilontarkan ke udara. Abunya bisa terbawa angin jauh dari gunung.'],
['Gas', 'Uap air, karbon dioksida, belerang dioksida, dan hidrogen sulfida. Sebagian di antaranya beracun.'],
];

const CARA = [
['Efusif', 'Magma encer dan gasnya mudah lepas, sehingga lava mengalir cukup tenang.'],
['Eksplosif', 'Magma kental menahan gas. Tekanan menumpuk sampai terjadi ledakan, abu tebal, dan awan panas.'],
];

const PENYEBAB = {
internal: {
label: 'Geologis internal',
ringkas: 'Berasal dari dalam bumi: magma terbentuk, menumpuk, lalu mencari jalan keluar.',
foto: FOTO.kawah,
alt: 'Kawah gunung api yang mengepulkan asap',
butir: [
['Subduksi lempeng', 'Di Sumatra dan Jawa, Lempeng Indo-Australia menunjam ke bawah Lempeng Eurasia. Batuan di kedalaman meleleh jadi magma baru yang naik ke atas.'],
['Tekanan gas', 'Gas terlarut dalam magma mengembang saat magma naik, seperti botol soda yang baru dibuka. Makin kental magmanya, makin sulit gas lepas.'],
['Dapur magma terisi', 'Pasokan magma baru terus masuk. Saat tekanannya melebihi kekuatan batuan penutup, magma menerobos keluar.'],
['Kubah lava runtuh', 'Lava yang menumpuk di puncak bisa longsor oleh gravitasi dan memicu awan panas guguran, seperti yang sering terjadi di Merapi.'],
],
},
eksternal: {
label: 'Faktor eksternal',
ringkas: 'Pemicu dari luar sistem magma. Umumnya bekerja pada gunung yang sudah siap meletus.',
foto: FOTO.lava,
alt: 'Lava pijar mengalir di lereng gelap',
butir: [
['Hujan ekstrem', 'Air meresap ke rekahan dan melemahkan lapisan penutup kawah. Material lepas di lereng juga ikut terbawa menjadi lahar hujan.'],
['Erupsi freatik', 'Air tanah bertemu batuan panas, berubah jadi uap, lalu meledak. Sering muncul dengan tanda yang tipis.'],
['Gempa regional', 'Gempa tektonik dari luar dapat mengubah tegangan batuan dan membuka jalur bagi magma.'],
['Aktivitas manusia', 'Pengeboran panas bumi atau konstruksi berat bisa mengganggu kestabilan. Pengaruhnya jauh lebih kecil dari faktor alam dan masih diteliti.'],
],
},
};

const TANDA = [
['Gempa vulkanik makin sering', 'Jumlah dan kekuatannya naik dari biasanya, baik yang dangkal maupun yang dalam.'],
['Gas kawah meningkat', 'Kadar belerang dioksida atau karbon dioksida naik, kadang tercium bau belerang.'],
['Tubuh gunung menggembung', 'Magma yang naik mendorong lereng. Perubahannya terbaca alat ukur kemiringan dan GPS.'],
['Suhu kawah dan mata air naik', 'Air panas muncul di tempat baru, atau mata air berubah suhu dan warna.'],
['Satwa turun dari lereng', 'Sering dilaporkan warga, tetapi belum bisa dijadikan patokan tunggal.'],
];

const POSITIF = [
['Tanah subur', 'Abu dan material vulkanik kaya mineral. Lereng gunung api jadi lahan pertanian yang produktif.'],
['Bahan bangunan', 'Pasir dan batu vulkanik dipakai untuk beton dan aspal.'],
['Mineral', 'Belerang dimanfaatkan untuk industri dan pertanian, sedangkan silika untuk kaca dan keramik.'],
['Panas bumi', 'Panas dari dapur magma bisa diubah jadi listrik, dan Indonesia punya cadangan yang sangat besar.'],
['Air dan wisata', 'Lereng gunung menyimpan mata air. Panorama dan jalur pendakian menghidupi ekonomi warga sekitar.'],
];

const NEGATIF = [
['Awan panas', 'Bersuhu ratusan derajat Celsius dan bergerak sangat cepat. Hampir mustahil dihindari kalau sudah terlihat.'],
['Lahar', 'Campuran air dan material vulkanik yang mengalir lewat sungai. Bisa terjadi bertahun-tahun setelah erupsi, saat hujan deras.'],
['Abu vulkanik', 'Mengganggu pernapasan dan mata, menutup bandara, merusak tanaman, dan membebani atap sampai roboh.'],
['Gas beracun', 'Karbon dioksida lebih berat dari udara dan mengendap di cekungan tanpa bau. Belerang dioksida mengiritasi paru-paru.'],
['Longsor dan tsunami', 'Runtuhnya sebagian tubuh gunung ke laut bisa memicu tsunami, seperti Anak Krakatau pada Desember 2018.'],
['Kerugian sosial', 'Pengungsian, hilangnya lahan dan ternak, serta jalan dan jembatan yang rusak.'],
];

const LETUSAN_BESAR = [
['1815 · Tambora', 'Sumbawa. Sekitar 90.000 korban jiwa: sekitar 10.000 akibat letusan dan sekitar 80.000 akibat gagal panen dan kelaparan.'],
['1883 · Krakatau', 'Selat Sunda. Skala VEI 6 dengan sekitar 36.000 korban jiwa, sebagian besar akibat tsunami yang menyusul.'],
['1982 · Galunggung', 'Jawa Barat. Skala VEI 4 dengan 68 korban jiwa.'],
['2010 · Merapi', 'Jawa Tengah dan DIY. Skala VEI 4.'],
];

const KLASIFIKASI = [
{ tipe: 'Tipe A', jumlah: 76, deskripsi: 'Pernah meletus sejak tahun 1600 dan punya catatan sejarahnya.' },
{ tipe: 'Tipe B', jumlah: 30, deskripsi: 'Catatan letusannya berasal dari sebelum tahun 1600.' },
{ tipe: 'Tipe C', jumlah: 21, deskripsi: 'Belum punya catatan letusan, tetapi masih memperlihatkan jejak aktivitas seperti solfatara atau fumarola.' },
];
const TOTAL = KLASIFIKASI.reduce((n, k) => n + k.jumlah, 0);

// --------------------------------------------------------------------------
// THREE.JS PROCEDURAL TECTONIC SUBDUCTION & MAGMA CHAMBER VISUALIZER
// --------------------------------------------------------------------------
function Tectonic3DChamber() {
const magmaRef = useRef();
const particleGroup = useRef();

// Partikel magma naik secara prosedural
const particles = useMemo(
  () =>
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.sin(i * 12.9898) * 0.4,
      y: -1.5 + ((Math.sin(i * 78.233) + 1) / 2) * 2.5,
      z: Math.cos(i * 4.1414) * 0.4,
      speed: 0.005 + ((Math.sin(i * 3.17) + 1) / 2) * 0.01,
    })),
  []
);

useFrame((state) => {
if (magmaRef.current) {
magmaRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
}
if (particleGroup.current) {
particleGroup.current.children.forEach((p, idx) => {
p.position.y += particles[idx].speed;
if (p.position.y > 1.2) p.position.y = -1.5;
});
}
});

return (
<group position={[0, -0.2, 0]}>
{/* Lempeng Kerak Bumi (Oceanic & Continental Crust) */}
<mesh position={[-0.55, 0.18, 0]} rotation-z={-0.32}>
<boxGeometry args={[1.8, 0.12, 0.18]} />
<meshBasicMaterial color="#6d8791" />
</mesh>

<mesh position={[0.75, 0.25, 0]}>
<boxGeometry args={[1.4, 0.12, 0.18]} />
<meshBasicMaterial color="#75634f" />
</mesh>

  {/* Dapur Magma (Magma Chamber) */}
  <mesh ref={magmaRef} position={[0.4, -0.75, 0]}>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshStandardMaterial color="#ff3b00" emissive="#ff3b00" emissiveIntensity={1.2} wireframe />
  </mesh>

  <mesh position={[0.4, -0.08, 0]}>
    <cylinderGeometry args={[0.07, 0.13, 0.9, 12]} />
    <meshBasicMaterial color="#d9651b" transparent opacity={0.8} />
  </mesh>

  {/* Partikel Magma Naik */}
  <group ref={particleGroup} position={[0.4, 0, 0]}>
    {particles.map((p, i) => (
      <mesh key={i} position={[p.x, p.y, p.z]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ff9a5a" />
      </mesh>
    ))}
  </group>

  {/* Gunung Api Prosedural Kerucut */}
  <mesh position={[0.4, 0.72, 0]}>
    <coneGeometry args={[0.45, 0.8, 16]} />
    <meshStandardMaterial color="#8a6b52" emissive="#301d12" emissiveIntensity={0.1} side={THREE.DoubleSide} />
  </mesh>
  <mesh position={[0.4, 1.13, 0]} rotation-x={Math.PI / 2}>
    <torusGeometry args={[0.12, 0.025, 8, 16]} />
    <meshBasicMaterial color="#d9651b" />
  </mesh>
</group>


);
}

function AngkaNaik({ nilai, durasi = 1.2, diam = false }) {
const ref = useRef(null);
const terlihat = useInView(ref, { once: true, margin: '-40px' });
const [tampil, setTampil] = useState(0);

useEffect(() => {
if (diam || !terlihat) return undefined;
let raf;
const mulai = performance.now();
const langkah = (t) => {
const p = Math.min(1, (t - mulai) / (durasi * 1000));
setTampil(Math.round(nilai * (1 - Math.pow(1 - p, 3))));
if (p < 1) raf = requestAnimationFrame(langkah);
};
raf = requestAnimationFrame(langkah);
return () => cancelAnimationFrame(raf);
}, [terlihat, nilai, durasi, diam]);

return <span ref={ref}>{(diam ? nilai : tampil).toLocaleString('id-ID')}</span>;
}

function Foto({ src, alt, className = '' }) {
const reduce = useReducedMotion();
return (
<div className={`overflow-hidden rounded-md bg-[#232a2f] ${className}`}>
<motion.img
src={src}
alt={alt}
loading="lazy"
initial={{ scale: reduce ? 1 : 1.03 }}
whileInView={{ scale: 1 }}
viewport={{ once: true, margin: '-60px' }}
transition={{ duration: reduce ? 0 : 0.8, ease: [0.25, 0.1, 0.25, 1] }}
className="h-full w-full object-cover"
onError={(e) => { e.currentTarget.style.display = 'none'; }}
/>
</div>
);
}

function Bagian({ id, judul, children }) {
const reduce = useReducedMotion();
return (
<motion.section
id={id}
initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 24 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: '-60px' }}
transition={{ duration: reduce ? 0 : 0.5 }}
className="scroll-mt-36 lg:scroll-mt-24 border-t border-[#343c41] py-14 first:border-t-0 first:pt-0 lg:py-20"
>
<h2 className="simb-display mb-6 text-3xl leading-tight text-[#f1efe8] lg:text-4xl">{judul}</h2>

{children}
</motion.section>
);
}

function Daftar({ items, sempit = false }) {
return (
<ul className="m-0 list-none p-0">
{items.map(([judul, isi]) => (
<li
key={judul}
className={`grid gap-1 border-t border-[#343c41] py-5 last:border-b ${sempit ? '' : 'md:grid-cols-[13rem_1fr] md:gap-8'}`}
>
<h3 className="font-semibold text-[#f1efe8]">{judul}</h3>
<p className="max-w-prose leading-relaxed text-[#a9ada9]">{isi}</p>
</li>
))}
</ul>
);
}

function Subjudul({ children }) {
return <h3 className="mb-4 mt-10 text-xl font-semibold text-[#f1efe8]">{children}</h3>;
}

const KUIS = [
{
tanya: 'Magma yang sudah sampai di permukaan disebut apa?',
opsi: ['Abu vulkanik', 'Lava', 'Lahar'],
benar: 1,
jelas: 'Magma yang sudah sampai di permukaan disebut lava.',
},
{
tanya: 'Mengapa gunung api bisa meletus secara eksplosif?',
opsi: ['Magma encer dan gasnya mudah lepas', 'Tidak ada gas di dalam magma', 'Magma kental menahan gas sehingga tekanan menumpuk'],
benar: 2,
jelas: 'Magma kental menahan gas. Tekanan menumpuk sampai terjadi ledakan, abu tebal, dan awan panas.',
},
{
tanya: 'Di Sumatra dan Jawa, lempeng mana yang menunjam ke bawah Lempeng Eurasia?',
opsi: ['Lempeng Indo-Australia', 'Lempeng Pasifik', 'Lempeng Antartika'],
benar: 0,
jelas: 'Di Sumatra dan Jawa, Lempeng Indo-Australia menunjam ke bawah Lempeng Eurasia. Batuan di kedalaman meleleh jadi magma baru yang naik ke atas.',
},
{
tanya: 'Apa yang memicu erupsi freatik?',
opsi: ['Kubah lava yang longsor', 'Air tanah bertemu batuan panas lalu berubah jadi uap', 'Pasokan magma baru yang terus masuk'],
benar: 1,
jelas: 'Air tanah bertemu batuan panas, berubah jadi uap, lalu meledak. Sering muncul dengan tanda yang tipis.',
},
{
tanya: 'Mengapa karbon dioksida dari gunung api berbahaya di cekungan?',
opsi: ['Lebih berat dari udara, mengendap, dan tidak berbau', 'Lebih ringan dari udara dan naik ke atas', 'Berbau menyengat sehingga mudah dikenali'],
benar: 0,
jelas: 'Karbon dioksida lebih berat dari udara dan mengendap di cekungan tanpa bau.',
},
{
tanya: 'Tahun 1816, setelah letusan Tambora, dikenal sebagai apa?',
opsi: ['Tahun tanpa musim hujan', 'Tahun hujan abu', 'Tahun tanpa musim panas'],
benar: 2,
jelas: 'Abunya menurunkan suhu global, dan tahun 1816 dikenal sebagai tahun tanpa musim panas.',
},
];

function Kuis() {
const reduce = useReducedMotion();
const [idx, setIdx] = useState(0);
const [pilih, setPilih] = useState(null);
const [skor, setSkor] = useState(0);
const [selesai, setSelesai] = useState(false);
const lanjutRef = useRef(null);
const soal = KUIS[idx];

useEffect(() => {
if (pilih !== null && lanjutRef.current) lanjutRef.current.focus();
}, [pilih]);

const jawab = (i) => {
if (pilih !== null) return;
setPilih(i);
if (i === soal.benar) setSkor((n) => n + 1);
};

const lanjut = () => {
if (idx + 1 >= KUIS.length) {
setSelesai(true);
return;
}
setIdx(idx + 1);
setPilih(null);
};

const ulang = () => {
setIdx(0);
setPilih(null);
setSkor(0);
setSelesai(false);
};

const tombolUtama = `rounded-md bg-[#d9651b] px-6 py-3 font-semibold text-white transition-all hover:bg-[#e8742a] active:scale-[0.97] ${focusRing}`;
const tombolLine = `rounded-md border border-[#f1efe8]/70 px-6 py-3 font-semibold text-[#f1efe8] transition-all hover:bg-[#f1efe8]/10 active:scale-[0.97] ${focusRing}`;

if (selesai) {
return (
<motion.div
role="status"
initial={{ opacity: 0, y: reduce ? 0 : 12 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: reduce ? 0 : 0.3 }}
>
<h3 className="text-2xl font-semibold text-[#f1efe8]">Kuis selesai</h3>
<p className="mt-4 text-lg text-[#a9ada9]">
  Skor kamu: <span className="simb-num text-[#f1efe8]">{skor}</span> / {KUIS.length}
</p>
<div className="mt-6 flex flex-wrap gap-4">
  <button type="button" onClick={ulang} className={tombolUtama}>Ulangi kuis</button>
  <a href="#pengertian" className={tombolLine}>Baca lagi: mengapa gunung meletus →</a>
</div>
</motion.div>
);
}

return (
<div>
  <div className="flex items-center justify-between text-sm text-[#a9ada9]">
    <span>Pertanyaan {idx + 1} dari {KUIS.length}</span>
    <span>Skor {skor}</span>
  </div>
  <div className="mt-3 h-1.5 overflow-hidden rounded-[1px] bg-[#232a2f]">
    <motion.span
      animate={{ width: `${((idx + (pilih !== null ? 1 : 0)) / KUIS.length) * 100}%` }}
      transition={{ duration: reduce ? 0 : 0.3 }}
      className="block h-full rounded-[1px] bg-[#d9651b]"
    />
  </div>
  <motion.div
    key={idx}
    initial={{ opacity: 0, x: reduce ? 0 : 12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: reduce ? 0 : 0.2 }}
  >
    <h3 className="mt-8 max-w-prose text-xl font-semibold leading-snug text-[#f1efe8] lg:text-2xl">{soal.tanya}</h3>

    <ul className="m-0 mt-6 list-none p-0">
      {soal.opsi.map((o, i) => {
        const benar = pilih !== null && i === soal.benar;
        const salah = pilih === i && i !== soal.benar;
        return (
          <li key={o} className="border-t border-[#343c41] last:border-b">
            <button
              type="button"
              onClick={() => jawab(i)}
              disabled={pilih !== null}
              className={`flex w-full items-center justify-between gap-4 py-4 text-left transition-colors ${focusRing} ${
                benar || salah
                  ? 'text-[#f1efe8]'
                  : pilih !== null
                  ? 'text-[#5b666c]'
                  : 'text-[#dcd9d0] hover:bg-[#f1efe8]/5'
              }`}
            >
              <span className="flex items-baseline gap-4">
                <span className="simb-num text-[#5b666c]">{'ABC'[i]}</span>
                <span>{o}</span>
              </span>
              {benar && (
                <>
                  <Check size={18} className="shrink-0 text-[#3f9b5f]" aria-hidden="true" />
                  <span className="sr-only">Jawaban benar</span>
                </>
              )}
              {salah && (
                <>
                  <X size={18} className="shrink-0 text-[#d6322c]" aria-hidden="true" />
                  <span className="sr-only">Jawabanmu belum tepat</span>
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>

    {pilih !== null && (
      <div className="mt-6" role="status">
        <p className={`font-semibold ${pilih === soal.benar ? 'text-[#3f9b5f]' : 'text-[#d9b72b]'}`}>
          {pilih === soal.benar ? 'Benar.' : 'Belum tepat.'}
        </p>
        <p className="mt-2 max-w-prose leading-relaxed text-[#a9ada9]">{soal.jelas}</p>
        <button ref={lanjutRef} type="button" onClick={lanjut} className={`mt-6 ${tombolUtama}`}>
          {idx + 1 >= KUIS.length ? 'Lihat hasil' : 'Pertanyaan berikutnya →'}
        </button>
      </div>
    )}
  </motion.div>
</div>
);
}

export default function Ensiklo() {
const [tab, setTab] = useState('internal');
const [aktif, setAktif] = useState(BAGIAN[0].id);
const data = PENYEBAB[tab];
const { scrollYProgress } = useScroll();
const progres = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
const reduce = useReducedMotion();

useEffect(() => {
document.title = 'Ensiklopedia | SIMB-GB';
}, []);

useEffect(() => {
const obs = new IntersectionObserver(
(entries) => entries.forEach((e) => e.isIntersecting && setAktif(e.target.id)),
{ rootMargin: '-25% 0px -65% 0px' }
);
BAGIAN.forEach((b) => {
const el = document.getElementById(b.id);
if (el) obs.observe(el);
});
return () => obs.disconnect();
}, []);

return (
<>


  <div className="simb bg-[#1c2226] text-[#dcd9d0]">
    <style>{FONT_CSS}</style>
    <motion.div
      aria-hidden="true"
      style={{ scaleX: reduce ? scrollYProgress : progres, transformOrigin: 'left' }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-[#d9651b]"
    />

    <div className="mx-auto w-full max-w-[1920px] px-6 py-12 lg:grid lg:grid-cols-[12rem_1fr] lg:gap-16 lg:px-12 lg:py-16 xl:px-16">
      <nav
        aria-label="Isi halaman, ringkas"
        className="sticky top-20 z-40 -mx-6 mb-8 overflow-x-auto border-b border-[#343c41] bg-[#1c2226]/95 px-6 py-3 backdrop-blur lg:hidden"
      >
        <ul className="m-0 flex list-none gap-2 whitespace-nowrap p-0">
          {BAGIAN.map((b) => (
            <li key={b.id}>
              <a
                href={`#${b.id}`}
                aria-current={aktif === b.id ? 'true' : undefined}
                className={`inline-block rounded-full border px-3.5 py-1.5 text-sm transition-colors ${focusRing} ${
                  aktif === b.id
                    ? 'border-[#d9651b] bg-[#d9651b]/15 text-[#f1efe8]'
                    : 'border-[#343c41] text-[#a9ada9]'
                }`}
              >
                {b.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Isi halaman" className="hidden lg:block">
        <ul className="sticky top-24 m-0 list-none p-0">
          {BAGIAN.map((b) => (
            <li key={b.id}>
              <a
                href={`#${b.id}`}
                aria-current={aktif === b.id ? 'true' : undefined}
                className={`block border-l py-1.5 pl-4 text-[15px] transition-colors ${focusRing} ${
                  aktif === b.id
                    ? 'border-[#d9651b] font-semibold text-[#f1efe8]'
                    : 'border-[#343c41] text-[#8a908d] hover:text-[#dcd9d0]'
                }`}
              >
                {b.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="min-w-0 max-w-5xl">
        <Bagian id="pengertian" judul="Apa itu gunung meletus?">
          <p className="max-w-3xl text-xl leading-snug text-[#f1efe8] lg:text-2xl">
            Gunung meletus, atau erupsi, adalah keluarnya magma, gas, dan material padat dari dalam bumi lewat kawah atau rekahan di gunung api. Magma yang sudah sampai di permukaan disebut lava.
          </p>
          <Foto src={FOTO.erupsi} alt="Kawah gunung api yang mengeluarkan lava dan asap" className="mt-10 aspect-[16/9] w-full" />

          <Subjudul>Yang keluar saat erupsi</Subjudul>
          <Daftar items={MATERIAL} />

          <Subjudul>Dua cara gunung meletus</Subjudul>
          <Daftar items={CARA} />
        </Bagian>

        <Bagian id="penyebab" judul="Mengapa gunung meletus?">
          <div role="tablist" aria-label="Jenis penyebab" className="inline-flex rounded-md border border-[#343c41] p-1">
            {Object.entries(PENYEBAB).map(([key, v]) => (
              <button
                key={key}
                role="tab"
                id={`tab-${key}`}
                aria-selected={tab === key}
                aria-controls="panel-penyebab"
                onClick={() => setTab(key)}
                className={`rounded px-5 py-2 text-sm font-semibold transition-colors ${focusRing} ${
                  tab === key ? 'bg-[#d9651b] text-white' : 'text-[#a9ada9] hover:text-[#f1efe8]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id="panel-penyebab" aria-labelledby={`tab-${tab}`} className="mt-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: reduce ? 0 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduce ? 0 : -12 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
              >
                <p className="max-w-prose text-lg leading-relaxed text-[#f1efe8]">{data.ringkas}</p>
                <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem]">
                  <Daftar items={data.butir} sempit />
                  
                  {/* Visualisasi 3D Subduksi Lempeng & Dapur Magma */}
                  <div className="h-64 lg:h-full min-h-[18rem] rounded-md border border-[#343c41] bg-[#161a1d] overflow-hidden relative">
                    <div className="absolute left-3 top-3 z-10 text-xs text-[#dcd9d0]">
                      Skema: lempeng menunjam, magma naik
                    </div>
                    <Canvas camera={{ position: [0, 1, 5], fov: 40 }} dpr={[1, 1.5]}>
                      <ambientLight intensity={0.7} />
                      <pointLight position={[3, 5, 3]} intensity={1.2} />
                      <Tectonic3DChamber />
                    </Canvas>
                    <div aria-hidden="true" className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 text-[10px]">
                      <span className="rounded bg-[#1c2226]/90 px-2 py-1 text-[#dcd9d0]">Lempeng</span>
                      <span className="rounded bg-[#1c2226]/90 px-2 py-1 text-[#ff9a5a]">Magma</span>
                      <span className="rounded bg-[#1c2226]/90 px-2 py-1 text-[#dcd9d0]">Gunung api</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Bagian>

        <Bagian id="tanda" judul="Tanda-tanda sebelum meletus">
          <Daftar items={TANDA} />
          <p className="mt-6 max-w-prose leading-relaxed text-[#a9ada9]">
            Tidak semua erupsi didahului tanda yang jelas, terutama erupsi freatik. Pegangan yang paling aman tetap status resmi dari PVMBG.
          </p>
        </Bagian>

        <Bagian id="dampak" judul="Dampak erupsi">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-12">
            <div>
              <h3 className="mb-1 text-xl font-semibold text-[#f1efe8]">Dampak positif</h3>
              <p className="mb-4 text-[#8a908d]">Biasanya dinikmati setelah erupsi reda.</p>
              <Daftar items={POSITIF} sempit />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-semibold text-[#f1efe8]">Dampak negatif</h3>
              <p className="mb-4 text-[#8a908d]">Sebagian terjadi saat erupsi, sebagian lagi menyusul kemudian.</p>
              <Daftar items={NEGATIF} sempit />
            </div>
          </div>

          <aside className="mt-14 grid gap-3 border-t border-[#343c41] pt-8 md:grid-cols-[9rem_1fr] md:items-baseline md:gap-8">
            <p className="simb-num text-6xl leading-none text-[#f1efe8]">1815</p>
            <p className="max-w-prose leading-relaxed text-[#a9ada9]">
              Letusan Tambora di Sumbawa adalah yang terbesar dalam sejarah tercatat. Abunya menurunkan suhu global, dan tahun 1816 dikenal sebagai tahun tanpa musim panas.
            </p>
          </aside>
        </Bagian>

        <Bagian id="sejarah" judul="Letusan besar dalam sejarah">
          <p className="max-w-prose leading-relaxed text-[#a9ada9]">
            Empat letusan di Indonesia yang tercatat luas, berurutan menurut tahun.
          </p>
          <div className="mt-6">
            <Daftar items={LETUSAN_BESAR} />
          </div>
          <p className="mt-4 max-w-prose text-sm text-[#8a908d]">
            Sumber: Wikipedia, “Volcanism of Indonesia”. Angka korban jiwa berbeda antarsumber, jadi anggap sebagai perkiraan.
          </p>
        </Bagian>

        <Bagian id="klasifikasi" judul="Tipe gunung api di Indonesia">
          <p className="max-w-prose leading-relaxed text-[#a9ada9]">
            Dari {TOTAL} gunung api aktif, PVMBG membaginya menjadi tiga tipe menurut catatan letusannya.
          </p>

          <div
            role="img"
            aria-label={`${KLASIFIKASI.map((k) => `${k.jumlah}${k.tipe}`).join(', ')}`}
            className="mt-6 flex h-1.5 w-full gap-[2px]"
          >
            {KLASIFIKASI.map((k, i) => (
              <motion.span
                key={k.tipe}
                initial={{ scaleX: reduce ? 1 : 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ flexGrow: k.jumlah, background: i === 0 ? '#d9651b' : i === 1 ? '#5b666c' : '#343c41', transformOrigin: 'left' }}
                className="block rounded-[1px]"
              />
            ))}
          </div>

          <ul className="m-0 mt-4 list-none p-0">
            {KLASIFIKASI.map((k) => (
              <li
                key={k.tipe}
                className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 border-t border-[#343c41] py-6 last:border-b md:grid-cols-[13rem_1fr_auto] md:gap-x-8"
              >
                <h4 className="text-xl font-semibold text-[#f1efe8]">{k.tipe}</h4>
                <p className="order-last col-span-2 mt-1 max-w-prose leading-relaxed text-[#a9ada9] md:order-none md:col-span-1 md:mt-0">
                  {k.deskripsi}
                </p>
                <p className="simb-num text-5xl leading-none text-[#f1efe8]"><AngkaNaik nilai={k.jumlah} diam={reduce} /></p>
              </li>
            ))}
          </ul>
        </Bagian>

        <Bagian id="kuis" judul="Uji pemahamanmu">
          <p className="mb-8 max-w-prose leading-relaxed text-[#a9ada9]">
            Enam pertanyaan dari isi halaman ini. Penjelasan tiap jawaban diambil dari bagian di atas.
          </p>
          <Kuis />
        </Bagian>

        <section className="border-t border-[#343c41] py-14 lg:py-20">
          <h2 className="simb-display max-w-2xl text-4xl leading-none text-[#f1efe8] lg:text-5xl">
            Cari tahu gunung api di dekatmu
          </h2>
          <p className="mt-4 max-w-prose leading-relaxed text-[#a9ada9]">
            Lihat status terbarunya, zona rawan di sekitar kawah, dan langkah yang perlu diambil saat status naik.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              to="/peta"
              className={`rounded-md bg-[#d9651b] px-6 py-3 font-semibold text-white transition-all hover:bg-[#e8742a] active:scale-[0.97] ${focusRing}`}
            >
              Buka peta KRB
            </Link>
            <Link
              to="/mitigasi"
              className={`rounded-md border border-[#f1efe8]/70 px-6 py-3 font-semibold text-[#f1efe8] transition-colors hover:bg-[#f1efe8]/10 ${focusRing}`}
            >
              Pelajari mitigasi →
            </Link>
          </div>
        </section>
      </main>
    </div>
  </div>
</>


);
}