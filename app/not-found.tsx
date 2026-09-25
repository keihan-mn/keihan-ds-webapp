import Link from "next/link";
import { Button } from "@/components/ui/button";

/** アプリにない URL の 404 画面。業務画面の枠の外で表示されるため、単独で中央に置く */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-heading text-2xl font-bold">
        ページが見つかりません
      </h1>
      <p className="text-muted-foreground">
        URL が間違っているか、ページが移動・削除された可能性があります。
      </p>
      <Button
        variant="outline"
        render={<Link href="/dashboard" />}
        nativeButton={false}
      >
        ダッシュボードへ
      </Button>
    </main>
  );
}
