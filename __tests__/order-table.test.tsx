import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderTable } from "@/components/orders/OrderTable";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { makeOrder } from "./fixtures";

const orders = [
  makeOrder({ id: "ORD-2026-0001", title: "カルテ電子化", customerName: "湖南中央病院", amount: 3200000 }),
  makeOrder({ id: "ORD-2026-0002", title: "パンフレット増刷", customerName: "株式会社びわこ精機", status: "完了" }),
];

describe("StatusBadge", () => {
  it.each([
    ["受付", "bg-info"],
    ["作業中", "bg-primary"],
    ["完了", "bg-success"],
    ["遅延", "bg-warning"],
  ] as const)("%s は %s（赤は使わない）", (status, cls) => {
    render(<StatusBadge status={status} />);
    const el = screen.getByText(status);
    expect(el).toHaveClass(cls);
    expect(el).not.toHaveClass("bg-destructive");
  });
});

describe("OrderTable", () => {
  it("全件と件数を表示し、案件名は詳細へのリンク", () => {
    render(<OrderTable orders={orders} />);
    expect(screen.getByText("2件")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "カルテ電子化" })).toHaveAttribute("href", "/orders/ORD-2026-0001");
    expect(screen.getByText("3,200,000円")).toBeInTheDocument();
  });

  it("キーワードで絞り込む", async () => {
    const user = userEvent.setup();
    render(<OrderTable orders={orders} />);
    await user.type(screen.getByLabelText("キーワード検索"), "病院");
    expect(screen.getByText("1件")).toBeInTheDocument();
    expect(screen.queryByText("パンフレット増刷")).not.toBeInTheDocument();
  });

  it("0件なら空状態を出し、条件クリアで全件に戻る", async () => {
    const user = userEvent.setup();
    render(<OrderTable orders={orders} />);
    await user.type(screen.getByLabelText("キーワード検索"), "存在しない案件");
    const table = screen.getByRole("table");
    expect(within(table).getByText("条件に一致する案件がありません")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "条件をクリア" }));
    expect(screen.getByLabelText("キーワード検索")).toHaveValue("");
    expect(screen.getByText("2件")).toBeInTheDocument();
  });
});
