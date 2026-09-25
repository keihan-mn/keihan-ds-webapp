import type { Order } from "@/lib/schema";

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "ORD-2026-0001",
    title: "公文書スキャニング",
    customerName: "湖東市役所 総務課",
    serviceType: "スキャニング",
    status: "作業中",
    quantity: 100,
    amount: 50000,
    receivedAt: "2026-09-01",
    dueDate: "2026-09-30",
    assignee: "山田",
    note: "",
    ...overrides,
  };
}
