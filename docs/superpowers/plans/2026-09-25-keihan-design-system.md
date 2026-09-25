# 京阪工技社 デザインシステム（土台＋業務アプリ用ひな形）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** このリポジトリを、京阪工技社のブランド（青 `#0056A8`）を反映した「コピーして使う業務アプリのひな形」にする。デザイントークン・shadcn 部品・汎用画面3種・部品カタログ・AI 用ルールを含める。

**Architecture:** 見本 `~/src/【smple】-workspace-ui-kit` と同じ Next.js 16 App Router 構成。色・角丸・フォントは `app/globals.css` の CSS 変数に一元化し、shadcn 部品はそれを参照する。見本データ（受注案件）は JSON から読み込み、`OrdersProvider`（React Context）でメモリ上に保持する。ルール逸脱は自動テスト（コントラスト）と `check:design` スクリプト（色の直書き・角丸）で機械的に検出する。

**Tech Stack:** Next.js 16 / React 19 / TypeScript strict / Tailwind CSS v4 / shadcn/ui（base-nova = `@base-ui/react`）/ lucide-react / zod 4 / recharts（shadcn chart 経由）/ sonner / Vitest + Testing Library。デプロイ先は Vercel

**Spec:** `docs/superpowers/specs/2026-09-25-keihan-design-system-design.md`

**見本リポジトリのパス（以下 `$SAMPLE`）:** `/Users/kabushikikaishakeihankougishakikakubu/src/【smple】-workspace-ui-kit`

## Global Constraints

- ライトモードのみ。`.dark { ... }` の色定義を書かない（`@custom-variant dark` 行は shadcn 部品が参照するので残す）
- 色は必ず役割名トークン（`bg-primary` 等）で指定する。`bg-blue-500`・`text-white`・`bg-[#xxxxxx]`・`"#xxxxxx"` 文字列を `app/` と `components/`（`components/ui/` を除く）に書かない
- ブランド値: primary `#0056A8` / destructive `#E60012` / info `#0A9EDB` / `--radius: 0.375rem`
- 赤（destructive）は削除・エラー専用。状態表示に使わない
- 状態と色の対応: 受付＝info、作業中＝default（primary）、完了＝success、遅延＝warning
- フォント: Inter（英数字）→ Noto Sans JP（日本語）の順。表の数値は `tabular-nums`
- 本文テキストのコントラスト 4.5:1 以上、入力欄の枠 3:1 以上
- base（Base UI）の API を使う。`asChild` は使わず `render` を使う
- 余白は親が管理する（`flex flex-col gap-*`）。`space-y-*` / `space-x-*` は使わない
- 正方形は `size-N`（`w-N h-N` にしない）
- 編集はフォーム＋「保存」ボタン方式。インライン自動保存にしない
- DB・認証は作らない（データは再読み込みで初期状態に戻る）
- 画面の文言・コメント・エラーメッセージは日本語
- `npx shadcn@latest add` で既存ファイルを `--overwrite` しない
- TypeScript は strict。`any`・非null断定（`!`）を使わない（ESLint で error）。型の決めつけ（`as`）は避け、型ガードや `satisfies` で表す。テストのモックだけは例外
- 新しい UI 部品は shadcn/ui（base-nova レジストリ）から `npx shadcn@latest add` で追加する。自作や他ライブラリの部品を持ち込まない
- アイコンは lucide-react のみ
- Tailwind CSS v4 の設定は CSS で行う。`tailwind.config.js` / `.ts` を作らない。色などの値は `app/globals.css` の `:root`、Tailwind クラスへの対応づけは同ファイルの `@theme inline` に書く
- 外から入る値（JSON データ・フォーム入力・将来の API の入出力）は zod で検証する
- デプロイ先は Vercel。Vercel 標準のビルド（`next build`）で動くこと。独自サーバーや `output: "export"` にしない

## Review Focus

1. **検索・絞り込みで0件** — 表が消えて真っ白にならず、「条件に一致する案件がありません」と「条件をクリア」ボタンが出ること（Task 7 のテストで固定）
2. **全角数字・カンマ付きの金額入力（例: `１２，０００`）** — エラーにせず 12000 として保存されること。空欄・負数・文字はエラー文言が出て保存されないこと（Task 5・Task 8 のテストで固定）
3. **未保存のまま画面内リンク・タブ閉じで離脱** — 確認が出てキャンセルできること。未変更なら確認が出ないこと（Task 8 のテストで固定）
4. **存在しない受注番号の URL（`/orders/ORD-9999-9999`）** — 404 画面になり、例外で落ちないこと（Task 8 の手順で固定、Task 12 で実機確認）
5. **タブレット幅（768px）で長い案件名・顧客名** — ページ全体が横にはみ出さず、表だけが横スクロールすること（Task 12 で実機確認）

---

## ファイル構成（完成形）

```
app/
  layout.tsx                ルート。フォント・TooltipProvider・Toaster
  globals.css               デザイントークン（唯一の正本）
  page.tsx                  / → /dashboard へリダイレクト
  (app)/layout.tsx          業務画面共通：OrdersProvider＋AppShell
  (app)/dashboard/page.tsx  ダッシュボード
  (app)/orders/page.tsx     一覧
  (app)/orders/[id]/page.tsx 詳細＋編集
  (app)/catalog/page.tsx    部品カタログ
components/
  ui/                       shadcn 部品（CLI で追加。独自 variant あり）
  brand/Logo.tsx            ロゴ（正式 SVG 未配置なら社名テキスト）
  layout/AppShell.tsx       サイドバー＋ヘッダー＋本文の枠
  layout/AppSidebar.tsx     サイドバー
  layout/PageHeader.tsx     各画面の見出し帯
  orders/OrdersProvider.tsx 受注データの保持（Context）
  orders/StatusBadge.tsx    状態バッジ
  orders/OrderTable.tsx     一覧表＋検索・絞り込み
  orders/OrdersView.tsx     一覧画面の中身
  orders/OrderEditForm.tsx  編集フォーム
  orders/OrderDetail.tsx    詳細画面の中身
  dashboard/StatCard.tsx    数字カード
  dashboard/StatusChart.tsx 状態別グラフ
  dashboard/DashboardView.tsx ダッシュボードの中身
  catalog/TokenSwatch.tsx   色見本（実際の CSS 変数値を表示）
  catalog/CatalogSection.tsx カタログの節
hooks/
  use-unsaved-changes-guard.ts 未保存離脱の確認
lib/
  utils.ts  brand.ts  navigation.ts  schema.ts  status.ts
  orders.ts  order-form.ts  format.ts  data.ts
data/orders.json            見本データ（受注案件12件）
scripts/
  design-drift.mjs          検出ロジック（純関数）
  check-design-drift.mjs    CLI（npm run check:design）
public/brand/README.md      ロゴ配置手順
__tests__/                  テスト
CLAUDE.md / README.md
.claude/skills/designing-keihan-ui/  自社スキル
.claude/skills/{shadcn,next-best-practices,vercel-react-best-practices}/  見本から流用
```

---

### Task 1: プロジェクトの土台（Next.js・テスト基盤）

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `.gitignore`, `vitest.config.ts`, `components.json`, `lib/utils.ts`, `__tests__/setup.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Test: `__tests__/smoke.test.ts`

**Interfaces:**
- Produces: `cn(...inputs)`（`lib/utils.ts`）、`@/` パス別名、`npm run test|lint|build|dev|format|check:design` スクリプト

- [ ] **Step 1: 見本から設定ファイルをコピー**

```bash
SAMPLE="/Users/kabushikikaishakeihankougishakikakubu/src/【smple】-workspace-ui-kit"
cd /Users/kabushikikaishakeihankougishakikakubu/src/keihan-design-system
mkdir -p lib __tests__ app
cp "$SAMPLE"/{tsconfig.json,next.config.ts,postcss.config.mjs,.prettierrc,.gitignore,vitest.config.ts,components.json} .
cp "$SAMPLE/lib/utils.ts" lib/
cp "$SAMPLE/__tests__/setup.ts" __tests__/
```

- [ ] **Step 1b: `eslint.config.mjs` を作成**（見本に `any`・`!` の禁止を追加）

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // 型チェックを素通りさせる書き方を禁止する（CLAUDE.md「TypeScript」参照）
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

- [ ] **Step 2: `.prettierignore` を作成**（見本から openspec 関連を除いたもの）

```
node_modules
.next
out
build
coverage

package-lock.json
pnpm-lock.yaml
yarn.lock

# shadcn の素体は upstream 同期があるため整形しない
components/ui

