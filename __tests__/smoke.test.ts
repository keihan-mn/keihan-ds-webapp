import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("土台", () => {
  it("cn はクラスを結合し、衝突する Tailwind クラスは後勝ちにする", () => {
    expect(cn("px-2", "px-4", false && "hidden")).toBe("px-4");
  });

  it("トップページのモジュールを読み込める", async () => {
    const mod = await import("../app/page");
    expect(mod.default).toBeTypeOf("function");
  });
});
