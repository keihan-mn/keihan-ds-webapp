import { describe, it, expect } from "vitest";
import { parseOrderForm, toFormValues } from "@/lib/order-form";
import { makeOrder } from "./fixtures";

const base = toFormValues(makeOrder());

describe("toFormValues", () => {
  it("数値を文字列にする", () => {
    expect(base.amount).toBe("50000");
    expect(base.quantity).toBe("100");
  });
});

describe("parseOrderForm", () => {
  it("正しい入力は Order になる", () => {
    const r = parseOrderForm("ORD-2026-0001", base);
    expect(r).toEqual({ success: true, data: makeOrder() });
  });

  it("全角数字・カンマ・前後の空白を許容する", () => {
    const r = parseOrderForm("ORD-2026-0001", {
      ...base,
      amount: " １２，０００ ",
      quantity: "1,200",
    });
    expect(r.success && r.data.amount).toBe(12000);
    expect(r.success && r.data.quantity).toBe(1200);
  });

  it.each([
    ["amount", "", "金額は数字で入力してください"],
    ["amount", "abc", "金額は数字で入力してください"],
    ["amount", "-1", "金額は0以上で入力してください"],
    ["amount", "10.5", "金額は円単位の整数で入力してください"],
    ["quantity", "0", "数量は1以上で入力してください"],
    ["title", "   ", "案件名を入力してください"],
    ["customerName", "", "顧客名を入力してください"],
  ] as const)("%s=%j → 「%s」", (field, value, message) => {
    const r = parseOrderForm("ORD-2026-0001", { ...base, [field]: value });
    expect(r.success).toBe(false);
    expect(!r.success && r.errors[field]).toBe(message);
  });

  it("納期が受付日より前ならエラー", () => {
    const r = parseOrderForm("ORD-2026-0001", {
      ...base,
      receivedAt: "2026-09-10",
      dueDate: "2026-09-09",
    });
    expect(!r.success && r.errors.dueDate).toBe(
      "納期は受付日以降にしてください",
    );
  });

  it("複数のエラーを項目ごとに返す", () => {
    const r = parseOrderForm("ORD-2026-0001", {
      ...base,
      title: "",
      amount: "x",
    });
    expect(!r.success && Object.keys(r.errors).sort()).toEqual([
      "amount",
      "title",
    ]);
  });
});