# 外部由来スキル（更新時の差分取り込みと衝突するため整形対象外）
.claude/skills/next-best-practices/
.claude/skills/shadcn/
.claude/skills/vercel-react-best-practices/
```

- [ ] **Step 3: `package.json` を作成**

```json
{
  "name": "keihan-app-template",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check:design": "node scripts/check-design-drift.mjs",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@base-ui/react": "^1.4.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.14.0",
    "next": "^16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "shadcn": "^4.7.0",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.2.6",
    "jsdom": "^27.0.1",
    "prettier": "^3.8.3",
    "prettier-plugin-tailwindcss": "^0.8.0",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 4: 仮の画面ファイルを作成**（Task 2・6 で本実装に置き換える）

`app/globals.css`:
```css
@import "tailwindcss";
```

`app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "京阪工技社 業務アプリひな形",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:
```tsx
export default function Page() {
  return <main>準備中</main>;
}
```

- [ ] **Step 5: スモークテストを書く**

`__tests__/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("土台", () => {
  it("cn はクラスを結合し、衝突する Tailwind クラスは後勝ちにする", () => {
    expect(cn("px-2", "px-4", false && "hidden")).toBe("px-4");
  });

  it("トップページのモジュールを読み込める", async () => {
    const mod = await import("../app/page");
    expect(mod.default).toBeTypeOf("function");
  });
});
```

- [ ] **Step 6: 依存をインストールしてテスト実行**

Run: `npm install && npm run test`
Expected: 2 tests PASS

- [ ] **Step 7: ビルドが通ることを確認**

Run: `npm run build`
Expected: `✓ Compiled successfully`（エラーなし）

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: Next.js 16 と Vitest の土台を用意"
```

---

### Task 2: デザイントークンとフォント

**Files:**
- Modify: `app/globals.css`（全置換）、`app/layout.tsx`（全置換）
- Test: `__tests__/tokens.test.ts`

**Interfaces:**
- Produces: Tailwind クラス `bg-/text-/border-` × `background foreground card card-foreground popover popover-foreground primary primary-foreground secondary secondary-foreground muted muted-foreground accent accent-foreground destructive destructive-foreground success success-foreground warning warning-foreground info info-foreground border input ring chart-1..5 sidebar*`、`font-sans` `font-heading` `font-mono`、`rounded-sm|md|lg|xl|2xl|3xl|4xl`

- [ ] **Step 1: 失敗するテストを書く**

`__tests__/tokens.test.ts`:
```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const css = readFileSync(
  path.resolve(__dirname, "../app/globals.css"),
  "utf-8",
);

/** `:root { ... }` 内の `--name: #RRGGBB;` を取り出す */
function rootColorTokens(source: string): Record<string, string> {
  const block = source.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error(":root ブロックが見つかりません");
  const tokens: Record<string, string> = {};
  for (const m of block[1].matchAll(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)) {
    tokens[m[1]] = m[2].toUpperCase();
  }
  return tokens;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const t = rootColorTokens(css);

describe("ブランド値", () => {
  it.each([
    ["primary", "#0056A8"],
    ["destructive", "#E60012"],
    ["info", "#0A9EDB"],
  ])("%s は %s", (name, hex) => {
    expect(t[name]).toBe(hex);
  });

  it("角丸の基準は 6px（0.375rem）", () => {
    expect(css).toMatch(/--radius:\s*0\.375rem;/);
  });

  it("ダークモードの色定義を持たない", () => {
    expect(css).not.toMatch(/\.dark\s*\{/);
  });
});

describe("コントラスト（WCAG AA）", () => {
  const pairs: [fg: string, bg: string, min: number][] = [
    ["foreground", "background", 4.5],
    ["foreground", "card", 4.5],
    ["card-foreground", "card", 4.5],
    ["popover-foreground", "popover", 4.5],
    ["primary-foreground", "primary", 4.5],
    ["primary", "card", 4.5],
    ["secondary-foreground", "secondary", 4.5],
    ["accent-foreground", "accent", 4.5],
    ["muted-foreground", "muted", 4.5],
    ["muted-foreground", "card", 4.5],
    ["muted-foreground", "background", 4.5],
    ["destructive-foreground", "destructive", 4.5],
    ["destructive", "card", 4.5],
    ["success-foreground", "success", 4.5],
    ["warning-foreground", "warning", 4.5],
    ["info-foreground", "info", 4.5],
    ["sidebar-foreground", "sidebar", 4.5],
    ["sidebar-accent-foreground", "sidebar-accent", 4.5],
    ["input", "card", 3],
  ];

  it.each(pairs)("%s / %s は %s:1 以上", (fg, bg, min) => {
    expect(t[fg], `--${fg} が未定義`).toBeDefined();
    expect(t[bg], `--${bg} が未定義`).toBeDefined();
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run __tests__/tokens.test.ts`
Expected: FAIL（`primary は #0056A8` で `undefined`）

- [ ] **Step 3: `app/globals.css` を全置換**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

/* shadcn 部品が dark: を参照するため宣言だけ残す。ダーク用の色定義は持たない（ライトのみ）。 */
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* 英字・数字は Inter、日本語は Noto Sans JP。どちらも app/layout.tsx の next/font が
     <html> に CSS 変数を注入する。読み込み前はシステムの日本語フォントで表示する。 */
  --font-sans:
    var(--font-inter), var(--font-noto-sans-jp), "Hiragino Sans",
    "Yu Gothic UI", "Meiryo", sans-serif;
  --font-heading: var(--font-sans);
  --font-mono: ui-monospace, "SFMono-Regular", "Menlo", monospace;

  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

/* 値の変更は企画部のみ。変更したら npm run test（コントラスト検証）を必ず通す。 */
:root {
  --background: #F4F6F9;
  --foreground: #1A2230;
  --card: #FFFFFF;
  --card-foreground: #1A2230;
  --popover: #FFFFFF;
  --popover-foreground: #1A2230;

  /* ブランド青（会社HPのコーポレートブルー） */
  --primary: #0056A8;
  --primary-foreground: #FFFFFF;
  --secondary: #EAF1F9;
  --secondary-foreground: #0056A8;
  --accent: #EAF1F9;
  --accent-foreground: #0056A8;
  --muted: #EEF1F5;
  --muted-foreground: #5B6675;

  /* 赤は削除・エラー専用。強調や状態表示に使わない */
  --destructive: #E60012;
  --destructive-foreground: #FFFFFF;
  --success: #177A42;
  --success-foreground: #FFFFFF;
  --warning: #F2A900;
  --warning-foreground: #1A2230;
  /* 会社HPの水色 */
  --info: #0A9EDB;
  --info-foreground: #1A2230;

  --border: #DDE2E9;
  /* 入力欄の枠は白地に対して 3:1 を確保（ITに不慣れな人でも入力欄と分かるように） */
  --input: #8A96A6;
  --ring: #0056A8;

  --chart-1: #0056A8;
  --chart-2: #0A9EDB;
  --chart-3: #177A42;
  --chart-4: #F2A900;
  --chart-5: #5B6675;

  --sidebar: #FFFFFF;
  --sidebar-foreground: #1A2230;
  --sidebar-primary: #0056A8;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #EAF1F9;
  --sidebar-accent-foreground: #0056A8;
  --sidebar-border: #DDE2E9;
  --sidebar-ring: #0056A8;

  --radius: 0.375rem;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  html {
    @apply font-sans;
  }
  body {
    @apply bg-background text-foreground;
    line-height: 1.65;
  }
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run __tests__/tokens.test.ts`
Expected: 全 PASS

- [ ] **Step 5: `app/layout.tsx` を全置換（フォント適用）**

```tsx
import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// 英字・数字用。globals.css の --font-sans で先頭に置く。
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// 日本語用。日本語グリフは unicode-range で必要な分だけ読み込まれるため preload しない。
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "京阪工技社 業務アプリひな形",
  description: "京阪工技社デザインシステムに沿った業務アプリのひな形",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: ビルド確認**

Run: `npm run build`
Expected: 成功（Google Fonts の取得にネット接続が必要）

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/layout.tsx __tests__/tokens.test.ts
git commit -m "feat: ブランド色・角丸・フォントのデザイントークンを定義"
```

---

### Task 3: shadcn 部品の導入と状態色 variant

**Files:**
- Create（CLI 生成）: `components/ui/{button,badge,card,input,label,textarea,select,table,dialog,alert-dialog,sidebar,separator,sheet,tooltip,skeleton,dropdown-menu,field,sonner,chart,breadcrumb,avatar}.tsx`, `hooks/use-mobile.ts`
- Modify: `components/ui/button.tsx`（destructive variant）、`components/ui/badge.tsx`（destructive＋success/warning/info）、`components/ui/sonner.tsx`（全置換）、`app/layout.tsx`
- Test: `__tests__/ui-variants.test.tsx`

**Interfaces:**
- Consumes: Task 2 のトークン
- Produces: `<Button variant="default|outline|secondary|ghost|destructive|link">`、`<Badge variant="default|secondary|destructive|outline|ghost|link|success|warning|info">`、`<Toaster />`、`toast`（`sonner` から import）

- [ ] **Step 1: 部品を追加**

```bash
npx shadcn@latest add button badge card input label textarea select table dialog alert-dialog sidebar separator sheet tooltip skeleton dropdown-menu field sonner chart breadcrumb avatar -y
```

Expected: `components/ui/` に各ファイル、`hooks/use-mobile.ts` が生成され、`recharts` `sonner` `next-themes` が dependencies に追加される。既存ファイルの上書き確認が出たら **No** を選ぶ。

- [ ] **Step 2: 失敗するテストを書く**

`__tests__/ui-variants.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

describe("Badge の状態色 variant", () => {
  it.each([
    ["success", "bg-success", "text-success-foreground"],
    ["warning", "bg-warning", "text-warning-foreground"],
    ["info", "bg-info", "text-info-foreground"],
    ["destructive", "bg-destructive", "text-destructive-foreground"],
  ] as const)("%s は %s + %s", (variant, bg, fg) => {
    render(<Badge variant={variant}>ラベル</Badge>);
    const el = screen.getByText("ラベル");
    expect(el).toHaveClass(bg, fg);
  });
});

describe("Button destructive", () => {
  it("赤の塗り＋白文字（淡い赤地に赤文字だとコントラスト不足のため）", () => {
    render(<Button variant="destructive">削除</Button>);
    expect(screen.getByRole("button", { name: "削除" })).toHaveClass(
      "bg-destructive",
      "text-destructive-foreground",
    );
  });
});
```

- [ ] **Step 3: テストが失敗することを確認**

Run: `npx vitest run __tests__/ui-variants.test.tsx`
Expected: FAIL（`success` variant が存在せず `bg-success` クラスがない）

- [ ] **Step 4: `components/ui/badge.tsx` の variants を編集**

`variant: { ... }` 内の `destructive:` 行を次に置き換え、その直後に3行を追加する:

```ts
        destructive:
          "bg-destructive text-destructive-foreground focus-visible:ring-destructive/20 [a]:hover:bg-destructive/90",
        success: "bg-success text-success-foreground [a]:hover:bg-success/90",
        warning: "bg-warning text-warning-foreground [a]:hover:bg-warning/90",
        info: "bg-info text-info-foreground [a]:hover:bg-info/90",
```

- [ ] **Step 5: `components/ui/button.tsx` の destructive を編集**

`destructive:` の値を次に置き換える:

```ts
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
```

- [ ] **Step 6: `components/ui/sonner.tsx` を全置換**（ライト固定。next-themes に依存しない）

```tsx
"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

// このデザインシステムはライトモードのみのため theme を固定する。
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
```

Run: `npm uninstall next-themes`（他に import がないことを `grep -r next-themes components app` で確認してから）

- [ ] **Step 7: `app/layout.tsx` の `<body>` を差し替え**

import を追加:
```tsx
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
```
`<body ...>{children}</body>` を次に置き換える:
```tsx
      <body className="flex min-h-full flex-col">
        {/* Sidebar の折りたたみ時ツールチップが TooltipProvider を要求する */}
        <TooltipProvider delay={300}>{children}</TooltipProvider>
        <Toaster position="top-center" />
      </body>
```

- [ ] **Step 8: テスト・ビルド確認**

Run: `npm run test && npm run build`
Expected: 全 PASS、ビルド成功

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: shadcn 部品を導入し状態色 variant を追加"
```

---

### Task 4: デザイン逸脱の自動チェック（check:design）

**Files:**
- Create: `scripts/design-drift.mjs`, `scripts/check-design-drift.mjs`
- Test: `__tests__/design-drift.test.ts`

**Interfaces:**
- Produces: `findDesignDrift(source: string): { line: number; rule: string; text: string }[]`（`scripts/design-drift.mjs`）、`npm run check:design`（違反時 exit 1）

- [ ] **Step 1: 失敗するテストを書く**

`__tests__/design-drift.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { findDesignDrift } from "../scripts/design-drift.mjs";

const rulesOf = (src: string) => findDesignDrift(src).map((d) => d.rule);

describe("findDesignDrift", () => {
  it("役割名トークンだけなら違反なし", () => {
    const src = `<div className="bg-primary text-primary-foreground rounded-lg border-border bg-success">`;
    expect(findDesignDrift(src)).toEqual([]);
  });

  it.each([
    [`<p className="text-red-600">`, "raw-color"],
    [`<div className="bg-blue-500/50">`, "raw-color"],
    [`<div className="border-gray-200">`, "raw-color"],
    [`<span className="text-white">`, "raw-black-white"],
    [`<div className="bg-black/10">`, "raw-black-white"],
    [`<div className="bg-[#0056A8]">`, "arbitrary-color"],
    [`<div className="text-[oklch(0.5_0.1_250)]">`, "arbitrary-color"],
    [`const c = "#0056A8";`, "hex-literal"],
    [`<div className="rounded-[10px]">`, "arbitrary-radius"],
    [`<div className="rounded-t-[4px]">`, "arbitrary-radius"],
    [`<div className="bg-card rounded-md p-2">`, "card-radius"],
  ])("%s → %s", (src, rule) => {
    expect(rulesOf(src)).toContain(rule);
  });

  it("行番号を 1 始まりで返す", () => {
    const src = `const a = 1;\n<p className="text-red-600">`;
    expect(findDesignDrift(src)[0]).toMatchObject({ line: 2, rule: "raw-color" });
  });

  it("href のアンカー（#top 等）は誤検出しない", () => {
    expect(findDesignDrift(`<a href="#top">`)).toEqual([]);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run __tests__/design-drift.test.ts`
Expected: FAIL（`Failed to resolve import "../scripts/design-drift.mjs"`）

- [ ] **Step 3: 検出ロジックを実装**

`scripts/design-drift.mjs`:
```js
/**
 * デザイン逸脱の検出ルール（純関数）。CLI は check-design-drift.mjs。
 * 色は役割名トークン（bg-primary 等）、角丸は rounded-sm/md/lg/xl だけを使う、という
 * デザインシステムの約束を機械的に確かめる。
 */

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const UTIL =
  "bg|text|border|ring|fill|stroke|from|via|to|outline|divide|decoration|accent|caret|placeholder|shadow";

export const RULES = [
  {
    rule: "raw-color",
    message: "色番号の直書き。bg-primary 等の役割名トークンを使う",
    pattern: new RegExp(`\\b(?:${UTIL})-(?:${PALETTE})-\\d{2,3}\\b`),
  },
  {
    rule: "raw-black-white",
    message: "黒・白の直書き。foreground / card / primary-foreground 等を使う",
    pattern: new RegExp(`\\b(?:${UTIL})-(?:black|white)\\b`),
  },
  {
    rule: "arbitrary-color",
    message: "任意値の色。globals.css のトークンを使う（足りなければ企画部に相談）",
    pattern: /-\[(?:#|rgb|hsl|oklch)/,
  },
  {
    rule: "hex-literal",
    message: "コード内の色コード文字列。CSS 変数（var(--primary) 等）を使う",
    pattern: /["'`]#[0-9A-Fa-f]{3,8}["'`]/,
  },
  {
    rule: "arbitrary-radius",
    message: "任意値の角丸。rounded-sm / md / lg / xl を使う",
    pattern: /\brounded(?:-[a-z]{1,2})?-\[/,
  },
  {
    rule: "card-radius",
    message: "bg-card の島は rounded-lg に揃える（rounded-md は行・メニュー用）",
    pattern: /bg-card\b.*\brounded-md\b|\brounded-md\b.*bg-card\b/,
  },
];

/**
 * @param {string} source
 * @returns {{ line: number, rule: string, message: string, text: string }[]}
 */
export function findDesignDrift(source) {
  const results = [];
  source.split("\n").forEach((text, i) => {
    for (const { rule, message, pattern } of RULES) {
      if (pattern.test(text)) {
        results.push({ line: i + 1, rule, message, text: text.trim() });
      }
    }
  });
  return results;
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run __tests__/design-drift.test.ts`
Expected: 全 PASS

- [ ] **Step 5: CLI を実装**

`scripts/check-design-drift.mjs`:
```js
#!/usr/bin/env node
/**
 * app/ と components/（components/ui/ を除く）の .ts/.tsx を走査し、
 * デザインシステムからの逸脱を報告する。違反があれば exit 1。
 *
 * 使い方: npm run check:design
 * components/ui/ は shadcn の素体で、ライブラリ内部の色指定を含むため対象外。
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { findDesignDrift } from "./design-drift.mjs";

const ROOT = join(import.meta.dirname, "..");
const TARGETS = ["app", "components"].map((d) => join(ROOT, d));
const EXCLUDE = [join(ROOT, "components", "ui")];

function walk(dir) {
  if (!existsSync(dir) || EXCLUDE.includes(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(tsx?|mjs)$/.test(name) ? [full] : [];
  });
}

let count = 0;
for (const file of TARGETS.flatMap(walk)) {
  for (const d of findDesignDrift(readFileSync(file, "utf-8"))) {
    console.warn(`⚠  ${relative(ROOT, file)}:${d.line}  [${d.rule}] ${d.message}`);
    console.warn(`   ${d.text}\n`);
    count++;
  }
}

if (count > 0) {
  console.warn(`${count} 件のデザイン逸脱が見つかりました。`);
  console.warn("ルール: .claude/skills/designing-keihan-ui/SKILL.md");
  process.exit(1);
}
console.log("✓ デザイン逸脱なし");
```

- [ ] **Step 6: CLI の動作確認**

Run: `npm run check:design`
Expected: `✓ デザイン逸脱なし`

Run: `mkdir -p components/tmp && echo '<p className="text-red-600" />' > components/tmp/x.tsx && npm run check:design; echo "exit=$?"; rm -r components/tmp`
Expected: `[raw-color]` の警告が出て `exit=1`（確認後、一時ファイルは削除済み）

- [ ] **Step 7: Commit**

```bash
git add scripts __tests__/design-drift.test.ts
git commit -m "feat: 色の直書き・任意角丸を検出する check:design を追加"
```

---

### Task 5: 受注案件のデータ層（型・見本データ・検索・集計・書式）

**Files:**
- Create: `lib/schema.ts`, `lib/data.ts`, `lib/orders.ts`, `lib/order-form.ts`, `lib/format.ts`, `data/orders.json`, `__tests__/fixtures.ts`
- Test: `__tests__/orders.test.ts`, `__tests__/order-form.test.ts`, `__tests__/format.test.ts`, `__tests__/data.test.ts`

**Interfaces:**
- Produces:
  - `ORDER_STATUSES = ["受付","作業中","完了","遅延"] as const`、`SERVICE_TYPES = ["スキャニング","オンデマンド印刷","コピー・プリント","製本加工"] as const`
  - `type OrderStatus`、`type ServiceType`、`type Order = { id; title; customerName; serviceType; status; quantity: number; amount: number; receivedAt: "YYYY-MM-DD"; dueDate; assignee; note }`
  - `orderSchema`、`ordersSchema`
  - `getInitialOrders(): Order[]`（`lib/data.ts`）
  - `type StatusFilter = OrderStatus | "すべて"`、`filterOrders(orders: Order[], filter: { keyword: string; status: StatusFilter }): Order[]`
  - `type OrderSummary = { total: number; inProgress: number; delayed: number; totalAmount: number; byStatus: { status: OrderStatus; count: number }[] }`、`summarizeOrders(orders: Order[]): OrderSummary`
  - `type OrderFormValues`（数値項目も string）、`ORDER_FORM_KEYS`（項目名の readonly 配列）、`type OrderFormErrors`、`toFormValues(order: Order): OrderFormValues`、`parseOrderForm(id: string, values: OrderFormValues): { success: true; data: Order } | { success: false; errors: Partial<Record<keyof OrderFormValues, string>> }`
  - `formatYen(n: number): string`（例 `1,234円`）、`formatDate(iso: string): string`（例 `2026/09/25`）、`formatNumber(n: number): string`

- [ ] **Step 1: 型と検証ルールを実装**（テストの前提になる型定義のみ先に置く）

`lib/schema.ts`:
```ts
import { z } from "zod";

export const ORDER_STATUSES = ["受付", "作業中", "完了", "遅延"] as const;
export const SERVICE_TYPES = [
  "スキャニング",
  "オンデマンド印刷",
  "コピー・プリント",
  "製本加工",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];

const isoDate = (label: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label}を入力してください`);

export const orderSchema = z
  .object({
    id: z.string().regex(/^ORD-\d{4}-\d{4}$/, "受注番号の形式が正しくありません"),
    title: z
      .string()
      .trim()
      .min(1, "案件名を入力してください")
      .max(100, "案件名は100文字以内で入力してください"),
    customerName: z
      .string()
      .trim()
      .min(1, "顧客名を入力してください")
      .max(100, "顧客名は100文字以内で入力してください"),
    serviceType: z.enum(SERVICE_TYPES, { error: "種別を選択してください" }),
    status: z.enum(ORDER_STATUSES, { error: "状態を選択してください" }),
    quantity: z
      .number({ error: "数量は数字で入力してください" })
      .int("数量は整数で入力してください")
      .min(1, "数量は1以上で入力してください"),
    amount: z
      .number({ error: "金額は数字で入力してください" })
      .int("金額は円単位の整数で入力してください")
      .min(0, "金額は0以上で入力してください"),
    receivedAt: isoDate("受付日"),
    dueDate: isoDate("納期"),
    assignee: z.string().trim().min(1, "担当者を入力してください"),
    note: z.string().max(1000, "備考は1000文字以内で入力してください"),
  })
  .refine((o) => o.dueDate >= o.receivedAt, {
    message: "納期は受付日以降にしてください",
    path: ["dueDate"],
  });

export type Order = z.infer<typeof orderSchema>;

export const ordersSchema = z.array(orderSchema);
```

- [ ] **Step 2: テスト用のデータ生成ヘルパーを作成**

`__tests__/fixtures.ts`:
```ts
import type { Order } from "@/lib/schema";

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "ORD-2026-0001",
    title: "公文書スキャニング",
    customerName: "湖東市役所 総務課",
    serviceType: "スキャニング",
    status: "作業中",
    quantity: 100,
    amount: 50000,
    receivedAt: "2026-09-01",
    dueDate: "2026-09-30",
    assignee: "山田",
    note: "",
    ...overrides,
  };
}
```

- [ ] **Step 3: 失敗するテストを書く（検索・集計）**

`__tests__/orders.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { filterOrders, summarizeOrders } from "@/lib/orders";
import { makeOrder } from "./fixtures";

const orders = [
  makeOrder({ id: "ORD-2026-0001", title: "カルテ電子化", customerName: "湖南中央病院", status: "作業中", amount: 1000 }),
  makeOrder({ id: "ORD-2026-0002", title: "パンフレット増刷", customerName: "株式会社びわこ精機", status: "完了", amount: 2000, assignee: "佐藤" }),
  makeOrder({ id: "ORD-2026-0003", title: "抄録集 製本", customerName: "近畿医療学会", status: "遅延", amount: 3000 }),
  makeOrder({ id: "ORD-2026-0004", title: "研修テキスト", customerName: "湖国県職員研修所", status: "受付", amount: 0 }),
];

describe("filterOrders", () => {
  it("キーワード空・すべて なら全件", () => {
    expect(filterOrders(orders, { keyword: "", status: "すべて" })).toHaveLength(4);
  });

  it("案件名・顧客名・受注番号・担当者のどれかに部分一致", () => {
    const ids = (kw: string) =>
      filterOrders(orders, { keyword: kw, status: "すべて" }).map((o) => o.id);
    expect(ids("病院")).toEqual(["ORD-2026-0001"]);
    expect(ids("製本")).toEqual(["ORD-2026-0003"]);
    expect(ids("0002")).toEqual(["ORD-2026-0002"]);
    expect(ids("佐藤")).toEqual(["ORD-2026-0002"]);
  });

  it("全角・半角と大文字・小文字の違いを無視する", () => {
    expect(filterOrders(orders, { keyword: "ｏｒｄ-2026-０００３", status: "すべて" })).toHaveLength(1);
  });

  it("前後の空白を無視する", () => {
    expect(filterOrders(orders, { keyword: "  病院 ", status: "すべて" })).toHaveLength(1);
  });

  it("状態で絞り込む", () => {
    expect(filterOrders(orders, { keyword: "", status: "遅延" }).map((o) => o.id)).toEqual(["ORD-2026-0003"]);
  });

  it("キーワードと状態は AND 条件。該当なしは空配列", () => {
    expect(filterOrders(orders, { keyword: "病院", status: "完了" })).toEqual([]);
  });
});

describe("summarizeOrders", () => {
  it("件数・進行中（受付＋作業中）・遅延・金額合計・状態別件数を返す", () => {
    expect(summarizeOrders(orders)).toEqual({
      total: 4,
      inProgress: 2,
      delayed: 1,
      totalAmount: 6000,
      byStatus: [
        { status: "受付", count: 1 },
        { status: "作業中", count: 1 },
        { status: "完了", count: 1 },
        { status: "遅延", count: 1 },
      ],
    });
  });

  it("0件でも全状態を 0 で返す", () => {
    const s = summarizeOrders([]);
    expect(s.total).toBe(0);
    expect(s.totalAmount).toBe(0);
    expect(s.byStatus.every((b) => b.count === 0)).toBe(true);
    expect(s.byStatus).toHaveLength(4);
  });
});
```

- [ ] **Step 4: 失敗を確認**

Run: `npx vitest run __tests__/orders.test.ts`
Expected: FAIL（`@/lib/orders` が見つからない）

- [ ] **Step 5: 検索・集計を実装**

`lib/orders.ts`:
```ts
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/schema";

export type StatusFilter = OrderStatus | "すべて";

export type OrderFilter = { keyword: string; status: StatusFilter };

/** 全角英数を半角に、大文字を小文字にそろえて比較できる形にする */
export function normalizeText(value: string): string {
  return value.normalize("NFKC").toLowerCase().trim();
}

export function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  const keyword = normalizeText(filter.keyword);
  return orders.filter((order) => {
    if (filter.status !== "すべて" && order.status !== filter.status) {
      return false;
    }
    if (keyword === "") return true;
    return [order.id, order.title, order.customerName, order.assignee].some(
      (field) => normalizeText(field).includes(keyword),
    );
  });
}

export type OrderSummary = {
  total: number;
  /** 受付＋作業中 */
  inProgress: number;
  delayed: number;
  totalAmount: number;
  byStatus: { status: OrderStatus; count: number }[];
};

export function summarizeOrders(orders: Order[]): OrderSummary {
  const countOf = (status: OrderStatus) =>
    orders.filter((o) => o.status === status).length;
  return {
    total: orders.length,
    inProgress: countOf("受付") + countOf("作業中"),
    delayed: countOf("遅延"),
    totalAmount: orders.reduce((sum, o) => sum + o.amount, 0),
    byStatus: ORDER_STATUSES.map((status) => ({ status, count: countOf(status) })),
  };
}
```

- [ ] **Step 6: 通ることを確認**

Run: `npx vitest run __tests__/orders.test.ts`
Expected: 全 PASS

- [ ] **Step 7: 失敗するテストを書く（フォーム値の変換）**

`__tests__/order-form.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseOrderForm, toFormValues } from "@/lib/order-form";
import { makeOrder } from "./fixtures";

const base = toFormValues(makeOrder());

describe("toFormValues", () => {
  it("数値を文字列にする", () => {
    expect(base.amount).toBe("50000");
    expect(base.quantity).toBe("100");
  });
});

describe("parseOrderForm", () => {
  it("正しい入力は Order になる", () => {
    const r = parseOrderForm("ORD-2026-0001", base);
    expect(r).toEqual({ success: true, data: makeOrder() });
  });

  it("全角数字・カンマ・前後の空白を許容する", () => {
    const r = parseOrderForm("ORD-2026-0001", { ...base, amount: " １２，０００ ", quantity: "1,200" });
    expect(r.success && r.data.amount).toBe(12000);
    expect(r.success && r.data.quantity).toBe(1200);
  });

  it.each([
    ["amount", "", "金額は数字で入力してください"],
    ["amount", "abc", "金額は数字で入力してください"],
    ["amount", "-1", "金額は0以上で入力してください"],
    ["amount", "10.5", "金額は円単位の整数で入力してください"],
    ["quantity", "0", "数量は1以上で入力してください"],
    ["title", "   ", "案件名を入力してください"],
    ["customerName", "", "顧客名を入力してください"],
  ] as const)("%s=%j → 「%s」", (field, value, message) => {
    const r = parseOrderForm("ORD-2026-0001", { ...base, [field]: value });
    expect(r.success).toBe(false);
    expect(!r.success && r.errors[field]).toBe(message);
  });

  it("納期が受付日より前ならエラー", () => {
    const r = parseOrderForm("ORD-2026-0001", { ...base, receivedAt: "2026-09-10", dueDate: "2026-09-09" });
    expect(!r.success && r.errors.dueDate).toBe("納期は受付日以降にしてください");
  });

  it("複数のエラーを項目ごとに返す", () => {
    const r = parseOrderForm("ORD-2026-0001", { ...base, title: "", amount: "x" });
    expect(!r.success && Object.keys(r.errors).sort()).toEqual(["amount", "title"]);
  });
});
```

- [ ] **Step 8: 失敗を確認**

Run: `npx vitest run __tests__/order-form.test.ts`
Expected: FAIL（`@/lib/order-form` が見つからない）

- [ ] **Step 9: フォーム変換を実装**

`lib/order-form.ts`:
```ts
import { orderSchema, type Order } from "@/lib/schema";

/** フォーム入力中の値。数値項目も入力途中の文字列として持つ */
export type OrderFormValues = {
  title: string;
  customerName: string;
  serviceType: string;
  status: string;
  quantity: string;
  amount: string;
  receivedAt: string;
  dueDate: string;
  assignee: string;
  note: string;
};

/** フォーム項目の一覧。エラーの振り分けや変更検知で `as` を使わずに済ませるため */
export const ORDER_FORM_KEYS = [
  "title",
  "customerName",
  "serviceType",
  "status",
  "quantity",
  "amount",
  "receivedAt",
  "dueDate",
  "assignee",
  "note",
] as const satisfies readonly (keyof OrderFormValues)[];

export type OrderFormErrors = Partial<Record<keyof OrderFormValues, string>>;

export type ParseOrderFormResult =
  | { success: true; data: Order }
  | { success: false; errors: OrderFormErrors };

export function toFormValues(order: Order): OrderFormValues {
  return {
    title: order.title,
    customerName: order.customerName,
    serviceType: order.serviceType,
    status: order.status,
    quantity: String(order.quantity),
    amount: String(order.amount),
    receivedAt: order.receivedAt,
    dueDate: order.dueDate,
    assignee: order.assignee,
    note: order.note,
  };
}

/** 全角数字・カンマ・空白を許容して数値にする。空欄や数字以外は NaN（=検証エラー） */
function toNumber(raw: string): number {
  const normalized = raw.normalize("NFKC").replace(/[,\s]/g, "");
  if (normalized === "" || !/^-?\d+(\.\d+)?$/.test(normalized)) return NaN;
  return Number(normalized);
}

export function parseOrderForm(
  id: string,
  values: OrderFormValues,
): ParseOrderFormResult {
  const result = orderSchema.safeParse({
    ...values,
    id,
    quantity: toNumber(values.quantity),
    amount: toNumber(values.amount),
  });
  if (result.success) return { success: true, data: result.data };

  const errors: OrderFormErrors = {};
  for (const issue of result.error.issues) {
    const key = ORDER_FORM_KEYS.find((k) => k === issue.path[0]);
    if (key) errors[key] ??= issue.message;
  }
  return { success: false, errors };
}
```

- [ ] **Step 10: 通ることを確認**

Run: `npx vitest run __tests__/order-form.test.ts`
Expected: 全 PASS。`title` が `"   "` のケースは `.trim()` 後の `min(1)` で「案件名を入力してください」になる。成功時の `title` は trim 済みの値になる点に注意。

- [ ] **Step 11: 失敗するテストを書く（書式・見本データ）**

`__tests__/format.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatDate, formatNumber, formatYen } from "@/lib/format";

describe("format", () => {
  it("金額は3桁区切り＋円", () => {
    expect(formatYen(1234567)).toBe("1,234,567円");
    expect(formatYen(0)).toBe("0円");
  });
  it("数値は3桁区切り", () => {
    expect(formatNumber(48000)).toBe("48,000");
  });
  it("日付は YYYY/MM/DD", () => {
    expect(formatDate("2026-09-05")).toBe("2026/09/05");
  });
});
```

`__tests__/data.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getInitialOrders } from "@/lib/data";

describe("見本データ", () => {
  const orders = getInitialOrders();

  it("12件すべてが検証を通る", () => {
    expect(orders).toHaveLength(12);
  });

  it("受注番号が重複しない", () => {
    expect(new Set(orders.map((o) => o.id)).size).toBe(orders.length);
  });

  it("全状態を含む（画面確認のため）", () => {
    expect(new Set(orders.map((o) => o.status))).toEqual(
      new Set(["受付", "作業中", "完了", "遅延"]),
    );
  });
});
```

- [ ] **Step 12: 失敗を確認**

Run: `npx vitest run __tests__/format.test.ts __tests__/data.test.ts`
Expected: FAIL（モジュールが見つからない）

- [ ] **Step 13: 書式・データ読み込み・見本データを実装**

`lib/format.ts`:
```ts
const numberFormat = new Intl.NumberFormat("ja-JP");

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatYen(value: number): string {
  return `${numberFormat.format(value)}円`;
}

/** "2026-09-05" → "2026/09/05"（タイムゾーンの影響を受けないよう文字列で変換） */
export function formatDate(iso: string): string {
  return iso.replaceAll("-", "/");
}
```

`lib/data.ts`:
```ts
import ordersJson from "@/data/orders.json";
import { ordersSchema, type Order } from "@/lib/schema";

/** 見本データを検証して返す。形式が壊れていたら原因を日本語で示して止める */
export function getInitialOrders(): Order[] {
  const result = ordersSchema.safeParse(ordersJson);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(
      `data/orders.json の形式が正しくありません: [${issue?.path.join(".")}] ${issue?.message}`,
    );
  }
  return result.data;
}
```

`data/orders.json`（顧客名はすべて架空）:
```json
[
  { "id": "ORD-2026-0001", "title": "公文書スキャニング（第3期）", "customerName": "湖東市役所 総務課", "serviceType": "スキャニング", "status": "作業中", "quantity": 12000, "amount": 1860000, "receivedAt": "2026-09-01", "dueDate": "2026-10-15", "assignee": "山田", "note": "A3図面を含む。原本は返却要。" },
  { "id": "ORD-2026-0002", "title": "会社案内パンフレット増刷", "customerName": "株式会社びわこ精機", "serviceType": "オンデマンド印刷", "status": "完了", "quantity": 500, "amount": 145000, "receivedAt": "2026-08-20", "dueDate": "2026-09-05", "assignee": "佐藤", "note": "" },
  { "id": "ORD-2026-0003", "title": "学会抄録集 製本", "customerName": "近畿医療学会 事務局", "serviceType": "製本加工", "status": "受付", "quantity": 300, "amount": 420000, "receivedAt": "2026-09-22", "dueDate": "2026-10-20", "assignee": "鈴木", "note": "無線綴じ、表紙カラー" },
  { "id": "ORD-2026-0004", "title": "設計図面 カラー出力", "customerName": "京滋建設コンサルタント株式会社", "serviceType": "コピー・プリント", "status": "遅延", "quantity": 850, "amount": 96000, "receivedAt": "2026-09-10", "dueDate": "2026-09-20", "assignee": "田中", "note": "A1サイズ。用紙入荷待ち" },
  { "id": "ORD-2026-0005", "title": "カルテ電子化", "customerName": "湖南中央病院", "serviceType": "スキャニング", "status": "作業中", "quantity": 48000, "amount": 3200000, "receivedAt": "2026-07-15", "dueDate": "2026-11-30", "assignee": "山田", "note": "個人情報取扱い：施錠保管" },
  { "id": "ORD-2026-0006", "title": "研修テキスト印刷", "customerName": "湖国県職員研修所", "serviceType": "オンデマンド印刷", "status": "受付", "quantity": 120, "amount": 88000, "receivedAt": "2026-09-24", "dueDate": "2026-10-08", "assignee": "佐藤", "note": "" },
  { "id": "ORD-2026-0007", "title": "議事録製本（令和7年度）", "customerName": "湖北町議会事務局", "serviceType": "製本加工", "status": "完了", "quantity": 20, "amount": 64000, "receivedAt": "2026-08-01", "dueDate": "2026-08-29", "assignee": "鈴木", "note": "上製本" },
  { "id": "ORD-2026-0008", "title": "イベントポスター出力", "customerName": "湖西観光協会", "serviceType": "コピー・プリント", "status": "完了", "quantity": 60, "amount": 39000, "receivedAt": "2026-09-02", "dueDate": "2026-09-09", "assignee": "田中", "note": "" },
  { "id": "ORD-2026-0009", "title": "旧図書目録 デジタル化", "customerName": "瀬田川文化センター", "serviceType": "スキャニング", "status": "遅延", "quantity": 6500, "amount": 780000, "receivedAt": "2026-08-10", "dueDate": "2026-09-18", "assignee": "山田", "note": "劣化資料あり、手めくり対応" },
  { "id": "ORD-2026-0010", "title": "商品カタログ 小ロット印刷", "customerName": "有限会社おうみ工房", "serviceType": "オンデマンド印刷", "status": "作業中", "quantity": 200, "amount": 176000, "receivedAt": "2026-09-15", "dueDate": "2026-09-30", "assignee": "佐藤", "note": "" },
  { "id": "ORD-2026-0011", "title": "卒業論文 製本", "customerName": "湖南工科大学 理工学部", "serviceType": "製本加工", "status": "受付", "quantity": 45, "amount": 67500, "receivedAt": "2026-09-25", "dueDate": "2026-10-31", "assignee": "鈴木", "note": "" },
  { "id": "ORD-2026-0012", "title": "契約書類 スキャン・OCR", "customerName": "株式会社なにわ物流", "serviceType": "スキャニング", "status": "完了", "quantity": 3400, "amount": 238000, "receivedAt": "2026-08-05", "dueDate": "2026-08-31", "assignee": "田中", "note": "" }
]
```

- [ ] **Step 14: 全テストを確認**

Run: `npm run test`
Expected: 全 PASS

- [ ] **Step 15: Commit**

```bash
git add lib data __tests__
git commit -m "feat: 受注案件の型・見本データ・検索・集計・フォーム変換を追加"
```

---

### Task 6: アプリの枠（ロゴ・サイドバー・データ保持）

**Files:**
- Create: `lib/brand.ts`, `lib/navigation.ts`, `components/brand/Logo.tsx`, `components/layout/AppSidebar.tsx`, `components/layout/AppShell.tsx`, `components/layout/PageHeader.tsx`, `components/orders/OrdersProvider.tsx`, `app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx`（仮）, `public/brand/README.md`
- Modify: `app/page.tsx`（全置換）
- Test: `__tests__/shell.test.tsx`

**Interfaces:**
- Consumes: `getInitialOrders()`、`Order`、shadcn `Sidebar*`
- Produces:
  - `brand = { companyName, shortName, appName, logoSrc: string | null }`
  - `<Logo src?: string | null />`
  - `navItems: { href: string; label: string; icon: LucideIcon }[]`、`isActivePath(pathname: string, href: string): boolean`
  - `<PageHeader title: string; description?: string; actions?: ReactNode />`
  - `<OrdersProvider initialOrders: Order[]>`、`useOrders(): { orders: Order[]; getOrder(id: string): Order | undefined; updateOrder(order: Order): void }`

- [ ] **Step 1: 失敗するテストを書く**

`__tests__/shell.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { Logo } from "@/components/brand/Logo";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrdersProvider, useOrders } from "@/components/orders/OrdersProvider";
import { isActivePath } from "@/lib/navigation";
import { makeOrder } from "./fixtures";

describe("Logo", () => {
  it("正式ロゴ未配置なら社名テキストを出す", () => {
    render(<Logo src={null} />);
    expect(screen.getByText("京阪工技社")).toBeInTheDocument();
  });

  it("ロゴ画像があれば社名を代替テキストにして表示する", () => {
    render(<Logo src="/brand/logo.svg" />);
    expect(screen.getByRole("img", { name: "株式会社京阪工技社" })).toHaveAttribute("src", "/brand/logo.svg");
  });
});

describe("isActivePath", () => {
  it.each([
    ["/orders", "/orders", true],
    ["/orders/ORD-2026-0001", "/orders", true],
    ["/orders-archive", "/orders", false],
    ["/dashboard", "/orders", false],
  ])("%s は %s の配下か → %s", (pathname, href, expected) => {
    expect(isActivePath(pathname, href)).toBe(expected);
  });
});

describe("PageHeader", () => {
  it("見出し・説明・操作ボタンを表示する", () => {
    render(<PageHeader title="受注案件" description="説明文" actions={<button>追加</button>} />);
    expect(screen.getByRole("heading", { level: 1, name: "受注案件" })).toBeInTheDocument();
    expect(screen.getByText("説明文")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });
});

describe("OrdersProvider", () => {
  it("取得と更新ができる", () => {
    const initial = [makeOrder({ id: "ORD-2026-0001", title: "旧" })];
    const { result } = renderHook(() => useOrders(), {
      wrapper: ({ children }) => <OrdersProvider initialOrders={initial}>{children}</OrdersProvider>,
    });
    expect(result.current.getOrder("ORD-2026-0001")?.title).toBe("旧");
    expect(result.current.getOrder("ORD-9999-9999")).toBeUndefined();

    act(() => result.current.updateOrder(makeOrder({ id: "ORD-2026-0001", title: "新" })));
    expect(result.current.getOrder("ORD-2026-0001")?.title).toBe("新");
    expect(result.current.orders).toHaveLength(1);
  });

  it("Provider の外で使うと分かりやすいエラーになる", () => {
    expect(() => renderHook(() => useOrders())).toThrow("OrdersProvider");
  });
});
```

- [ ] **Step 2: 失敗を確認**

Run: `npx vitest run __tests__/shell.test.tsx`
Expected: FAIL（モジュールが見つからない）

- [ ] **Step 3: ブランド情報・ナビ・ロゴを実装**

`lib/brand.ts`:
```ts
export const brand = {
  companyName: "株式会社京阪工技社",
  shortName: "京阪工技社",
  appName: "業務アプリひな形",
  /**
   * 正式ロゴ（SVG）のパス。public/brand/ に置いたら "/brand/logo.svg" のように設定する。
   * null の間は社名テキストを表示する。手順は public/brand/README.md。
   */
  logoSrc: null as string | null,
};
```

`lib/navigation.ts`:
```ts
import { ClipboardList, LayoutDashboard, Palette, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/orders", label: "受注案件", icon: ClipboardList },
  { href: "/catalog", label: "部品カタログ", icon: Palette },
];

/** href 自身、またはその配下のページにいるか */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
```

`components/brand/Logo.tsx`:
```tsx
import { brand } from "@/lib/brand";

export function Logo({ src = brand.logoSrc }: { src?: string | null }) {
  if (src) {
    // SVG ロゴは画像最適化が不要なため next/image ではなく img を使う
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={brand.companyName} className="h-6 w-auto" />;
  }
  return (
    <span className="font-heading text-base font-bold text-primary">
      {brand.shortName}
    </span>
  );
}
```

`public/brand/README.md`:
```md
# ロゴの置き場所

1. 企画部が管理する正式ロゴ（SVG）をこのフォルダに `logo.svg` という名前で置く
2. `lib/brand.ts` の `logoSrc` を `"/brand/logo.svg"` に変更する
3. `npm run dev` でサイドバー左上に表示されることを確認する

ロゴの色・比率を加工しないこと。使用ルールは企画部の資料に従う。
```

- [ ] **Step 4: 見出し帯とデータ保持を実装**

`components/layout/PageHeader.tsx`:
```tsx
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

`components/orders/OrdersProvider.tsx`:
```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Order } from "@/lib/schema";

type OrdersContextValue = {
  orders: Order[];
  getOrder: (id: string) => Order | undefined;
  updateOrder: (order: Order) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

/**
 * 受注データをメモリ上で保持する。DB 接続はこのひな形の範囲外のため、
 * ページを再読み込みすると data/orders.json の初期状態に戻る。
 */
export function OrdersProvider({
  initialOrders,
  children,
}: {
  initialOrders: Order[];
  children: ReactNode;
}) {
  const [orders, setOrders] = useState(initialOrders);

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const updateOrder = useCallback((next: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === next.id ? next : o)));
  }, []);

  const value = useMemo(
    () => ({ orders, getOrder, updateOrder }),
    [orders, getOrder, updateOrder],
  );

  return <OrdersContext value={value}>{children}</OrdersContext>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders は OrdersProvider の内側で使ってください");
  }
  return ctx;
}
```

- [ ] **Step 5: 通ることを確認**

Run: `npx vitest run __tests__/shell.test.tsx`
Expected: 全 PASS

- [ ] **Step 6: サイドバーと枠を実装**

`components/layout/AppSidebar.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { brand } from "@/lib/brand";
import { isActivePath, navItems } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col gap-0.5 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <Logo />
          <span className="text-xs text-muted-foreground">{brand.appName}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={isActivePath(pathname, href)}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

`components/layout/AppShell.tsx`:
```tsx
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { brand } from "@/lib/brand";

/** 業務画面の共通枠。PC ではサイドバー常時表示、768px 未満では引き出しになる */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex h-12 items-center gap-2 border-b bg-card px-4">
          <SidebarTrigger aria-label="メニューの開閉" />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">{brand.companyName}</span>
        </header>
        <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

`app/(app)/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OrdersProvider } from "@/components/orders/OrdersProvider";
import { getInitialOrders } from "@/lib/data";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <OrdersProvider initialOrders={getInitialOrders()}>
      <AppShell>{children}</AppShell>
    </OrdersProvider>
  );
}
```

`app/(app)/dashboard/page.tsx`（Task 9 で置き換える仮ページ）:
```tsx
import { PageHeader } from "@/components/layout/PageHeader";

export default function DashboardPage() {
  return <PageHeader title="ダッシュボード" />;
}
```

`app/page.tsx`（全置換）:
```tsx
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dashboard");
}
```

`__tests__/smoke.test.ts` の2つ目のテストを次に置き換える（トップはリダイレクトのみになったため）:
```ts
  it("ダッシュボードのモジュールを読み込める", async () => {
    const mod = await import("../app/(app)/dashboard/page");
    expect(mod.default).toBeTypeOf("function");
  });
```

- [ ] **Step 7: テスト・lint・check:design・ビルド**

Run: `npm run test && npm run lint && npm run check:design && npm run build`
Expected: すべて成功

- [ ] **Step 8: 画面確認**

Run: `npm run dev` → `http://localhost:3000` を開く
Expected: `/dashboard` に移動し、左にサイドバー（「京阪工技社」の青文字・3項目）、ダッシュボードの項目が選択状態（淡い青地に青文字）

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: ロゴ・サイドバー・受注データ保持を含むアプリの枠を追加"
```

---

### Task 7: 一覧画面（表＋検索・絞り込み）

**Files:**
- Create: `lib/status.ts`, `components/orders/StatusBadge.tsx`, `components/orders/OrderTable.tsx`, `components/orders/OrdersView.tsx`, `app/(app)/orders/page.tsx`
- Test: `__tests__/order-table.test.tsx`

**Interfaces:**
- Consumes: `filterOrders`、`StatusFilter`、`ORDER_STATUSES`、`useOrders`、`formatYen`、`formatDate`、`PageHeader`
- Produces:
  - `STATUS_APPEARANCE: Record<OrderStatus, { badge: "info" | "default" | "success" | "warning"; color: string }>`（color は `"var(--info)"` 等）
  - `<StatusBadge status: OrderStatus />`
  - `<OrderTable orders: Order[] />`

- [ ] **Step 1: 失敗するテストを書く**

`__tests__/order-table.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderTable } from "@/components/orders/OrderTable";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { makeOrder } from "./fixtures";

const orders = [
  makeOrder({ id: "ORD-2026-0001", title: "カルテ電子化", customerName: "湖南中央病院", amount: 3200000 }),
  makeOrder({ id: "ORD-2026-0002", title: "パンフレット増刷", customerName: "株式会社びわこ精機", status: "完了" }),
];

describe("StatusBadge", () => {
  it.each([
    ["受付", "bg-info"],
    ["作業中", "bg-primary"],
    ["完了", "bg-success"],
    ["遅延", "bg-warning"],
  ] as const)("%s は %s（赤は使わない）", (status, cls) => {
    render(<StatusBadge status={status} />);
    const el = screen.getByText(status);
    expect(el).toHaveClass(cls);
    expect(el).not.toHaveClass("bg-destructive");
  });
});

describe("OrderTable", () => {
  it("全件と件数を表示し、案件名は詳細へのリンク", () => {
    render(<OrderTable orders={orders} />);
    expect(screen.getByText("2件")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "カルテ電子化" })).toHaveAttribute("href", "/orders/ORD-2026-0001");
    expect(screen.getByText("3,200,000円")).toBeInTheDocument();
  });

  it("キーワードで絞り込む", async () => {
    const user = userEvent.setup();
    render(<OrderTable orders={orders} />);
    await user.type(screen.getByLabelText("キーワード検索"), "病院");
    expect(screen.getByText("1件")).toBeInTheDocument();
    expect(screen.queryByText("パンフレット増刷")).not.toBeInTheDocument();
  });

  it("0件なら空状態を出し、条件クリアで全件に戻る", async () => {
    const user = userEvent.setup();
    render(<OrderTable orders={orders} />);
    await user.type(screen.getByLabelText("キーワード検索"), "存在しない案件");
    const table = screen.getByRole("table");
    expect(within(table).getByText("条件に一致する案件がありません")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "条件をクリア" }));
    expect(screen.getByLabelText("キーワード検索")).toHaveValue("");
    expect(screen.getByText("2件")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 失敗を確認**

Run: `npx vitest run __tests__/order-table.test.tsx`
Expected: FAIL（モジュールが見つからない）

- [ ] **Step 3: 状態の見た目とバッジを実装**

`lib/status.ts`:
```ts
import type { OrderStatus } from "@/lib/schema";

/**
 * 状態ごとの色。バッジとグラフで共通に使う。
 * 赤（destructive）は削除・エラー専用のため、遅延も warning（黄）で表す。
 */
export const STATUS_APPEARANCE: Record<
  OrderStatus,
  { badge: "info" | "default" | "success" | "warning"; color: string }
> = {
  受付: { badge: "info", color: "var(--info)" },
  作業中: { badge: "default", color: "var(--primary)" },
  完了: { badge: "success", color: "var(--success)" },
  遅延: { badge: "warning", color: "var(--warning)" },
};
```

`components/orders/StatusBadge.tsx`:
```tsx
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/schema";
import { STATUS_APPEARANCE } from "@/lib/status";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={STATUS_APPEARANCE[status].badge}>{status}</Badge>;
}
```

- [ ] **Step 4: 一覧表を実装**

`components/orders/OrderTable.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatYen } from "@/lib/format";
import { filterOrders, type StatusFilter } from "@/lib/orders";
import { ORDER_STATUSES, type Order } from "@/lib/schema";

const STATUS_OPTIONS: StatusFilter[] = ["すべて", ...ORDER_STATUSES];

export function OrderTable({ orders }: { orders: Order[] }) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("すべて");
  const visible = filterOrders(orders, { keyword, status });

  const clear = () => {
    setKeyword("");
    setStatus("すべて");
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="キーワード検索"
              placeholder="案件名・顧客名・受注番号・担当者"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) =>
              setStatus(STATUS_OPTIONS.find((s) => s === v) ?? "すべて")
            }
          >
            <SelectTrigger aria-label="状態で絞り込み" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground tabular-nums">
            {visible.length}件
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>受注番号</TableHead>
              <TableHead>案件名</TableHead>
              <TableHead>顧客名</TableHead>
              <TableHead>種別</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>納期</TableHead>
              <TableHead className="text-right">金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-muted-foreground">
                      条件に一致する案件がありません
                    </span>
                    <Button variant="outline" size="sm" onClick={clear}>
                      条件をクリア
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visible.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {order.id}
                  </TableCell>
                  <TableCell className="max-w-64 truncate font-medium">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {order.title}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-56 truncate">
                    {order.customerName}
                  </TableCell>
                  <TableCell>{order.serviceType}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatDate(order.dueDate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatYen(order.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: 画面を実装**

`components/orders/OrdersView.tsx`:
```tsx
"use client";

import { OrderTable } from "@/components/orders/OrderTable";
import { useOrders } from "@/components/orders/OrdersProvider";

export function OrdersView() {
  const { orders } = useOrders();
  return <OrderTable orders={orders} />;
}
```

`app/(app)/orders/page.tsx`:
```tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { OrdersView } from "@/components/orders/OrdersView";

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="受注案件"
        description="スキャニング・印刷・製本の受注案件の一覧です。案件名を押すと詳細を開きます。"
      />
      <OrdersView />
    </>
  );
}
```

- [ ] **Step 6: テスト・チェック**

Run: `npm run test && npm run lint && npm run check:design`
Expected: すべて成功

- [ ] **Step 7: 画面確認**

Run: `npm run dev` → `/orders`
Expected: 12件の表。状態バッジが 水色（受付）/青（作業中）/緑（完了）/黄（遅延）。「状態で絞り込み」で「遅延」を選ぶと2件。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: 受注案件の一覧画面（検索・絞り込み・空状態）を追加"
```

