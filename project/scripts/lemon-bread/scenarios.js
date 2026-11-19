window.LemonBreadData = window.LemonBreadData || {};

window.LemonBreadData.scenarios = {
  overview: 'Bagian ini menyatukan simulasi transaksi & sensitivitas biaya tetap dari Source A/C, rencana program & anggaran 2027–2028 dari Source B, serta simulator skenario interaktif untuk menguji ketahanan model bisnis Lemon Bread terhadap tekanan sewa lokasi, kenaikan HPP, dan perubahan harga jual.',
  variables: [
    { name: 'Volume Transaksi Harian (tx/hari)', baseline: '12 / 20 / 30 tx/hari', source: 'Source A & C', impact: 'Menentukan skala omzet bulanan dan pencapaian titik impas (BEP).' },
    { name: 'Average Order Value (AOV)', baseline: 'Rp15.000 (Booth) vs Rp18.000–Rp24.000 (Minuman Source B)', source: 'Source A, B & C', impact: 'Menentukan margin kontribusi per transaksi; konflik harga antar-sumber perlu diuji.' },
    { name: 'Rasio HPP / Biaya Variabel', baseline: '45% dari penjualan (Margin Kontribusi 55%)', source: 'Source A & C', impact: 'Sensitif terhadap fluktuasi harga bahan baku, kemasan, dan waste.' },
    { name: 'Biaya Tetap Bulanan', baseline: 'Rp2.500.000/bln (stress test Rp5.000.000/bln)', source: 'Source A & C', impact: 'Kenaikan sewa lokasi transit atau upah staf langsung menggandakan target BEP.' },
    { name: 'Hari Operasional per Bulan', baseline: '26 hari/bulan', source: 'Source A & C', impact: 'Mengubah target transaksi harian yang dibutuhkan untuk menutup biaya tetap.' },
    { name: 'Anggaran Program Strategis 2027–2028', baseline: 'Rp26.000.000 (2027) + Rp17.000.000 (2028) = Rp43.000.000', source: 'Source B', impact: 'Menunjukkan kebutuhan dana korporat jika skala berpindah dari 1 booth ke ekspansi brand 2 tahun.' }
  ],
  presets: [
    {
      id: 'source-bep',
      label: 'Original BEP (12 tx/hari)',
      origin: 'Original Source A & C',
      status: 'Simulation',
      params: { txPerDay: 12, aov: 15000, hppRatio: 0.45, fixedCost: 2500000, days: 26 },
      narrative: 'Skenario titik impas dasar pada asumsi biaya tetap Rp2.500.000/bln. Menghasilkan 312 transaksi/bulan (sedikit di atas BEP 304 tx/bln) dengan sisa Rp74.000.',
      operationalImplication: 'Beban dapur ringan (~12 pesanan/hari), mudah dicapai dengan 1–2 orang, namun sangat rentan jika terjadi penurunan traffic atau biaya tak terduga.',
      riskNote: 'Hampir tidak memiliki bantalan kas untuk penyusutan peralatan, pajak, atau perbaikan mendadak.'
    },
    {
      id: 'source-target',
      label: 'Original Target (20 tx/hari)',
      origin: 'Original Source A & C',
      status: 'Simulation',
      params: { txPerDay: 20, aov: 15000, hppRatio: 0.45, fixedCost: 2500000, days: 26 },
      narrative: 'Skenario target moderat pada biaya tetap Rp2.500.000/bln. Menghasilkan omzet Rp7.800.000/bln dan sisa Rp1.790.000 sebelum pajak & penyusutan.',
      operationalImplication: 'Kapasitas layanan 5–7 menit tetap aman karena rata-rata hanya ~2–3 pesanan per jam efektif.',
      riskNote: 'Tetap bergantung pada asumsi bahwa biaya sewa lokasi + gaji tidak melampaui Rp2.500.000/bulan.'
    },
    {
      id: 'source-optimistic',
      label: 'Original Optimistic (30 tx/hari)',
      origin: 'Original Source A & C',
      status: 'Simulation',
      params: { txPerDay: 30, aov: 15000, hppRatio: 0.45, fixedCost: 2500000, days: 26 },
      narrative: 'Skenario volume tinggi pada biaya tetap Rp2.500.000/bln. Menghasilkan omzet Rp11.700.000/bln dan sisa Rp3.935.000.',
      operationalImplication: 'Jika 30 transaksi menumpuk di jam berangkat/pulang kerja, risiko antrean panjang meningkat dan membutuhkan bahan prepped penuh.',
      riskNote: 'Pada volume ini, 1 orang operator kemungkinan kewalahan; diperlukan 2 staf aktif saat jam sibuk.'
    },
    {
      id: 'source-high-fixed',
      label: 'Original High-Fixed Stress (Rp5 Jt)',
      origin: 'Original Source A & C',
      status: 'Simulation',
      params: { txPerDay: 24, aov: 15000, hppRatio: 0.45, fixedCost: 5000000, days: 26 },
      narrative: 'Uji sensitivitas asli Source A/C ketika biaya tetap naik 2× lipat menjadi Rp5.000.000/bln (misal sewa stasiun lebih tinggi + upah staf). BEP melonjak ke 607 tx/bln (~24 tx/hari).',
      operationalImplication: 'Booth wajib menjaga volume minimal 24 transaksi/hari hanya untuk impas, tanpa ruang margin error di hari sepi.',
      riskNote: 'Menegaskan bahwa validasi biaya sewa lokasi & skema gaji adalah risiko paling krusial sebelum investasi.'
    },
    {
      id: 'sim-source-b-pricing',
      label: 'Simulasi Harga Source B (AOV Rp21rb)',
      origin: 'Newly Introduced Simulation (Hybrid Source B)',
      status: 'Simulation',
      params: { txPerDay: 20, aov: 21000, hppRatio: 0.45, fixedCost: 5000000, days: 26 },
      narrative: 'Simulasi baru menggunakan rata-rata harga minuman Source B (Rp18.000–Rp24.000, rata-rata Rp21.000) dengan biaya tetap Rp5.000.000/bln. Margin kontribusi naik ke Rp11.550/tx sehingga BEP turun ke 433 tx/bln (~17 tx/hari).',
      operationalImplication: 'Kenaikan AOV membantu menutup biaya sewa transit yang lebih mahal tanpa harus mengejar volume ekstrem.',
      riskNote: 'Harga Rp21.000 berisiko melampaui batas kesediaan membayar segmen komuter hemat (Rp10.000–Rp15.000); wajib diuji lewat survei WTP.'
    }
  ],
  strategicInterpretation: [
    {
      title: 'Tekanan Biaya Tetap Paling Menentukan',
      text: 'Kenaikan biaya tetap dari Rp2,5 juta ke Rp5,0 juta langsung menggandakan BEP dari 304 menjadi 607 transaksi/bulan (~12 ke ~24 transaksi/hari). Sewa lokasi terminal/stasiun dan struktur upah staf adalah penentu utama kelayakan.'
    },
    {
      title: 'Sensitivitas Harga Jual vs Daya Beli Komuter',
      text: 'Konsep awal mematok Rp10.000–Rp15.000, namun lini minuman Source B berada di Rp18.000–Rp24.000. Jika AOV naik ke Rp21.000 (dengan HPP 45%), BEP pada biaya tetap Rp5 juta turun dari 24 menjadi 17 tx/hari — tetapi risiko penolakan harga meningkat.'
    },
    {
      title: 'Kesenjangan Skala Modal: Rp8,4 Juta vs Rp43 Juta',
      text: 'Modal booth Rp8,4 juta (Source A/C) tidak dirancang untuk menanggung program pemasaran Rp43 juta (Source B). Ekspansi program 2027–2028 baru masuk akal setelah pilot booth terbukti menghasilkan arus kas positif.'
    }
  ],
  recommendations: {
    actions: [
      'Jalankan validasi sewa, deposit, listrik/air, dan izin tertulis di 5 lokasi transit sebelum membeli peralatan (Source C).',
      'Gunakan paket bundling (Bread/Snack + Drink Rp20.000–Rp25.000) untuk menaikkan AOV secara alami tanpa menaikkan harga satuan minuman terlalu tinggi.',
      'Terapkan owner-operator pada tahap pilot untuk menahan biaya tetap tetap dekat Rp2,5 juta/bulan.'
    ],
    alternatives: [
      'Jika sewa lokasi stasiun melebihi Rp3–4 juta/bulan, pertimbangkan titik alternatif seperti area pekerja/kampus terdekat atau skema bagi hasil (revenue sharing) alih-alih sewa tetap.',
      'Uji dua tier menu: menu hemat Rp10.000–Rp15.000 untuk volume harian dan minuman signature Rp18.000–Rp22.000 sebagai penarik margin.'
    ],
    unverifiedAssumptions: [
      'Belum ada data aktual HPP per SKU dari supplier.',
      'Belum ada konfirmasi tarif sewa resmi pengelola terminal/stasiun.',
      'Belum ada data konversi footfall ke transaksi aktual di jam sibuk vs jam sepi.'
    ]
  },
  conclusion: 'Secara matematis, model booth kecil Lemon Bread layak diuji apabila biaya tetap dapat dijaga di kisaran Rp2,5 juta/bulan (BEP ~12 transaksi/hari). Namun, kelayakan tersebut sangat rapuh terhadap lonjakan biaya sewa lokasi dan ketidaksesuaian HPP. Oleh karena itu, Lemon Bread harus dieksekusi sebagai pilot project berbiaya terkendali terlebih dahulu — bukan langsung mengeksekusi belanja program Rp43 juta sebelum validasi lapangan terbukti.'
};
