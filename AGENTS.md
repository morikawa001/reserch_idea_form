# AGENTS.md - 開発エージェント向けプロジェクトガイド

静岡県立静岡がんセンター 臨床研究支援センター向けの「研究アイデア支援システム」Webアプリ。**静的HTML/CSS/JS群**（フレームワーク・ビルドツール・テスト基盤なし）。変更前に必ずこのファイルを読むこと。

## 1. プロジェクト概要

- 研究アイデア入力 → 研究種別判定 → 症例数計算 → 統計解析計画（SAP）→ それらの必須書類（様式5/8/8-2）作成を支援する単一ページ＋帳票ページ群。
- **静的なHTMLのみ**。バックエンドなし。localStorage のみで状態を保持。

### ファイル構成

| ファイル | 役割 |
|---|---|
| `login.html` | ログイン（レポート表紙風）。未ログイン時は全ページからここへリダイレクト |
| `login.js` | 簡易ログイン管理（`window.ResearchAuth`）。localStorageキー `researchIdeaLogin` |
| `index.html` | メイン8ステップ画面（基本情報→種別判定→症例数→SAP→新規性→書類→スケジュール→ブラッシュアップ）。`style.css` + `app.js` + `login.js` を読込 |
| `app.js` | index.html 専用の全ロジック（ステップ移動・計算・SAP・AIブラッシュアップ・localStorage） |
| `style.css` | **index.html 専用**の紙風デザイン（トークン・header・step・card・AIパネル等） |
| `study-plan-outline.html` | 様式5 研究計画概略書（自前インラインCSS/JS・紙面プレビュー） |
| `clinical-study-application.html` | 様式8 臨床研究申請書（同上） |
| `study-application-exploratory.html` | 様式8-2 探索研究IRB用（同上・多ページ構成） |
| `schedule-gantt-generator.html` | CSV＋ガントチャート生成ツール（Plotly CDN・ライト/ダークテーマ） |

## 2. ビルド / Lint / テスト

**ビルド・Lint・自動テスト基盤は存在しない。** 検証は以下を手動実行する：

### 検証手順（変更後）

1. **JS構文チェック**（変更したJSファイルごと）:
   ```bash
   node --check login.js
   node --check app.js
   ```
2. **HTML内インラインJSの構文チェック**:
   ```bash
   node -e "const fs=require('fs'); const s=fs.readFileSync('index.html','utf8'); for (const m of s.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)){ new Function(m[1]); } console.log('OK');"
   ```
   ※ `login.html` `index.html` `study-plan-outline.html` `clinical-study-application.html` `study-application-exploratory.html` `schedule-gantt-generator.html` の6ファイルに適用（src指定の外付けJSは除く）。
3. **ページ番号・文言の一貫性確認**: 各HTMLの見出し・ボタン・ステップが `index.html` の `app.js` 内 `goToStep(n)` と一致しているか目視確認。
4. **ブラウザ確認**: `python -m http.server 8000` 等で起動し、login → index → 各様式 → ガントの遷移・印刷プレビュー・テーマ切替を確認（コンソールエラーなし）。

## 3. コード規約

- **Vanilla JSのみ**。外部CDNは Plotly（schedule-gantt-generator.html）のみ。
- **日本語コメント・日本語UI**。語の表記揺れに注意（例:「ブラッシュアップ」に統一。旧表記「AIブラッシュアップ」は廃止）。
- ページはそれぞれが**自前のインラインCSS/JS**を持つ。`style.css` は主に index.html 用（後述）。
- `app.js` は分録関数群（グローバル関数）。モジュール化は `login.js`（IIFE + `window.ResearchAuth`）。
- 命名: 関数/変数 camelCase、定数 SCREAMING_SNAKE_CASE、CSSクラス kebab-case。
- 出力は `innerHTML` へ直接文字列連結せず、`escapeHtml`/`h()` 等でHTMLエスケープしてから流す（XSS対策）。

## 4. ログイン仕様（重要・新規ページ追加時の必須手順）

