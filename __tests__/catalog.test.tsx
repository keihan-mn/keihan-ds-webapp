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
