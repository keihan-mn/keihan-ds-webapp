import { DashboardView } from "@/components/dashboard/DashboardView";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="ダッシュボード"
        description="受注案件の状況をまとめて確認できます。"
      />
      <DashboardView />
    </>
  );
}
