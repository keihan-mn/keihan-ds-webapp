import { describe, it, expect } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { Logo } from "@/components/brand/Logo";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrdersProvider, useOrders } from "@/components/orders/OrdersProvider";
import { isActivePath } from "@/lib/navigation";
import { makeOrder } from "./fixtures";

describe("Logo", () => {
  it("正式ロゴ未配置なら社名テキストを出す", () => {
    render(<Logo src={null} />);
    expect(screen.getByText("京阪工技社")).toBeInTheDocument();
  });

  it("ロゴ画像があれば社名を代替テキストにして表示する", () => {
    render(<Logo src="/brand/logo.svg" />);
    expect(
      screen.getByRole("img", { name: "株式会社京阪工技社" }),
    ).toHaveAttribute("src", "/brand/logo.svg");
  });
});

describe("isActivePath", () => {
  it.each([
    ["/orders", "/orders", true],
    ["/orders/ORD-2026-0001", "/orders", true],
    ["/orders-archive", "/orders", false],
    ["/dashboard", "/orders", false],
  ])("%s は %s の配下か → %s", (pathname, href, expected) => {
    expect(isActivePath(pathname, href)).toBe(expected);
  });
});

describe("PageHeader", () => {
  it("見出し・説明・操作ボタンを表示する", () => {
    render(
      <PageHeader
        title="受注案件"
        description="説明文"
        actions={<button>追加</button>}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "受注案件" }),
    ).toBeInTheDocument();
    expect(screen.getByText("説明文")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });
});

describe("OrdersProvider", () => {
  it("取得と更新ができる", () => {
    const initial = [makeOrder({ id: "ORD-2026-0001", title: "旧" })];
    const { result } = renderHook(() => useOrders(), {
      wrapper: ({ children }) => (
        <OrdersProvider initialOrders={initial}>{children}</OrdersProvider>
      ),
    });
    expect(result.current.getOrder("ORD-2026-0001")?.title).toBe("旧");
    expect(result.current.getOrder("ORD-9999-9999")).toBeUndefined();

    act(() =>
      result.current.updateOrder(
        makeOrder({ id: "ORD-2026-0001", title: "新" }),
      ),
    );
    expect(result.current.getOrder("ORD-2026-0001")?.title).toBe("新");
    expect(result.current.orders).toHaveLength(1);
  });

  it("Provider の外で使うと分かりやすいエラーになる", () => {
    expect(() => renderHook(() => useOrders())).toThrow("OrdersProvider");
  });
});
