import { PageHeader } from "@/components/layout/PageHeader";
import { OrdersView } from "@/components/orders/OrdersView";

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="受注案件"
        description="スキャニング・印刷・製本の受注案件の一覧です。案件名を押すと詳細を開きます。"
      />
      <OrdersView />
    </>
  );
}
