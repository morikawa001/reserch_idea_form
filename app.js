// ── GAS URL ──
const GAS_URL = "https://script.google.com/macros/s/AKfycbwFGWXonRPSDqhToxurlrxmvb0oMydOdM18_2Jy5aQWDXP60o6bKjkjYYfu741dgkqB/exec";

let currentStep = 1;

// ── Step navigation ──
function goToStep(n) {
  if (n === 2) { runClassification(); }
  if (n === 5) { renderNovelty(); }
  if (n === 6) { renderDocuments(); }
  if (n === 7) { generateSchedule(); }

  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.step-item').forEach((s, i) => {
    s.classList.remove('active');
    if (i + 1 < n) s.classList.add('done');
    else s.classList.remove('done');
  });

  const panel = document.getElementById('panel-' + n);
  const stepNav = document.getElementById('step-nav-' + n);
  if (panel) panel.classList.add('active');
  if (stepNav) stepNav.classList.add('active');

  currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Get form values ──
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function getRadio(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

// 表示中の症例数計算結果（hiddenでない最初のパネル）を返す
function getActiveCalcResult() {
  for (let i = 1; i <= 5; i++) {
    const res = document.getElementById('c' + i + '-result');
    if (res && !res.classList.contains('hidden')) return res;
  }
  return null;
}

// 表示中の症例数計算結果を「ラベル：値」形式のテキストとして返す
function calcResultSummary() {
  const res = getActiveCalcResult();
  if (!res) return '';
  const lines = [];
  res.querySelectorAll('.calc-num').forEach(item => {
    const val = item.querySelector('.val')?.textContent || '';
    const lbl = item.querySelector('.lbl')?.textContent || '';
    if (val || lbl) lines.push(`${lbl}：${val}`);
  });
  return lines.join('\n');
}

// ============================================================
// ── Form5連携用データ保存 ──
// ============================================================
function collectResearchIdeaData() {
  const sampleSizeSummary = calcResultSummary();

  const secondaryEndpoints = Array.from(document.querySelectorAll('.sap-secondary-ep')).map((el, i) => {
    const type = el.parentElement?.querySelector('.sap-secondary-type')?.value || '';
    return el.value ? { name: el.value, type } : null;
  }).filter(Boolean);

  const checkedSensitivity = Array.from(document.querySelectorAll('.sap-sensitivity-chk:checked')).map(el => el.value);

  return {
    savedAt: new Date().toISOString(),
    theme: getVal('theme'),
    background: getVal('background'),
    purpose: getVal('purpose'),
    design: getVal('design'),
    disease: getVal('disease'),
    subjects: getVal('subjects'),
    setting: getVal('setting'),

    intervention: getRadio('intervention'),
    unapproved: getRadio('unapproved'),
    funding: getRadio('funding'),
    clinicalTrial: getRadio('clinicalTrial'),
    invasiveness: getRadio('invasiveness'),
    multicenter: getRadio('multicenter'),
    retrospective: getRadio('retrospective'),
    researchType: window._researchType || '',

    c1Test: getVal('c1-test'),
    c1Alpha: getVal('c1-alpha'),
    c1Power: getVal('c1-power'),
    c1M1: getVal('c1-m1'),
    c1M2: getVal('c1-m2'),
    c1Sd: getVal('c1-sd'),
    c1Ratio: getVal('c1-ratio'),

    c2Test: getVal('c2-test'),
    c2Alpha: getVal('c2-alpha'),
    c2Power: getVal('c2-power'),
    c2P1: getVal('c2-p1'),
    c2P2: getVal('c2-p2'),
    c2Ratio: getVal('c2-ratio'),

    c3Test: getVal('c3-test'),
    c3Alpha: getVal('c3-alpha'),
    c3Power: getVal('c3-power'),
    c3Diff: getVal('c3-diff'),
    c3Sd: getVal('c3-sd'),

    c4Alpha: getVal('c4-alpha'),
    c4P: getVal('c4-p'),
    c4D: getVal('c4-d'),
    c4Prev: getVal('c4-prev'),

    c5Test: getVal('c5-test'),
    c5Alpha: getVal('c5-alpha'),
    c5Power: getVal('c5-power'),
    c5Mu0: getVal('c5-mu0'),
    c5Mu1: getVal('c5-mu1'),
    c5Sd: getVal('c5-sd'),

    sampleSizeSummary,

    sapPrimaryEndpoint: getVal('sap-primary-endpoint'),
    sapDatatype: getRadio('sap-datatype'),
    sapTiming: getVal('sap-timing'),
    sapSecondaryEndpoints: secondaryEndpoints,
    sapAnalysisSet: getRadio('sap-analysisset'),
    sapExclusionPlan: getVal('sap-exclusion-plan'),
    sapPrimaryMethod: getVal('sap-primary-method'),
    sapCovariate: getRadio('sap-covariate'),
    sapCovariates: getVal('sap-covariates'),
    sapAlpha: getVal('sap-alpha'),
    sapSided: getVal('sap-sided'),
    sapSoftware: getVal('sap-software'),
    sapSensitivityChecks: checkedSensitivity,
    sapSensitivityOther: getVal('sap-sensitivity-other'),
    sapMissing: getRadio('sap-missing'),
    sapExclusionPlan2: getVal('sap-exclusion-plan'),
    sapDropoutPlan: getVal('sap-dropout-plan'),
    sapDropoutRate: getVal('sap-dropout-rate'),
    sapAdjustedN: document.getElementById('sap-adjusted-n')?.textContent || '',
    sapDraft: window._sapDraft || '',

    startDate: getVal('start-date'),

    aiIncludeBasic: document.getElementById('ai-include-basic')?.checked || false,
    aiIncludeDesign: document.getElementById('ai-include-design')?.checked || false,
    aiIncludeSamplesize: document.getElementById('ai-include-samplesize')?.checked || false,
    aiIncludeSap: document.getElementById('ai-include-sap')?.checked || false,
    aiOutputType: getRadio('ai-output-type'),
    aiExtraInstruction: getVal('ai-extra-instruction')
  };
}

function saveResearchIdeaData() {
  try {
    const data = collectResearchIdeaData();
    localStorage.setItem('researchIdeaFormData', JSON.stringify(data));
  } catch (e) {
    console.error('researchIdeaFormData save error:', e);
  }
}

function openForm5WithData(event) {
  if (event) event.preventDefault();
  saveResearchIdeaData();
  window.open('https://morikawa001.github.io/reserch_idea_form/study-plan-outline.html', '_blank', 'noopener,noreferrer');
}

function bindAutoSave() {
  const selectors = [
    '#theme', '#background', '#purpose', '#design', '#disease', '#subjects', '#setting',
    'input[name="intervention"]', 'input[name="unapproved"]', 'input[name="funding"]',
    'input[name="clinicalTrial"]', 'input[name="invasiveness"]',
    'input[name="multicenter"]', 'input[name="retrospective"]',

    '#c1-test', '#c1-alpha', '#c1-power', '#c1-m1', '#c1-m2', '#c1-sd', '#c1-ratio',
    '#c2-test', '#c2-alpha', '#c2-power', '#c2-p1', '#c2-p2', '#c2-ratio',
    '#c3-test', '#c3-alpha', '#c3-power', '#c3-diff', '#c3-sd',
    '#c4-alpha', '#c4-p', '#c4-d', '#c4-prev',
    '#c5-test', '#c5-alpha', '#c5-power', '#c5-mu0', '#c5-mu1', '#c5-sd',

    '#sap-primary-endpoint', 'input[name="sap-datatype"]', '#sap-timing',
    '.sap-secondary-ep', '.sap-secondary-type',
    'input[name="sap-analysisset"]', '#sap-exclusion-plan',
    '#sap-primary-method', 'input[name="sap-covariate"]', '#sap-covariates',
    '#sap-alpha', '#sap-sided', '#sap-software',
    '.sap-sensitivity-chk', '#sap-sensitivity-other',
    'input[name="sap-missing"]', '#sap-dropout-plan', '#sap-dropout-rate',

    '#start-date',
    '#ai-include-basic', '#ai-include-design', '#ai-include-samplesize', '#ai-include-sap',
    'input[name="ai-output-type"]', '#ai-extra-instruction'
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('input', saveResearchIdeaData);
      el.addEventListener('change', saveResearchIdeaData);
    });
  });
}

