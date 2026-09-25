import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OrdersProvider } from "@/components/orders/OrdersProvider";
import { getInitialOrders } from "@/lib/data";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <OrdersProvider initialOrders={getInitialOrders()}>
      <AppShell>{children}</AppShell>
    </OrdersProvider>
  );
}
