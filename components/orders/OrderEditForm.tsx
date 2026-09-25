"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import {
  ORDER_FORM_KEYS,
  parseOrderForm,
  toFormValues,
  type OrderFormErrors,
  type OrderFormValues,
} from "@/lib/order-form";
import { ORDER_STATUSES, SERVICE_TYPES, type Order } from "@/lib/schema";

type OrderEditFormProps = {
  order: Order;
  onSave: (order: Order) => void;
};

/** 保存ボタン方式の編集フォーム。保存を押すまで変更は確定しない */
export function OrderEditForm({ order, onSave }: OrderEditFormProps) {
  const [baseline, setBaseline] = useState(() => toFormValues(order));
  const [values, setValues] = useState(baseline);
  const [errors, setErrors] = useState<OrderFormErrors>({});

  const dirty = ORDER_FORM_KEYS.some((key) => values[key] !== baseline[key]);
  useUnsavedChangesGuard(dirty);

  const set = (key: keyof OrderFormValues) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = parseOrderForm(order.id, values);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    const saved = toFormValues(result.data);
    onSave(result.data);
    setBaseline(saved);
    setValues(saved);
    setErrors({});
    toast.success("保存しました");
  };

  const handleReset = () => {
    setValues(baseline);
    setErrors({});
  };

  const textField = (
    key: keyof OrderFormValues,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
  ) => (
    <Field data-invalid={!!errors[key] || undefined}>
      <FieldLabel htmlFor={key}>{label}</FieldLabel>
      <Input
        id={key}
        value={values[key]}
        onChange={(e) => set(key)(e.target.value)}
        aria-invalid={!!errors[key] || undefined}
        {...props}
      />
      <FieldError>{errors[key]}</FieldError>
    </Field>
  );

  const selectField = (
    key: "serviceType" | "status",
    label: string,
    options: readonly string[],
  ) => (
    <Field data-invalid={!!errors[key] || undefined}>
      <FieldLabel htmlFor={key}>{label}</FieldLabel>
      <Select value={values[key]} onValueChange={(v) => set(key)(v ?? "")}>
        <SelectTrigger
          id={key}
          className="w-full"
          aria-invalid={!!errors[key] || undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError>{errors[key]}</FieldError>
    </Field>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardContent>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">{textField("title", "案件名")}</div>
            {textField("customerName", "顧客名")}
            {textField("assignee", "担当者")}
            {selectField("serviceType", "種別", SERVICE_TYPES)}
            {selectField("status", "状態", ORDER_STATUSES)}
            {textField("quantity", "数量", { inputMode: "numeric" })}
            {textField("amount", "金額（円）", { inputMode: "numeric" })}
            {textField("receivedAt", "受付日", { type: "date" })}
            {textField("dueDate", "納期", { type: "date" })}
            <Field
              className="md:col-span-2"
              data-invalid={!!errors.note || undefined}
            >
              <FieldLabel htmlFor="note">備考</FieldLabel>
              <Textarea
                id="note"
                rows={4}
                value={values.note}
                onChange={(e) => set("note")(e.target.value)}
                aria-invalid={!!errors.note || undefined}
              />
              <FieldError>{errors.note}</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!dirty}
            onClick={handleReset}
          >
            変更を取り消す
          </Button>
          <Button type="submit" disabled={!dirty}>
            保存
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
