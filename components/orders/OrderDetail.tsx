"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderEditForm } from "@/components/orders/OrderEditForm";
import { useOrders } from "@/components/orders/OrdersProvider";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Button } from "@/components/ui/button";

export function OrderDetail({ id }: { id: string }) {
  const { getOrder, updateOrder } = useOrders();
  const order = getOrder(id);

  if (!order) {
    return <p className="text-muted-foreground">受注案件 {id} は見つかりませんでした。</p>;
  }

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" render={<Link href="/orders" />} nativeButton={false}>
          <ArrowLeftIcon data-icon="inline-start" />
          一覧に戻る
        </Button>
      </div>
      <PageHeader
        title={order.title}
        description={`${order.id}　${order.customerName}`}
        actions={<StatusBadge status={order.status} />}
      />
      <OrderEditForm key={order.id} order={order} onSave={updateOrder} />
    </>
  );
}
