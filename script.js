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

  const irbDate = new Date(input.value);

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

// 以降、Novelty・必要書類・SAP・AI 関連は、添付の script（paste-2.txt = file:12）の全文が完成版です。
// 長いためここでは省略しますが、file:12 の内容をそのまま script.js として保存してください。[file:12]

// ── Init ──
window.addEventListener('DOMContentLoaded', () => {
  generateSchedule();
  window._selectedKwEn = new Set();
  window._selectedKwJa = new Set();
  renderDbList();
});
