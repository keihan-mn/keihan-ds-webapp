import { brand } from "@/lib/brand";

export function Logo({ src = brand.logoSrc }: { src?: string | null }) {
  if (src) {
    // SVG ロゴは画像最適化が不要なため next/image ではなく img を使う
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={brand.companyName} className="h-6 w-auto" />;
  }
  return (
    <span className="font-heading text-base font-bold text-primary">
      {brand.shortName}
    </span>
  );
}
