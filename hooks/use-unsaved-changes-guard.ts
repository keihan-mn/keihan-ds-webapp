import { useEffect, useRef } from "react";

export const UNSAVED_MESSAGE =
  "保存されていない変更があります。このページを離れますか？";

/** 「戻る」の見張り用に積む履歴の目印（history.state のキー） */
export const UNSAVED_GUARD_KEY = "__keihanUnsavedGuard";

function isOnGuardEntry(): boolean {
  return window.history.state?.[UNSAVED_GUARD_KEY] === true;
}

/**
 * 未保存の変更があるとき、ページ離脱の前に確認を出す。
 * - タブを閉じる・再読み込み: ブラウザ標準の確認（beforeunload）
 * - 画面内のリンク（サイドバー・戻るリンク等）: window.confirm
 * - ブラウザの「戻る」: window.confirm（見張り用の履歴を1つ積んで検知する）
 *
 * リンクはキャプチャ段階で先に受け取り、キャンセル時は Next.js の Link に届く前に止める。
 */
export function useUnsavedChangesGuard(when: boolean): void {
  const whenRef = useRef(when);
  // 見張り用の履歴を積んでいて、まだ「戻る」で消費されていないか
  const armedRef = useRef(false);

  useEffect(() => {
    whenRef.current = when;
    // 未保存になったら、同じ URL の履歴を1つ積む。「戻る」はまずこの履歴を消費するので、
    // 画面を離れる前に確認を挟める。Next.js は外部の pushState を公式に許容している
    // （node_modules/next/dist/docs の single-page-applications 参照）
    if (when && !isOnGuardEntry()) {
      window.history.pushState({ [UNSAVED_GUARD_KEY]: true }, "");
      armedRef.current = true;
    }
  }, [when]);

  useEffect(() => {
    const onPopState = () => {
      // 見張り用の履歴から離れたとき（＝「戻る」が押されたとき）だけ反応する
      if (!armedRef.current || isOnGuardEntry()) return;
      armedRef.current = false;
      if (whenRef.current && !window.confirm(UNSAVED_MESSAGE)) {
        // キャンセル: 見張りを積み直してこの画面に留まる
        window.history.pushState({ [UNSAVED_GUARD_KEY]: true }, "");
        armedRef.current = true;
        return;
      }
      // OK、または保存済み: 本来の戻る先へ進む
      window.history.back();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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
