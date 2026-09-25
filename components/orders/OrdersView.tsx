"use client";

import { OrderTable } from "@/components/orders/OrderTable";
import { useOrders } from "@/components/orders/OrdersProvider";

export function OrdersView() {
  const { orders } = useOrders();
  return <OrderTable orders={orders} />;
}
