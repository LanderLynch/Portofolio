window.LemonBreadData = window.LemonBreadData || {};

window.LemonBreadData.operations = {
  menuArchitecture: {
    skuLimitNote: 'Tahap awal dibatasi 5–7 SKU agar persediaan, kecepatan layanan (≤ 7 menit), dan risiko bahan terbuang (waste) tetap terkendali (Source C).',
    boothCategories: [
      { category: 'Quick Bread', items: 'Egg & Cheese Bread, Tuna Mayo Bread, Choco Cream Bread', price: 'Rp15.000', source: 'Source A & C', status: 'Business Assumption' },
      { category: 'Road Snack', items: 'Croissant Original, Snack Box (Mini Bites)', price: 'Rp10.000', source: 'Source A & C', status: 'Business Assumption' },
      { category: 'Beverage (Booth Draft)', items: 'Coffee, Lemon Drink (identitas), Tea, Matcha', price: 'Rp10.000–Rp15.000', source: 'Source A & C', status: 'Business Assumption' },
      { category: 'Paket Hemat', items: 'Bread + Drink Bundle / Snack + Drink Bundle', price: 'Rp20.000–Rp25.000', source: 'Source A & C', status: 'Business Assumption' }
    ],
    sourceBProducts: [
      { name: 'Brown Sugar Latte', desc: 'Perpaduan espresso, susu, dan sirup gula aren yang lembut.', price: 22000, source: 'Source B', status: 'Business Assumption' },
      { name: 'Cloud Matcha', desc: 'Matcha pilihan dengan susu creamy dan rasa yang seimbang.', price: 24000, source: 'Source B', status: 'Business Assumption' },
      { name: 'Honey Lemon Tea', desc: 'Teh lemon dengan madu alami yang manis dan menyegarkan.', price: 20000, source: 'Source B', status: 'Business Assumption' },
      { name: 'Lemon Sunrise', desc: 'Teh lemon segar dengan sensasi citrus yang menyegarkan.', price: 18000, source: 'Source B', status: 'Business Assumption' }
    ],
    pricingConflictNote: 'Konflik Harga Antar-Sumber: Source A & C menetapkan target harga awal booth Rp10.000–Rp15.000, sedangkan Source B mencantumkan harga minuman Rp18.000–Rp24.000. Harga final wajib ditetapkan setelah perhitungan HPP per SKU dan riset kesediaan membayar (WTP) di lokasi target.'
  },
  pricingFormulas: [
    'Margin kotor per unit = Harga jual − HPP',
    'Persentase margin kotor = (Harga jual − HPP) ÷ Harga jual × 100%'
  ],
  boothSpecs: {
    dimensions: '300 × 200 cm (6,0 m²)',
    seating: '4–6 kursi singkat (hanya bila ruang, jalur evakuasi, dan izin pengelola memungkinkan)',
    flow: 'Alur satu arah: pelanggan memesan & membayar di depan → staf memproses di area kerja → pengambilan pesanan di titik terpisah.'
  },
  serviceWorkflow: [
    { step: '1. Customer Arrival', activity: 'Pelanggan datang dan melihat papan menu di depan booth.', time: '—' },
    { step: '2. Order & Payment', activity: 'Pelanggan memilih produk dan membayar (Tunai / QRIS).', time: '1 menit' },
    { step: '3. Order Preparation', activity: 'Pesanan diteruskan ke area persiapan bahan yang sudah ditakar (prepped).', time: '1 menit' },
    { step: '4. Production (Made-to-Order)', activity: 'Roti dipanggang/dirakit dan minuman diseduh/diracik sesuai SOP.', time: '2–4 menit' },
    { step: '5. Quality Check & Serving', activity: 'Pemeriksaan kelengkapan, kebersihan, dan penyerahan pesanan.', time: '1 menit (Total 5–7 menit)' }
  ],
  hrPlan: [
    { role: 'Owner / Business Manager', responsibility: 'Mengatur keuangan, stok, strategi, supplier, evaluasi penjualan, dan kepatuhan usaha.' },
    { role: 'Staff 1 — Order & Cashier', responsibility: 'Menerima pesanan, memproses pembayaran, komunikasi pelanggan, dan penyerahan pesanan.' },
    { role: 'Staff 2 — F&B Preparation', responsibility: 'Menyiapkan makanan/minuman, menjaga kebersihan area kerja, stok, dan konsistensi resep.' }
  ],
  hrNote: 'Pada tahap pilot/uji coba, owner dapat memegang salah satu fungsi operasional untuk menekan biaya tenaga kerja. Kebutuhan shift dan upah penuh harus dihitung sebelum operasi rutin (Source C).',
  sopStandards: [
    'Waktu pelayanan dicatat per pesanan (target ≤ 7 menit).',
    'Resep dan ukuran porsi dibuat standar dengan bahan prepped.',
    'Area kerja makanan dan minuman dipisah sejauh ruang memungkinkan.',
    'Bahan baku diberi label tanggal (FIFO/FEFO) dan disimpan pada suhu sesuai standar.',
    'Stok masuk, stok terpakai, dan waste dicatat di awal dan akhir hari.',
    'Keluhan pelanggan dicatat beserta tindakan perbaikannya.'
  ]
};
