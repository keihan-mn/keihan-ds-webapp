"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { OrderSummary } from "@/lib/orders";
import { STATUS_APPEARANCE } from "@/lib/status";

const chartConfig = {
  count: { label: "件数", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** 状態別の件数。棒の色はバッジと同じ（STATUS_APPEARANCE）にそろえる */
export function StatusChart({ data }: { data: OrderSummary["byStatus"] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="status" tickLine={false} axisLine={false} />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={4}>
          {data.map((d) => (
            <Cell key={d.status} fill={STATUS_APPEARANCE[d.status].color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
