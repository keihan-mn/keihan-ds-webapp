import { afterEach, describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import OrderNotFound from "@/app/(app)/orders/[id]/not-found";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { OrdersProvider } from "@/components/orders/OrdersProvider";
import { makeOrder } from "./fixtures";

vi.mock("next/navigation", () => ({ usePathname: () => "/orders" }));

afterEach(() => vi.restoreAllMocks());

// Base UI の Button を render でリンクにするときは nativeButton={false} が要る。
// 付け忘れると開発時にコンソールエラーになり、ボタンの意味づけも崩れる。
describe("リンクとして使うボタン", () => {
  it("404 画面の「一覧へ」で Base UI の警告を出さない", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<OrderNotFound />);
    expect(error).not.toHaveBeenCalled();
  });

  it("詳細画面の「一覧に戻る」で Base UI の警告を出さない", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <OrdersProvider initialOrders={[makeOrder()]}>
        <OrderDetail id="ORD-2026-0001" />
      </OrdersProvider>,
    );
    expect(error).not.toHaveBeenCalled();
  });
});
