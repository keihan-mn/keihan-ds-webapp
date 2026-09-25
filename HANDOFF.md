# HANDOFF（引き継ぎ資料・正本）

最終更新: 2026-09-25（全12タスクの実装と最終レビューが完了。ブランチ feat/design-system-template は main へ未マージ）

## 1. 目的と概要

京阪工技社の**業務アプリ向けデザインシステム**を作る。このリポジトリ自体を「コピーして使う業務アプリのひな形」にする。

- 使う人: 社内の人が AI（Claude Code）と一緒に業務アプリ（管理画面・業務ツール）を作るとき
- 構成: 共通の土台（色・フォント・ロゴ・言葉づかい）＋ 使い方ルール。今回は **土台＋業務アプリ用ルール** のみ。社外ページ用は第2段
- 持ち主: 企画部（土台の変更は企画部だけが行う）

詳細は設計書（下記 2-②）を正とする。

## 2. 読むべき資料（優先順）

| 順 | 資料 | 役割 |
|---|---|---|
| ① | [docs/superpowers/plans/2026-09-25-keihan-design-system.md](docs/superpowers/plans/2026-09-25-keihan-design-system.md) | **実装計画**。全12タスク、コード・テスト・コマンドつき。これに沿って実装する |
| ② | [docs/superpowers/specs/2026-09-25-keihan-design-system-design.md](docs/superpowers/specs/2026-09-25-keihan-design-system-design.md) | **設計書**。決定事項の正本（色の値・画面・運用） |
| ③ | `/Users/kabushikikaishakeihankougishakikakubu/src/【smple】-workspace-ui-kit` | 参考にした見本リポジトリ。計画の Task 1・11 でファイルをコピーする。**書き換えない** |
| ④ | https://keihankogisha.co.jp/ | 会社 HP。ブランド色の出どころ（青 #0056A8・赤 #E60012・水色 #0A9EDB） |

設計の正本は「見た目」（上記②＝画面・トークン・UI ルール）のみ。「裏側」（DB・認証・同期）は範囲外で、必要になったら別の設計書を用意する。

## 3. 現在の状況

- 実装計画の **全12タスクが完了**。ブランチ `feat/design-system-template`（main から分岐、**未 push・未マージ**）
- 確認済み: `npm run test`（114件）・`lint`・`check:design`・`build`・`format:check` すべて成功。画面は PC 幅（1280px）とタブレット幅（768px）で目視確認し、Review Focus 1〜5 も実機で確認済み
- 最終レビュー（別エージェント）: Critical 0 / Important 1（ブラウザの「戻る」で未保存の変更が消える → **修正済み**）/ Minor 4（未対応。下の「5. 未決事項」）
- 計画からの変更点（判断の記録）:
  - shadcn 4.21 は部品の `cn` を `"cn"` パッケージから読み込む形で出力する → `@/lib/utils` に書き換え、`cn` パッケージは入れていない（CLAUDE.md に手順を追記済み）
  - Base UI の `Button` を `render={<Link/>}` でリンクにするときは `nativeButton={false}` が必要（計画に抜けていた。コードとスキル文書を修正済み）
  - テストの後片付け（`cleanup`）を `__tests__/setup.ts` に追加
  - 一覧表の顧客名列の最大幅を `max-w-48` に詰めた（1280px で金額列が切れていたため）
  - 768px ちょうどではサイドバーは開いたまま（引き出しになるのは 768px 未満）。ページ全体ははみ出さないため、そのままにしている
  - `docs/superpowers/` と `HANDOFF.md` は Prettier の整形対象外にした（記録文書を書かれたまま残すため）

## 4. 確定事項（要点。詳細は設計書）

