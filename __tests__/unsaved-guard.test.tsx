import { afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  UNSAVED_GUARD_KEY,
  UNSAVED_MESSAGE,
  useUnsavedChangesGuard,
} from "@/hooks/use-unsaved-changes-guard";

function Harness({ dirty }: { dirty: boolean }) {
  useUnsavedChangesGuard(dirty);
  // 素の <a> でもガードが効くことを確かめるため、あえて next/link を使わない
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  return <a href="/orders">一覧へ</a>;
}

function clickLink() {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
  });
  screen.getByText("一覧へ").dispatchEvent(event);
  return event;
}

afterEach(() => vi.restoreAllMocks());

describe("useUnsavedChangesGuard", () => {
  it("未変更ならリンクで確認を出さない", () => {
    const confirm = vi.spyOn(window, "confirm");
    render(<Harness dirty={false} />);
    expect(clickLink().defaultPrevented).toBe(false);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("未保存でリンクを押すと確認し、キャンセルなら移動を止める", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Harness dirty />);
    expect(clickLink().defaultPrevented).toBe(true);
    expect(confirm).toHaveBeenCalledWith(UNSAVED_MESSAGE);
  });

  it("確認で OK なら移動を止めない", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Harness dirty />);
    expect(clickLink().defaultPrevented).toBe(false);
  });

  it("未保存でタブを閉じる・再読み込みするとブラウザの確認を出す", () => {
    render(<Harness dirty />);
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("未変更ならタブを閉じても確認しない", () => {
    render(<Harness dirty={false} />);
    const event = new Event("beforeunload", { cancelable: true });
    fireEvent(window, event);
    expect(event.defaultPrevented).toBe(false);
  });
});

/** ブラウザの「戻る」を押し、popstate が届くまで待つ */
async function pressBrowserBack() {
  const popped = new Promise((resolve) =>
    window.addEventListener("popstate", resolve, { once: true }),
  );
  window.history.back();
  await popped;
}

const onGuardEntry = () => window.history.state?.[UNSAVED_GUARD_KEY] === true;

describe("useUnsavedChangesGuard（ブラウザの戻る）", () => {
  it("未変更なら履歴を積まず、戻るで確認しない", async () => {
    const confirm = vi.spyOn(window, "confirm");
    window.history.pushState(null, "", "/orders/ORD-2026-0001");
    render(<Harness dirty={false} />);
    expect(onGuardEntry()).toBe(false);
    await pressBrowserBack();
    expect(confirm).not.toHaveBeenCalled();
  });

  it("未保存で戻るを押すと確認し、キャンセルならその画面に留まる", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    window.history.pushState(null, "", "/orders/ORD-2026-0001");
    render(<Harness dirty />);
    expect(onGuardEntry()).toBe(true);

    await pressBrowserBack();
    expect(confirm).toHaveBeenCalledWith(UNSAVED_MESSAGE);
    // 留まるために見張り用の履歴を積み直している
    expect(onGuardEntry()).toBe(true);
    expect(window.location.pathname).toBe("/orders/ORD-2026-0001");
  });

  it("確認で OK なら本来の戻る先へ進む", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    window.history.pushState(null, "", "/orders");
    window.history.pushState(null, "", "/orders/ORD-2026-0001");
    render(<Harness dirty />);

    await pressBrowserBack();
    await waitFor(() => expect(window.location.pathname).toBe("/orders"));
  });

  it("保存して未変更に戻ったあとの戻るは、確認せずにそのまま戻る", async () => {
    const confirm = vi.spyOn(window, "confirm");
    window.history.pushState(null, "", "/orders");
    window.history.pushState(null, "", "/orders/ORD-2026-0001");
    const { rerender } = render(<Harness dirty />);
    rerender(<Harness dirty={false} />);

    await pressBrowserBack();
    await waitFor(() => expect(window.location.pathname).toBe("/orders"));
    expect(confirm).not.toHaveBeenCalled();
  });
});
