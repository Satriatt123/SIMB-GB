export async function fetchMagmaRealtimeData() {
  try {
    // Memanggil endpoint laporan aktivitas gunung api MAGMA Indonesia
    const RESPONSE = await fetch('https://esdm.go.id');
    
    if (!RESPONSE.ok) {
      throw new Error(`HTTP error! status: ${RESPONSE.status}`);
    }
    
    const DATA = await RESPONSE.json();
    
    if (DATA && DATA.success) {
      return DATA.data.map(gunung => {
        let warnaHex = "#16a34a"; // Default Level I (Normal)
        const STATUS_STR = gunung.status.toLowerCase();
        
        function levelDariStatus(status = '') {
        const t = status.toLowerCase();
        if (t.includes('awas'))    return { romawi: 'IV',  warna: '#d6322c' };
        if (t.includes('siaga'))   return { romawi: 'III', warna: '#e8801f' };
        if (t.includes('waspada')) return { romawi: 'II',  warna: '#d9b72b' };
        return { romawi: 'I', warna: '#3f9b5f' };
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
