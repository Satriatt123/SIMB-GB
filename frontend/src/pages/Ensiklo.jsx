import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../component/PageHeader.jsx';

const FOTO = {
  erupsi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Merapi_2010_wedjo.jpg/1280px-Merapi_2010_wedjo.jpg',
  kawah: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Kawah_Ijen_Volcano_Blue_Fire_Ijen_Crater%2C_Banyuwangi%2C_East_Java%2C_Indonesia.jpg/1280px-Kawah_Ijen_Volcano_Blue_Fire_Ijen_Crater%2C_Banyuwangi%2C_East_Java%2C_Indonesia.jpg',
  lava: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Pahoeoe_fountain_original.jpg/1280px-Pahoeoe_fountain_original.jpg',
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
  { id: 'klasifikasi', label: 'Tipe gunung api' },
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

const KLASIFIKASI = [
  { tipe: 'Tipe A', jumlah: 76, deskripsi: 'Pernah meletus sejak tahun 1600 dan punya catatan sejarahnya.' },
  { tipe: 'Tipe B', jumlah: 30, deskripsi: 'Catatan letusannya berasal dari sebelum tahun 1600.' },
  { tipe: 'Tipe C', jumlah: 21, deskripsi: 'Belum punya catatan letusan, tetapi masih memperlihatkan jejak aktivitas seperti solfatara atau fumarola.' },
];
const TOTAL = KLASIFIKASI.reduce((n, k) => n + k.jumlah, 0);

function Foto({ src, alt, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-md bg-[#232a2f] ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
}

function Bagian({ id, judul, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[#343c41] py-14 first:border-t-0 first:pt-0 lg:py-20">
      {/* aksen garis oranye kiri judul bagian */}
      <div className="flex items-start gap-5">
        <div aria-hidden="true" className="mt-2 h-px w-6 shrink-0 bg-[#d9651b] self-center" />
        <h2 className="simb-display text-4xl leading-none text-[#f1efe8] lg:text-5xl">{judul}</h2>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Daftar({ items, sempit = false }) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map(([judul, isi]) => (
        <li
          key={judul}
          className={`grid gap-1 border-t border-[#343c41] py-5 last:border-b ${
            sempit ? '' : 'md:grid-cols-[13rem_1fr] md:gap-8'
          }`}
        >
          <h4 className="font-semibold text-[#f1efe8]">{judul}</h4>
          <p className="max-w-prose leading-relaxed text-[#a9ada9]">{isi}</p>
        </li>
      ))}
    </ul>
  );
}

function Subjudul({ children }) {
  return <h3 className="mb-3 mt-14 text-xl font-semibold text-[#f1efe8]">{children}</h3>;
}

export default function Ensiklo() {
  const [tab, setTab] = useState('internal');
  const [aktif, setAktif] = useState(BAGIAN[0].id);
  const data = PENYEBAB[tab];

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
      <PageHeader
        title="Pengetahuan Vulkanologi"
        description="Pahami penyebab terjadinya erupsi dan klasifikasi tipe gunung api di Indonesia."
      />

      <div className="simb bg-[#1c2226] text-[#dcd9d0]">
        <style>{FONT_CSS}</style>

        <div className="mx-auto w-full max-w-[1920px] px-6 py-12 lg:grid lg:grid-cols-[12rem_1fr] lg:gap-16 lg:px-12 lg:py-16 xl:px-16">
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
                <p className="max-w-prose text-lg leading-relaxed text-[#f1efe8]">{data.ringkas}</p>
                <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_20rem]">
                  <Daftar items={data.butir} sempit />
                  <Foto src={data.foto} alt={data.alt} className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[20rem]" />
                </div>
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

            <Bagian id="klasifikasi" judul="Tipe gunung api di Indonesia">
              <p className="max-w-prose leading-relaxed text-[#a9ada9]">
                Dari {TOTAL} gunung api aktif, PVMBG membaginya menjadi tiga tipe menurut catatan letusannya.
              </p>

              <div
                role="img"
                aria-label={`${KLASIFIKASI.map((k) => `${k.jumlah} ${k.tipe}`).join(', ')}`}
                className="mt-6 flex h-1.5 w-full gap-[2px]"
              >
                {KLASIFIKASI.map((k, i) => (
                  <span
                    key={k.tipe}
                    style={{
                      flexGrow: k.jumlah,
                      background: i === 0 ? '#d9651b' : i === 1 ? '#5b666c' : '#343c41',
                    }}
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
                    <p className="simb-num text-5xl leading-none text-[#f1efe8]">{k.jumlah}</p>
                  </li>
                ))}
              </ul>
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
                  className={`rounded-md bg-[#d9651b] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#e8742a] ${focusRing}`}
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