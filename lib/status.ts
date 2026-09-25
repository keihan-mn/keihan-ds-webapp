import type { OrderStatus } from "@/lib/schema";

/**
 * 状態ごとの色。バッジとグラフで共通に使う。
 * 赤（destructive）は削除・エラー専用のため、遅延も warning（黄）で表す。
 */
export const STATUS_APPEARANCE: Record<
  OrderStatus,
  { badge: "info" | "default" | "success" | "warning"; color: string }
> = {
  受付: { badge: "info", color: "var(--info)" },
  作業中: { badge: "default", color: "var(--primary)" },
  完了: { badge: "success", color: "var(--success)" },
  遅延: { badge: "warning", color: "var(--warning)" },
};
