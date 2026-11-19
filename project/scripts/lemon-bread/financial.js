window.LemonBreadData = window.LemonBreadData || {};

window.LemonBreadData.financial = {
  equipmentItems: [
    { item: 'Booth sederhana / meja kerja', cost: 1200000 },
    { item: 'Sandwich toaster', cost: 450000 },
    { item: 'Blender', cost: 350000 },
    { item: 'Peralatan minuman dan termos', cost: 450000 },
    { item: 'Cooler atau kulkas kecil', cost: 1200000 },
    { item: 'Rak dan wadah penyimpanan', cost: 350000 },
    { item: 'Peralatan kebersihan', cost: 200000 }
  ],
  initialCapitalAllocation: [
    { category: 'Peralatan Operasional', detail: 'Booth/meja kerja, toaster, blender, peralatan minuman, cooler/kulkas, rak, kebersihan', amount: 4200000, share: 50 },
    { category: 'Bahan Baku & Kemasan Awal', detail: 'Stok awal roti/snack, bahan minuman, cup/box, cadangan bahan', amount: 1400000, share: 17 },
    { category: 'Fasilitas Booth', detail: 'Signage/menu, meja, 4–6 kursi, dekorasi brand', amount: 1100000, share: 13 },
    { category: 'Cadangan & Pengadaan Awal', detail: 'Transportasi/pengadaan dan dana cadangan operasional', amount: 1700000, share: 20 }
  ],
  capitalWarning: 'Estimasi modal awal Rp8.400.000 belum mencakup deposit/sewa lokasi, perizinan, renovasi, instalasi listrik/air, gaji awal, maupun pengeluaran tak terduga. Validasi biaya lokasi merupakan gerbang keputusan sebelum investasi (Source C).',
  baseAssumptions: {
    avgOrderValue: 15000,
    hppRatio: 0.45,
    fixedCostMonthly: 2500000,
    highFixedCostMonthly: 5000000,
    operatingDaysPerMonth: 26
  },
  formulas: [
    'Margin Kontribusi / Transaksi = AOV × (1 − Rasio HPP)',
    'BEP Bulanan (Transaksi) = Biaya Tetap Bulanan ÷ Margin Kontribusi / Transaksi',
    'BEP Harian (Transaksi) = BEP Bulanan ÷ Hari Operasional per Bulan',
    'Omzet Bulanan = Transaksi / Hari × Hari Operasional × AOV',
    'Laba Kontribusi = Omzet Bulanan × (1 − Rasio HPP)',
    'Sisa Setelah Biaya Tetap = Laba Kontribusi − Biaya Tetap Bulanan (belum dikurangi pajak, penyusutan & biaya tak terduga)'
  ],
  calculateMetrics: function (params) {
    const aov = Number(params.aov) || 0;
    const hppRatio = Math.min(0.95, Math.max(0.05, Number(params.hppRatio) || 0.45));
    const fixedCost = Math.max(0, Number(params.fixedCost) || 0);
    const days = Math.max(1, Number(params.days) || 26);
    const txPerDay = Math.max(0, Number(params.txPerDay) || 0);

    const cmRatio = 1 - hppRatio;
    const cmPerTx = aov * cmRatio;
    const bepMonthlyTx = cmPerTx > 0 ? Math.ceil(fixedCost / cmPerTx) : 0;
    const bepDailyTx = cmPerTx > 0 ? Math.ceil(bepMonthlyTx / days) : 0;

    const monthlyTx = txPerDay * days;
    const monthlyRevenue = monthlyTx * aov;
    const variableCostMonthly = monthlyRevenue * hppRatio;
    const contributionTotal = monthlyRevenue * cmRatio;
    const netSurplus = contributionTotal - fixedCost;

    return {
      aov,
      hppRatio,
      cmRatio,
      cmPerTx,
      fixedCost,
      days,
      txPerDay,
      monthlyTx,
      monthlyRevenue,
      variableCostMonthly,
      contributionTotal,
      netSurplus,
      bepMonthlyTx,
      bepDailyTx
    };
  }
};
