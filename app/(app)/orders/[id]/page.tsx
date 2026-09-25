import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { getInitialOrders } from "@/lib/data";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getInitialOrders().some((o) => o.id === id)) notFound();
  return <OrderDetail id={id} />;
}
