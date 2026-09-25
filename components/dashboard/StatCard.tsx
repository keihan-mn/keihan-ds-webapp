import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  /** warning は左端に注意色の帯を付ける */
  tone?: "default" | "warning";
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: StatCardProps) {
  return (
    <Card
      data-tone={tone}
      className={cn(tone === "warning" && "border-l-4 border-l-warning")}
    >
      <CardContent className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-heading text-2xl font-bold tabular-nums">
          {value}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </CardContent>
    </Card>
  );
}
