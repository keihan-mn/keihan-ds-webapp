import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/schema";
import { STATUS_APPEARANCE } from "@/lib/status";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={STATUS_APPEARANCE[status].badge}>{status}</Badge>;
}
