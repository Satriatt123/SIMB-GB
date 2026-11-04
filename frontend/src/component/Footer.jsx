import { Link } from 'react-router-dom';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]';

const linkCls =
  `text-[#a9ada9] hover:text-[#f1efe8] transition-colors underline underline-offset-4 decoration-[#5b666c] ${focusRing}`;

const NAV_LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/ensiklo', label: 'Ensiklopedia' },
  { to: '/mitigasi', label: 'Mitigasi' },
  { to: '/tentang', label: 'Tentang Kami' },
  { to: '/peta', label: 'Peta KRB' },
];

const SUMBER_DATA = [
  { href: 'https://magma.esdm.go.id/', label: 'MAGMA Indonesia' },
  { href: 'https://vsi.esdm.go.id/', label: 'PVMBG' },
];

function FooterMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M3 27 L12 9 L16 14 L20 9 L29 27 Z" stroke="#f1efe8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 14 L14 21 L16 27" stroke="#d9651b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1c2226] border-t border-[#343c41]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          <div className="space-y-4">
            <Link to="/" className={`inline-flex items-center gap-2.5 ${focusRing}`}>
              <FooterMark />
              <span className="simb-display text-xl text-[#f1efe8]">SIMB-GB</span>
            </Link>
            <p className="text-[#a9ada9] text-sm leading-relaxed max-w-xs">
              Sistem Informasi Manajemen Bencana Gunung Api
            </p>
          </div>

          <div>
            <p className="mb-4 text-sm text-[#8a908d]">Navigasi</p>
            <ul className="space-y-2.5" role="list">
              {NAV_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={`text-sm ${linkCls}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm text-[#8a908d]">Sumber data</p>
            <ul className="space-y-2.5" role="list">
              {SUMBER_DATA.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm ${linkCls}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#343c41] mt-10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-[#5b666c] text-xs">
            &copy; 2026 SIMB-GB &mdash; Kelompok 2, Sistem Informasi Manajemen Bencana
          </p>
          <p className="text-[#5b666c] text-xs max-w-md md:text-right">
            Data dan status gunung api bersumber dari PVMBG. Simulasi 3D bersifat ilustratif.
          </p>
        </div>
      </div>
    </footer>
  );
}
