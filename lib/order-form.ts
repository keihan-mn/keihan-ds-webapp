import { orderSchema, type Order } from "@/lib/schema";

/** フォーム入力中の値。数値項目も入力途中の文字列として持つ */
export type OrderFormValues = {
  title: string;
  customerName: string;
  serviceType: string;
  status: string;
  quantity: string;
  amount: string;
  receivedAt: string;
  dueDate: string;
  assignee: string;
  note: string;
};

/** フォーム項目の一覧。エラーの振り分けや変更検知で `as` を使わずに済ませるため */
export const ORDER_FORM_KEYS = [
  "title",
  "customerName",
  "serviceType",
  "status",
  "quantity",
  "amount",
  "receivedAt",
  "dueDate",
  "assignee",
  "note",
] as const satisfies readonly (keyof OrderFormValues)[];

export type OrderFormErrors = Partial<Record<keyof OrderFormValues, string>>;

export type ParseOrderFormResult =
  { success: true; data: Order } | { success: false; errors: OrderFormErrors };

export function toFormValues(order: Order): OrderFormValues {
  return {
    title: order.title,
    customerName: order.customerName,
    serviceType: order.serviceType,
    status: order.status,
    quantity: String(order.quantity),
    amount: String(order.amount),
    receivedAt: order.receivedAt,
    dueDate: order.dueDate,
    assignee: order.assignee,
    note: order.note,
  };
}

/** 全角数字・カンマ・空白を許容して数値にする。空欄や数字以外は NaN（=検証エラー） */
function toNumber(raw: string): number {
  const normalized = raw.normalize("NFKC").replace(/[,\s]/g, "");
  if (normalized === "" || !/^-?\d+(\.\d+)?$/.test(normalized)) return NaN;
  return Number(normalized);
}

export function parseOrderForm(
  id: string,
  values: OrderFormValues,
): ParseOrderFormResult {
  const result = orderSchema.safeParse({
    ...values,
    id,
    quantity: toNumber(values.quantity),
    amount: toNumber(values.amount),
  });
  if (result.success) return { success: true, data: result.data };

  const errors: OrderFormErrors = {};
  for (const issue of result.error.issues) {
    const key = ORDER_FORM_KEYS.find((k) => k === issue.path[0]);
    if (key) errors[key] ??= issue.message;
  }
  return { success: false, errors };
}