---

### Task 8: 詳細＋編集フォーム画面

**Files:**
- Create: `hooks/use-unsaved-changes-guard.ts`, `components/orders/OrderEditForm.tsx`, `components/orders/OrderDetail.tsx`, `app/(app)/orders/[id]/page.tsx`, `app/(app)/orders/[id]/not-found.tsx`
- Test: `__tests__/unsaved-guard.test.tsx`, `__tests__/order-edit-form.test.tsx`

**Interfaces:**
- Consumes: `parseOrderForm`、`toFormValues`、`OrderFormValues`、`OrderFormErrors`、`SERVICE_TYPES`、`ORDER_STATUSES`、`useOrders`、`getInitialOrders`、`StatusBadge`、`PageHeader`、`formatYen`
- Produces:
  - `UNSAVED_MESSAGE: string`、`useUnsavedChangesGuard(when: boolean): void`
  - `<OrderEditForm order: Order; onSave: (order: Order) => void />`
  - `<OrderDetail id: string />`

- [ ] **Step 1: 失敗するテストを書く（離脱ガード）**

`__tests__/unsaved-guard.test.tsx`:
```tsx
import { afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { UNSAVED_MESSAGE, useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

function Harness({ dirty }: { dirty: boolean }) {
  useUnsavedChangesGuard(dirty);
  return <a href="/orders">一覧へ</a>;
}

function clickLink() {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
  screen.getByText("一覧へ").dispatchEvent(event);
  return event;
}

afterEach(() => vi.restoreAllMocks());

describe("useUnsavedChangesGuard", () => {
  it("未変更ならリンクで確認を出さない", () => {
    const confirm = vi.spyOn(window, "confirm");
    render(<Harness dirty={false} />);
    expect(clickLink().defaultPrevented).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("未保存でリンクを押すと確認し、キャンセルなら移動を止める", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Harness dirty />);
    expect(clickLink().defaultPrevented).toBe(true);
    expect(confirm).toHaveBeenCalledWith(UNSAVED_MESSAGE);
  });

  it("確認で OK なら移動を止めない", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Harness dirty />);
    expect(clickLink().defaultPrevented).toBe(false);
  });

  it("未保存でタブを閉じる・再読み込みするとブラウザの確認を出す", () => {
    render(<Harness dirty />);
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("未変更ならタブを閉じても確認しない", () => {
    render(<Harness dirty={false} />);
    const event = new Event("beforeunload", { cancelable: true });
    fireEvent(window, event);
    expect(event.defaultPrevented).toBe(false);
  });
});
```