// ── Classification logic ──
function runClassification() {
  const intervention  = getRadio('intervention');
  const unapproved    = getRadio('unapproved');
  const funding       = getRadio('funding');
  const clinicalTrial = getRadio('clinicalTrial');
  const invasiveness  = getRadio('invasiveness');
  const multicenter   = getRadio('multicenter');
  const retrospective = getRadio('retrospective');

  let type = '', badgeClass = '', description = '', flowSteps = [];

  if (clinicalTrial === 'yes') {
    flowSteps.push({ text: '臨床研究法の対象（特定臨床研究）に該当しますか？', type: 'question' });
    flowSteps.push({ text: 'はい → 特定臨床研究', type: 'answer-yes' });
    type = '特定臨床研究';
    badgeClass = 'badge-spec';
    description = '臨床研究法が適用される特定臨床研究です。認定臨床研究審査委員会（CRB）の審査、jRCTへの登録、モニタリングが必須です。';
  } else {
    flowSteps.push({ text: '研究に「介入」を行いますか？', type: 'question' });

    if (intervention === 'yes') {
      flowSteps.push({ text: 'はい → 介入研究', type: 'answer-yes' });
      flowSteps.push({ text: '未承認薬・未承認機器を使用しますか？', type: 'question' });

      if (unapproved === 'yes') {
        flowSteps.push({ text: 'はい → 治験（薬事法規制対象）', type: 'answer-yes' });
        flowSteps.push({ text: '医師が自ら実施する治験ですか？', type: 'question' });

        if (funding === 'yes') {
          flowSteps.push({ text: 'いいえ（企業依頼）→ 企業治験', type: 'answer-yes' });
          type = '企業治験';
          badgeClass = 'badge-trial';
          description = '製薬・医療機器企業が依頼する治験です。GCP（医薬品臨床試験の実施基準）が適用されます。最も規制が厳しく、倫理審査委員会（IRB）の承認に加え、薬事規制当局への届出が必要です。';
        } else {
          flowSteps.push({ text: 'はい → 医師主導治験', type: 'answer-yes' });
          type = '医師主導治験';
          badgeClass = 'badge-trial';
          description = '医師が自ら実施する治験です。GCPの適用を受けます。治験計画届（薬機法第80条の2）が必要で、倫理審査委員会の審査と規制当局への届出が必要です。';
        }
      } else {
        flowSteps.push({ text: 'いいえ（承認済み薬剤のみ）→ 承認済みの介入', type: 'answer-no' });
        flowSteps.push({ text: '企業（製薬・医療機器）からの資金提供はありますか？', type: 'question' });

        if (funding === 'yes') {
          flowSteps.push({ text: 'はい → 特定臨床研究（臨床研究法 第2条2項該当）', type: 'answer-yes' });
          type = '特定臨床研究';
          badgeClass = 'badge-spec';
          description = '企業（製薬・医療機器）からの資金提供を受けた承認済み医薬品・機器を用いた介入研究です。臨床研究法第2条2項により特定臨床研究に該当します。認定臨床研究審査委員会（CRB）の審査、jRCTへの登録、モニタリングが必須です。';
        } else {
          flowSteps.push({ text: 'いいえ（自己資金・公的資金のみ）', type: 'answer-no' });
          flowSteps.push({ text: 'いいえ → 介入研究（非特定臨床研究）', type: 'answer-no' });
          type = '介入研究（非特定臨床研究）';
          badgeClass = 'badge-inv';
          description = '承認済み医薬品・機器を用いた介入研究で、臨床研究法の規制対象外です。「人を対象とする生命科学・医学系研究に関する倫理指針」が適用され、倫理審査委員会（IRB）の承認が必要です。侵襲の程度により審査区分が変わります。';
        }
      }
    } else if (intervention === 'no') {
      flowSteps.push({ text: 'いいえ → 観察研究・調査研究', type: 'answer-no' });
      flowSteps.push({ text: '既存資料・診療情報のみを使用しますか？', type: 'question' });

      if (retrospective === 'yes') {
        flowSteps.push({ text: 'はい → 後ろ向き観察研究', type: 'answer-yes' });
        type = '後ろ向き観察研究';
        badgeClass = 'badge-obs';
        description = '既存の診療情報・データベースを用いた後ろ向き研究です。「人を対象とする生命科学・医学系研究に関する倫理指針」が適用されます。個人情報の適切な管理と匿名化が必要です。侵襲なしの場合、倫理審査は簡略審査の対象になる可能性があります。';
      } else {
        flowSteps.push({ text: 'いいえ（前向き収集あり）→ 前向き観察研究', type: 'answer-no' });
        type = '前向き観察研究';
        badgeClass = 'badge-obs';
        description = '前向きにデータを収集する観察研究（コホート研究・横断研究等）です。「人を対象とする生命科学・医学系研究に関する倫理指針」が適用されます。研究参加者への十分なインフォームド・コンセントが必要です。';
      }

      if (funding === 'yes') {
        flowSteps.push({ text: '⚠️ 企業からの資金提供あり → 特定臨床研究（介入研究の場合）に該当する可能性があります', type: 'answer-yes' });
        description += ' ⚠️ 企業（製薬・医療機器）からの資金提供がある場合、介入研究では臨床研究法上の特定臨床研究に該当する可能性があります。研究内容を改めて確認し、必要に応じて臨床研究支援室に相談してください。';
      }
    } else {
      type = '判定するには入力が必要です';
      badgeClass = '';
      description = 'ステップ1に戻り、「介入を行いますか？」を選択してください。';
      flowSteps = [{ text: '介入の有無が選択されていません。ステップ1に戻ってください。', type: 'question' }];
    }
  }

  window._researchType = type;
  saveResearchIdeaData();

  const fc = document.getElementById('flowchart-visual');
  if (fc) {
    fc.innerHTML = '';
    flowSteps.forEach((s, i) => {
      if (i > 0) {
        const arr = document.createElement('div');
        arr.className = 'flow-arrow';
        fc.appendChild(arr);
      }
      const node = document.createElement('div');
      node.className = 'flow-node ' + s.type;
      node.textContent = s.text;
      fc.appendChild(node);
    });

    if (type) {
      const arr = document.createElement('div');
      arr.className = 'flow-arrow';
      fc.appendChild(arr);

      const result = document.createElement('div');
      result.className = 'flow-node result-node';
      result.innerHTML = '🏁 判定結果：<strong>' + type + '</strong>';
      fc.appendChild(result);
    }
  }

  const badgeArea = document.getElementById('classification-badge-area');
  if (badgeArea) {
    badgeArea.innerHTML = badgeClass
      ? `<span class="result-badge ${badgeClass}">${type}</span>`
      : '';
  }

  const desc = document.getElementById('classification-desc');
  if (desc) {
    desc.innerHTML = description;
    desc.classList.remove('hidden');
  }
}

