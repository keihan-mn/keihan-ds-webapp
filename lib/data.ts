import ordersJson from "@/data/orders.json";
import { ordersSchema, type Order } from "@/lib/schema";

/** 見本データを検証して返す。形式が壊れていたら原因を日本語で示して止める */
export function getInitialOrders(): Order[] {
  const result = ordersSchema.safeParse(ordersJson);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(
      `data/orders.json の形式が正しくありません: [${issue?.path.join(".")}] ${issue?.message}`,
    );
  }
  return result.data;
}
