import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import Beranda from './pages/Beranda.jsx';
import PetaKRB from './pages/PetaKRB.jsx';
import PusatMitigasi from './pages/PusatMitigasi.jsx';
import Ensiklo from './pages/Ensiklo.jsx';
import AboutUs from './pages/AboutUs.jsx';
import Footer from './component/Footer.jsx';

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap');
.simb { font-family: 'Archivo', system-ui, sans-serif; }
.simb-display { font-stretch: 70%; font-weight: 800; letter-spacing: -0.015em; }
.simb-num { font-stretch: 78%; font-weight: 700; font-variant-numeric: tabular-nums; }
`;

const NAV = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/ensiklo', label: 'Ensiklopedia' },
  { to: '/mitigasi', label: 'Mitigasi' },
  { to: '/tentang', label: 'Tentang Kami' },
];
const CTA = { to: '/peta', label: 'Peta KRB' };

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcd9d0]';

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M3 27 L12 9 L16 14 L20 9 L29 27 Z" stroke="#f1efe8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 14 L14 21 L16 27" stroke="#d9651b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Nav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const overlay = pathname === '/';

  useEffect(() => setOpen(false), [pathname]);

  const linkCls = ({ isActive }) =>
    `relative py-2 text-[15px] font-medium transition-colors ${
      isActive
        ? 'text-[#f1efe8] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:bg-[#d9651b]'
        : 'text-[#c4c6c1] hover:text-[#f1efe8]'
    } ${focusRing}`;

  const ctaCls = ({ isActive }) =>
    `px-5 py-2 rounded-md border text-[15px] font-semibold transition-colors ${
      isActive
        ? 'bg-[#d9651b] border-[#d9651b] text-white'
        : 'border-[#f1efe8]/70 text-[#f1efe8] hover:bg-[#f1efe8]/10'
    } ${focusRing}`;

  const headerCls = open
    ? 'sticky top-0 z-50 bg-[#1c2226]'
    : overlay
    ? 'absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-[#1c2226]/85 to-transparent'
    : 'sticky top-0 z-50 bg-[#1c2226] border-b border-[#343c41]';

  return (
    <header className={headerCls}>
      <nav aria-label="Navigasi utama" className="max-w-[1920px] mx-auto px-6 lg:px-12 xl:px-16 h-20 flex items-center justify-between">
        <Link to="/" className={`flex items-center gap-3 ${focusRing}`}>
          <Mark />
          <span className="simb-display text-2xl text-[#f1efe8]">SIMB-GB</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkCls}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to={CTA.to} className={ctaCls}>
            {CTA.label}
          </NavLink>
        </div>

        <button
          type="button"
          className={`md:hidden p-2 -mr-2 text-[#f1efe8] ${focusRing}`}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M5 5 L19 19 M19 5 L5 19" /> : <path d="M4 7 H20 M4 12 H20 M4 17 H20" />}
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden md:hidden border-t border-[#343c41]"
          >
            <div className="px-6 pb-6 flex flex-col">
              {[...NAV, CTA].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `py-3.5 text-lg border-b border-[#343c41] ${
                      isActive ? 'text-[#f1efe8] font-semibold' : 'text-[#c4c6c1]'
                    } ${focusRing}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="simb relative min-h-screen bg-[#1c2226] text-[#dcd9d0]">
        <style>{FONT_CSS}</style>

        <Nav />

        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/ensiklo" element={<Ensiklo />} />
          <Route path="/peta" element={<PetaKRB />} />
          <Route path="/mitigasi" element={<PusatMitigasi />} />
          <Route path="/tentang" element={<AboutUs />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}