// ============================================================
// ── Novelty / keywords ──
// ============================================================
window._selectedKwEn = new Set();
window._selectedKwJa = new Set();

function renderNovelty() {
  const theme = getVal('theme');
  const disease = getVal('disease');
  const purpose = getVal('purpose');
  const keywords = generateKeywords(theme, disease, purpose);

  window._selectedKwEn = new Set();
  window._selectedKwJa = new Set();

  const area = document.getElementById('novelty-keywords-area');
  if (area) {
    area.innerHTML = `
      <h3>🔑 推奨検索キーワード</h3>
      <p class="kw-hint">キーワードをクリックして選択 → 下のデータベースボタンで検索できます</p>
      <div class="doc-section">
        <h4>英語キーワード（PubMed用）</h4>
        <div class="kw-tag-list" id="kw-en-list">
          ${keywords.en.map((k) =>
            `<button class="kw-tag" data-lang="en" data-kw="${k.replace(/"/g, '&quot;')}"
              onclick="toggleKwTag(this,'en')">${k}</button>`
          ).join('')}
        </div>
      </div>
      <div class="doc-section">
        <h4>日本語キーワード（医中誌Web用）</h4>
        <div class="kw-tag-list" id="kw-ja-list">
          ${keywords.ja.map((k) =>
            `<button class="kw-tag" data-lang="ja" data-kw="${k.replace(/"/g, '&quot;')}"
              onclick="toggleKwTag(this,'ja')">${k}</button>`
          ).join('')}
        </div>
      </div>
      <div id="kw-selected-count" class="kw-selected-count" style="display:none;"></div>
    `;
  }

  const assess = document.getElementById('novelty-assessment');
  if (assess) {
    assess.innerHTML = `
      <h3>📌 新規性評価の視点</h3>
      <div class="doc-list">
        <div class="doc-item"><span class="doc-num">Population</span><span>${getVal('subjects') || '（未入力）'}</span></div>
        <div class="doc-item"><span class="doc-num">Setting</span><span>${getVal('setting') || '（未入力）'}</span></div>
        <div class="doc-item"><span class="doc-num">Design</span><span>${getVal('design') || '（未入力）'}</span></div>
        <div class="doc-item"><span class="doc-num">研究種別</span><span>${window._researchType || '（要判定）'}</span></div>
      </div>
    `;
  }

  renderDbList();
}

function toggleKwTag(btn, lang) {
  const kw = btn.dataset.kw;
  const set = lang === 'en' ? window._selectedKwEn : window._selectedKwJa;

  if (set.has(kw)) {
    set.delete(kw);
    btn.classList.remove('selected');
  } else {
    set.add(kw);
    btn.classList.add('selected');
  }

  updateKwCount();
  renderDbList();
}

function updateKwCount() {
  const total = window._selectedKwEn.size + window._selectedKwJa.size;
  const el = document.getElementById('kw-selected-count');
  const tip = document.getElementById('kw-search-tip');

  if (!el) return;

  if (total > 0) {
    el.style.display = 'block';
    el.textContent = `✓ ${total}件のキーワードを選択中（英語：${window._selectedKwEn.size}件、日本語：${window._selectedKwJa.size}件）`;
    if (tip) tip.classList.add('show');
  } else {
    el.style.display = 'none';
    if (tip) tip.classList.remove('show');
  }
}

function buildSearchUrl(db) {
  const enArr = Array.from(window._selectedKwEn);
  const jaArr = Array.from(window._selectedKwJa);
  const allArr = [...enArr, ...jaArr];
  const hasEn = enArr.length > 0;
  const hasJa = jaArr.length > 0;
  const hasAny = allArr.length > 0;

  switch (db) {
    case 'pubmed': {
      if (!hasEn && !hasAny) return 'https://pubmed.ncbi.nlm.nih.gov/';
      const terms = (hasEn ? enArr : allArr)
        .map(k => `"${k}"[Title/Abstract]`).join(' AND ');
      return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(terms)}`;
    }
    case 'jamas': {
      if (!hasJa && !hasAny) return 'https://search.jamas.or.jp/';
      const q = (hasJa ? jaArr : allArr).join(' AND ');
      return `https://search.jamas.or.jp/api/opensearch?q=${encodeURIComponent(q)}`;
    }
    case 'cochrane': {
      if (!hasEn && !hasAny) return 'https://www.cochranelibrary.com/';
      const q = (hasEn ? enArr : allArr).join(' AND ');
      return `https://www.cochranelibrary.com/search?q=${encodeURIComponent(q)}&t=1`;
    }
    case 'jrct':
      return 'https://jrct.mhlw.go.jp/search';
    case 'semantic': {
      if (!hasEn && !hasAny) return 'https://www.semanticscholar.org/';
      const q = (hasEn ? enArr : allArr).join(' ');
      return `https://www.semanticscholar.org/search?q=${encodeURIComponent(q)}&sort=Relevance`;
    }
    default:
      return '#';
  }
}

function renderDbList() {
  const hasAny = window._selectedKwEn.size + window._selectedKwJa.size > 0;
  const DBS = [
    {
      id: 'pubmed',
      label: '英文文献',
      name: 'PubMed / MEDLINE',
      desc: '国際医学文献の主要データベース',
      baseUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
      formula: () => {
        const arr = Array.from(window._selectedKwEn);
        if (!arr.length) return null;
        return arr.map(k => `"${k}"[Title/Abstract]`).join(' AND ');
      }
    },
    {
      id: 'jamas',
      label: '日本語文献',
      name: '医中誌Web',
      desc: '国内医学文献の総合データベース',
      baseUrl: 'https://search.jamas.or.jp/',
      formula: () => {
        const arr = Array.from(window._selectedKwJa);
        if (!arr.length) return null;
        return arr.join(' AND ');
      }
    },
    {
      id: 'cochrane',
      label: '系統的レビュー',
      name: 'Cochrane Library',
      desc: '系統的レビュー・メタアナリシス',
      baseUrl: 'https://www.cochranelibrary.com/',
      formula: () => {
        const arr = Array.from(window._selectedKwEn);
        if (!arr.length) return null;
        return arr.join(' AND ');
      }
    },
    {
      id: 'jrct',
      label: '試験登録',
      name: 'jRCT（日本臨床試験登録システム）',
      desc: '国内臨床試験登録（※ キーワードをコピーして検索欄に貼り付けてください）',
      baseUrl: 'https://jrct.mhlw.go.jp/search',
      formula: () => {
        const arr = [...Array.from(window._selectedKwJa), ...Array.from(window._selectedKwEn)];
        if (!arr.length) return null;
        return arr.join(' ');
      }
    },
    {
      id: 'semantic',
      label: 'AI検索',
      name: 'Semantic Scholar',
      desc: 'AI支援論文検索',
      baseUrl: 'https://www.semanticscholar.org/',
      formula: () => {
        const arr = Array.from(window._selectedKwEn);
        if (!arr.length) return null;
        return arr.join(' ');
      }
    }
  ];

  const container = document.getElementById('db-list-area');
  if (!container) return;

  container.innerHTML = DBS.map(db => {
    const formula = db.formula();
    const btnActive = hasAny;
    const formulaHtml = formula
      ? `<div style="margin-top:4px;font-size:0.75rem;font-family:monospace;
           background:#f0f4ff;padding:3px 7px;border-radius:4px;color:var(--primary);
           word-break:break-all;">
           ${formula.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
         </div>`
      : '';

    return `
      <div class="db-item" id="db-${db.id}">
        <span class="db-label">${db.label}</span>
        <div style="flex:1;min-width:0;">
          <a class="db-link" href="${db.baseUrl}" target="_blank" rel="noopener noreferrer">${db.name}</a>
          <div class="db-desc">${db.desc}</div>
          ${formulaHtml}
        </div>
        <button class="db-search-btn"
          ${btnActive ? '' : 'disabled'}
          onclick="openDbSearch('${db.id}', event)"
          title="${hasAny ? '選択したキーワードで検索' : 'キーワードを選択してください'}">
          🔍 検索
        </button>
      </div>`;
  }).join('');
}

