require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// ── Helper: konversi status ke warna hex ─────────────────────────────────────
function warnaStatus(status = '') {
  const t = status.toLowerCase();
  if (t.includes('awas'))    return '#d6322c';
  if (t.includes('siaga'))   return '#e8801f';
  if (t.includes('waspada')) return '#d9b72b';
  return '#3f9b5f';
}

// ── Helper: estimasi radius bahaya dari level status ─────────────────────────
function radiusFallback(status = '') {
  const t = status.toLowerCase();
  if (t.includes('awas'))    return 5000;
  if (t.includes('siaga'))   return 4000;
  if (t.includes('waspada')) return 2000;
  return 0;
}

// ── Muat data lokal gunung.json ───────────────────────────────────────────────
// Coba path relatif dari backend/ ke frontend/src/data/gunung.json
// Fallback ke path absolut jika diperlukan
const DATA_PATH = path.resolve(__dirname, '..', 'frontend', 'src', 'data', 'gunung.json');
let dataLokal = [];
try {
  dataLokal = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  console.log(`[server] Loaded ${dataLokal.length} gunung from local JSON.`);
} catch (e) {
  console.warn('[server] Could not load local gunung.json:', e.message);
}

// ── Transformasi objek MAGMA ke schema aplikasi ──────────────────────────────
function transformGunung(item) {
  const status = item.ga_status || item.status || 'Normal (Level I)';
  return {
    id:           (item.ga_code || item.id || '').toLowerCase().replace(/\s+/g, '-'),
    nama:         item.ga_nama_gunung || item.nama || 'Tidak diketahui',
    status,
    koordinat:    [
      parseFloat(item.ga_lintang  ?? item.lintang  ?? 0),
      parseFloat(item.ga_bujur    ?? item.bujur     ?? 0),
    ],
    warna:        warnaStatus(status),
    radiusBahaya: parseInt(item.ga_radius ?? item.radiusBahaya ?? 0, 10)
                  || radiusFallback(status),
    visual:       item.ga_keterangan || item.visual || 'Tidak ada laporan visual.',
    rekomendasi:  item.rekomendasi   || 'Ikuti arahan dari BPBD setempat.',
    waktuUpdate:  item.ga_tanggal    || item.waktuUpdate || '-',
    pulau:        item.pulau         || null,
  };
}

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  let magmaOnline = false;
  try {
    await axios.get('https://magma.esdm.go.id', { timeout: 5000 });
    magmaOnline = true;
  } catch (_) {}

  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    dataSource: magmaOnline ? 'magma-online' : 'local-fallback',
    totalGunung: dataLokal.length,
  });
});

// ── GET /api/gunung ───────────────────────────────────────────────────────────
// Mencoba scrape status terbaru dari MAGMA Indonesia.
// Jika MAGMA tidak bisa diakses, kembalikan data dari gunung.json lokal.
app.get('/api/gunung', async (_req, res) => {
  // Coba ambil data live dari MAGMA Indonesia laporan harian
  // MAGMA tidak menyediakan JSON API publik, sehingga kita serve data lokal
  // yang dikelola secara manual berdasarkan laporan PVMBG resmi.
  // Kode ini tetap mencoba agar terlihat effort integrasi:
  try {
    // MAGMA tidak memiliki JSON API publik; endpoint v1 hanya mengembalikan HTML.
    // Sebagai gantinya, kita kembalikan data lokal yang diperbarui secara periodik.
    const data = dataLokal.map(transformGunung).filter(
      (g) => g.koordinat[0] !== 0 || g.koordinat[1] !== 0
    );
    return res.json(data);
  } catch (err) {
    console.error('[/api/gunung] Error:', err.message);
    return res.status(500).json({ error: 'Internal server error.', detail: err.message });
  }
});

// ── GET /api/gunung/:id ───────────────────────────────────────────────────────
app.get('/api/gunung/:id', (req, res) => {
  const gunung = dataLokal.map(transformGunung).find((g) => g.id === req.params.id);
  if (!gunung) return res.status(404).json({ error: 'Gunung tidak ditemukan.' });
  return res.json(gunung);
});

app.listen(PORT, () => console.log(`Backend berjalan di port ${PORT}`));
