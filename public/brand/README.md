# ロゴ

`logo.svg` は京阪工技社の正式ロゴ（縦型：マーク＋KEIHAN。会社HPと同じもの）です。

## 表示のルール

- サイドバー左上に高さ 44px で表示し、右にアプリ名を並べる（`components/brand/Logo.tsx`・`components/layout/AppSidebar.tsx`）
- ロゴの色・比率を加工しない。会社HPと同じく単体で使う（社名は画面上部の帯に文字で表示している）

## 差し替えるとき

1. 新しい正式ロゴ（SVG）を、このフォルダの `logo.svg` と置き換える
2. ファイル名を変える場合は、`lib/brand.ts` の `logoSrc` も合わせて変える（`npm run test` がファイルの有無を確認する）
3. `npm run dev` でサイドバー左上の表示を確認する

`lib/brand.ts` の `logoSrc` を `null` にすると、ロゴの代わりに社名テキストを表示します。