function openDbSearch(dbId, event) {
  event.preventDefault();
  const url = buildSearchUrl(dbId);

  if (dbId === 'jrct') {
    const jaArr = Array.from(window._selectedKwJa);
    const enArr = Array.from(window._selectedKwEn);
    const kwText = [...jaArr, ...enArr].join(' ');

    if (kwText) {
      navigator.clipboard.writeText(kwText).then(() => {
        alert('キーワードをクリップボードにコピーしました。\njRCT の検索欄に貼り付けてください。\n\n' + kwText);
      }).catch(() => {
        window.prompt('以下のキーワードをコピーして jRCT 検索欄に貼り付けてください:', kwText);
      });
    }

    window.open(url, '_blank');
    return;
  }

  window.open(url, '_blank');
}

function generateKeywords(theme, disease, purpose) {
  const base = (theme + ' ' + disease + ' ' + purpose).replace(/[　]/g, ' ');
  const jaWords = base.split(/[\s、。，．,\.]+/).filter(w => w.length > 1).slice(0, 5);

  while (jaWords.length < 5) {
    jaWords.push(['臨床研究', '観察研究', 'がん', '看護', '介入'][jaWords.length]);
  }

  const enMap = {
    'がん': 'cancer',
    '腫瘍': 'tumor',
    '乳がん': 'breast cancer',
    '肺がん': 'lung cancer',
    '胃がん': 'gastric cancer',
    '大腸': 'colorectal',
    '術後': 'postoperative',
    '疼痛': 'pain',
    '看護': 'nursing',
    '介入': 'intervention',
    '観察': 'observational',
    '治療': 'treatment',
    '予後': 'prognosis',
    'QOL': 'quality of life',
    '化学療法': 'chemotherapy',
    '緩和': 'palliative',
    '外来': 'outpatient',
    '入院': 'inpatient',
    'リハビリ': 'rehabilitation',
    '栄養': 'nutrition',
    '感染': 'infection'
  };

  const enWords = [];
  for (const [ja, en] of Object.entries(enMap)) {
    if (base.includes(ja)) enWords.push(en);
    if (enWords.length >= 5) break;
  }

  const defaults = ['clinical study', 'randomized controlled trial', 'cohort study', 'observational study', 'cancer care'];
  while (enWords.length < 5) {
    enWords.push(defaults[enWords.length]);
  }

  return { ja: jaWords, en: enWords };
}

// ── Documents list ──
function renderDocuments() {
  const type = window._researchType || '';
  const retrospective = getRadio('retrospective');

  const isTrial = type.includes('治験');
  const isObs = type.includes('観察研究');

  let html = '';

  html += `
    <div class="doc-section">
      <h4>📋 全研究共通（必須）</h4>
      <div class="doc-list">
        <div class="doc-item">
          <span class="doc-num">様式5</span>
          <span>
            <a href="https://morikawa001.github.io/reserch_idea_form/study-plan-outline.html"
               target="_blank"
               rel="noopener noreferrer"
               onclick="openForm5WithData(event)">
              研究計画概略書
            </a>
          </span>
          <span class="required">必須</span>
        </div>
        <div class="doc-item"><span class="doc-num">様式7</span><span>研究者の履歴書</span><span class="required">必須</span></div>
        <div class="doc-item"><span class="doc-num">様式40</span><span>利益相反自己申告書</span><span class="required">必須</span></div>
        <div class="doc-item"><span class="doc-num">様式29</span><span>誓約書</span><span class="required">必須</span></div>
        <div class="doc-item"><span class="doc-num">研究計画書</span><span>詳細な研究プロトコル</span><span class="required">必須</span></div>
      </div>
    </div>`;

  if (isObs && retrospective === 'yes') {
    html += `
      <div class="doc-section">
        <h4>📋 後ろ向き観察研究（SCC内後向き観察研究用）</h4>
        <div class="doc-list">
          <div class="doc-item"><span class="doc-num">様式8-3</span><span>臨床研究申請書（SCC内後向き観察研究用）</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式6</span><span>分担者リスト</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">院内掲示文書</span><span>様式39 院内掲示文書（オプトアウト対応）</span><span class="optional">条件付</span></div>
        </div>
      </div>`;
  } else if (isObs) {
    html += `
      <div class="doc-section">
        <h4>📋 前向き観察研究</h4>
        <div class="doc-list">
          <div class="doc-item"><span class="doc-num">様式8</span><span>臨床研究申請書（臨床研究IRB用）</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式8-1</span><span>計画書作成者が配慮するべきポイントの申請者チェック表</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式6</span><span>分担者リスト</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式38</span><span>臨床研究への参加についての同意書（インフォームドコンセント）</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式13</span><span>研究経費概算書</span><span class="optional">要確認</span></div>
        </div>
      </div>`;
  }

  if (!isObs) {
    html += `
      <div class="doc-section">
        <h4>📋 介入研究共通書類</h4>
        <div class="doc-list">
          <div class="doc-item"><span class="doc-num">様式8</span><span>臨床研究申請書（臨床研究IRB用）</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式8-1</span><span>計画書作成者チェック表</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式6</span><span>分担者リスト</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式38</span><span>インフォームドコンセント同意書</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式13</span><span>研究経費概算書</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式15</span><span>モニタリング申請書</span><span class="required">必須</span></div>
        </div>
      </div>`;
  }

  if (isTrial) {
    html += `
      <div class="doc-section">
        <h4>⚠️ 治験（企業治験・医師主導治験）追加書類</h4>
        <div class="warn-box">治験はGCPが適用され、通常の臨床研究より大幅に多くの書類が必要です。治験統一書式（厚生労働省様式）を使用してください。</div>
        <div class="doc-list">
          <div class="doc-item"><span class="doc-num">治験統一書式</span><span>治験の依頼等に係る統一書式（厚生労働省様式）</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">治験計画届</span><span>薬機法に基づく治験計画届（薬事規制当局へ）</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">治験薬概要書</span><span>Investigator's Brochure（IB）</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式18</span><span>被検者の安全等に関わる報告書</span><span class="required">必須</span></div>
          <div class="doc-item"><span class="doc-num">様式20</span><span>重篤な有害事象等報告書</span><span class="required">必須</span></div>
        </div>
      </div>`;
  }

  const container = document.getElementById('documents-list-area');
  if (container) container.innerHTML = html;
}

