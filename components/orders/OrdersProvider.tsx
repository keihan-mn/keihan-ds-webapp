"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Order } from "@/lib/schema";

type OrdersContextValue = {
  orders: Order[];
  getOrder: (id: string) => Order | undefined;
  updateOrder: (order: Order) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

/**
 * 受注データをメモリ上で保持する。DB 接続はこのひな形の範囲外のため、
 * ページを再読み込みすると data/orders.json の初期状態に戻る。
 */
export function OrdersProvider({
  initialOrders,
  children,
}: {
  initialOrders: Order[];
  children: ReactNode;
}) {
  const [orders, setOrders] = useState(initialOrders);

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const updateOrder = useCallback((next: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === next.id ? next : o)));
  }, []);

  const value = useMemo(
    () => ({ orders, getOrder, updateOrder }),
    [orders, getOrder, updateOrder],
  );

  return <OrdersContext value={value}>{children}</OrdersContext>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders は OrdersProvider の内側で使ってください");
  }
  return ctx;
}
