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
    message:
      "任意値の色。globals.css のトークンを使う（足りなければ企画部に相談）",
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
    message:
      "bg-card の島は rounded-lg に揃える（rounded-md は行・メニュー用）",
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
