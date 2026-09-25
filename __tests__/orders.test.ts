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