- [ ] **Step 2: 失敗を確認**

Run: `npx vitest run __tests__/unsaved-guard.test.tsx`
Expected: FAIL（モジュールが見つからない）

- [ ] **Step 3: 離脱ガードを実装**

`hooks/use-unsaved-changes-guard.ts`:
```ts
import { useEffect } from "react";

export const UNSAVED_MESSAGE =
  "保存されていない変更があります。このページを離れますか？";

/**
 * 未保存の変更があるとき、ページ離脱の前に確認を出す。
 * - タブを閉じる・再読み込み: ブラウザ標準の確認（beforeunload）
 * - 画面内のリンク（サイドバー・戻るリンク等）: window.confirm
 *
 * リンクはキャプチャ段階で先に受け取り、キャンセル時は Next.js の Link に届く前に止める。
 */
export function useUnsavedChangesGuard(when: boolean): void {
  useEffect(() => {
    if (!when) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 古いブラウザ向け。値の内容は表示されない
      event.returnValue = "";
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor =
        event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      if (!window.confirm(UNSAVED_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [when]);
}
```

- [ ] **Step 4: 通ることを確認**

Run: `npx vitest run __tests__/unsaved-guard.test.tsx`
Expected: 全 PASS

- [ ] **Step 5: 失敗するテストを書く（編集フォーム）**

