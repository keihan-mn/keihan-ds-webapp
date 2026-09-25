import { useEffect } from "react";

export const UNSAVED_MESSAGE =
  "保存されていない変更があります。このページを離れますか？";

/**
 * 未保存の変更があるとき、ページ離脱の前に確認を出す。
 * - タブを閉じる・再読み込み: ブラウザ標準の確認（beforeunload）
 * - 画面内のリンク（サイドバー・戻るリンク等）: window.confirm
 *
 * リンクはキャプチャ段階で先に受け取り、キャンセル時は Next.js の Link に届く前に止める。
 */
export function useUnsavedChangesGuard(when: boolean): void {
  useEffect(() => {
    if (!when) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 古いブラウザ向け。値の内容は表示されない
      event.returnValue = "";
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const anchor =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      if (!window.confirm(UNSAVED_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [when]);
}
