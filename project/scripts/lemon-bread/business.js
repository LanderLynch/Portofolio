window.LemonBreadData = window.LemonBreadData || {};

window.LemonBreadData.business = {
  swotIntegrated: {
    status: 'Business Assumption',
    note: 'SWOT berikut menggabungkan hipotesis awal booth (Source A & C) dan tinjauan kompetitif program 2027–2028 (Source B). Seluruhnya merupakan hipotesis awal yang perlu diuji melalui riset pasar.',
    quadrants: [
      {
        key: 'S',
        title: 'Strengths (Kekuatan)',
        items: [
          'Konsep target pasar transit yang spesifik dengan kombinasi makanan dan minuman dalam satu booth (Source A & C).',
          'Identitas visual maskot penguin & nuansa vintage yang ramah dan mudah dikenali (Source A & C).',
          'Porsi produk praktis yang sesuai untuk pelanggan saat beristirahat atau transit (Source B).',
          'Harga awal terjangkau dengan konsep cepat saji (Source A).'
        ]
      },
      {
        key: 'W',
        title: 'Weaknesses (Kelemahan)',
        items: [
          'Brand awareness dan basis pelanggan belum terbentuk; data penjualan aktual belum tersedia (Source A & C).',
          'Modal awal booth terbatas (< Rp10 juta) dengan kapasitas duduk kecil (4–6 kursi) (Source A & C).',
          'Model made-to-order berisiko memperpanjang waktu tunggu saat jam ramai (Source A & C).',
          'Belum menyediakan pilihan makanan berat/utama untuk pelanggan yang butuh porsi lebih besar (Source B).'
        ]
      },
      {
        key: 'O',
        title: 'Opportunities (Peluang)',
        items: [
          'Meningkatnya kebutuhan makanan & minuman praktis di area transit dengan mobilitas tinggi yang memicu pembelian impulsif (Source A, B & C).',
          'Pengembangan paket bundling (Bread/Snack + Drink), loyalty stamp card, dan pickup/pesan antar bila ekonomis (Source A & C).',
          'Potensi kolaborasi promosi dengan pengelola tempat transit, area istirahat, maupun komunitas transportasi (Source B & C).'
        ]
      },
      {
        key: 'T',
        title: 'Threats (Ancaman)',
        items: [
          'Persaingan dari restoran cepat saji, minimarket, kedai kopi, dan food stall lain dengan harga kompetitif (Source A, B & C).',
          'Biaya sewa/deposit lokasi, perubahan aturan pengelola terminal/stasiun, dan fluktuasi harga bahan baku yang menekan HPP (Source A & C).',
          'Risiko antrean panjang pada jam sibuk serta risiko bahan baku tidak terjual (waste) (Source A & C).'
        ]
      }
    ],
    conclusion: 'Lemon Bread memiliki peluang kuat memenuhi kebutuhan konsumsi praktis di area transit. Namun, keunikan produk, konsistensi harga terhadap HPP, dan strategi pemasaran harus divalidasi agar mampu bersaing dengan minimarket dan gerai cepat saji (Source B & C).'
  },
  segments: [
    { segment: 'Pengemudi & Pengendara', needs: 'Minuman segar, makanan ringan, dan tempat singgah praktis untuk mengisi energi.', priority: 'Utama', status: 'Business Assumption' },
    { segment: 'Penumpang Terminal / Stasiun & Komuter', needs: 'Produk mudah dibawa (takeaway), pilihan cepat, dan konsumsi ringan saat menunggu keberangkatan.', priority: 'Utama', status: 'Business Assumption' },
    { segment: 'Pekerja Sekitar Lokasi', needs: 'Camilan dan minuman terjangkau saat jam istirahat atau sebelum/sesudah bekerja.', priority: 'Sekunder', status: 'Business Assumption' }
  ],
  persona: {
    status: 'Research Pending',
    name: 'Raka Pratama (22 thn) — Draft Persona',
    note: 'Source C mencatat bahwa demografi pasti (usia, pendapatan, frekuensi perjalanan) masih harus divalidasi melalui 20–30 survei awal. Source A menggunakan Raka Pratama sebagai persona ilustratif untuk desain produk.',
    profile: 'Mahasiswa & komuter KRL/Bus di Jakarta dengan frekuensi perjalanan 3–5×/minggu, waktu tunggu 5–30 menit, dan kisaran pengeluaran target Rp10.000–Rp15.000 per transaksi.',
    jobs: [
      'Mendapatkan makanan ringan dan minuman dengan cepat sebelum jadwal transportasi.',
      'Mengisi waktu tunggu tanpa harus membeli makanan berat.',
      'Membeli produk yang mudah dibawa (grab-and-go) dalam satu titik.'
    ],
    pains: [
      'Waktu transit terbatas sehingga rentan batal membeli jika antrean panjang.',
      'Harga makanan/minuman di area transit sering terasa mahal.',
      'Makanan dan minuman sering tidak tersedia di satu booth yang sama.'
    ],
    gains: [
      'Harga masuk akal & transparan pada papan menu.',
      'Kombinasi roti, snack, dan minuman dalam satu tempat.',
      'Pelayanan cepat (5–7 menit), kemasan praktis, dan opsi 4–6 kursi singkat.'
    ]
  },
  bmc: [
    { block: '1. Customer Segments', content: 'Pengemudi/pengendara, penumpang terminal & stasiun, komuter/pelajar, serta pekerja sekitar lokasi.' },
    { block: '2. Value Propositions', content: 'Makanan dan minuman praktis, harga terjangkau (konsep Rp10.000–Rp15.000), porsi ringan, layanan cepat (5–7 menit), dan tempat duduk singkat.' },
    { block: '3. Channels', content: 'Booth fisik dekat area tunggu, signage & menu visual, Google Maps, media sosial (Instagram/TikTok), dan opsi pesan antar bila ekonomis & diizinkan.' },
    { block: '4. Customer Relationships', content: 'Pelayanan cepat & konsisten, loyalty stamp card, promo bundling, pengumpulan feedback, dan penanganan keluhan.' },
    { block: '5. Revenue Streams', content: 'Penjualan roti isi, snack ringan, minuman (kopi, lemon drink, tea, matcha), dan paket bundling (Bread/Snack + Drink).' },
    { block: '6. Key Resources', content: 'Booth & peralatan operasional, bahan baku & kemasan, resep/SOP, 1–2 karyawan, identitas brand, dan sistem kasir/pencatatan transaksi.' },
    { block: '7. Key Activities', content: 'Persiapan bahan terukur, produksi made-to-order, penyajian, manajemen stok & kebersihan, pemasaran, serta evaluasi penjualan.' },
    { block: '8. Key Partners', content: 'Supplier bahan baku & kemasan, pengelola lokasi transit, penyedia pembayaran (QRIS/e-wallet), serta mitra distribusi bila diperlukan.' },
    { block: '9. Cost Structure', content: 'Sewa/deposit lokasi, bahan baku & kemasan, upah staf, listrik/air, peralatan, promosi, transportasi, perizinan, dan biaya tak terduga.' }
  ]
};