`__tests__/order-edit-form.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderEditForm } from "@/components/orders/OrderEditForm";
import { makeOrder } from "./fixtures";

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

function setup() {
  const onSave = vi.fn();
  const user = userEvent.setup();
  render(<OrderEditForm order={makeOrder()} onSave={onSave} />);
  return { onSave, user };
}

describe("OrderEditForm", () => {
  it("未変更のうちは保存・取り消しボタンが押せない", () => {
    setup();
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "変更を取り消す" })).toBeDisabled();
  });

  it("変更すると保存でき、保存後は再び未変更扱いになる", async () => {
    const { onSave, user } = setup();
    const title = screen.getByLabelText("案件名");
    await user.clear(title);
    await user.type(title, "公文書スキャニング（追加分）");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).toHaveBeenCalledWith(makeOrder({ title: "公文書スキャニング（追加分）" }));
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });

  it("全角・カンマ付きの金額を数値として保存する", async () => {
    const { onSave, user } = setup();
    const amount = screen.getByLabelText("金額（円）");
    await user.clear(amount);
    await user.type(amount, "１２，０００");
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledWith(makeOrder({ amount: 12000 }));
  });

  it("入力エラーがあると項目の下に理由を出し、保存しない", async () => {
    const { onSave, user } = setup();
    await user.clear(screen.getByLabelText("案件名"));
    await user.clear(screen.getByLabelText("金額（円）"));
    await user.type(screen.getByLabelText("金額（円）"), "-5");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("案件名を入力してください")).toBeInTheDocument();
    expect(screen.getByText("金額は0以上で入力してください")).toBeInTheDocument();
    expect(screen.getByLabelText("案件名")).toHaveAttribute("aria-invalid", "true");
  });

  it("変更を取り消すと元の値に戻る", async () => {
    const { user } = setup();
    const title = screen.getByLabelText("案件名");
    await user.type(title, "あ");
    await user.click(screen.getByRole("button", { name: "変更を取り消す" }));
    expect(title).toHaveValue("公文書スキャニング");
  });
});
```

