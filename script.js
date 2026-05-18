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

// ── 各ステップへのショートカット関数（HTMLのonclick属性対応）──
function goToStep1() { goToStep(1); }
function goToStep2() { goToStep(2); }
function goToStep3() { goToStep(3); }
function goToStep4() { goToStep(4); }
function goToStep5() { goToStep(5); }
function goToStep6() { goToStep(6); }
function goToStep7() { goToStep(7); }
function goToStep8() { goToStep(8); }

// ── Get form values ──
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function getRadio(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
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

// ── Schedule（IRB開催日を基準に前後を表示）──
function generateSchedule() {
  const input = document.getElementById('start-date');
  const container = document.getElementById('schedule-area');
  if (!container) return;

  if (!input || !input.value) {
    container.innerHTML = '<div class="info-box">まず「倫理審査委員会 開催予定日」を入力してください。</div>';
    return;
  }

  // IRB開催日
  const irbDate = new Date(input.value);

  // 日付ヘルパー
  function addDays(d, days) {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
  }

  function addMonths(d, months) {
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + months);
    return nd;
  }

  function fmt(d) {
    const y = d.getFullYear();
    const m = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${y}-${m}-${day}`;
  }

  // 1) IRB 前
  const rpDeadline    = addMonths(irbDate, -2);
  const docsDeadline  = addDays(irbDate, -7 * 7);
  const preCheckDone  = addDays(irbDate, -5 * 7);
  const preReviewDone = addDays(irbDate, -3 * 7);

  const beforeMilestones = [
    {
      title: '研究計画書提出期限',
      desc: '委員会開催日の 2 か月前までに、研究計画書案を作成し、事務局へ提出。',
      date: rpDeadline
    },
    {
      title: '新規申請書類提出期限（様式5等）',
      desc: '委員会開催日の 7 週間前までに、様式5を含む新規申請書類一式を提出。',
      date: docsDeadline
    },
    {
      title: '事前確認完了目標',
      desc: '委員会開催日の 5 週間前までに、事務局による形式・内容の事前確認を完了。',
      date: preCheckDone
    },
    {
      title: '予備審査（委員事前レビュー）完了目標',
      desc: '委員会開催日の 3 週間前までに、主担当委員による予備審査を完了。',
      date: preReviewDone
    },
    {
      title: '倫理審査委員会 本審査',
      desc: 'IRB開催日。研究計画が審査され、承認後に研究開始が可能。',
      date: irbDate
    }
  ];

  // 2) IRB 後（旧Week0〜10から構成）
  const afterMilestones = [
    {
      week: 'Week 0',
      offset: 0,
      title: '倫理審査委員会 本審査',
      desc: 'IRBにて研究計画の審査。条件付き承認の場合は条件対応が必要。'
    },
    {
      week: 'Week 2',
      offset: 14,
      title: 'IRB結果通知・条件対応',
      desc: '承認・条件付き承認の通知を受け、必要な条件対応・文書修正を実施。'
    },
    {
      week: 'Week 4',
      offset: 28,
      title: '研究開始準備',
      desc: '同意説明文書・同意書の印刷、CRF/電子データシートの準備、スタッフ説明会の実施。'
    },
    {
      week: 'Week 6',
      offset: 42,
      title: '研究開始（登録開始）',
      desc: '対象者リクルート開始、同意取得、データ収集開始。モニタリング・データ管理体制を稼働。'
    }
  ];

  const beforeHtml = `
    <h3>① 倫理審査委員会【前】のスケジュール</h3>
    <div class="timeline">
      ${beforeMilestones
        .sort((a, b) => a.date - b.date)
        .map((m) => {
          const isIRB = (m.date.getTime() === irbDate.getTime());
          return `
          <div class="tl-item ${isIRB ? 'milestone' : ''}">
            <div class="tl-week">${fmt(m.date)}</div>
            <div class="tl-title">${m.title}</div>
            <div class="tl-desc">${m.desc}</div>
          </div>`;
        })
        .join('')}
    </div>
  `;

  const afterHtml = `
    <h3 style="margin-top:18px;">② 倫理審査委員会【後】のスケジュール（目安）</h3>
    <div class="timeline">
      ${afterMilestones
        .map((m, i, arr) => {
          const d = addDays(irbDate, m.offset);
          const isLast = i === arr.length - 1;
          return `
          <div class="tl-item ${isLast ? 'milestone' : ''}">
            <div class="tl-week">${m.week}　目安日：${fmt(d)}</div>
            <div class="tl-title">${m.title}</div>
            <div class="tl-desc">${m.desc}</div>
          </div>`;
        })
        .join('')}
    </div>
  `;

  container.innerHTML = `
    ${beforeHtml}
    ${afterHtml}
    <div class="info-box" style="margin-top:10px;font-size:0.8rem;">
      ※ 日付はあくまで目安です。実際の委員会開催日程・事務局スケジュールに合わせて調整してください。
    </div>
  `;
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
      label: '英語',
      name: 'PubMed / MEDLINE',
      desc: '臨床医学全般（英語論文）',
      baseUrl: 'https://pubmed.ncbi.nlm.nih.gov/',
      formula: () => {
        const arr = Array.from(window._selectedKwEn);
        if (!arr.length) return null;
        return arr.map(k => `"${k}"[Title/Abstract]`).join(' AND ');
      }
    },
    {
      id: 'jamas',
      label: '日本語',
      name: '医中誌Web',
      desc: '日本語の医学論文・看護研究',
      baseUrl: 'https://search.jamas.or.jp/',
      formula: () => {
        const arr = Array.from(window._selectedKwJa);
        if (!arr.length) return null;
        return arr.join(' AND ');
      }
    },
    {
      id: 'cochrane',
      label: 'SR',
      name: 'Cochrane Library',
      desc: 'システマティックレビュー・RCT',
      baseUrl: 'https://www.cochranelibrary.com/',
      formula: () => {
        const arr = Array.from(window._selectedKwEn);
        if (!arr.length) return null;
        return arr.join(' AND ');
      }
    },
    {
      id: 'jrct',
      label: '登録',
      name: 'jRCT',
      desc: '特定臨床研究・治験の登録情報',
      baseUrl: 'https://jrct.mhlw.go.jp/search',
      formula: () => {
        const arr = [...Array.from(window._selectedKwJa), ...Array.from(window._selectedKwEn)];
        if (!arr.length) return null;
        return arr.join(' ');
      }
    },
    {
      id: 'semantic',
      label: 'AI',
      name: 'Semantic Scholar',
      desc: 'AIを活用した論文検索',
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
    const formulaHtml = formula ? `
      <div style="margin-top:4px;font-size:0.75rem;font-family:monospace;background:#f0f4ff;padding:3px 7px;border-radius:4px;color:var(--primary);word-break:break-all;">
        ${formula.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>` : '';

    return `
      <div class="db-item" id="db-${db.id}">
        <span class="db-label">${db.label}</span>
        <div style="flex:1;min-width:0;">
          <a class="db-link" href="${db.baseUrl}" target="_blank" rel="noopener noreferrer">${db.name}</a>
          <div class="db-desc">${db.desc}</div>
          ${formulaHtml}
        </div>
        <button class="db-search-btn ${btnActive ? '' : 'disabled'}"
          ${btnActive ? `onclick="openDbSearch('${db.id}', event)"` : 'disabled'}
          title="${hasAny ? '選択中のキーワードで検索' : '先にキーワードを選択してください'}">
          🔍 この条件で検索
        </button>
      </div>
    `;
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
      navigator.clipboard.writeText(kwText)
        .then(() => alert('jRCT用キーワードをクリップボードにコピーしました：\n' + kwText))
        .catch(() => window.prompt('以下のキーワードをコピーしてください', kwText));
    }
  }

  window.open(url, '_blank');
}

// ここから下は SAP, AI 関連…（元の script.js からそのまま）
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
}

// …（SAP の詳細関数・AI関数群は、もとのファイルから変更なしで続きます）…

// ── Init ──
window.addEventListener('DOMContentLoaded', () => {
  generateSchedule();
  window._selectedKwEn = new Set();
  window._selectedKwJa = new Set();
  renderDbList();
});
