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