- [ ] **Step 6: 失敗を確認**

Run: `npx vitest run __tests__/order-edit-form.test.tsx`
Expected: FAIL（モジュールが見つからない）

- [ ] **Step 7: 編集フォームを実装**

`components/orders/OrderEditForm.tsx`:
```tsx
"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import {
  ORDER_FORM_KEYS,
  parseOrderForm,
  toFormValues,
  type OrderFormErrors,
  type OrderFormValues,
} from "@/lib/order-form";
import { ORDER_STATUSES, SERVICE_TYPES, type Order } from "@/lib/schema";

type OrderEditFormProps = {
  order: Order;
  onSave: (order: Order) => void;
};

/** 保存ボタン方式の編集フォーム。保存を押すまで変更は確定しない */
export function OrderEditForm({ order, onSave }: OrderEditFormProps) {
  const [baseline, setBaseline] = useState(() => toFormValues(order));
  const [values, setValues] = useState(baseline);
  const [errors, setErrors] = useState<OrderFormErrors>({});

  const dirty = ORDER_FORM_KEYS.some((key) => values[key] !== baseline[key]);
  useUnsavedChangesGuard(dirty);

  const set = (key: keyof OrderFormValues) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseOrderForm(order.id, values);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    const saved = toFormValues(result.data);
    onSave(result.data);
    setBaseline(saved);
    setValues(saved);
    setErrors({});
    toast.success("保存しました");
  };

  const handleReset = () => {
    setValues(baseline);
    setErrors({});
  };

  const textField = (
    key: keyof OrderFormValues,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <Field data-invalid={!!errors[key] || undefined}>
      <FieldLabel htmlFor={key}>{label}</FieldLabel>
      <Input
        id={key}
        value={values[key]}
        onChange={(e) => set(key)(e.target.value)}
        aria-invalid={!!errors[key] || undefined}
        {...props}
      />
      <FieldError>{errors[key]}</FieldError>
    </Field>
  );

  const selectField = (
    key: "serviceType" | "status",
    label: string,
    options: readonly string[],
  ) => (
    <Field data-invalid={!!errors[key] || undefined}>
      <FieldLabel htmlFor={key}>{label}</FieldLabel>
      <Select value={values[key]} onValueChange={(v) => set(key)(v ?? "")}>
        <SelectTrigger id={key} className="w-full" aria-invalid={!!errors[key] || undefined}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError>{errors[key]}</FieldError>
    </Field>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardContent>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">{textField("title", "案件名")}</div>
            {textField("customerName", "顧客名")}
            {textField("assignee", "担当者")}
            {selectField("serviceType", "種別", SERVICE_TYPES)}
            {selectField("status", "状態", ORDER_STATUSES)}
            {textField("quantity", "数量", { inputMode: "numeric" })}
            {textField("amount", "金額（円）", { inputMode: "numeric" })}
            {textField("receivedAt", "受付日", { type: "date" })}
            {textField("dueDate", "納期", { type: "date" })}
            <Field className="md:col-span-2" data-invalid={!!errors.note || undefined}>
              <FieldLabel htmlFor="note">備考</FieldLabel>
              <Textarea
                id="note"
                rows={4}
                value={values.note}
                onChange={(e) => set("note")(e.target.value)}
                aria-invalid={!!errors.note || undefined}
              />
              <FieldError>{errors.note}</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="outline" disabled={!dirty} onClick={handleReset}>
            変更を取り消す
          </Button>
          <Button type="submit" disabled={!dirty}>
            保存
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```

- [ ] **Step 8: 通ることを確認**

Run: `npx vitest run __tests__/order-edit-form.test.tsx`
Expected: 全 PASS

- [ ] **Step 9: 詳細画面と 404 を実装**

`components/orders/OrderDetail.tsx`:
```tsx
"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderEditForm } from "@/components/orders/OrderEditForm";
import { useOrders } from "@/components/orders/OrdersProvider";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Button } from "@/components/ui/button";

export function OrderDetail({ id }: { id: string }) {
  const { getOrder, updateOrder } = useOrders();
  const order = getOrder(id);

  if (!order) {
    return <p className="text-muted-foreground">受注案件 {id} は見つかりませんでした。</p>;
  }

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/orders" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          一覧に戻る
        </Button>
      </div>
      <PageHeader
        title={order.title}
        description={`${order.id}　${order.customerName}`}
        actions={<StatusBadge status={order.status} />}
      />
      <OrderEditForm key={order.id} order={order} onSave={updateOrder} />
    </>
  );
}
```

`app/(app)/orders/[id]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { getInitialOrders } from "@/lib/data";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getInitialOrders().some((o) => o.id === id)) notFound();
  return <OrderDetail id={id} />;
}
```

`app/(app)/orders/[id]/not-found.tsx`:
```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="font-heading text-2xl font-bold">案件が見つかりません</h1>
      <p className="text-muted-foreground">
        受注番号が間違っているか、削除された可能性があります。
      </p>
      <Button variant="outline" render={<Link href="/orders" />}>
        受注案件の一覧へ
      </Button>
    </div>
  );
}
```

注意: Next.js 16 では `params` は Promise。書く前に `node_modules/next/dist/docs/` の dynamic routes と `not-found` の記述を確認し、差異があればそちらに合わせる。

- [ ] **Step 10: テスト・チェック・ビルド**

Run: `npm run test && npm run lint && npm run check:design && npm run build`
Expected: すべて成功

- [ ] **Step 11: 画面確認**

Run: `npm run dev`
- `/orders/ORD-2026-0001` → フォームが表示され「保存」は押せない
- 金額を `１２，０００` にして保存 → 「保存しました」が上部に出る。一覧に戻ると 12,000円 になっている
- 案件名を変更したままサイドバーの「ダッシュボード」を押す → 確認が出る。キャンセルで留まる
- `/orders/ORD-9999-9999` → 「案件が見つかりません」

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: 受注案件の詳細・編集フォーム（保存ボタン方式・離脱確認）を追加"
```

---

### Task 9: ダッシュボード

**Files:**
- Create: `components/dashboard/StatCard.tsx`, `components/dashboard/StatusChart.tsx`, `components/dashboard/DashboardView.tsx`
- Modify: `app/(app)/dashboard/page.tsx`（全置換）
- Test: `__tests__/dashboard.test.tsx`

**Interfaces:**
- Consumes: `summarizeOrders`、`OrderSummary`、`STATUS_APPEARANCE`、`useOrders`、`formatYen`、`formatNumber`、shadcn `ChartContainer`/`ChartTooltip`/`ChartTooltipContent`/`ChartConfig`
- Produces: `<StatCard label: string; value: string; hint?: string; tone?: "default" | "warning" />`、`<StatusChart data: OrderSummary["byStatus"] />`

- [ ] **Step 1: 失敗するテストを書く**

`__tests__/dashboard.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/dashboard/StatCard";

describe("StatCard", () => {
  it("ラベル・値・補足を表示する", () => {
    render(<StatCard label="受注金額合計" value="7,173,500円" hint="全案件" />);
    expect(screen.getByText("受注金額合計")).toBeInTheDocument();
    expect(screen.getByText("7,173,500円")).toHaveClass("tabular-nums");
    expect(screen.getByText("全案件")).toBeInTheDocument();
  });

  it("warning は注意色の目印を付ける（赤は使わない）", () => {
    render(<StatCard label="遅延" value="2件" tone="warning" />);
    const card = screen.getByText("遅延").closest("[data-slot=card]");
    expect(card).toHaveAttribute("data-tone", "warning");
    expect(card?.className).not.toMatch(/destructive/);
  });
});
```

- [ ] **Step 2: 失敗を確認**

Run: `npx vitest run __tests__/dashboard.test.tsx`
Expected: FAIL（モジュールが見つからない）

- [ ] **Step 3: 数字カードを実装**

`components/dashboard/StatCard.tsx`:
```tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  /** warning は左端に注意色の帯を付ける */
  tone?: "default" | "warning";
};

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <Card
      data-tone={tone}
      className={cn(tone === "warning" && "border-l-4 border-l-warning")}
    >
      <CardContent className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-heading text-2xl font-bold tabular-nums">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: 通ることを確認**

Run: `npx vitest run __tests__/dashboard.test.tsx`
Expected: 全 PASS

- [ ] **Step 5: グラフと画面を実装**

`components/dashboard/StatusChart.tsx`:
```tsx
"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { OrderSummary } from "@/lib/orders";
import { STATUS_APPEARANCE } from "@/lib/status";

const chartConfig = {
  count: { label: "件数", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** 状態別の件数。棒の色はバッジと同じ（STATUS_APPEARANCE）にそろえる */
export function StatusChart({ data }: { data: OrderSummary["byStatus"] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="status" tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={4}>
          {data.map((d) => (
            <Cell key={d.status} fill={STATUS_APPEARANCE[d.status].color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
```

`components/dashboard/DashboardView.tsx`:
```tsx
"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { useOrders } from "@/components/orders/OrdersProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatYen } from "@/lib/format";
import { summarizeOrders } from "@/lib/orders";

export function DashboardView() {
  const { orders } = useOrders();
  const summary = summarizeOrders(orders);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="案件数" value={`${formatNumber(summary.total)}件`} />
        <StatCard label="進行中" value={`${formatNumber(summary.inProgress)}件`} hint="受付＋作業中" />
        <StatCard label="遅延" value={`${formatNumber(summary.delayed)}件`} tone={summary.delayed > 0 ? "warning" : "default"} />
        <StatCard label="受注金額合計" value={formatYen(summary.totalAmount)} hint="全案件" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>状態別の件数</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusChart data={summary.byStatus} />
        </CardContent>
      </Card>
    </>
  );
}
```

`app/(app)/dashboard/page.tsx`（全置換）:
```tsx
import { DashboardView } from "@/components/dashboard/DashboardView";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="ダッシュボード" description="受注案件の状況をまとめて確認できます。" />
      <DashboardView />
    </>
  );
}
```

- [ ] **Step 6: テスト・チェック・ビルド**

Run: `npm run test && npm run lint && npm run check:design && npm run build`
Expected: すべて成功

- [ ] **Step 7: 画面確認**

Run: `npm run dev` → `/dashboard`
Expected: 案件数 12件 / 進行中 6件 / 遅延 2件（左に黄色の帯）/ 受注金額合計 7,173,500円。棒グラフは 水色・青・緑・黄 で 3/3/4/2。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: ダッシュボード（数字カード・状態別グラフ）を追加"
```

---

### Task 10: 部品カタログ

**Files:**
- Create: `components/catalog/TokenSwatch.tsx`, `components/catalog/CatalogSection.tsx`, `app/(app)/catalog/page.tsx`
- Test: `__tests__/catalog.test.tsx`

**Interfaces:**
- Consumes: shadcn 部品、`StatusBadge`、`ORDER_STATUSES`、`PageHeader`
- Produces: `<TokenSwatch name: string; className: string; description: string />`、`<CatalogSection title: string; description?: string; children />`

- [ ] **Step 1: 失敗するテストを書く**

`__tests__/catalog.test.tsx`:
```tsx
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CatalogPage from "@/app/(app)/catalog/page";
import { TokenSwatch } from "@/components/catalog/TokenSwatch";

