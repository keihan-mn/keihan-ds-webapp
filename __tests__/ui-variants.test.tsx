import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

describe("Badge の状態色 variant", () => {
  it.each([
    ["success", "bg-success", "text-success-foreground"],
    ["warning", "bg-warning", "text-warning-foreground"],
    ["info", "bg-info", "text-info-foreground"],
    ["destructive", "bg-destructive", "text-destructive-foreground"],
  ] as const)("%s は %s + %s", (variant, bg, fg) => {
    render(<Badge variant={variant}>ラベル</Badge>);
    const el = screen.getByText("ラベル");
    expect(el).toHaveClass(bg, fg);
  });
});

describe("Button destructive", () => {
  it("赤の塗り＋白文字（淡い赤地に赤文字だとコントラスト不足のため）", () => {
    render(<Button variant="destructive">削除</Button>);
    expect(screen.getByRole("button", { name: "削除" })).toHaveClass(
      "bg-destructive",
      "text-destructive-foreground",
    );
  });
});
