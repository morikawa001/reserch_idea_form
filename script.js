// Schedule
function generateSchedule() {
  const input = document.getElementById('start-date');
  const container = document.getElementById('schedule-area');
  if (!container) return;

  let form5Date = null; // 新規様式5提出予定日（入力値）
  if (input && input.value) {
    form5Date = new Date(input.value);
  } else {
    container.innerHTML = '<div class="info-box">まず「新規様式５提出予定日」を入力してください。</div>';
    return;
  }

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

  // IRB スケジュールの計算ロジック
  // ・様式5提出日：form5Date
  // ・委員会開催日：様式5提出日の 7 週間後（49日後）
  // ・研究計画書提出期限：委員会開催日の 2 ヶ月前
  // ・新規申請書類提出期限：委員会開催日の 7 週間前（= form5Date）
  // ・事前確認完了目標：委員会開催日の 5 週間前（35日）
  // ・予備審査完了目標：委員会開催日の 3 週間前（21日）

  const irbDate = addDays(form5Date, 7 * 7);              // 49 日後
  const rpDeadline = addMonths(irbDate, -2);              // 2 ヶ月前
  const docsDeadline = form5Date;                         // 7週間前 = 様式5
  const preCheckDone = addDays(irbDate, -5 * 7);          // 5 週間前
  const preReviewDone = addDays(irbDate, -3 * 7);         // 3 週間前

  // 画面表示用リスト
  const milestones = [
    {
      title: '研究計画書提出期限',
      desc: '委員会開催日の 2 か月前まで。研究計画書ドラフトを完成させ、事務局へ提出。',
      date: rpDeadline
    },
    {
      title: '新規申請書類提出期限（様式5等）',
      desc: '委員会開催日の 7 週間前まで。新規申請書類一式（様式5 を含む）を提出。',
      date: docsDeadline
    },
    {
      title: '事前確認完了目標',
      desc: '委員会開催日の 5 週間前までに、事務局による形式的・内容的な事前確認を完了。',
      date: preCheckDone
    },
    {
      title: '予備審査（委員事前レビュー）完了目標',
      desc: '委員会開催日の 3 週間前までに、予備審査（主担当委員レビュー）を完了。',
      date: preReviewDone
    },
    {
      title: '倫理審査委員会 開催予定日',
      desc: '本審査。委員会の開催日。承認取得後に研究開始可能。',
      date: irbDate
    }
  ];

  container.innerHTML = `
    <div class="timeline">
      ${milestones
        .sort((a, b) => a.date - b.date)
        .map((m, i, arr) => {
          const isLast = i === arr.length - 1;
          return `
          <div class="tl-item ${isLast ? 'milestone' : ''}">
            <div class="tl-week">${fmt(m.date)}</div>
            <div class="tl-title">${m.title}</div>
            <div class="tl-desc">${m.desc}</div>
          </div>`;
        })
        .join('')}
    </div>
    <div class="info-box" style="margin-top:10px;font-size:0.8rem;">
      ※ 委員会の実際の開催日は施設の正式な開催日程に従って調整してください。
    </div>
  `;
}
