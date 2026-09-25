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
    for (const word of [
      "base-nova",
      "lucide-react",
      "zod",
      "Vercel",
      "npx shadcn@latest add",
      "@theme inline",
      "docs/design-system.md",
    ]) {
      expect(md, word).toContain(word);
    }
  });

  it("tailwind.config.* を置かない（v4 は CSS の @theme で設定する）", () => {
    for (const f of [
      "tailwind.config.js",
      "tailwind.config.ts",
      "tailwind.config.mjs",
      "tailwind.config.cjs",
    ]) {
      expect(existsSync(path.join(root, f)), f).toBe(false);
    }
  });

  it("自社スキルの name がディレクトリ名と一致する", () => {
    const skill = read(".claude/skills/designing-keihan-ui/SKILL.md");
    expect(skill).toMatch(/^---\nname: designing-keihan-ui\n/);
  });

  it("スキルが参照するファイルが実在する", () => {
    const skill = read(".claude/skills/designing-keihan-ui/SKILL.md");
    for (const p of [
      "app/globals.css",
      "components/ui",
      "app/(app)/catalog/page.tsx",
      "lib/status.ts",
      "references/coding-rules.md",
    ]) {
      expect(skill).toContain(p);
    }
    for (const p of [
      "app/globals.css",
      "components/ui",
      "app/(app)/catalog/page.tsx",
      "lib/status.ts",
      ".claude/skills/designing-keihan-ui/references/coding-rules.md",
    ]) {
      expect(existsSync(path.join(root, p)), p).toBe(true);
    }
  });

  it.each(["README.md", "CLAUDE.md", "public/brand/README.md"])(
    "%s のリポジトリ内リンクが実在するファイルを指している",
    (file) => {
      const md = read(file);
      const links = [...md.matchAll(/\]\(([^)#\s]+)\)/g)]
        .map((m) => m[1])
        .filter((href) => !/^[a-z]+:/i.test(href));
      for (const href of links) {
        const target = path.join(root, path.dirname(file), href);
        expect(existsSync(target), `${file} → ${href}`).toBe(true);
      }
    },
  );

  it("流用スキルが同梱されている", () => {
    for (const s of [
      "shadcn",
      "next-best-practices",
      "vercel-react-best-practices",
    ]) {
      expect(
        existsSync(path.join(root, ".claude/skills", s, "SKILL.md")),
        s,
      ).toBe(true);
    }
  });
});
