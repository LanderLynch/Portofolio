(function () {
  const D = window.LemonBreadData;
  if (!D) return;

  const rupiah = (n) => 'Rp' + new Intl.NumberFormat('id-ID').format(Math.round(n));
  const pct = (n) => Math.round(n * 100) + '%';

  function statusBadge(status) {
    const map = {
      'Actual Fact': { cls: 'badge-fact', label: 'Actual Fact' },
      'Business Assumption': { cls: 'badge-assumption', label: 'Business Assumption' },
      'Target': { cls: 'badge-target', label: 'Target' },
      'Simulation': { cls: 'badge-sim', label: 'Simulation' },
      'Research Pending': { cls: 'badge-pending', label: 'Research Pending' }
    };
    const info = map[status] || map['Business Assumption'];
    return `<span class="status-tag ${info.cls}">${info.label}</span>`;
  }

  function renderPalette() {
    const el = document.getElementById('lb-palette-grid');
    if (!el) return;
    el.innerHTML = D.brand.palette.map((c) => `
      <div class="swatch-card">
        <div class="swatch-color" style="background:${c.hex};color:${c.textOn};">
          <span>${c.hex}</span>
        </div>
        <div class="swatch-meta">
          <strong>${c.name}</strong>
          <span>${c.role}</span>
        </div>
      </div>
    `).join('');
  }

  function renderOverview() {
    const tbody = document.getElementById('lb-overview-tbody');
    if (tbody) {
      tbody.innerHTML = D.brand.overviewSummary.map((r) => `
        <tr>
          <td><strong>${r.label}</strong></td>
          <td>${r.value}</td>
          <td>${statusBadge(r.status)}</td>
        </tr>
      `).join('');
    }

    const pillarsEl = document.getElementById('lb-pillars-list');
    if (pillarsEl) {
      pillarsEl.innerHTML = D.brand.pillars.map((p) => `
        <li><strong>${p.title}:</strong> ${p.desc}</li>
      `).join('');
    }

    const entityEl = document.getElementById('lb-entity-comparison');
    if (entityEl) {
      entityEl.innerHTML = D.brand.entityComparison.map((e) => `
        <article class="panel">
          <div class="panel-top">
            <span class="panel-kicker">${e.source}</span>
            ${statusBadge(e.status)}
          </div>
          <h3>${e.entity}</h3>
          <p class="muted-note">${e.legalNote}</p>
          <ul>
            <li><strong>Skala:</strong> ${e.scale}</li>
            <li><strong>Modal / Anggaran:</strong> ${e.capital}</li>
          </ul>
        </article>
      `).join('');
    }
  }

  function renderBrandFoundation() {
    const visionEl = document.getElementById('lb-vision-text');
    if (visionEl) visionEl.textContent = D.brand.vision.text;

    const missionEl = document.getElementById('lb-mission-list');
    if (missionEl) {
      missionEl.innerHTML = D.brand.mission.map((m) => `<li>${m}</li>`).join('');
    }

    const cultureEl = document.getElementById('lb-culture-chips');
    if (cultureEl) {
      cultureEl.innerHTML = D.brand.culture.map((c) => `<span class="culture-chip">${c}</span>`).join('');
    }

    const purposeEl = document.getElementById('lb-purpose-text');
    if (purposeEl) purposeEl.textContent = D.brand.purpose;
  }

  function renderMarketAndSwot() {
    const swotEl = document.getElementById('lb-swot-grid');
    if (swotEl) {
      swotEl.innerHTML = D.business.swotIntegrated.quadrants.map((q) => `
        <article class="panel swot-panel swot-${q.key.toLowerCase()}">
          <div class="panel-top">
            <span class="panel-kicker">${q.key} · SWOT</span>
            ${statusBadge('Business Assumption')}
          </div>
          <h3>${q.title}</h3>
          <ul>${q.items.map((i) => `<li>${i}</li>`).join('')}</ul>
        </article>
      `).join('');
    }

    const swotConc = document.getElementById('lb-swot-conclusion');
    if (swotConc) swotConc.textContent = D.business.swotIntegrated.conclusion;

    const segBody = document.getElementById('lb-segments-tbody');
    if (segBody) {
      segBody.innerHTML = D.business.segments.map((s) => `
        <tr>
          <td><strong>${s.segment}</strong></td>
          <td>${s.needs}</td>
          <td>${s.priority}</td>
          <td>${statusBadge(s.status)}</td>
        </tr>
      `).join('');
    }

    const personaEl = document.getElementById('lb-persona-grid');
    if (personaEl) {
      const p = D.business.persona;
      personaEl.innerHTML = `
        <article class="panel">
          <div class="panel-top">
            <span class="panel-kicker">Draft Persona</span>
            ${statusBadge(p.status)}
          </div>
          <h3>${p.name}</h3>
          <p>${p.profile}</p>
          <p class="muted-note" style="margin-top:0.65rem;">${p.note}</p>
        </article>
        <article class="panel">
          <span class="panel-kicker">Customer Jobs &amp; Pains</span>
          <h3>Kebutuhan &amp; Hambatan</h3>
          <ul>
            ${p.jobs.map((j) => `<li><strong>Job:</strong> ${j}</li>`).join('')}
            ${p.pains.map((pn) => `<li><strong>Pain:</strong> ${pn}</li>`).join('')}
          </ul>
        </article>
        <article class="panel">
          <span class="panel-kicker">Pain Relievers &amp; Gains</span>
          <h3>Nilai yang Diharapkan</h3>
          <ul>${p.gains.map((g) => `<li>${g}</li>`).join('')}</ul>
        </article>
      `;
    }
  }

  function renderBmc() {
    const tbody = document.getElementById('lb-bmc-tbody');
    if (tbody) {
      tbody.innerHTML = D.business.bmc.map((b) => `
        <tr>
          <td><strong>${b.block}</strong></td>
          <td>${b.content}</td>
        </tr>
      `).join('');
    }
  }

  function renderMarketingAndRoadmap() {
    const jBody = document.getElementById('lb-journey-tbody');
    if (jBody) {
      jBody.innerHTML = D.marketing.journey.map((j) => `
        <tr>
          <td><strong>${j.stage}</strong></td>
          <td>${j.experience}</td>
          <td>${j.indicator}</td>
          <td>${statusBadge(j.status)}</td>
        </tr>
      `).join('');
    }

    const caveatEl = document.getElementById('lb-awareness-caveat');
    if (caveatEl) caveatEl.textContent = D.marketing.awarenessCaveat;

    const chEl = document.getElementById('lb-channels-grid');
    if (chEl) {
      chEl.innerHTML = D.marketing.channelsAndRetention.map((c) => `
        <article class="panel">
          <span class="panel-kicker">Marketing &amp; Retention</span>
          <h3>${c.title}</h3>
          <p>${c.desc}</p>
        </article>
      `).join('');
    }

    const ganttBody = document.getElementById('lb-roadmap-tbody');
    if (ganttBody) {
      ganttBody.innerHTML = D.marketing.roadmapPrograms.map((p) => {
        const leftPct = (p.mulai / 24) * 100;
        const widthPct = ((p.selesai - p.mulai + 1) / 24) * 100;
        const barColor = p.tahun === 2027 ? '#983E2B' : '#5AA9C8';
        return `
          <tr>
            <td><strong>P${p.id}</strong> · ${p.tahun}</td>
            <td><strong>${p.kegiatan}</strong><br><span class="muted-note">Sasaran: ${p.sasaran} · PJ: ${p.pj}</span></td>
            <td>${p.tanggal}</td>
            <td>
              <div class="gantt-track" aria-label="${p.tanggal}">
                <span class="gantt-bar" style="left:${leftPct}%;width:${widthPct}%;background:${barColor};"></span>
              </div>
            </td>
            <td style="white-space:nowrap;"><strong>${rupiah(p.anggaran)}</strong></td>
          </tr>
        `;
      }).join('');
    }
  }

  function renderOperations() {
    const boothBody = document.getElementById('lb-menu-booth-tbody');
    if (boothBody) {
      boothBody.innerHTML = D.operations.menuArchitecture.boothCategories.map((m) => `
        <tr>
          <td><strong>${m.category}</strong></td>
          <td>${m.items}</td>
          <td>${m.price}</td>
          <td>${statusBadge(m.status)}</td>
        </tr>
      `).join('');
    }

    const sourceBBody = document.getElementById('lb-menu-sourceb-tbody');
    if (sourceBBody) {
      sourceBBody.innerHTML = D.operations.menuArchitecture.sourceBProducts.map((m) => `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td>${m.desc}</td>
          <td><strong>${rupiah(m.price)}</strong></td>
          <td>${statusBadge(m.status)}</td>
        </tr>
      `).join('');
    }

    const wfBody = document.getElementById('lb-workflow-tbody');
    if (wfBody) {
      wfBody.innerHTML = D.operations.serviceWorkflow.map((w) => `
        <tr>
          <td><strong>${w.step}</strong></td>
          <td>${w.activity}</td>
          <td>${w.time}</td>
        </tr>
      `).join('');
    }

    const hrBody = document.getElementById('lb-hr-tbody');
    if (hrBody) {
      hrBody.innerHTML = D.operations.hrPlan.map((h) => `
        <tr>
          <td><strong>${h.role}</strong></td>
          <td>${h.responsibility}</td>
        </tr>
      `).join('');
    }

    const sopList = document.getElementById('lb-sop-list');
    if (sopList) {
      sopList.innerHTML = D.operations.sopStandards.map((s) => `<li>${s}</li>`).join('');
    }
  }

  function renderFinancial() {
    const capBody = document.getElementById('lb-capital-tbody');
    if (capBody) {
      capBody.innerHTML = D.financial.initialCapitalAllocation.map((c) => `
        <tr>
          <td><strong>${c.category}</strong><br><span class="muted-note">${c.detail}</span></td>
          <td>${c.share}%</td>
          <td><strong>${rupiah(c.amount)}</strong></td>
        </tr>
      `).join('');
    }

    const eqBody = document.getElementById('lb-equipment-tbody');
    if (eqBody) {
      eqBody.innerHTML = D.financial.equipmentItems.map((e) => `
        <tr>
          <td>${e.item}</td>
          <td><strong>${rupiah(e.cost)}</strong></td>
        </tr>
      `).join('');
    }

    const simBody = document.getElementById('lb-base-sim-tbody');
    if (simBody) {
      const base = D.financial.baseAssumptions;
      const vols = [12, 20, 30];
      simBody.innerHTML = vols.map((v) => {
        const res = D.financial.calculateMetrics({
          txPerDay: v,
          aov: base.avgOrderValue,
          hppRatio: base.hppRatio,
          fixedCost: base.fixedCostMonthly,
          days: base.operatingDaysPerMonth
        });
        const label = v === 12 ? '12 transaksi (BEP)' : `${v} transaksi`;
        return `
          <tr>
            <td><strong>${label}</strong></td>
            <td>${rupiah(res.monthlyRevenue)}</td>
            <td>${rupiah(res.contributionTotal)}</td>
            <td><strong>${rupiah(res.netSurplus)}</strong></td>
          </tr>
        `;
      }).join('');
    }

    const formulasList = document.getElementById('lb-formulas-list');
    if (formulasList) {
      formulasList.innerHTML = D.financial.formulas.map((f) => `<li><code>${f}</code></li>`).join('');
    }
  }

  function renderBepChart(activeMetrics) {
    const svg = document.getElementById('lb-bep-svg');
    if (!svg) return;

    const maxTx = 1000;
    const maxVal = Math.max(activeMetrics.aov * maxTx, activeMetrics.fixedCost + activeMetrics.aov * activeMetrics.hppRatio * maxTx, 18000000);
    const W = 680;
    const H = 300;
    const pad = { top: 24, right: 24, bottom: 42, left: 74 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const x = (tx) => pad.left + (tx / maxTx) * plotW;
    const y = (val) => pad.top + plotH - (val / maxVal) * plotH;

    const rev0 = y(0);
    const revEnd = y(activeMetrics.aov * maxTx);
    const cost0 = y(activeMetrics.fixedCost);
    const costEnd = y(activeMetrics.fixedCost + activeMetrics.aov * activeMetrics.hppRatio * maxTx);

    const bepTx = Math.min(maxTx, activeMetrics.bepMonthlyTx);
    const bepVal = bepTx * activeMetrics.aov;
    const bx = x(bepTx);
    const by = y(bepVal);

    const curTx = Math.min(maxTx, activeMetrics.monthlyTx);
    const curVal = curTx * activeMetrics.aov;
    const cx = x(curTx);
    const cy = y(curVal);

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => maxVal * t);
    const xTicks = [0, 200, 400, 600, 800, 1000];

    svg.innerHTML = `
      <rect x="0" y="0" width="${W}" height="${H}" fill="#FAF6F0" rx="10"></rect>
      ${yTicks.map((val) => {
        const yy = y(val);
        return `
          <line x1="${pad.left}" y1="${yy}" x2="${W - pad.right}" y2="${yy}" stroke="#E6DACB" stroke-dasharray="3 3" />
          <text x="${pad.left - 8}" y="${yy + 4}" text-anchor="end" font-size="10.5" fill="#76655A">${(val / 1000000).toFixed(1)} jt</text>
        `;
      }).join('')}
      ${xTicks.map((tx) => {
        const xx = x(tx);
        return `
          <line x1="${xx}" y1="${pad.top}" x2="${xx}" y2="${H - pad.bottom}" stroke="#EFE6DA" />
          <text x="${xx}" y="${H - pad.bottom + 16}" text-anchor="middle" font-size="10.5" fill="#76655A">${tx} tx</text>
        `;
      }).join('')}
      <line x1="${pad.left}" y1="${rev0}" x2="${x(maxTx)}" y2="${revEnd}" stroke="#5AA9C8" stroke-width="3" />
      <line x1="${pad.left}" y1="${cost0}" x2="${x(maxTx)}" y2="${costEnd}" stroke="#983E2B" stroke-width="3" stroke-dasharray="6 4" />
      ${activeMetrics.bepMonthlyTx <= maxTx ? `
        <line x1="${bx}" y1="${by}" x2="${bx}" y2="${H - pad.bottom}" stroke="#6B3F24" stroke-dasharray="3 3" />
        <circle cx="${bx}" cy="${by}" r="6" fill="#F4C430" stroke="#30221D" stroke-width="2" />
        <text x="${Math.min(W - 120, bx + 8)}" y="${Math.max(pad.top + 14, by - 10)}" font-size="11" font-weight="700" fill="#30221D">BEP: ${activeMetrics.bepMonthlyTx} tx</text>
      ` : ''}
      <circle cx="${cx}" cy="${cy}" r="5.5" fill="#5AA9C8" stroke="#30221D" stroke-width="1.5" />
      <text x="${pad.left + 8}" y="${pad.top + 14}" font-size="11" font-weight="700" fill="#5AA9C8">● Omzet Bulanan</text>
      <text x="${pad.left + 125}" y="${pad.top + 14}" font-size="11" font-weight="700" fill="#983E2B">--- Total Biaya (Tetap + HPP)</text>
      <text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="#57463D">Volume Transaksi Bulanan (tx/bln)</text>
    `;
  }

  function setupScenarioSimulator() {
    const presetsEl = document.getElementById('lb-scenario-presets');
    const compareBody = document.getElementById('lb-scenario-compare-tbody');
    const varsBody = document.getElementById('lb-scenario-vars-tbody');

    if (varsBody) {
      varsBody.innerHTML = D.scenarios.variables.map((v) => `
        <tr>
          <td><strong>${v.name}</strong></td>
          <td>${v.baseline}</td>
          <td>${v.source}</td>
          <td>${v.impact}</td>
        </tr>
      `).join('');
    }

    if (compareBody) {
      compareBody.innerHTML = D.scenarios.presets.map((p) => {
        const res = D.financial.calculateMetrics(p.params);
        const netCls = res.netSurplus >= 0 ? 'num-pos' : 'num-neg';
        return `
          <tr>
            <td><strong>${p.label}</strong><br><span class="muted-note">${p.origin}</span></td>
            <td>${p.params.txPerDay} tx/hari<br><span class="muted-note">${res.monthlyTx} tx/bln</span></td>
            <td>${rupiah(p.params.aov)}</td>
            <td>${rupiah(p.params.fixedCost)}</td>
            <td>${res.bepMonthlyTx} tx (${res.bepDailyTx}/hr)</td>
            <td>${rupiah(res.monthlyRevenue)}</td>
            <td class="${netCls}"><strong>${rupiah(res.netSurplus)}</strong></td>
          </tr>
        `;
      }).join('');
    }

    const state = Object.assign({}, D.scenarios.presets[1].params);
    const txInput = document.getElementById('sim-tx');
    const aovInput = document.getElementById('sim-aov');
    const hppInput = document.getElementById('sim-hpp');
    const fixedInput = document.getElementById('sim-fixed');
    const daysInput = document.getElementById('sim-days');

    function updateOutputs(activePresetId) {
      const m = D.financial.calculateMetrics(state);
      const setTxt = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      setTxt('sim-tx-val', state.txPerDay + ' tx/hari (' + m.monthlyTx + ' tx/bln)');
      setTxt('sim-aov-val', rupiah(state.aov));
      setTxt('sim-hpp-val', pct(state.hppRatio) + ' (Margin ' + pct(m.cmRatio) + ')');
      setTxt('sim-fixed-val', rupiah(state.fixedCost));
      setTxt('sim-days-val', state.days + ' hari/bln');

      setTxt('out-revenue', rupiah(m.monthlyRevenue));
      setTxt('out-cm', rupiah(m.cmPerTx) + ' / tx');
      setTxt('out-bep', m.bepMonthlyTx + ' tx/bln (~' + m.bepDailyTx + '/hari)');
      const netEl = document.getElementById('out-net');
      if (netEl) {
        netEl.textContent = rupiah(m.netSurplus);
        netEl.className = 'sim-kpi-val ' + (m.netSurplus >= 0 ? 'num-pos' : 'num-neg');
      }

      if (activePresetId) {
        const preset = D.scenarios.presets.find((p) => p.id === activePresetId);
        if (preset) {
          setTxt('sim-narrative', preset.narrative);
          setTxt('sim-ops-note', preset.operationalImplication);
          setTxt('sim-risk-note', preset.riskNote);
        }
      } else {
        setTxt('sim-narrative', 'Simulasi kustom aktif: pada ' + state.txPerDay + ' tx/hari dengan AOV ' + rupiah(state.aov) + ' dan biaya tetap ' + rupiah(state.fixedCost) + '/bln, titik impas berada di ' + m.bepMonthlyTx + ' tx/bln (~' + m.bepDailyTx + ' tx/hari).');
        setTxt('sim-ops-note', state.txPerDay >= 25 ? 'Volume ≥ 25 tx/hari memerlukan 2 staf aktif dan bahan prepped penuh saat jam sibuk.' : 'Volume < 25 tx/hari masih aman dikelola 1–2 operator dengan target layanan 5–7 menit.');
        setTxt('sim-risk-note', m.netSurplus <= 250000 ? 'Bantalan kas sangat tipis atau defisit; rentan terhadap waste dan kenaikan harga bahan baku.' : 'Surplus operasional positif sebelum pajak, penyusutan peralatan, dan biaya tak terduga.');
      }

      renderBepChart(m);
    }

    if (presetsEl) {
      presetsEl.innerHTML = D.scenarios.presets.map((p, idx) => `
        <button type="button" class="preset-btn ${idx === 1 ? 'active' : ''}" data-preset="${p.id}">
          ${p.label}
        </button>
      `).join('');

      presetsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.preset-btn');
        if (!btn) return;
        const preset = D.scenarios.presets.find((p) => p.id === btn.dataset.preset);
        if (!preset) return;
        presetsEl.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        Object.assign(state, preset.params);
        if (txInput) txInput.value = state.txPerDay;
        if (aovInput) aovInput.value = state.aov;
        if (hppInput) hppInput.value = Math.round(state.hppRatio * 100);
        if (fixedInput) fixedInput.value = state.fixedCost;
        if (daysInput) daysInput.value = state.days;
        updateOutputs(preset.id);
      });
    }

    const bindSlider = (input, key, transform) => {
      if (!input) return;
      input.addEventListener('input', () => {
        state[key] = transform ? transform(input.value) : Number(input.value);
        if (presetsEl) presetsEl.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
        updateOutputs(null);
      });
    };

    bindSlider(txInput, 'txPerDay', Number);
    bindSlider(aovInput, 'aov', Number);
    bindSlider(hppInput, 'hppRatio', (v) => Number(v) / 100);
    bindSlider(fixedInput, 'fixedCost', Number);
    bindSlider(daysInput, 'days', Number);

    updateOutputs(D.scenarios.presets[1].id);

    const interpEl = document.getElementById('lb-scenario-interpretation');
    if (interpEl) {
      interpEl.innerHTML = D.scenarios.strategicInterpretation.map((item) => `
        <article class="panel">
          <span class="panel-kicker">Interpretasi Strategis</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `).join('');
    }

    const recEl = document.getElementById('lb-recommendations-grid');
    if (recEl) {
      recEl.innerHTML = `
        <article class="panel">
          <span class="panel-kicker">Recommended Actions</span>
          <h3>Tindakan Prioritas</h3>
          <ul>${D.scenarios.recommendations.actions.map((a) => `<li>${a}</li>`).join('')}</ul>
        </article>
        <article class="panel">
          <span class="panel-kicker">Alternative Strategies</span>
          <h3>Strategi Alternatif</h3>
          <ul>${D.scenarios.recommendations.alternatives.map((a) => `<li>${a}</li>`).join('')}</ul>
        </article>
        <article class="panel">
          <span class="panel-kicker">Unverified Assumptions</span>
          <h3>Asumsi Belum Teruji</h3>
          <ul>${D.scenarios.recommendations.unverifiedAssumptions.map((a) => `<li>${a}</li>`).join('')}</ul>
        </article>
      `;
    }

    const concEl = document.getElementById('lb-scenario-conclusion');
    if (concEl) concEl.textContent = D.scenarios.conclusion;
  }

  function renderRisksAndValidation() {
    const rBody = document.getElementById('lb-risk-tbody');
    if (rBody) {
      rBody.innerHTML = D.risks.matrix.map((r) => `
        <tr>
          <td><strong>${r.risk}</strong></td>
          <td>${r.impact}</td>
          <td>${r.mitigation}</td>
          <td><span class="priority-pill">${r.priority}</span></td>
        </tr>
      `).join('');
    }

    const valBody = document.getElementById('lb-validation-tbody');
    if (valBody) {
      valBody.innerHTML = D.risks.validationRoadmap.map((v) => `
        <tr>
          <td><strong>${v.step}</strong></td>
          <td>${v.activity}</td>
          <td>${v.output}</td>
        </tr>
      `).join('');
    }

    const kpiEl = document.getElementById('lb-kpi-list');
    if (kpiEl) {
      kpiEl.innerHTML = D.risks.kpis.map((k) => `
        <li><strong>${k.name} (${k.target}):</strong> ${k.formula}</li>
      `).join('');
    }

    const collectEl = document.getElementById('lb-data-collect-list');
    if (collectEl) {
      collectEl.innerHTML = D.risks.dataToCollect.map((d) => `<li>${d}</li>`).join('');
    }
  }

  function renderRpl() {
    const discEl = document.getElementById('lb-rpl-disclaimer');
    if (discEl) discEl.textContent = D.rpl.disclaimer;

    const rplBody = document.getElementById('lb-rpl-tbody');
    if (rplBody) {
      rplBody.innerHTML = D.rpl.mappings.map((m) => `
        <tr>
          <td><strong>${m.area}</strong></td>
          <td>${m.activity}</td>
          <td>${m.output}</td>
          <td>${m.competency}</td>
          <td>${m.evidence}</td>
        </tr>
      `).join('');
    }

    const intEl = document.getElementById('lb-integrity-rules');
    if (intEl) {
      intEl.innerHTML = D.rpl.integrityRules.map((r) => `<li>${r}</li>`).join('');
    }
  }

  function setupDriveRetry() {
    document.querySelectorAll('.visual-figure img').forEach((img) => {
      let attempts = 0;
      img.addEventListener('error', () => {
        if (attempts >= 3) return;
        attempts += 1;
        const src = img.getAttribute('src') || '';
        const match = src.match(/\/d\/([A-Za-z0-9_-]+)/);
        window.setTimeout(() => {
          if (attempts === 2 && match) {
            img.src = 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(match[1]) + '&sz=w1400';
          } else {
            const sep = src.includes('?') ? '&' : '?';
            img.src = src.split(/[?&]retry=/)[0] + sep + 'retry=' + attempts;
          }
        }, attempts * 650);
      });
    });
  }

  renderPalette();
  renderOverview();
  renderBrandFoundation();
  renderMarketAndSwot();
  renderBmc();
  renderMarketingAndRoadmap();
  renderOperations();
  renderFinancial();
  setupScenarioSimulator();
  renderRisksAndValidation();
  renderRpl();
  setupDriveRetry();
})();
