import { describe, it, expect } from "vitest";
import { formatDate, formatNumber, formatYen } from "@/lib/format";

describe("format", () => {
  it("金額は3桁区切り＋円", () => {
    expect(formatYen(1234567)).toBe("1,234,567円");
    expect(formatYen(0)).toBe("0円");
  });
  it("数値は3桁区切り", () => {
    expect(formatNumber(48000)).toBe("48,000");
  });
  it("日付は YYYY/MM/DD", () => {
    expect(formatDate("2026-09-05")).toBe("2026/09/05");
  });
});
