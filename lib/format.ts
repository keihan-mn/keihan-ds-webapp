const numberFormat = new Intl.NumberFormat("ja-JP");

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatYen(value: number): string {
  return `${numberFormat.format(value)}円`;
}

/** "2026-09-05" → "2026/09/05"（タイムゾーンの影響を受けないよう文字列で変換） */
export function formatDate(iso: string): string {
  return iso.replaceAll("-", "/");
}
