export async function fetchMagmaRealtimeData() {
  try {
    // Memanggil endpoint laporan aktivitas gunung api MAGMA Indonesia
    const RESPONSE = await fetch('https://esdm.go.id');
    
    if (!RESPONSE.ok) {
      throw new Error(`HTTP error! status: ${RESPONSE.status}`);
    }
    
    const DATA = await RESPONSE.json();
    
    if (DATA && DATA.success) {
      // Memetakan struktur data mentah API menjadi siap pakai di React Leaflet
      return DATA.data.map(gunung => {
        let warnaHex = "#16a34a"; // Default Level I (Normal)
        const STATUS_STR = gunung.status.toLowerCase();
        
        if (STATUS_STR.includes('waspada') || STATUS_STR.includes('ii')) {
          warnaHex = "#eab308"; // Level II
        } else if (STATUS_STR.includes('siaga') || STATUS_STR.includes('iii')) {
          warnaHex = "#d9651b"; // Level III
        } else if (STATUS_STR.includes('awas') || STATUS_STR.includes('iv')) {
          warnaHex = "#dc2626"; // Level IV
        }

        return {
          id: gunung.ga_code,
          nama: gunung.nama,
          status: gunung.status,
          warna: warnaHex,
          koordinat: [parseFloat(gunung.latitude), parseFloat(gunung.longitude)],
          visual: gunung.visual || "Tidak ada laporan visual.",
          rekomendasi: gunung.rekomendasi || "Ikuti arahan dari BPBD setempat.",
          waktuUpdate: `${gunung.tanggal_laporan} ${gunung.jam_laporan}`
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Gagal mengambil data dari MAGMA Indonesia:", error);
    return [];
  }
}