- 技術: Next.js 16 / React 19 / TypeScript strict / Tailwind CSS v4 / shadcn/ui（base-nova＝`@base-ui/react`）/ lucide-react / zod / Vitest。デプロイ先は Vercel
- `any`・非null断定（`!`）禁止（ESLint で error）。`as` は避ける（テストのモックは例外）
- Tailwind の設定は CSS で行う。`tailwind.config.*` を作らない（値は `app/globals.css` の `:root`、クラス対応は `@theme inline`）
- 新しい部品は shadcn/ui から `npx shadcn@latest add` で追加
- 色: primary `#0056A8` / 背景はクールグレー `#F4F6F9` ＋白カード / 赤 `#E60012` は**削除・エラー専用** / 状態色 受付＝info(#0A9EDB)・作業中＝primary・完了＝success・遅延＝warning
- 角丸 6px（`--radius: 0.375rem`）、フォント Inter＋Noto Sans JP、ライトモードのみ
- 画面: ダッシュボード・一覧（検索/絞込）・詳細＋編集フォーム（**保存ボタン方式**・未保存離脱の確認）・部品カタログ。見本データは架空の受注案件12件
- 端末: PC 優先、タブレット（768px）で崩れない
- AI ガード: CLAUDE.md ＋ 自社スキル `designing-keihan-ui` ＋ `npm run check:design`（色直書き・任意角丸の検出）

## 5. 未決事項

- **正式ロゴ（SVG）**: ユーザーが「正式データがある」と回答済みだが未受領。受領まで社名テキストで表示（計画 Task 6 の `lib/brand.ts` の `logoSrc: null`）。受領したら `public/brand/logo.svg` に置いて `logoSrc` を設定
- 余白・行間の詰め具合、成功・注意色の最終値（部品カタログで実物を見てユーザーと調整）
- 社外ページ用ルール（第2段）
- 最終レビューで見つかった細かい改善（未対応。直すかどうかはユーザー判断）:
  - アプリにない URL（`/nope` 等）の 404 画面が Next.js 標準の英語表示（`app/not-found.tsx` を足すと直る）
  - 768px 未満でメニューを押しても引き出しが閉じない（`AppSidebar` で `setOpenMobile(false)` を呼ぶ）
  - 桁が極端に大きい金額のエラー文言が分かりにくい（`lib/schema.ts` の金額に上限を足す）
  - 空白のない長い英数字の案件名で詳細の見出しがはみ出すおそれ（`PageHeader` の h1 に `break-words`）

## 6. 次の一歩

1. ユーザーにブランチの扱い（main へのマージ、push・PR 作成、またはそのまま保留）を確認する
2. 上の「細かい改善」4件を直すかユーザーに確認する
3. 部品カタログ（`/catalog`）を実物で見ながら、余白・成功色・注意色をユーザーと調整する
4. 正式ロゴを受け取ったら `public/brand/README.md` の手順で差し替える

## 7. 進捗

| Task | 内容 | 状態 |
|---|---|---|
| 1 | 土台（Next.js・テスト基盤・ESLint） | 完了 |
| 2 | デザイントークン・フォント・コントラストテスト | 完了 |
| 3 | shadcn 部品導入・状態色 variant | 完了 |
| 4 | check:design（逸脱検出） | 完了 |
| 5 | 受注データ層（型・見本データ・検索・集計・フォーム変換） | 完了 |
| 6 | アプリの枠（ロゴ・サイドバー・OrdersProvider） | 完了 |
| 7 | 一覧画面 | 完了 |
| 8 | 詳細＋編集フォーム・離脱確認 | 完了 |
| 9 | ダッシュボード | 完了 |
| 10 | 部品カタログ | 完了 |
| 11 | CLAUDE.md・自社スキル・README | 完了 |
| 12 | 最終確認（PC/タブレット幅・Review Focus） | 完了 |

## 8. 注意点

- **ユーザーのルール**: 回答は日本語、専門用語はかみくだいて説明する。ファイル・データの削除や既存ファイルの上書きは、明示の指示なしに行わない（計画に書かれた置換は承認済みとして扱ってよいが、計画外の上書きはしない）
- **Task 11 で CLAUDE.md を全置換するとき**、先頭の「引き継ぎ」節が残ることを確認する（計画のひな形には含めてある）
- 見本リポジトリのパスに `【】` が含まれる。シェルでは必ず引用符で囲む
- ネット接続が必要: `npm install`、`npx shadcn@latest add`、`next build`（Google Fonts の取得）
- Next.js 16 は学習データと差がある。書く前に `node_modules/next/dist/docs/` を読む（特に動的ルートの `params` は Promise）
- base（Base UI）では `asChild` ではなく `render` を使う
- 計画内に「環境で API が違ったら」の注意書きがある箇所（Task 8 の `params`、Task 10 の `CardTitle render`、Task 10 の lint 警告）は、計画の指示どおりに対処する
- `npx shadcn@latest add` で上書き確認が出たら No。`--overwrite` は使わない
- 開発サーバーのポート 3000 は、このマシンでは別のプロジェクトが使っていることがある。そのときは `npx next dev -p 3100` で起動する
- 実装中の作業メモ（判断の記録）は `.superpowers/sdd/2026-09-25-keihan-design-system/progress.md` にある（git 管理外）
