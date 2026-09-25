import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotFound from "@/app/not-found";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PageHeader } from "@/components/layout/PageHeader";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

afterEach(() => vi.unstubAllGlobals());

describe("アプリにない URL の 404 画面", () => {
  it("日本語で案内し、ダッシュボードへ戻るリンクを出す", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: "ページが見つかりません" }),
    ).toBeInTheDocument();
    // Button を render でリンクにすると Base UI が role="button" を付ける
    expect(
      screen.getByRole("button", { name: "ダッシュボードへ" }),
    ).toHaveAttribute("href", "/dashboard");
  });
});

/** 引き出しの開閉状態を外から見るための小さな部品 */
function MobileDrawerProbe() {
  const { openMobile, setOpenMobile } = useSidebar();
  return (
    <>
      <button onClick={() => setOpenMobile(true)}>引き出しを開く</button>
      <output aria-label="引き出しの状態">{openMobile ? "開" : "閉"}</output>
    </>
  );
}

describe("768px 未満の引き出しメニュー", () => {
  it("メニューを押すと引き出しが閉じる", async () => {
    // 画面幅が 768px 未満だと判定させる
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <AppSidebar />
        <MobileDrawerProbe />
      </SidebarProvider>,
    );

    await user.click(screen.getByRole("button", { name: "引き出しを開く" }));
    const link = await screen.findByRole("link", { name: "受注案件" });
    // jsdom は画面遷移できないので、リンク本来の遷移だけ止める
    link.addEventListener("click", (e) => e.preventDefault());
    await user.click(link);

    await waitFor(() =>
      expect(screen.getByLabelText("引き出しの状態")).toHaveTextContent("閉"),
    );
  });
});

describe("PageHeader の長い見出し", () => {
  it("空白のない長い英数字でも折り返せる", () => {
    render(<PageHeader title={"A".repeat(120)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
      "break-words",
    );
  });
});
