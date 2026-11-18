import dataGunung from '../data/gunung.json';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * Ambil daftar gunung api dari backend proxy (yang fetch ke MAGMA Indonesia).
 * Jika backend tidak tersedia, fallback ke data lokal gunung.json.
 */
export async function fetchMagmaRealtimeData() {
  try {
    const res = await fetch(`${API_URL}/api/gunung`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Respons kosong');
    return data;
  } catch (err) {
    console.warn('[magmaApi] Fallback ke data lokal:', err.message);
    return dataGunung;
  }
}
