import { afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
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
