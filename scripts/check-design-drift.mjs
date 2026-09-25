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
    console.warn(
      `⚠  ${relative(ROOT, file)}:${d.line}  [${d.rule}] ${d.message}`,
    );
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
