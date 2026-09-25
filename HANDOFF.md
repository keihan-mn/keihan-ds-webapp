# HANDOFF（引き継ぎ資料・正本）

最終更新: 2026-09-25（実装フェーズ進行中。ブランチ feat/design-system-template）

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

- 設計（グリル）と実装計画の作成が完了。**実装は未着手**
- リポジトリにあるのは `README.md`（初期の2行）・`CLAUDE.md`（引き継ぎ節のみ）・`HANDOFF.md`・`docs/`（設計書・計画）だけ
- 上記の docs・CLAUDE.md・HANDOFF.md は**未コミット**の可能性がある。`git status` で確認すること
- 実行方式はユーザーが「新しいエージェントで実装する」と決定。方式の推奨は **superpowers:executing-plans（ネイティブ：1エージェントが順に実装し、最後にレビュー）**。タスクが一本道で依存し合い、計画にコードがほぼ全部あるため

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

## 6. 次の一歩

1. `git status` を確認。docs などが未コミットなら、ユーザーに確認してからコミットする
2. `main` 上なので、作業用ブランチ（例 `feat/design-system-template`）を作る
3. `superpowers:executing-plans` スキルで計画の **Task 1** から順に実装する。各タスク末尾でコミット
4. タスク完了ごとに下の「7. 進捗」を更新する

## 7. 進捗

| Task | 内容 | 状態 |
|---|---|---|
| 1 | 土台（Next.js・テスト基盤・ESLint） | 完了 |
| 2 | デザイントークン・フォント・コントラストテスト | 完了 |
| 3 | shadcn 部品導入・状態色 variant | 完了 |
| 4 | check:design（逸脱検出） | 未着手 |
| 5 | 受注データ層（型・見本データ・検索・集計・フォーム変換） | 未着手 |
| 6 | アプリの枠（ロゴ・サイドバー・OrdersProvider） | 未着手 |
| 7 | 一覧画面 | 未着手 |
| 8 | 詳細＋編集フォーム・離脱確認 | 未着手 |
| 9 | ダッシュボード | 未着手 |
| 10 | 部品カタログ | 未着手 |
| 11 | CLAUDE.md・自社スキル・README | 未着手 |
| 12 | 最終確認（PC/タブレット幅・Review Focus） | 未着手 |

## 8. 注意点

- **ユーザーのルール**: 回答は日本語、専門用語はかみくだいて説明する。ファイル・データの削除や既存ファイルの上書きは、明示の指示なしに行わない（計画に書かれた置換は承認済みとして扱ってよいが、計画外の上書きはしない）
- **Task 11 で CLAUDE.md を全置換するとき**、先頭の「引き継ぎ」節が残ることを確認する（計画のひな形には含めてある）
- 見本リポジトリのパスに `【】` が含まれる。シェルでは必ず引用符で囲む
- ネット接続が必要: `npm install`、`npx shadcn@latest add`、`next build`（Google Fonts の取得）
- Next.js 16 は学習データと差がある。書く前に `node_modules/next/dist/docs/` を読む（特に動的ルートの `params` は Promise）
- base（Base UI）では `asChild` ではなく `render` を使う
- 計画内に「環境で API が違ったら」の注意書きがある箇所（Task 8 の `params`、Task 10 の `CardTitle render`、Task 10 の lint 警告）は、計画の指示どおりに対処する
- `npx shadcn@latest add` で上書き確認が出たら No。`--overwrite` は使わない
