"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { useOrders } from "@/components/orders/OrdersProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatYen } from "@/lib/format";
import { summarizeOrders } from "@/lib/orders";

export function DashboardView() {
  const { orders } = useOrders();
  const summary = summarizeOrders(orders);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="案件数" value={`${formatNumber(summary.total)}件`} />
        <StatCard
          label="進行中"
          value={`${formatNumber(summary.inProgress)}件`}
          hint="受付＋作業中"
        />
        <StatCard
          label="遅延"
          value={`${formatNumber(summary.delayed)}件`}
          tone={summary.delayed > 0 ? "warning" : "default"}
        />
        <StatCard
          label="受注金額合計"
          value={formatYen(summary.totalAmount)}
          hint="全案件"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>状態別の件数</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusChart data={summary.byStatus} />
        </CardContent>
      </Card>
    </>
  );
}
