# コーディングルール詳細（正しい例／誤った例）

## 色

**Incorrect**
```tsx
<span className="text-green-600">完了</span>
<div className="bg-[#0056A8] text-white">見出し</div>
```

**Correct**
```tsx
<StatusBadge status="完了" />
<div className="bg-primary text-primary-foreground">見出し</div>
```

状態の表示は `StatusBadge`（`lib/status.ts` の対応表）を使う。新しい状態が必要ならユーザーに確認して `lib/status.ts` と `ORDER_STATUSES` を同時に更新する。

## 赤の使いどころ

**Incorrect** — 目立たせたいから赤
```tsx
<Button variant="destructive">今すぐ申し込む</Button>
<Badge variant="destructive">遅延</Badge>
```

**Correct** — 赤は削除とエラーだけ
```tsx
<Button>申し込む</Button>
<StatusBadge status="遅延" />  {/* warning（黄） */}
<Button variant="destructive">削除する</Button>
<FieldError>金額は0以上で入力してください</FieldError>
```

## base（Base UI）の書き方

**Incorrect**
```tsx
<Button asChild><Link href="/orders">一覧へ</Link></Button>
```

**Correct** — リンクにするときは `nativeButton={false}` も付ける（付けないと Base UI がコンソールエラーを出す）
```tsx
<Button render={<Link href="/orders" />} nativeButton={false}>一覧へ</Button>
```

## 余白

**Incorrect**
```tsx
<div className="space-y-4">...</div>
```

**Correct**
```tsx
<div className="flex flex-col gap-4">...</div>
```

## フォーム

- ラベルは `FieldLabel htmlFor` で入力欄と結びつける
- エラーは `FieldError` で入力欄の下に出し、入力欄に `aria-invalid` を付ける
- 数値は `inputMode="numeric"`。全角・カンマを許容して変換する（`lib/order-form.ts` の `toNumber` を参照）
- 保存は `<Button type="submit">保存</Button>`。未変更の間は `disabled`
- 未保存離脱は `useUnsavedChangesGuard(dirty)`

**Incorrect** — 入力と同時に保存
```tsx
<Input value={title} onChange={(e) => save({ title: e.target.value })} />
```

**Correct** — フォームの状態を持ち、保存ボタンで確定
```tsx
<Input id="title" value={values.title} onChange={(e) => set("title")(e.target.value)} />
...
<Button type="submit" disabled={!dirty}>保存</Button>
```

## 表

- 数値列は `className="text-right tabular-nums"`
- 長い文字列のセルは `max-w-* truncate`
- 0件のときは空状態（理由＋「条件をクリア」）を表の中に出す（`components/orders/OrderTable.tsx`）

## 角丸

- 親の角丸 ≧ 子の角丸
- `bg-card` の島は `rounded-lg`（`Card` 本体は `rounded-xl`）
- `rounded-md` は行・メニュー用
