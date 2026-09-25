import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="font-heading text-2xl font-bold">案件が見つかりません</h1>
      <p className="text-muted-foreground">
        受注番号が間違っているか、削除された可能性があります。
      </p>
      <Button
        variant="outline"
        render={<Link href="/orders" />}
        nativeButton={false}
      >
        受注案件の一覧へ
      </Button>
    </div>
  );
}
