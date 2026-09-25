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