// ── Novelty progress ──
function updateNoveltyProgress() {
  const checks = Array.from(document.querySelectorAll('.novelty-chk'));
  if (!checks.length) return;

  const done = checks.filter(c => c.checked).length;
  const rate = Math.round((done / checks.length) * 100);

  const bar = document.getElementById('novelty-progress-bar');
  const fill = document.getElementById('novelty-progress-fill');
  const label = document.getElementById('novelty-progress-label');
  if (!bar || !fill || !label) return;

  if (done > 0) {
    bar.style.display = 'block';
    fill.style.width = rate + '%';
    label.textContent = `チェック達成率：${rate}%（${done}/${checks.length}項目）`;
  } else {
    bar.style.display = 'none';
  }
}

// ── Sample size helper ──
function zAlpha(alpha, two) {
  const p = two ? 1 - alpha / 2 : 1 - alpha;
  return inverseNormal(p);
}

function zBeta(power) {
  return inverseNormal(power);
}

function inverseNormal(p) {
  const a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
  const a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
  const b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
  const b4 = 66.8013118877197, b5 = -13.2806815528857;
  const c1 = -0.00778489400243029, c2 = -0.322396458041136, c3 = -2.40075827716184;
  const c4 = -2.54973253934373, c5 = 4.37466414146497, c6 = 2.93816398269878;
  const d1 = 0.00778469570904146, d2 = 0.32246712907004, d3 = 2.445134137143;
  const d4 = 3.75440866190742;
  const plow = 0.02425, phigh = 1 - plow;
  let q, r;

  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  if (phigh < p) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  q = p - 0.5;
  r = q * q;
  return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
    (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
}

function calcTTest() {
  const two = document.getElementById('c1-test').value === 'two';
  const alpha = parseFloat(document.getElementById('c1-alpha').value);
  const power = parseFloat(document.getElementById('c1-power').value);
  const m1 = parseFloat(document.getElementById('c1-m1').value);
  const m2 = parseFloat(document.getElementById('c1-m2').value);
  const sd = parseFloat(document.getElementById('c1-sd').value);
  const ratio = parseFloat(document.getElementById('c1-ratio').value);

  const za = zAlpha(alpha, two);
  const zb = zBeta(power);
  const d = Math.abs(m1 - m2) / sd;
  const n1 = Math.ceil((za + zb) ** 2 * (1 + 1 / ratio) / d ** 2);
  const n2 = Math.ceil(n1 * ratio);

  showCalcResult('c1-result', [
    { val: n1, lbl: '対照群（人）' },
    { val: n2, lbl: '介入群（人）' },
    { val: n1 + n2, lbl: '総症例数（人）' },
    { val: d.toFixed(2), lbl: "Cohen's d" }
  ]);
  saveResearchIdeaData();
}

function calcProportions() {
  const two = document.getElementById('c2-test').value === 'two';
  const alpha = parseFloat(document.getElementById('c2-alpha').value);
  const power = parseFloat(document.getElementById('c2-power').value);
  const p1 = parseFloat(document.getElementById('c2-p1').value) / 100;
  const p2 = parseFloat(document.getElementById('c2-p2').value) / 100;
  const ratio = parseFloat(document.getElementById('c2-ratio').value);

  const za = zAlpha(alpha, two);
  const zb = zBeta(power);
  const p = (p1 + ratio * p2) / (1 + ratio);
  const n1 = Math.ceil(
    (za * Math.sqrt((1 + 1 / ratio) * p * (1 - p)) +
      zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2) / ratio)) ** 2 /
    (p2 - p1) ** 2
  );
  const n2 = Math.ceil(n1 * ratio);

  showCalcResult('c2-result', [
    { val: n1, lbl: '対照群（人）' },
    { val: n2, lbl: '介入群（人）' },
    { val: n1 + n2, lbl: '総症例数（人）' },
    { val: ((p2 - p1) * 100).toFixed(1) + '%', lbl: '反応率の差' }
  ]);
  saveResearchIdeaData();
}

function calcPaired() {
  const two = document.getElementById('c3-test').value === 'two';
  const alpha = parseFloat(document.getElementById('c3-alpha').value);
  const power = parseFloat(document.getElementById('c3-power').value);
  const diff = parseFloat(document.getElementById('c3-diff').value);
  const sd = parseFloat(document.getElementById('c3-sd').value);

  const za = zAlpha(alpha, two);
  const zb = zBeta(power);
  const d = Math.abs(diff) / sd;
  const n = Math.ceil((za + zb) ** 2 / d ** 2);

  showCalcResult('c3-result', [
    { val: n, lbl: '必要症例数（人）' },
    { val: d.toFixed(2), lbl: "Cohen's d" }
  ]);
  saveResearchIdeaData();
}

function calcSensSpec() {
  const alpha = parseFloat(document.getElementById('c4-alpha').value);
  const p = parseFloat(document.getElementById('c4-p').value);
  const d = parseFloat(document.getElementById('c4-d').value);
  const prev = parseFloat(document.getElementById('c4-prev').value);

  const za = zAlpha(alpha, true);
  const nTarget = Math.ceil(za ** 2 * p * (1 - p) / d ** 2);
  const nTotal = Math.ceil(nTarget / prev);

  showCalcResult('c4-result', [
    { val: nTarget, lbl: '陽性例数（人）' },
    { val: nTotal, lbl: '総対象者数（人）' }
  ]);
  saveResearchIdeaData();
}

function calcOneSample() {
  const two = document.getElementById('c5-test').value === 'two';
  const alpha = parseFloat(document.getElementById('c5-alpha').value);
  const power = parseFloat(document.getElementById('c5-power').value);
  const mu0 = parseFloat(document.getElementById('c5-mu0').value);
  const mu1 = parseFloat(document.getElementById('c5-mu1').value);
  const sd = parseFloat(document.getElementById('c5-sd').value);

  const za = zAlpha(alpha, two);
  const zb = zBeta(power);
  const d = Math.abs(mu1 - mu0) / sd;
  const n = Math.ceil((za + zb) ** 2 / d ** 2);

  showCalcResult('c5-result', [
    { val: n, lbl: '必要症例数（人）' },
    { val: d.toFixed(2), lbl: "Cohen's d" }
  ]);
  saveResearchIdeaData();
}

function showCalcResult(id, items) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = items.map(i => `
    <div class="calc-num">
      <div class="val">${i.val}</div>
      <div class="lbl">${i.lbl}</div>
    </div>
  `).join('');

  el.classList.remove('hidden');
}

function resetCalc(n) {
  const el = document.getElementById('c' + n + '-result');
  if (el) el.classList.add('hidden');
  saveResearchIdeaData();
}

function switchCalcTab(n) {
  for (let i = 1; i <= 5; i++) {
    const panel = document.getElementById('cpanel-' + i);
    if (panel) panel.classList.toggle('hidden', i !== n);

    const btn = document.getElementById('ctab-' + i);
    if (btn) btn.style.borderBottom = i === n ? '3px solid var(--primary)' : '';
  }
}

