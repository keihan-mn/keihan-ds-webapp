import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/schema";

export type StatusFilter = OrderStatus | "すべて";

export type OrderFilter = { keyword: string; status: StatusFilter };

/** 全角英数を半角に、大文字を小文字にそろえて比較できる形にする */
export function normalizeText(value: string): string {
  return value.normalize("NFKC").toLowerCase().trim();
}

export function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  const keyword = normalizeText(filter.keyword);
  return orders.filter((order) => {
    if (filter.status !== "すべて" && order.status !== filter.status) {
      return false;
    }
    if (keyword === "") return true;
    return [order.id, order.title, order.customerName, order.assignee].some(
      (field) => normalizeText(field).includes(keyword),
    );
  });
}

export type OrderSummary = {
  total: number;
  /** 受付＋作業中 */
  inProgress: number;
  delayed: number;
  totalAmount: number;
  byStatus: { status: OrderStatus; count: number }[];
};

export function summarizeOrders(orders: Order[]): OrderSummary {
  const countOf = (status: OrderStatus) =>
    orders.filter((o) => o.status === status).length;
  return {
    total: orders.length,
    inProgress: countOf("受付") + countOf("作業中"),
    delayed: countOf("遅延"),
    totalAmount: orders.reduce((sum, o) => sum + o.amount, 0),
    byStatus: ORDER_STATUSES.map((status) => ({ status, count: countOf(status) })),
  };
}
