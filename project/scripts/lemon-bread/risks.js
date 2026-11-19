window.LemonBreadData = window.LemonBreadData || {};

window.LemonBreadData.risks = {
  matrix: [
    { risk: 'Biaya & Aturan Lokasi', impact: 'Booth tidak dapat beroperasi atau modal Rp8,4 jt tidak cukup menutup sewa/deposit.', mitigation: 'Survei 5 titik lokasi, konfirmasi tarif sewa & izin tertulis pengelola sebelum kontrak.', priority: 'Tinggi' },
    { risk: 'Modal Kerja Tidak Cukup', impact: 'Operasional terhenti sebelum mencapai arus kas stabil.', mitigation: 'Validasi biaya di muka, pengadaan bertahap, jaga cadangan 20% (Rp1,7 jt).', priority: 'Tinggi' },
    { risk: 'Antrean Panjang Jam Sibuk', impact: 'Penumpang transit batal membeli karena takut ketinggalan jadwal.', mitigation: 'Batasi 5–7 SKU, pisahkan tugas kasir/dapur, gunakan bahan prepped, ukur waktu layanan.', priority: 'Tinggi' },
    { risk: 'Lokasi Sepi / Footfall Rendah', impact: 'Transaksi harian di bawah BEP (12–24 tx/hari).', mitigation: 'Observasi footfall di jam berangkat, istirahat, dan pulang sebelum komitmen lokasi.', priority: 'Sedang-Tinggi' },
    { risk: 'Harga Bahan Naik / HPP Melenceng', impact: 'Margin kontribusi turun di bawah 55% dan menaikkan BEP.', mitigation: 'Hitung HPP per SKU, siapkan supplier alternatif, kontrol takaran porsi.', priority: 'Sedang' },
    { risk: 'Bahan Baku Terbuang (Waste)', impact: 'Menggerus laba bersih harian terutama untuk roti & bahan segar.', mitigation: 'Forecast stok harian, metode FIFO/FEFO, catat waste harian.', priority: 'Sedang' },
    { risk: 'Produk Tidak Konsisten', impact: 'Pelanggan kecewa dan repeat purchase gagal terbentuk.', mitigation: 'SOP resep terukur, pelatihan singkat staf, quality check sebelum serah terima.', priority: 'Sedang' },
    { risk: 'Keamanan Pangan', impact: 'Risiko kesehatan pelanggan dan rusaknya reputasi brand.', mitigation: 'Sanitasi alat, penyimpanan suhu sesuai standar, label tanggal bahan.', priority: 'Tinggi' }
  ],
  validationRoadmap: [
    { step: '1. Location Research', activity: 'Daftar 5 lokasi transit; observasi arus orang; cek izin, sewa, deposit, dan utilitas.', output: 'Location comparison sheet, foto observasi, penawaran biaya resmi.' },
    { step: '2. Customer Research', activity: 'Wawancara & survei eksploratif 20–30 calon penumpang/komuter; uji kebutuhan dan harga.', output: 'Kuesioner, data mentah, ringkasan insight & WTP.' },
    { step: '3. Menu & Costing', activity: 'Tetapkan 5–7 SKU awal; hitung HPP rinci; uji resep, porsi, dan kemasan.', output: 'Recipe card, HPP sheet, hasil uji rasa.' },
    { step: '4. Operations Test', activity: 'Simulasi order (target ≤ 7 menit); uji skenario antrean; finalisasi SOP kebersihan.', output: 'Service-time log, SOP tertulis, checklist harian.' },
    { step: '5. Pilot Sales', activity: 'Uji penjualan terbatas skala kecil bila izin dan lokasi tersedia.', output: 'Catatan transaksi, omzet, waste, feedback pelanggan, dokumentasi foto.' },
    { step: '6. Evaluation', activity: 'Bandingkan kinerja pilot dengan target KPI dan asumsi BEP.', output: 'KPI report dan keputusan strategis: lanjut, perbaiki, atau hentikan.' }
  ],
  kpis: [
    { name: 'Service Time', target: '≤ 7 menit/pesanan', formula: 'Waktu dari pesanan diterima hingga pesanan diserahkan' },
    { name: 'Order Accuracy', target: '≥ 98%', formula: 'Pesanan sesuai tanpa revisi ÷ total pesanan × 100%' },
    { name: 'Conversion Rate', target: '≥ 60% pengunjung booth', formula: 'Jumlah pembeli ÷ jumlah pengunjung booth × 100%' },
    { name: 'Repeat Purchase', target: '≥ 30%', formula: 'Pelanggan kembali ÷ pelanggan teridentifikasi × 100%' },
    { name: 'Customer Satisfaction', target: '≥ 4,5 / 5', formula: 'Rata-rata skor survei/feedback singkat pelanggan' },
    { name: 'Average Order Value', target: 'Rp15.000 (atau teruji)', formula: 'Total penjualan ÷ jumlah transaksi' },
    { name: 'Gross Profit & Waste Rate', target: 'Margin ~55% · Waste terkendali', formula: 'Penjualan − HPP · Nilai produk terbuang ÷ total stok' }
  ],
  dataToCollect: [
    'Nama terminal/stasiun dan titik lokasi spesifik yang dipertimbangkan',
    'Biaya sewa, deposit, listrik, air, dan aturan operasional pengelola',
    'Ukuran area booth dan izin penempatan 4–6 kursi',
    'Data footfall aktual pada jam sibuk vs jam normal',
    'Daftar harga bahan baku & kemasan dari supplier lokal',
    'Perhitungan HPP aktual untuk setiap 5–7 SKU',
    'Benchmark harga kompetitor di radius area transit yang sama',
    'Hasil survei/wawancara 20–30 calon konsumen transit',
    'Estimasi upah tenaga kerja dan kebutuhan shift',
    'Persyaratan izin usaha & sertifikasi keamanan pangan'
  ]
};
