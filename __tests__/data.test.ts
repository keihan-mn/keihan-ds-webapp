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
