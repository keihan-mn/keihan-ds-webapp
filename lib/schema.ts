import { z } from "zod";

export const ORDER_STATUSES = ["受付", "作業中", "完了", "遅延"] as const;
export const SERVICE_TYPES = [
  "スキャニング",
  "オンデマンド印刷",
  "コピー・プリント",
  "製本加工",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];

const isoDate = (label: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label}を入力してください`);

export const orderSchema = z
  .object({
    id: z.string().regex(/^ORD-\d{4}-\d{4}$/, "受注番号の形式が正しくありません"),
    title: z
      .string()
      .trim()
      .min(1, "案件名を入力してください")
      .max(100, "案件名は100文字以内で入力してください"),
    customerName: z
      .string()
      .trim()
      .min(1, "顧客名を入力してください")
      .max(100, "顧客名は100文字以内で入力してください"),
    serviceType: z.enum(SERVICE_TYPES, { error: "種別を選択してください" }),
    status: z.enum(ORDER_STATUSES, { error: "状態を選択してください" }),
    quantity: z
      .number({ error: "数量は数字で入力してください" })
      .int("数量は整数で入力してください")
      .min(1, "数量は1以上で入力してください"),
    amount: z
      .number({ error: "金額は数字で入力してください" })
      .int("金額は円単位の整数で入力してください")
      .min(0, "金額は0以上で入力してください"),
    receivedAt: isoDate("受付日"),
    dueDate: isoDate("納期"),
    assignee: z.string().trim().min(1, "担当者を入力してください"),
    note: z.string().max(1000, "備考は1000文字以内で入力してください"),
  })
  .refine((o) => o.dueDate >= o.receivedAt, {
    message: "納期は受付日以降にしてください",
    path: ["dueDate"],
  });

export type Order = z.infer<typeof orderSchema>;

export const ordersSchema = z.array(orderSchema);
