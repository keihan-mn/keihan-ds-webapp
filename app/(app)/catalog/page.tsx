import { CatalogSection } from "@/components/catalog/CatalogSection";
import { TokenSwatch } from "@/components/catalog/TokenSwatch";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUSES } from "@/lib/schema";

const COLOR_TOKENS = [
  {
    name: "primary",
    className: "bg-primary",
    description: "ブランド青。主ボタン・リンク・選択中",
  },
  {
    name: "secondary",
    className: "bg-secondary",
    description: "淡い青。控えめな強調面",
  },
  { name: "background", className: "bg-background", description: "ページの地" },
  { name: "card", className: "bg-card", description: "カード・表の面" },
  { name: "muted", className: "bg-muted", description: "控えめな面" },
  {
    name: "muted-foreground",
    className: "bg-muted-foreground",
    description: "補助の文字",
  },
  { name: "border", className: "bg-border", description: "区切り線" },
  { name: "input", className: "bg-input", description: "入力欄の枠" },
  { name: "info", className: "bg-info", description: "情報（受付）" },
  { name: "success", className: "bg-success", description: "成功（完了）" },
  { name: "warning", className: "bg-warning", description: "注意（遅延）" },
  {
    name: "destructive",
    className: "bg-destructive",
    description: "削除・エラー専用",
  },
];

const RADII = [
  { className: "rounded-sm", label: "sm：小さな印" },
  { className: "rounded-md", label: "md：行・メニュー" },
  { className: "rounded-lg", label: "lg：ボタン・入力・島" },
  { className: "rounded-xl", label: "xl：カード" },
];

export default function CatalogPage() {
  return (
    <>
      <PageHeader
        title="部品カタログ"
        description="このデザインシステムの色・文字・部品の一覧です。新しい画面はここにある部品で組み立てます。"
      />

      <CatalogSection
        title="色"
        description="色は必ずこの役割名で指定します（bg-primary など）。値は app/globals.css が正本です。"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_TOKENS.map((t) => (
            <TokenSwatch key={t.name} {...t} />
          ))}
        </div>
      </CatalogSection>

      <CatalogSection
        title="文字"
        description="英字・数字は Inter、日本語は Noto Sans JP。表の数字は等幅（tabular-nums）。"
      >
        <div className="flex flex-col gap-2">
          <p className="font-heading text-2xl font-bold">
            見出し1　受注案件 ORD-2026-0001
          </p>
          <p className="font-heading text-lg font-bold">
            見出し2　状態別の件数
          </p>
          <p>
            本文　スキャニング・オンデマンド印刷・製本加工の受注を管理します。
          </p>
          <p className="text-sm text-muted-foreground">
            補足　最終更新 2026/09/25
          </p>
          <p className="tabular-nums">等幅数字　1,111,111円 / 8,888,888円</p>
        </div>
      </CatalogSection>

      <CatalogSection
        title="角丸"
        description="基準は 6px。部品の大きさに応じて段階的に使い分けます。"
      >
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <div key={r.className} className="flex flex-col items-center gap-2">
              <div
                className={`size-16 border-2 border-primary bg-secondary ${r.className}`}
              />
              <span className="text-xs text-muted-foreground">{r.label}</span>
            </div>
          ))}
        </div>
      </CatalogSection>

      <CatalogSection
        title="ボタン"
        description="主操作は1画面に1つ（塗りの青）。赤は削除専用です。"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button>保存</Button>
          <Button variant="outline">キャンセル</Button>
          <Button variant="secondary">下書き保存</Button>
          <Button variant="ghost">詳細</Button>
          <Button variant="link">リンク</Button>
          <Button variant="destructive">削除する</Button>
          <Button disabled>押せない状態</Button>
        </div>
      </CatalogSection>

      <CatalogSection
        title="状態バッジ"
        description="状態の色はこの4種に固定します。赤は使いません。"
      >
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </CatalogSection>

      <CatalogSection
        title="入力"
        description="ラベルは入力欄の上。エラーは入力欄の下に赤字で理由を示します。"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="catalog-name">顧客名</FieldLabel>
            <Input id="catalog-name" placeholder="例：湖東市役所 総務課" />
            <FieldDescription>正式名称で入力します。</FieldDescription>
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="catalog-amount">金額（円）</FieldLabel>
            <Input id="catalog-amount" defaultValue="-5" aria-invalid />
            <FieldError>金額は0以上で入力してください</FieldError>
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="catalog-note">備考</FieldLabel>
            <Textarea
              id="catalog-note"
              rows={3}
              placeholder="作業上の注意など"
            />
          </Field>
        </div>
      </CatalogSection>

      <CatalogSection
        title="表"
        description="数値は右寄せ・等幅。長い文字は省略（…）して1行に収めます。"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>受注番号</TableHead>
              <TableHead>案件名</TableHead>
              <TableHead>状態</TableHead>
              <TableHead className="text-right">金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-muted-foreground tabular-nums">
                ORD-2026-0001
              </TableCell>
              <TableCell>公文書スキャニング（第3期）</TableCell>
              <TableCell>
                <StatusBadge status="作業中" />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                1,860,000円
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground tabular-nums">
                ORD-2026-0004
              </TableCell>
              <TableCell>設計図面 カラー出力</TableCell>
              <TableCell>
                <StatusBadge status="遅延" />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                96,000円
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CatalogSection>
    </>
  );
}