// ── Schedule ──
function generateSchedule() {
  const input = document.getElementById('start-date');
  const container = document.getElementById('schedule-area');
  if (!container) return;

  let committeeDate = null;
  if (input && input.value) {
    committeeDate = new Date(input.value);
  } else {
    container.innerHTML = '<div class="info-box">倫理委員会開催日を入力してください。</div>';
    return;
  }

  function addDays(d, days) {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
  }

  function addMonths(d, months) {
    const nd = new Date(d);
    const originalDate = nd.getDate();
    nd.setMonth(nd.getMonth() + months);

    if (nd.getDate() !== originalDate) {
      nd.setDate(0);
    }
    return nd;
  }

  function fmt(d) {
    const y = d.getFullYear();
    const m = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${y}-${m}-${day}`;
  }

  const beforeMilestones = [
    { phase: '準備開始', date: addMonths(committeeDate, -2), title: '研究構想・先行研究整理', desc: '研究テーマ・背景・目的の明確化、文献検索開始' },
    { phase: '7週前', date: addDays(committeeDate, -49), title: '研究計画相談', desc: '臨床研究支援センターへ事前相談、様式5作成開始' },
    { phase: '5週前', date: addDays(committeeDate, -35), title: '書類作成', desc: '研究計画書、説明文書、必要書類の整備' },
    { phase: '3週前', date: addDays(committeeDate, -21), title: '提出準備', desc: '申請書最終確認、院内調整、提出準備' },
    { phase: '委員会当日', date: committeeDate, title: '倫理委員会審査', desc: 'IRB/倫理審査委員会で審査' }
  ];

  const afterMilestones = [
    { phase: '2週後', date: addDays(committeeDate, 14), title: 'IRB結果受領', desc: '承認・条件付き承認・修正指示への対応' },
    { phase: '4週後', date: addDays(committeeDate, 28), title: '研究開始準備', desc: 'CRF整備、研究者説明、データ収集開始準備' },
    { phase: '6週後', date: addDays(committeeDate, 42), title: '研究開始', desc: '同意取得・症例登録・データ収集開始' }
  ];

  const milestones = [...beforeMilestones, ...afterMilestones];

  container.innerHTML = `
    <div class="timeline">
      ${milestones.map((m, i) => `
        <div class="tl-item ${m.phase} ${i === milestones.length - 1 ? 'milestone' : ''}">
          <div class="tl-week">${m.phase}<br>${fmt(m.date)}</div>
          <div class="tl-title">${m.title}</div>
          <div class="tl-desc">${m.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
  saveResearchIdeaData();
}

// ── Markdown → HTML ──
function markdownToHtml(md) {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^### (.*)$/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gim, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/^- (.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  html = html.replace(/\n{2,}/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<\/ul>\s*<ul>/g, '');
  return html;
}

// ── AI Brushup ──
function copyAiResult() {
  const el = document.getElementById('ai-result');
  if (!el) return;

  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  document.execCommand('copy');
  sel.removeAllRanges();
  alert('AI結果をクリップボードにコピーしました。');
}

function printAiResult() {
  const el = document.getElementById('ai-result');
  if (!el) return;

  const win = window.open('', '_blank');
  win.document.write('<html><head><title>ブラッシュアップ結果</title></head><body>');
  win.document.write(el.innerHTML);
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}

function resetAi() {
  const result = document.getElementById('ai-result');
  const aibtns = document.getElementById('ai-btns');

  if (result) {
    result.innerHTML = '';
    result.style.display = 'none';
  }
  if (aibtns) aibtns.style.display = 'none';

  document.querySelectorAll('#panel-7 .checkbox-group input').forEach(c => {
    c.checked = false;
  });
}

// ── Print all ──
function printAll() {
  window.print();
}

// ── 終了画面 ──
function showEndScreen() {
  if (!confirm('入力内容をリセットして終了しますか？')) return;
  resetAllInputs();

  const endScreen = document.getElementById('endScreen');
  if (endScreen) endScreen.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restartFromEnd() {
  const endScreen = document.getElementById('endScreen');
  if (endScreen) endScreen.classList.remove('active');
  goToStep(1);
}

function resetAllInputs() {
  document.querySelectorAll('input, textarea, select').forEach(el => {
    if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked = false;
    } else {
      el.value = '';
    }
  });

  window._researchType = null;
  window._selectedKwEn = new Set();
  window._selectedKwJa = new Set();
  window._sapDraft = '';

  localStorage.removeItem('researchIdeaFormData');

  const fv = document.getElementById('flowchart-visual');
  if (fv) fv.innerHTML = '';

  const ba = document.getElementById('classification-badge-area');
  if (ba) ba.innerHTML = '';

  const desc = document.getElementById('classification-desc');
  if (desc) {
    desc.innerHTML = '';
    desc.classList.add('hidden');
  }

  ['c1-result', 'c2-result', 'c3-result', 'c4-result', 'c5-result'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const noveltyKw = document.getElementById('novelty-keywords-area');
  if (noveltyKw) noveltyKw.innerHTML = '';

  const noveltyAs = document.getElementById('novelty-assessment');
  if (noveltyAs) noveltyAs.innerHTML = '';

  const dbList = document.getElementById('db-list-area');
  if (dbList) dbList.innerHTML = '';

  const docs = document.getElementById('documents-list-area');
  if (docs) docs.innerHTML = '';

  const sched = document.getElementById('schedule-area');
  if (sched) sched.innerHTML = '';

  const aiRes = document.getElementById('ai-result');
  if (aiRes) {
    aiRes.innerHTML = '';
    aiRes.style.display = 'none';
  }

  const aibtns = document.getElementById('ai-btns');
  if (aibtns) aibtns.style.display = 'none';

  updateNoveltyProgress();
  renderDbList();
}

// ── Init ──
window.addEventListener('DOMContentLoaded', () => {
  generateSchedule();
  window._selectedKwEn = new Set();
  window._selectedKwJa = new Set();
  renderDbList();
  bindAutoSave();
  saveResearchIdeaData();
});

// ============================================================
// ── SAP（統計解析計画）関連関数 ──
// ============================================================

let currentSapStep = 1;
const SAP_TOTAL = 7;

function sapGoTo(n) {
  for (let i = 1; i <= SAP_TOTAL; i++) {
    const panel = document.getElementById('sap-panel-' + i);
    if (panel) panel.classList.toggle('hidden', i !== n);

    const nav = document.getElementById('sap-nav-' + i);
    if (nav) {
      nav.classList.remove('active', 'done');
      if (i === n) nav.classList.add('active');
      else if (i < n) nav.classList.add('done');
    }
  }

  currentSapStep = n;

  const pct = Math.round((n / SAP_TOTAL) * 100);
  const bar = document.getElementById('sap-progress-bar');
  const label = document.getElementById('sap-progress-label');
  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = 'Step ' + n + ' / ' + SAP_TOTAL;

  if (n === 4) sapUpdateMethodRecommend();
  if (n === 7) sapUpdateSampleSizeSummary();

  saveResearchIdeaData();
}

function sapUpdateDatatype() {
  const val = getRadio('sap-datatype');
  const tip = document.getElementById('sap-datatype-tip');
  if (!tip) return;

  const tips = {
    continuous: '✅ 平均・標準偏差で要約します。正規性の確認（Shapiro-Wilk検定等）を忘れずに。t検定 or Mann-Whitney U検定が候補です。',
    binary: '✅ 割合・率で要約します。χ²検定 or Fisherの正確確率検定、ロジスティック回帰が候補です。',
    ordinal: '✅ 中央値（IQR）で要約します。Kruskal-Wallis検定 or 順序ロジスティック回帰が候補です。',
    survival: '✅ Kaplan-Meier曲線で可視化し、log-rank検定 or Cox回帰を使用します。打ち切りの定義を明確に。',
    count: '✅ 発生数・発生率で要約します。ポアソン回帰 or 負の二項回帰が候補です。過分散に注意。'
  };

  if (val && tips[val]) {
    tip.textContent = tips[val];
    tip.classList.remove('hidden');
  } else {
    tip.classList.add('hidden');
  }

  sapUpdateMethodRecommend();
  saveResearchIdeaData();
}

function sapUpdateMethodRecommend() {
  const datatype = getRadio('sap-datatype');
  const el = document.getElementById('sap-method-recommend');
  const sel = document.getElementById('sap-primary-method');
  if (!el) return;

  const recommends = {
    continuous: { text: '📊 連続変数 → 推奨：対応なしt検定 / ANCOVA（共変量調整あり） / MMRM（反復測定）', value: 'ttest_2' },
    binary:     { text: '📊 二値変数 → 推奨：χ²検定 / Fisherの正確確率検定 / ロジスティック回帰', value: 'chisq' },
    ordinal:    { text: '📊 順序変数 → 推奨：Kruskal-Wallis検定 / 順序ロジスティック回帰', value: 'kruskal' },
    survival:   { text: '📊 生存時間 → 推奨：Kaplan-Meier + log-rank検定 / Cox比例ハザードモデル', value: 'km_logrank' },
    count:      { text: '📊 カウントデータ → 推奨：ポアソン回帰 / 負の二項回帰', value: 'poisson' }
  };

  if (datatype && recommends[datatype]) {
    const r = recommends[datatype];
    el.textContent = r.text;
    if (sel && !sel.value) sel.value = r.value;
    sapShowMethodDetail();
  } else {
    el.textContent = '← Step 1 でデータ型を選択すると、ここに推奨手法が表示されます';
  }
}

function sapShowMethodDetail() {
  const method = document.getElementById('sap-primary-method')?.value;
  const detail = document.getElementById('sap-method-detail');
  if (!detail) return;

  const details = {
    ttest_2: '対応なしt検定：2群の平均比較。Rなら t.test、EZRなら Student t-test を使用。',
    ttest_paired: '対応ありt検定：同一対象の前後比較。Rなら t.test(paired=TRUE)。',
    ancova: 'ANCOVA：ベースライン値などを調整して2群比較。Rなら lm。',
    mixed_model: '混合効果モデル（MMRM）：反復測定データに適する。Rなら nlme::lme や mmrm。',
    anova: '一元配置分散分析：3群以上の平均比較。多重比較は Tukey, Bonferroni など。',
    mw: 'Mann-Whitney U検定：非正規分布の2群比較。Rなら wilcox.test。',
    wilcoxon: 'Wilcoxon符号付き順位検定：非正規分布の前後比較。Rなら wilcox.test(paired=TRUE)。',
    chisq: 'カイ二乗検定：2×2表などの比率比較。期待度数が小さい場合はFisher検定。',
    fisher: 'Fisherの正確確率検定：小標本の比率比較。Rなら fisher.test。',
    logistic: 'ロジスティック回帰：調整済みORと95%CIを算出。Rなら glm(family=binomial)。',
    rr: 'リスク比（RR）・リスク差（RD）：臨床的解釈がしやすい効果量指標。',
    km_logrank: 'Kaplan-Meier法 + log-rank検定：生存曲線比較。Rなら survival::survfit, survdiff。',
    cox: 'Cox比例ハザードモデル：HRを推定。比例ハザード性の確認が必要。Rなら survival::coxph。',
    kruskal: 'Kruskal-Wallis検定：順序変数や非正規連続変数の3群以上比較。',
    ordinal_logistic: '順序ロジスティック回帰：順序カテゴリの回帰モデル。Rなら MASS::polr。',
    cmh: 'Cochran-Mantel-Haenszel検定：層別したカテゴリ比較。',
    poisson: 'ポアソン回帰：発生数・発生率のモデル化。offset の設定に注意。',
    negbinom: '負の二項回帰：過分散があるカウントデータに適する。Rなら MASS::glm.nb。'
  };

  if (method && details[method]) {
    detail.textContent = details[method];
    detail.classList.remove('hidden');
  } else {
    detail.classList.add('hidden');
  }

  saveResearchIdeaData();
}

function sapAddSecondary() {
  const list = document.getElementById('sap-secondary-list');
  if (!list) return;

  const row = document.createElement('div');
  row.className = 'sap-endpoint-row';
  row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:6px;';
  row.innerHTML = `
    <input type="text" class="sap-secondary-ep" placeholder="例：副作用発生率、QOLスコア変化量" style="flex:1;" />
    <select class="sap-secondary-type" style="width:140px;">
      <option value="">データ型</option>
      <option value="continuous">連続変数</option>
      <option value="count">カウント変数</option>
      <option value="binary">二値変数</option>
      <option value="survival">生存時間</option>
      <option value="ordinal">順序変数</option>
    </select>
    <button class="btn btn-secondary" onclick="this.parentElement.remove(); saveResearchIdeaData();" style="padding:6px 10px;font-size:0.8rem;">削除</button>
  `;
  list.appendChild(row);

  row.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', saveResearchIdeaData);
    el.addEventListener('change', saveResearchIdeaData);
  });

  saveResearchIdeaData();
}

function sapCalcAdjusted() {
  const rate = parseFloat(document.getElementById('sap-dropout-rate')?.value || 10);
  const el = document.getElementById('sap-adjusted-n');
  if (!el) return;

  const res = getActiveCalcResult();
  if (!res) {
    el.textContent = '─';
    return;
  }

  let baseN = null;
  res.querySelectorAll('.val').forEach(v => {
    const n = parseInt(v.textContent, 10);
    if (!isNaN(n) && (baseN === null || n > baseN)) baseN = n;
  });

  if (baseN === null) {
    el.textContent = '─';
    return;
  }

  const adjusted = Math.ceil(baseN / (1 - rate / 100));
  el.textContent = `${adjusted}（ベース ${baseN} / 脱落率 ${rate}%）`;
  saveResearchIdeaData();
}

function sapUpdateSampleSizeSummary() {
  const el = document.getElementById('sap-samplesize-summary');
  if (!el) return;

  const res = getActiveCalcResult();
  if (!res) {
    el.textContent = 'Step 3 の結果がありません。';
    return;
  }

  let text = '';
  res.querySelectorAll('.calc-num').forEach(item => {
    const val = item.querySelector('.val')?.textContent || '';
    const lbl = item.querySelector('.lbl')?.textContent || '';
    text += `${lbl} ${val}\n`;
  });
  el.textContent = text.trim() || 'Step 3 の結果がありません。';
}

function generateSAPDraft() {
  const primaryEp = document.getElementById('sap-primary-endpoint')?.value;
  const datatype = getRadio('sap-datatype');
  const timing = document.getElementById('sap-timing')?.value;
  const analysisSet = getRadio('sap-analysisset');
  const method = document.getElementById('sap-primary-method')?.value;
  const covariate = getRadio('sap-covariate');
  const covariates = document.getElementById('sap-covariates')?.value;
  const alpha = document.getElementById('sap-alpha')?.value || 0.05;
  const sided = document.getElementById('sap-sided')?.value || 'two';
  const software = document.getElementById('sap-software')?.value;
  const missing = getRadio('sap-missing');
  const exclusion = document.getElementById('sap-exclusion-plan')?.value;
  const dropout = document.getElementById('sap-dropout-plan')?.value;
  const dropoutRate = document.getElementById('sap-dropout-rate')?.value || 10;
  const sensChecks = Array.from(document.querySelectorAll('.sap-sensitivity-chk:checked')).map(c => c.value);
  const sensitivityOther = document.getElementById('sap-sensitivity-other')?.value;
  const secondaryEps = Array.from(document.querySelectorAll('.sap-secondary-ep'))
    .map((el, i) => {
      const type = el.parentElement?.querySelector('.sap-secondary-type')?.value;
      return el.value ? `${i + 1}. ${el.value}（${type || '型未設定'}）` : null;
    })
    .filter(Boolean)
    .join('\n');

  const sidedLabel = sided === 'two' ? '両側検定' : '片側検定';
  const datatypeLabel = {
    continuous: '連続変数',
    binary: '二値変数',
    ordinal: '順序変数',
    survival: '時間-イベントデータ',
    count: 'カウントデータ'
  }[datatype] || datatype;

  const sensList = sensChecks.map(v => ({
    pp: 'PP解析（Per-Protocol）',
    imputation: '欠損値補完解析',
    outlier: '外れ値除外解析',
    covariate: '共変量調整の有無比較',
    subgroup: 'サブグループ解析',
    competing: '競合リスク解析'
  }[v] || v)).filter(Boolean).join('、');

  const draft = `【統計解析計画書ひな型】作成日：${new Date().toLocaleDateString('ja-JP')}

研究テーマ：${document.getElementById('theme')?.value || '未入力'}
研究種別：${window._researchType || '未判定'}

1. 主要評価項目
主要評価項目：${primaryEp || '未入力'}
データ型：${datatypeLabel || '未入力'}
測定タイミング：${timing || '未入力'}

2. 副次評価項目
${secondaryEps || '特になし'}

3. 解析対象集団
主要解析集団：${analysisSet || '未入力'}
除外・中断の扱い：${exclusion || '未入力'}

4. 主要解析方法
解析手法：${method || '未入力'}
共変量調整：${covariate || '未入力'}
調整する共変量：${covariates || 'なし'}
有意水準：${alpha}
検定方針：${sidedLabel}
使用ソフト：${software || '未入力'}

5. 感度分析
予定する感度分析：${sensList || '未設定'}
その他：${sensitivityOther || 'なし'}

6. 欠損値・中止例の扱い
欠損値の扱い：${missing || '未入力'}
中止・脱落時の方針：${dropout || '未入力'}

7. 症例数との整合
想定ドロップアウト率：${dropoutRate}%
症例数計算結果との整合を確認し、登録予定症例数を最終決定する。`;

  const area = document.getElementById('sap-draft-area');
  const content = document.getElementById('sap-draft-content');
  if (area) area.classList.remove('hidden');
  if (content) content.textContent = draft;

  window._sapDraft = draft;
  saveResearchIdeaData();

  area?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copySAPDraft() {
  const content = document.getElementById('sap-draft-content');
  if (!content) return;

  const text = content.textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('統計解析計画書ひな型をコピーしました。');
  }).catch(() => {
    window.prompt('以下をコピーしてください:', text);
  });
}

function buildAIPrompt() {
  const theme = getVal('theme');
  const background = getVal('background');
  const purpose = getVal('purpose');
  const design = getVal('design');
  const disease = getVal('disease');
  const subjects = getVal('subjects');
  const setting = getVal('setting');
  const type = window._researchType;
  const intervention = getRadio('intervention');
  const invasiveness = getRadio('invasiveness');

  const outputType = getRadio('ai-output-type') || 'protocol';
  const extraInst = document.getElementById('ai-extra-instruction')?.value;
  const includeBasic = document.getElementById('ai-include-basic')?.checked;
  const includeDesign = document.getElementById('ai-include-design')?.checked;
  const includeSamplesize = document.getElementById('ai-include-samplesize')?.checked;
  const includeSAP = document.getElementById('ai-include-sap')?.checked;

  const sampleSizeSummary = includeSamplesize ? calcResultSummary() : '';

  const outputInstructions = {
    protocol: '研究計画書ひな型（全体）を作成してください。背景・目的・方法・統計解析・倫理的配慮・参考文献リストの構成でお願いします。',
    sap_only: '統計解析計画書（SAP）のみを作成してください。主要評価項目・副次評価項目・解析対象集団・解析手法・感度分析・欠損値の扱いを含む詳細な計画書にしてください。',
    summary:  '研究概要サマリー（A4 1ページ相当）を作成してください。PICO/PECO・研究デザイン・主要評価項目・統計解析の概要を簡潔にまとめてください。'
  };

  let prompt = `あなたは静岡県立静岡がんセンター臨床研究支援センターの方針に精通した臨床研究専門家AIです。
以下の研究情報をもとに、日本語で研究計画書のひな型を作成してください。

${outputInstructions[outputType] || outputInstructions['protocol']}

`;

  if (includeBasic) {
    prompt += `【基本情報】
研究テーマ：${theme || '未入力'}
研究背景・動機：${background || '未入力'}
研究目的：${purpose || '未入力'}
対象疾患・領域：${disease || '未入力'}
研究対象者：${subjects || '未入力'}
研究対象施設・部署：${setting || '未入力'}

`;
  }

  if (includeDesign) {
    prompt += `【研究デザイン・種別】
研究デザイン：${design || '未選択'}
研究種別（システム判定）：${type}
介入の有無：${intervention === 'yes' ? 'あり' : intervention === 'no' ? 'なし' : '未選択'}
侵襲の程度：${invasiveness === 'none' ? 'なし' : invasiveness === 'minor' ? '軽微' : invasiveness === 'major' ? 'あり' : '未選択'}

`;
  }

  if (includeSamplesize && sampleSizeSummary) {
    prompt += `【症例数計算結果】
${sampleSizeSummary}
`;
  }

  if (includeSAP && window._sapDraft) {
    prompt += `【統計解析計画（Step 4 入力内容）】
${window._sapDraft}
`;
  }

  if (extraInst) {
    prompt += `【追加の指示・要望】
${extraInst}

`;
  }

  prompt += `
出力はMarkdown形式で、見出し・表・箇条書きを活用して読みやすく作成してください。
倫理的配慮は静岡がんセンターの倫理審査委員会（IRB）を想定して記載してください。
`;

  return prompt;
}

async function runAI() {
  const theme = getVal('theme');
  if (!theme) {
    alert('研究テーマ（ステップ1）を入力してください。');
    return;
  }

  const btn     = document.getElementById('brushup-btn') || document.querySelector('#panel-8 .btn-warn');
  const loading = document.getElementById('ai-loading');
  const result  = document.getElementById('ai-result');
  const aibtns  = document.getElementById('ai-btns');

  if (!loading || !result || !aibtns) return;

  if (btn) btn.disabled = true;
  loading.style.display = 'flex';
  result.style.display = 'none';
  aibtns.style.display = 'none';

  const prompt = buildAIPrompt();

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, topP: 0.9, maxOutputTokens: 8192 }
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'APIエラー ' + res.status);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('レスポンスが空です。');

    result.innerHTML = markdownToHtml(text);
    result.style.display = 'block';
    aibtns.style.display = 'flex';
  } catch (e) {
    result.innerHTML = `<div style="color:#f87171;">エラー: ${e.message}</div>`;
    result.style.display = 'block';
  } finally {
    if (btn) btn.disabled = false;
    loading.style.display = 'none';
  }
}

function copyAiPrompt() {
  const prompt = buildAIPrompt();
  navigator.clipboard.writeText(prompt).then(() => {
    alert('プロンプトをクリップボードにコピーしました。\nChatGPT・Claude等に貼り付けてご利用ください。');
  }).catch(() => {
    window.prompt('以下のプロンプトをコピーしてください:', prompt);
  });
}
