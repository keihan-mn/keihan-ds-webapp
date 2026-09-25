import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/dashboard/StatCard";

describe("StatCard", () => {
  it("ラベル・値・補足を表示する", () => {
    render(<StatCard label="受注金額合計" value="7,173,500円" hint="全案件" />);
    expect(screen.getByText("受注金額合計")).toBeInTheDocument();
    expect(screen.getByText("7,173,500円")).toHaveClass("tabular-nums");
    expect(screen.getByText("全案件")).toBeInTheDocument();
  });

  it("warning は注意色の目印を付ける（赤は使わない）", () => {
    render(<StatCard label="遅延" value="2件" tone="warning" />);
    const card = screen.getByText("遅延").closest("[data-slot=card]");
    expect(card).toHaveAttribute("data-tone", "warning");
    expect(card?.className).not.toMatch(/destructive/);
  });
});
