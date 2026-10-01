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
    // 向き・offset 付きの形と、任意値の途中の色（ウェブページ用 keihan-ds-website から移した改良）
    [`<div className="border-t-gray-200">`, "raw-color"],
    [`<div className="hover:border-b-slate-300">`, "raw-color"],
    [`<div className="ring-offset-white">`, "raw-black-white"],
    [`<div className="shadow-[0_0_0_2px_#000]">`, "arbitrary-color"],
    [`<div className="shadow-[0_1px_2px_rgba(0,0,0,0.1)]">`, "arbitrary-color"],
    // Tailwind v4 は色を --color-* の変数としても出力する
    [`  .x { color: var(--color-red-500); }`, "raw-color"],
    [`<p className="text-(--color-red-500)">`, "raw-color"],
    [`<div className="bg-(--color-white)">`, "raw-black-white"],
    // CSS や style 属性の色コード
    [`  .hero { color: #0056a8; }`, "css-hex"],
    [`<p style="color:#fff">`, "css-hex"],
    [`  border: 1px solid #ddd;`, "css-hex"],
    [`  box-shadow: 0 0 0 2px #0056a8;`, "css-hex"],
    [`  background: linear-gradient(#fff, #000);`, "css-hex"],
  ])("%s → %s", (src, rule) => {
    expect(rulesOf(src)).toContain(rule);
  });

  it("行番号を 1 始まりで返す", () => {
    const src = `const a = 1;\n<p className="text-red-600">`;
    expect(findDesignDrift(src)[0]).toMatchObject({
      line: 2,
      rule: "raw-color",
    });
  });

  it.each([
    `<a href="#top">`,
    // 色コードと同じ並びのページ内リンク（#add・#bad・#cafe）と id
    `<a href="#add">追加</a>`,
    `<a href="#bad">`,
    `<Link className="text-primary hover:underline" href="#cafe">`,
    `const NAV = [{ label: "追加", href: "#add" }];`,
    `<section id="back-to-white">`,
    `const url = "https://example.com/#feed";`,
    `<p>受付番号: #1234</p>`,
    // 削除・エラーの赤（業務アプリでは赤い面も削除ボタンに使ってよい）
    `<Button className="bg-destructive">`,
    `<p className="text-destructive">入力してください</p>`,
    // shadcn 部品によくある任意値（色ではない）
    `<div className="w-[min(100%,40rem)] grid-cols-[1fr_auto]">`,
    // 業務アプリは文字サイズの5段階の決まりを使わない
    `<p className="text-sm text-muted-foreground">`,
  ])("誤検出しない: %s", (src) => {
    expect(findDesignDrift(src)).toEqual([]);
  });

  it("複数行の className 指定でも card-radius を検出する", () => {
    const src = `<div>\n  <div\n    className="bg-card\n      rounded-md p-4"\n  >`;
    expect(findDesignDrift(src)).toContainEqual(
      expect.objectContaining({ line: 3, rule: "card-radius" }),
    );
  });

  it("1行の className 指定は二重に報告しない", () => {
    const src = `<div className="bg-card rounded-md">`;
    expect(rulesOf(src).filter((r) => r === "card-radius")).toHaveLength(1);
  });
});