`login.js` が `window.ResearchAuth` を公開：
- `getLogin()` / `saveLogin(obj)` / `logout()` / `requireLogin()` / `renderUserChip()` / `isLoggedIn()`
- localStorageキー: `researchIdeaLogin`（値 `{user, affiliation, loggedAt}`）

### 新規ページを追加するとき

1. `<head>` 元に `<script src="login.js"></script>` + `<script>ResearchAuth.requireLogin();</script>` を入れる（未ログイン時 `login.html` へ遷移）。
2. ヘッダー/トップバーにログアウトリンク `<a href="#" onclick="ResearchAuth.logout();return false;">ログアウト</a>` を置く。
3. 利用者名チップ `<span id="paperUser"></span>` を置く（`renderUserChip()` が自動で氏名を反映）。
   - index.html はクラス `.user-chip`、様式5/8/8-2・ガントは `.paper-user` のスタイルを用意済み。

## 5. デザイン（レポート用紙風）トークン

### style.css（index.html用）の共通トークン

| 変数 | 値 | 用途 |
|---|---|---|
| `--bg` | `#efece3` | 頁背景（罫線入り） |
| `--card` | `#fdfcf8` | カード・パネル面 |
| `--border` | `#d8d0c0` | 罫線 |
| `--primary` | `#1e3a5f` | 主要インク色 |
| `--accent` | `#a33d2a` | アクセント |
| `--radius` | `4px` | 角丸（控えめ） |

- body に横罫線（`repeating-linear-gradient`）、`Yu Mincho`系フォント。
- header は上に2px線＋下に3px二重線、公開チップ＋ログアウトを右寄せ。
- `.ai-panel` は既存インラインの暗色指定を、紙風へCSS上書き（`.ai-panel *` で `color`/`border-color` を `var(--text)`/`var(--border)` に統一）。

### 様式・ガント各ページ

- 様式5/8/8-2: 各ページで自分の `:root` トークン（`--blue:#1a5c96` 等）を持ち、`.topbar`・`.panel` を茶系ボーダー＋紙白で統一済み。
- `.topbar .primary` = 塗りボタン、`.topbar .secondary` = 白地ボタン、`.paper-user` = 利用者チップ。
- schedule-gantt-generator.html: `[data-theme="light"|"dark"]` のCSS変数テーマ。ライトは紙風色（`--color-bg:#efece3` / `--color-surface:#fdfcf8` / `--color-primary:#1f3a5c`）。

## 6. 修正済み要点（このプロジェクトの既知ルール）

- **「AIブラッシュアップ」表記は廃止 →「ブラッシュアップ」に統一**。STEP 8 のラベル・見出し・説明文すべてその形。
- **STEP 8 のボタン（`runAI` 実行・`goToStep(8)` 遷移・`goToAIWithSAP()`）はすべて削除済み**。`goToAIWithSAP()` 関数も削除済み。`runAI()` 自体は残存（STEP 8のコピー/出力ボタンからは呼ばれない）。
- **ログインfooterの部署名は「静岡県立静岡がんセンター　臨床研究支援センター」**（全角スペース）。旧表記「臨床研究推進部」は廃止。

## 7. localStorageキー一覧

| キー | 内容 |
|---|---|
| `researchIdeaLogin` | ログイン情報（login.js） |
| `researchIdeaFormData` | index.html の共通入力データ |
| `form5DraftData` | 様式5 (study-plan-outline) の下書き |
| `form8DraftData` | 様式8 (clinical-study-application) の下書き |

- study-application-exploratory.html は localStorage を保持しない（都度生成）。
- こちらは様式ページが `index.html` からデータ参照しやすいよう `researchIdeaFormData` を読み、`form5DraftData`/`form8DraftData` は各様式が自分の draft を持つ構造。

## 7. Git運用

- リモート: `origin`（`https://github.com/morikawa001/reserch_idea_form.git`）のみ。ブランチは `main`。
- Push: `git push origin main`
- ※別プロジェクト（kanri-flow-web-app）の2リモート構成とは完全不同。

## 8. 参考リンク

- デプロイ先（index.html が様式ページを開くURL）: `https://morikawa001.github.io/reserch_idea_form/study-plan-outline.html`（app.js 内の `openForm5WithData` 等が開く）。