afterEach(() => vi.restoreAllMocks());

describe("TokenSwatch", () => {
  it("CSS 変数の実際の値を読んで表示する", async () => {
    // jsdom は CSS 変数の計算値を返さないため getComputedStyle を差し替える
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (prop: string) => (prop === "--primary" ? " #0056A8" : ""),
    } as unknown as CSSStyleDeclaration);
    render(<TokenSwatch name="primary" className="bg-primary" description="メイン" />);
    expect(await screen.findByText("#0056A8")).toBeInTheDocument();
    expect(screen.getByText("--primary")).toBeInTheDocument();
  });
});

describe("部品カタログ", () => {
  it("主要な節がそろっている", () => {
    render(<CatalogPage />);
    for (const title of ["色", "文字", "角丸", "ボタン", "状態バッジ", "入力", "表"]) {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument();
    }
  });

  it("削除ボタンは赤、状態バッジに赤はない", () => {
    render(<CatalogPage />);
    expect(screen.getByRole("button", { name: "削除する" })).toHaveClass("bg-destructive");
    for (const s of ["受付", "作業中", "完了", "遅延"]) {
      expect(screen.getAllByText(s)[0]).not.toHaveClass("bg-destructive");
    }
  });
});
```

- [ ] **Step 2: 失敗を確認**

Run: `npx vitest run __tests__/catalog.test.tsx`
Expected: FAIL（モジュールが見つからない）

- [ ] **Step 3: カタログ用の部品を実装**

`components/catalog/TokenSwatch.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TokenSwatchProps = {
  /** CSS 変数名（-- を除く） */
  name: string;
  /** 見本の塗りに使う Tailwind クラス（例: "bg-primary"）。Tailwind が検出できるよう文字列で渡す */
  className: string;
  description: string;
};

/** globals.css の値を実行時に読んで表示する。値をここに二重に書かないため */
export function TokenSwatch({ name, className, description }: TokenSwatchProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(
      getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim(),
    );
  }, [name]);

  return (
    <div className="flex items-center gap-3">
      <div className={cn("size-10 shrink-0 rounded-md border", className)} />
      <div className="flex min-w-0 flex-col">
        <code className="font-mono text-sm">--{name}</code>
        <span className="text-xs text-muted-foreground">
          {description}
          {value && <> ・ <span className="font-mono">{value}</span></>}
        </span>
      </div>
    </div>
  );
}
```

注意: `useEffect` 内の `setValue` は外部（DOM）の値の読み取りで、派生 state の複製ではないため許容する。lint の `react-hooks/set-state-in-effect` が警告する場合は、該当行に `// eslint-disable-next-line react-hooks/set-state-in-effect -- DOM の CSS 変数を読むため` を付ける。テストの `findByText("#0056A8")` は `<span className="font-mono">` の中身と一致する。

`components/catalog/CatalogSection.tsx`:
```tsx
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CatalogSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle render={<h2 />}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
```

注意: base-nova の `CardTitle` が `render` を受け取らない（`div` 固定）場合は、`card.tsx` を編集せずに `<CardTitle><h2 className="font-heading">{title}</h2></CardTitle>` と入れ子にする。見出しレベル2として取得できることがテストの条件。

- [ ] **Step 4: カタログページを実装**

`app/(app)/catalog/page.tsx`:
```tsx
import { CatalogSection } from "@/components/catalog/CatalogSection";
import { TokenSwatch } from "@/components/catalog/TokenSwatch";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUSES } from "@/lib/schema";

const COLOR_TOKENS = [
  { name: "primary", className: "bg-primary", description: "ブランド青。主ボタン・リンク・選択中" },
  { name: "secondary", className: "bg-secondary", description: "淡い青。控えめな強調面" },
  { name: "background", className: "bg-background", description: "ページの地" },
  { name: "card", className: "bg-card", description: "カード・表の面" },
  { name: "muted", className: "bg-muted", description: "控えめな面" },
  { name: "muted-foreground", className: "bg-muted-foreground", description: "補助の文字" },
  { name: "border", className: "bg-border", description: "区切り線" },
  { name: "input", className: "bg-input", description: "入力欄の枠" },
  { name: "info", className: "bg-info", description: "情報（受付）" },
  { name: "success", className: "bg-success", description: "成功（完了）" },
  { name: "warning", className: "bg-warning", description: "注意（遅延）" },
  { name: "destructive", className: "bg-destructive", description: "削除・エラー専用" },
];

const RADII = [
  { className: "rounded-sm", label: "sm：小さな印" },
  { className: "rounded-md", label: "md：行・メニュー" },
  { className: "rounded-lg", label: "lg：ボタン・入力・島" },
  { className: "rounded-xl", label: "xl：カード" },
];

export default function CatalogPage() {
  return (
    <>
      <PageHeader
        title="部品カタログ"
        description="このデザインシステムの色・文字・部品の一覧です。新しい画面はここにある部品で組み立てます。"
      />

      <CatalogSection title="色" description="色は必ずこの役割名で指定します（bg-primary など）。値は app/globals.css が正本です。">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_TOKENS.map((t) => (
            <TokenSwatch key={t.name} {...t} />
          ))}
        </div>
      </CatalogSection>

      <CatalogSection title="文字" description="英字・数字は Inter、日本語は Noto Sans JP。表の数字は等幅（tabular-nums）。">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-2xl font-bold">見出し1　受注案件 ORD-2026-0001</p>
          <p className="font-heading text-lg font-bold">見出し2　状態別の件数</p>
          <p>本文　スキャニング・オンデマンド印刷・製本加工の受注を管理します。</p>
          <p className="text-sm text-muted-foreground">補足　最終更新 2026/09/25</p>
          <p className="tabular-nums">等幅数字　1,111,111円 / 8,888,888円</p>
        </div>
      </CatalogSection>

      <CatalogSection title="角丸" description="基準は 6px。部品の大きさに応じて段階的に使い分けます。">
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <div key={r.className} className="flex flex-col items-center gap-2">
              <div className={`size-16 border-2 border-primary bg-secondary ${r.className}`} />
              <span className="text-xs text-muted-foreground">{r.label}</span>
            </div>
          ))}
        </div>
      </CatalogSection>

      <CatalogSection title="ボタン" description="主操作は1画面に1つ（塗りの青）。赤は削除専用です。">
        <div className="flex flex-wrap items-center gap-2">
          <Button>保存</Button>
          <Button variant="outline">キャンセル</Button>
          <Button variant="secondary">下書き保存</Button>
          <Button variant="ghost">詳細</Button>
          <Button variant="link">リンク</Button>
          <Button variant="destructive">削除する</Button>
          <Button disabled>押せない状態</Button>
        </div>
      </CatalogSection>

      <CatalogSection title="状態バッジ" description="状態の色はこの4種に固定します。赤は使いません。">
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </CatalogSection>

      <CatalogSection title="入力" description="ラベルは入力欄の上。エラーは入力欄の下に赤字で理由を示します。">
        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="catalog-name">顧客名</FieldLabel>
            <Input id="catalog-name" placeholder="例：湖東市役所 総務課" />
            <FieldDescription>正式名称で入力します。</FieldDescription>
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="catalog-amount">金額（円）</FieldLabel>
            <Input id="catalog-amount" defaultValue="-5" aria-invalid />
            <FieldError>金額は0以上で入力してください</FieldError>
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="catalog-note">備考</FieldLabel>
            <Textarea id="catalog-note" rows={3} placeholder="作業上の注意など" />
          </Field>
        </div>
      </CatalogSection>

      <CatalogSection title="表" description="数値は右寄せ・等幅。長い文字は省略（…）して1行に収めます。">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>受注番号</TableHead>
              <TableHead>案件名</TableHead>
              <TableHead>状態</TableHead>
              <TableHead className="text-right">金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-muted-foreground tabular-nums">ORD-2026-0001</TableCell>
              <TableCell>公文書スキャニング（第3期）</TableCell>
              <TableCell><StatusBadge status="作業中" /></TableCell>
              <TableCell className="text-right tabular-nums">1,860,000円</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground tabular-nums">ORD-2026-0004</TableCell>
              <TableCell>設計図面 カラー出力</TableCell>
              <TableCell><StatusBadge status="遅延" /></TableCell>
              <TableCell className="text-right tabular-nums">96,000円</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CatalogSection>
    </>
  );
}
```

- [ ] **Step 5: テスト・チェック・ビルド**

Run: `npm run test && npm run lint && npm run check:design && npm run build`
Expected: すべて成功

- [ ] **Step 6: 画面確認**

Run: `npm run dev` → `/catalog`
Expected: 色見本に実際の値（例 `#0056a8`）が表示される。赤は「削除する」ボタンと destructive 見本、入力エラー文字だけ。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 色・文字・部品を一覧できる部品カタログを追加"
```

---

### Task 11: AI 用ルール（CLAUDE.md・自社スキル）と README

**Files:**
- Modify: `CLAUDE.md`（全置換。実装前から「引き継ぎ」節だけが存在する。下記の内容はその節を含むので、置換後も節が残ることを確認する）
- Create: `.claude/skills/designing-keihan-ui/SKILL.md`, `.claude/skills/designing-keihan-ui/references/coding-rules.md`, `skills-lock.json`（見本からコピー）, `.claude/skills/{shadcn,next-best-practices,vercel-react-best-practices}/`（見本からコピー）
- Modify: `README.md`（全置換。現状は2行のみの初期 README）
- Test: `__tests__/docs.test.ts`

**Interfaces:**
- Consumes: これまでの全タスクのファイル名・コマンド名

- [ ] **Step 1: 失敗するテストを書く**

`__tests__/docs.test.ts`:
```ts
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const root = path.resolve(__dirname, "..");
const read = (p: string) => readFileSync(path.join(root, p), "utf-8");

describe("AI 用ルール", () => {
  it("CLAUDE.md が自社スキルと check:design を案内している", () => {
    const md = read("CLAUDE.md");
    expect(md).toContain("designing-keihan-ui");
    expect(md).toContain("npm run check:design");
    expect(md).toContain("app/globals.css");
  });

  it("CLAUDE.md が技術スタックとデプロイ先を明記している", () => {
    const md = read("CLAUDE.md");
    for (const word of ["base-nova", "lucide-react", "zod", "Vercel", "npx shadcn@latest add", "@theme inline", "HANDOFF.md"]) {
      expect(md, word).toContain(word);
    }
  });

  it("tailwind.config.* を置かない（v4 は CSS の @theme で設定する）", () => {
    for (const f of ["tailwind.config.js", "tailwind.config.ts", "tailwind.config.mjs", "tailwind.config.cjs"]) {
      expect(existsSync(path.join(root, f)), f).toBe(false);
    }
  });

  it("自社スキルの name がディレクトリ名と一致する", () => {
    const skill = read(".claude/skills/designing-keihan-ui/SKILL.md");
    expect(skill).toMatch(/^---\nname: designing-keihan-ui\n/);
  });

  it("スキルが参照するファイルが実在する", () => {
    const skill = read(".claude/skills/designing-keihan-ui/SKILL.md");
    for (const p of ["app/globals.css", "components/ui", "app/(app)/catalog/page.tsx", "lib/status.ts", "references/coding-rules.md"]) {
      expect(skill).toContain(p);
    }
    for (const p of ["app/globals.css", "components/ui", "app/(app)/catalog/page.tsx", "lib/status.ts", ".claude/skills/designing-keihan-ui/references/coding-rules.md"]) {
      expect(existsSync(path.join(root, p)), p).toBe(true);
    }
  });

  it("流用スキルが同梱されている", () => {
    for (const s of ["shadcn", "next-best-practices", "vercel-react-best-practices"]) {
      expect(existsSync(path.join(root, ".claude/skills", s, "SKILL.md")), s).toBe(true);
    }
  });
});
```

- [ ] **Step 2: 失敗を確認**

Run: `npx vitest run __tests__/docs.test.ts`
Expected: FAIL（`CLAUDE.md` がない）

- [ ] **Step 3: 流用スキルをコピー**

```bash
SAMPLE="/Users/kabushikikaishakeihankougishakikakubu/src/【smple】-workspace-ui-kit"
mkdir -p .claude/skills
cp -R "$SAMPLE/.claude/skills/shadcn" "$SAMPLE/.claude/skills/next-best-practices" "$SAMPLE/.claude/skills/vercel-react-best-practices" .claude/skills/
cp "$SAMPLE/skills-lock.json" .
```

- [ ] **Step 4: `CLAUDE.md` を全置換**

```md
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

| スキル | いつ使うか |
|---|---|
| designing-keihan-ui | UI の追加・変更・色・余白・レイアウト・フォーム作業のすべて |
| shadcn | shadcn 部品の追加・カスタマイズ |
| next-best-practices | Next.js 16 のファイル規約・RSC 境界 |
| vercel-react-best-practices | React の性能最適化 |

MUST: Next.js のコードを書く前に `node_modules/next/dist/docs/` の該当ドキュメントを読む。学習データではなくバンドル版が正。

## 編集の方針

IMPORTANT:

- **UI を変更する前に `/designing-keihan-ui` スキルを起動する**
- 土台（色・角丸・フォント）に足りないものがあっても**独断で `globals.css` を変えない**。ユーザーに確認し、企画部への要望として扱う
- 編集は**フォーム＋「保存」ボタン方式**。インライン自動保存・鉛筆アイコン式にしない
- 赤（`destructive`）は**削除・エラー専用**。状態表示や強調に使わない
- **新しい UI 部品は shadcn/ui から追加する**（`npx shadcn@latest add <部品名>`）。自作の部品や他の UI ライブラリで代替しない。shadcn に無い部品が必要なら、作る前にユーザーに確認する
- shadcn 部品の更新は `npx shadcn@latest add ... --diff` で確認。`--overwrite` は本人の明示許可なしに使わない

## コード生成ルール（詳細は designing-keihan-ui スキル）

- 色は役割名トークン（`bg-primary` 等）。`bg-blue-500`・`text-white`・`bg-[#...]`・`"#xxxxxx"` は禁止
- 角丸は `rounded-sm|md|lg|xl`。`rounded-[..]` は禁止
- 子要素の間隔は親で管理（`flex flex-col gap-*`）。`space-y-*` は禁止
- 部品の見た目を呼び出し側の `className` で打ち消さない。部品側に variant を追加する
- 正方形は `size-N`
- base（Base UI）を使用。`asChild` ではなく `render`
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
```

- [ ] **Step 5: 自社スキル `.claude/skills/designing-keihan-ui/SKILL.md` を作成**

```md
---
name: designing-keihan-ui
description: 京阪工技社の業務アプリ（このひな形とそのコピー）で UI を作る・直す作業で、デザインシステム（ブランド色・角丸・部品・フォーム方式）を守らせるスキル。「画面を作りたい」「ボタンを追加したい」「色を変えたい」「表を作りたい」「フォームを追加したい」「レイアウトを直したい」「余白を直したい」と依頼された際に使用する。README のみの編集・テストのみの修正・依存更新では使用しない。
---

# Designing Keihan UI

京阪工技社デザインシステムに沿って UI を作る。**正本を経由しないデザイン変更はしない。**

## 作業前チェック（応答にコピーし、埋めてから作業する）

```
正本の把握:
- [ ] app/globals.css を読み、使えるトークン（色・角丸・フォント）を列挙した
- [ ] components/ui/ を ls し、使える shadcn 部品を列挙した
- [ ] app/(app)/catalog/page.tsx を読み、部品の使い方の手本を確認した
- [ ] 状態を扱うなら lib/status.ts の色対応を確認した
```

## ブランドの約束

| 項目 | 約束 |
|---|---|
| メイン色 | `primary`（#0056A8）。主ボタン・リンク・選択中に使う |
| 赤 | `destructive`（#E60012）は **削除・エラー専用**。強調・状態表示に使わない |
| 状態 | 受付＝`info` / 作業中＝`default` / 完了＝`success` / 遅延＝`warning`（`lib/status.ts`） |
| 地の色 | ページ `background`、カード `card`（白） |
| 角丸 | 基準 6px。`rounded-sm`（印）/`md`（行・メニュー）/`lg`（ボタン・入力・島）/`xl`（カード） |
| 文字 | `font-sans`（Inter＋Noto Sans JP）。見出しは `font-heading font-bold`。数値は `tabular-nums` |
| 主操作 | 1画面に塗りの青ボタンは1つ。他は `outline` / `ghost` |
| 編集 | フォーム＋「保存」ボタン。未保存離脱は `useUnsavedChangesGuard` で確認 |
| 端末 | PC 優先。768px 幅で崩れないこと（表は横スクロール、ページ全体ははみ出さない） |

## コード生成ルール

| 禁止 | 正しい方法 | なぜ |
|---|---|---|
| `bg-blue-500` 等の色番号 | `bg-primary` 等の役割名 | 色の変更が1か所で済む。ブランドのブレを防ぐ |
| `text-white` / `bg-black` | `text-primary-foreground` / `bg-foreground` | 同上 |
| `bg-[#0056A8]` / `"#0056A8"` | トークン / `var(--primary)` | 同上 |
| `rounded-[10px]` | `rounded-lg` 等 | 角丸の段階をそろえる |
| `space-y-*` | `flex flex-col gap-*` | 子が条件で消えても余白が崩れない |
| 呼び出し側 `className` で色・文字サイズ上書き | 部品に variant を追加 | コピペの蔓延を防ぐ |
| `asChild` | `render` | このプロジェクトは base（Base UI） |
| 自前 div のバッジ・区切り線 | `Badge` / `Separator` | アクセシビリティとテーマ連動が組み込み済み |
| インライン自動保存・鉛筆アイコン編集 | フォーム＋保存ボタン | 金額・納期の誤変更を防ぐ |

具体例（正しい書き方／誤った書き方）は [references/coding-rules.md](references/coding-rules.md)。

## 足りないものが出たとき（必ずユーザーに確認）

1. **トークンの穴**（色・余白・角丸が足りない）: 何が足りないか1行で説明し、`globals.css` への追加案を示して確認する。仮に直書きしない
2. **部品の穴**: 既存部品の variant で代替できないか先に試す → shadcn/ui（base-nova）に該当部品があれば `npx shadcn@latest add` で追加する → それでも無理なら新 variant 案を示して確認する。部品ファイルを複製しない。他の UI ライブラリを入れない
3. **パターンの穴**（空状態・エラー・読み込み中などの型がない）: カタログと既存画面を確認し、案を示して確認する
4. **情報設計の穴**（何を表示するか・並び順）: コードを書かずに質問する

土台（`globals.css`）の変更は企画部の判断事項。承認が得られたら、変更後に `npm run test`（コントラスト検証）を通す。

## 出力後セルフレビュー

1. `npm run check:design` が通るか
2. `npm run test` が通るか
3. 間隔は親管理か、色は役割名か、`render` を使っているか
4. 新しい部品・パターンを作ったら `app/(app)/catalog/page.tsx` に見本を追加したか
```

- [ ] **Step 6: `.claude/skills/designing-keihan-ui/references/coding-rules.md` を作成**

````md
# コーディングルール詳細（正しい例／誤った例）

## 色

**Incorrect**
```tsx
<span className="text-green-600">完了</span>
<div className="bg-[#0056A8] text-white">見出し</div>
```

**Correct**
```tsx
<StatusBadge status="完了" />
<div className="bg-primary text-primary-foreground">見出し</div>
```

状態の表示は `StatusBadge`（`lib/status.ts` の対応表）を使う。新しい状態が必要ならユーザーに確認して `lib/status.ts` と `ORDER_STATUSES` を同時に更新する。

## 赤の使いどころ

**Incorrect** — 目立たせたいから赤
```tsx
<Button variant="destructive">今すぐ申し込む</Button>
<Badge variant="destructive">遅延</Badge>
```

**Correct** — 赤は削除とエラーだけ
```tsx
<Button>申し込む</Button>
<StatusBadge status="遅延" />  {/* warning（黄） */}
<Button variant="destructive">削除する</Button>
<FieldError>金額は0以上で入力してください</FieldError>
```

## base（Base UI）の書き方

**Incorrect**
```tsx
<Button asChild><Link href="/orders">一覧へ</Link></Button>
```

**Correct**
```tsx
<Button render={<Link href="/orders" />}>一覧へ</Button>
```

## 余白

**Incorrect**
```tsx
<div className="space-y-4">...</div>
```

**Correct**
```tsx
<div className="flex flex-col gap-4">...</div>
```

## フォーム

- ラベルは `FieldLabel htmlFor` で入力欄と結びつける
- エラーは `FieldError` で入力欄の下に出し、入力欄に `aria-invalid` を付ける
- 数値は `inputMode="numeric"`。全角・カンマを許容して変換する（`lib/order-form.ts` の `toNumber` を参照）
- 保存は `<Button type="submit">保存</Button>`。未変更の間は `disabled`
- 未保存離脱は `useUnsavedChangesGuard(dirty)`

**Incorrect** — 入力と同時に保存
```tsx
<Input value={title} onChange={(e) => save({ title: e.target.value })} />
```

**Correct** — フォームの状態を持ち、保存ボタンで確定
```tsx
<Input id="title" value={values.title} onChange={(e) => set("title")(e.target.value)} />
...
<Button type="submit" disabled={!dirty}>保存</Button>
```

## 表

- 数値列は `className="text-right tabular-nums"`
- 長い文字列のセルは `max-w-* truncate`
- 0件のときは空状態（理由＋「条件をクリア」）を表の中に出す（`components/orders/OrderTable.tsx`）

## 角丸

- 親の角丸 ≧ 子の角丸
- `bg-card` の島は `rounded-lg`（`Card` 本体は `rounded-xl`）
- `rounded-md` は行・メニュー用
````

- [ ] **Step 7: `README.md` を全置換**（既存は「# keihan-design-system / 京阪工技社のデザインシステム」の2行のみ）

````md
# 京阪工技社 デザインシステム（業務アプリひな形）

社内の業務用ウェブアプリ（管理画面・業務ツール）を、会社のブランドに沿った見た目で素早く作るための**ひな形**です。
AI（Claude Code）と一緒に作ることを前提に、AI 向けのルール集も入っています。

## 何が入っているか

| 画面 | URL | 用途 |
|---|---|---|
| ダッシュボード | `/dashboard` | 件数・金額のまとめとグラフ |
| 受注案件 一覧 | `/orders` | 表＋検索・絞り込み |
| 受注案件 詳細 | `/orders/ORD-2026-0001` | 編集フォーム（保存ボタン方式） |
| 部品カタログ | `/catalog` | 色・文字・ボタンなどの見本帳 |

見本データ（受注案件）は架空です。自分の業務に合わせて作り変えてください。

## 動かし方

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 新しいアプリを始めるとき

1. このリポジトリをコピー（テンプレートとして複製）する
2. `lib/brand.ts` の `appName` をアプリ名に変える
3. `data/` と `lib/schema.ts` を自分の業務のデータに作り変える
4. 画面は `app/(app)/` に追加する。部品は `/catalog` にあるものを使う

## デザインの約束（要点）

- メインの色は会社の青 `#0056A8`
- 赤 `#E60012` は**削除とエラーだけ**に使う
- 状態の色：受付＝水色、作業中＝青、完了＝緑、遅延＝黄
- 編集は「入力 → 保存ボタン」で確定する
- パソコン優先。タブレットでも崩れないようにする

詳しくは [設計書](docs/superpowers/specs/2026-09-25-keihan-design-system-design.md) を参照してください。

## 色や部品を足したいとき

色・フォント・角丸（`app/globals.css`）は**企画部が管理**しています。各アプリで勝手に変えず、企画部に要望を出してください。
AI にも同じルールを守らせています（`CLAUDE.md`）。

## チェックコマンド

| コマンド | 内容 |
|---|---|
| `npm run test` | テスト（色のコントラスト＝読みやすさの検証を含む） |
| `npm run check:design` | 色の直書き・角丸のズレを検出 |
| `npm run lint` | コードの書き方チェック |
| `npm run build` | 本番用にビルド |

## 公開（デプロイ）

公開先は **Vercel** です。GitHub のリポジトリを Vercel に接続すると、設定を変えずに `next build` で公開されます。
データは今は見本の JSON をメモリに持っているだけなので、公開しても編集内容は保存されません（再読み込みで元に戻ります）。

## ロゴ

正式ロゴの置き方は [public/brand/README.md](public/brand/README.md) を参照してください。
````

- [ ] **Step 8: テスト確認**

Run: `npm run test`
Expected: 全 PASS

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "docs: AI 用ルール（CLAUDE.md・自社スキル）と README を追加"
```

---

### Task 12: 最終確認（実機・タブレット幅・Review Focus）

**Files:**
- なし（問題が見つかれば該当ファイルを修正）

- [ ] **Step 1: 全チェック**

Run: `npm run format && npm run lint && npm run test && npm run check:design && npm run build`
Expected: すべて成功。`format` で変更が出たらコミットに含める。

- [ ] **Step 2: PC 幅（1280px）で全画面を確認**

Run: `npm run dev`。ブラウザで `/dashboard` `/orders` `/orders/ORD-2026-0001` `/catalog` を開く。
Expected: ブランド青のサイドバー選択表示、フォントは日本語が Noto Sans JP、数字の桁がそろう、コンソールにエラーなし。

- [ ] **Step 3: タブレット幅（768px）で確認（Review Focus 5）**

ブラウザの幅を 768px にして `/orders` を開き、`ORD-2026-0001` の案件名を 80 文字程度に編集・保存してから一覧に戻る。
Expected: ページ全体に横スクロールバーが出ない（`document.documentElement.scrollWidth <= window.innerWidth`）。表だけが横スクロールし、長い案件名は「…」で省略される。サイドバーはアイコン表示または引き出しに切り替わる。

- [ ] **Step 4: Review Focus 1〜4 を実機で確認**

1. `/orders` で「存在しない」と検索 → 空状態と「条件をクリア」
2. 詳細で金額 `１２，０００` → 保存成功。`-5` → 「金額は0以上で入力してください」
3. 未保存でサイドバーのリンク → 確認が出る。タブ再読み込み → ブラウザの確認が出る
4. `/orders/ORD-9999-9999` → 「案件が見つかりません」

- [ ] **Step 5: 問題があれば修正してコミット**

```bash
git add -A
git commit -m "fix: 最終確認で見つかった表示崩れを修正"
```
（修正がなければこのステップは不要）
