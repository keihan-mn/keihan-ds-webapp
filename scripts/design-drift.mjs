/**
 * デザイン逸脱の検出ルール（純関数）。CLI は check-design-drift.mjs。
 * 色は役割名トークン（bg-primary 等）、角丸は rounded-sm/md/lg/xl だけを使う、という
 * デザインシステムの約束を機械的に確かめる。
 * 見逃しを減らす改良はウェブページ用（keihan-ds-website の scripts/design-drift.mjs）から移した。
 * ウェブページ用だけの決まり（行動ボタンの赤・赤い面の禁止・文字サイズ5段階）は入れない。
 */

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const UTIL =
  "bg|text|border|ring|fill|stroke|from|via|to|outline|divide|decoration|accent|caret|placeholder|shadow";

// border-t- や ring-offset- のように、向き・offset が付いた形も含める
const UTIL_EXT = `(?:${UTIL})(?:-(?:[xytrblse]|offset))?`;
// クラス名の先頭でだけ一致させる（id="back-to-white" の "to-white" を拾わない）
const START = "(?<![\\w-])";

const CARD_RADIUS_MESSAGE =
  "bg-card の島は rounded-lg に揃える（rounded-md は行・メニュー用）";

export const RULES = [
  {
    rule: "raw-color",
    message: "色番号の直書き。bg-primary 等の役割名トークンを使う",
    pattern: new RegExp(
      `${START}${UTIL_EXT}-(?:${PALETTE})-\\d{2,3}\\b|--color-(?:${PALETTE})-\\d{2,3}\\b`,
    ),
  },
  {
    rule: "raw-black-white",
    message: "黒・白の直書き。foreground / card / primary-foreground 等を使う",
    pattern: new RegExp(
      `${START}${UTIL_EXT}-(?:black|white)\\b|--color-(?:black|white)\\b`,
    ),
  },
  {
    rule: "arbitrary-color",
    message:
      "任意値の色。globals.css のトークンを使う（足りなければユーザーに確認）",
    // [] の中のどこかに色がある形（shadow-[0_0_0_2px_#000] など）
    pattern:
      /-\[[^\]\s]*?(?:#[0-9A-Fa-f]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\()/,
  },
  {
    rule: "hex-literal",
    message: "コード内の色コード文字列。CSS 変数（var(--primary) 等）を使う",
    // href="#add"・{ href: "#add" } のようなページ内リンクは除く
    pattern:
      /(?<!\b(?:xlink:)?href\s*[=:]\s*\{?\s*)["'`]#(?:[0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})["'`]/,
  },
  {
    rule: "arbitrary-radius",
    message: "任意値の角丸。rounded-sm / md / lg / xl を使う",
    pattern: /\brounded(?:-[a-z]{1,2})?-\[/,
  },
  {
    rule: "card-radius",
    message: CARD_RADIUS_MESSAGE,
    pattern: /bg-card\b.*\brounded-md\b|\brounded-md\b.*bg-card\b/,
  },
  {
    rule: "css-hex",
    message: "style の色コード直書き。var(--primary) 等の CSS 変数を使う",
    // 「プロパティ名: …値… #xxx」の形。URL（https://…/#xxx）と日本語の「番号: #1234」は除く
    pattern: /[\w-]+\s*:(?!\/\/)[^;"'{}]*#[0-9A-Fa-f]{3,8}\b/,
  },
];

// 複数行にまたがる class="..." / className="..." の中身
const MULTILINE_CLASS = /\bclass(?:Name)?\s*=\s*(["'`])([\s\S]*?)\1/g;

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
  // 行ごとの判定では見えない「複数行の class 指定の中の組み合わせ」を調べる
  for (const m of source.matchAll(MULTILINE_CLASS)) {
    const value = m[2] ?? "";
    if (!value.includes("\n")) continue; // 1行の指定は上で判定済み
    if (/\bbg-card\b/.test(value) && /\brounded-md\b/.test(value)) {
      results.push({
        line: source.slice(0, m.index).split("\n").length,
        rule: "card-radius",
        message: CARD_RADIUS_MESSAGE,
        text: m[0].replace(/\s+/g, " ").trim(),
      });
    }
  }
  return results;
}
