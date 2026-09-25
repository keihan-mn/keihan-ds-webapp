"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatYen } from "@/lib/format";
import { filterOrders, type StatusFilter } from "@/lib/orders";
import { ORDER_STATUSES, type Order } from "@/lib/schema";

const STATUS_OPTIONS: StatusFilter[] = ["すべて", ...ORDER_STATUSES];

export function OrderTable({ orders }: { orders: Order[] }) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("すべて");
  const visible = filterOrders(orders, { keyword, status });

  const clear = () => {
    setKeyword("");
    setStatus("すべて");
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="キーワード検索"
              placeholder="案件名・顧客名・受注番号・担当者"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) =>
              setStatus(STATUS_OPTIONS.find((s) => s === v) ?? "すべて")
            }
          >
            <SelectTrigger aria-label="状態で絞り込み" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-sm text-muted-foreground tabular-nums">
            {visible.length}件
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>受注番号</TableHead>
              <TableHead>案件名</TableHead>
              <TableHead>顧客名</TableHead>
              <TableHead>種別</TableHead>
              <TableHead>状態</TableHead>
              <TableHead>納期</TableHead>
              <TableHead className="text-right">金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-muted-foreground">
                      条件に一致する案件がありません
                    </span>
                    <Button variant="outline" size="sm" onClick={clear}>
                      条件をクリア
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              visible.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {order.id}
                  </TableCell>
                  <TableCell className="max-w-64 truncate font-medium">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {order.title}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {order.customerName}
                  </TableCell>
                  <TableCell>{order.serviceType}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatDate(order.dueDate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatYen(order.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
