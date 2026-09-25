# 京阪工技社 業務アプリひな形

## 引き継ぎ

- 作業を始める前に、引き継ぎ資料の正本 [HANDOFF.md](HANDOFF.md) を読む
- 引き継ぎ資料の正本は `HANDOFF.md` の1枚だけ。別の場所に引き継ぎメモを作らない
- 引き継ぎ資料の作成・更新は `creating-handoffs` スキルに従う

## 概要

京阪工技社デザインシステム（土台＋業務アプリ用ルール）に沿った Next.js 16 × shadcn/ui のひな形。
新しい業務アプリはこのリポジトリをコピーして始める。設計の正本は
[docs/superpowers/specs/2026-09-25-keihan-design-system-design.md](docs/superpowers/specs/2026-09-25-keihan-design-system-design.md)。

## 技術スタック

- Next.js 16（App Router）/ React 19 / TypeScript（strict）/ Tailwind CSS v4 / shadcn/ui
- shadcn/ui は **base-nova レジストリ**（`@base-ui/react` ベース）。`components.json` で設定済み
- アイコンは **lucide-react のみ**。他のアイコンライブラリを追加しない
- Tailwind CSS は **v4**。テーマ・カラーは `tailwind.config.js` ではなく CSS で定義する（`tailwind.config.*` を作らない）
  - 値: `app/globals.css` の `:root`（例 `--primary: #0056A8;`）
  - Tailwind クラスとの対応: 同ファイルの `@theme inline`（例 `--color-primary: var(--primary);` → `bg-primary` が使える）
  - トークンを足すときは両方に1行ずつ追加する（企画部の承認が必要）
- 外から入る値（JSON データ・フォーム入力・API の入出力）は **zod** で検証する（手本: `lib/schema.ts` `lib/data.ts` `lib/order-form.ts`）
- デプロイ先は **Vercel**。`next build` の標準構成を崩さない（独自サーバー・`output: "export"` にしない）

## TypeScript

- `any` と非null断定（`!`）は使わない（ESLint で error になる）
- `as` による型の決めつけは避け、型ガード・`satisfies`・zod の検証結果で型を得る

## 正本（SSoT）

- 色・角丸・フォント: `app/globals.css`（**企画部のみ変更可**。各アプリで値を変えない）
- 部品: `components/ui/`（shadcn。独自 variant あり）と `app/(app)/catalog/page.tsx`（部品カタログ）
- 状態の色: `lib/status.ts`

## 同梱スキル

| スキル                      | いつ使うか                                                  |
| --------------------------- | ----------------------------------------------------------- |
| designing-keihan-ui         | UI の追加・変更・色・余白・レイアウト・フォーム作業のすべて |
| shadcn                      | shadcn 部品の追加・カスタマイズ                             |
| next-best-practices         | Next.js 16 のファイル規約・RSC 境界                         |
| vercel-react-best-practices | React の性能最適化                                          |

MUST: Next.js のコードを書く前に `node_modules/next/dist/docs/` の該当ドキュメントを読む。学習データではなくバンドル版が正。

## 編集の方針

IMPORTANT:

- **UI を変更する前に `/designing-keihan-ui` スキルを起動する**
- 土台（色・角丸・フォント）に足りないものがあっても**独断で `globals.css` を変えない**。ユーザーに確認し、企画部への要望として扱う
- 編集は**基本はフォーム＋「保存」ボタン方式**。金額・数量・納期など大事な値は必ずこの方式にする。1つの操作で完結しすぐ戻せるもの（チェック・並び順・表示設定・メモ）に限り自動保存も可（保存中／保存済み・失敗を表示する）。迷ったら保存ボタン方式
- 赤（`destructive`）は**削除・エラー専用**。状態表示や強調に使わない
- **新しい UI 部品は shadcn/ui から追加する**（`npx shadcn@latest add <部品名>`）。自作の部品や他の UI ライブラリで代替しない。shadcn に無い部品が必要なら、作る前にユーザーに確認する
- shadcn 部品の更新は `npx shadcn@latest add ... --diff` で確認。`--overwrite` は本人の明示許可なしに使わない
- `npx shadcn@latest add` で追加した部品が `import { cn } from "cn"` になっていたら `import { cn } from "@/lib/utils"` に直す（このひな形は `lib/utils.ts` の `cn` に統一している）

## コード生成ルール（詳細は designing-keihan-ui スキル）

- 色は役割名トークン（`bg-primary` 等）。`bg-blue-500`・`text-white`・`bg-[#...]`・`"#xxxxxx"` は禁止
- 角丸は `rounded-sm|md|lg|xl`。`rounded-[..]` は禁止
- 子要素の間隔は親で管理（`flex flex-col gap-*`）。`space-y-*` は禁止
- 部品の見た目を呼び出し側の `className` で打ち消さない。部品側に variant を追加する
- 正方形は `size-N`
- base（Base UI）を使用。`asChild` ではなく `render`。`Button` をリンクにするときは `nativeButton={false}` も付ける
- shadcn 部品があるなら自前の div で代替しない
- 表の数値は右寄せ＋`tabular-nums`
- 派生 state を Effect で複製しない（レンダー中に計算する）

## コマンド

```bash
npm run dev           # 開発サーバー
npm run build         # 本番ビルド
npm run lint          # ESLint
npm run test          # テスト（コントラスト検証を含む）
npm run check:design  # 色の直書き・任意角丸の検出
npm run format        # Prettier
```

UI を変更したら `npm run test && npm run check:design` を必ず通す。

## やらないこと

- DB 接続・認証（データは `data/orders.json` をメモリで保持。再読み込みで元に戻る）
- ダークモード
- 社外向けページ（LP 等）— 別ルールを第2段で整備予定
