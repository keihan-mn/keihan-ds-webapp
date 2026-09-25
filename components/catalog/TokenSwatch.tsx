"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TokenSwatchProps = {
  /** CSS 変数名（-- を除く） */
  name: string;
  /** 見本の塗りに使う Tailwind クラス（例: "bg-primary"）。Tailwind が検出できるよう文字列で渡す */
  className: string;
  description: string;
};

/** globals.css の値を実行時に読んで表示する。値をここに二重に書かないため */
export function TokenSwatch({ name, className, description }: TokenSwatchProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM の CSS 変数を読むため
    setValue(
      getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim(),
    );
  }, [name]);

  return (
    <div className="flex items-center gap-3">
      <div className={cn("size-10 shrink-0 rounded-md border", className)} />
      <div className="flex min-w-0 flex-col">
        <code className="font-mono text-sm">--{name}</code>
        <span className="text-xs text-muted-foreground">
          {description}
          {value && <> ・ <span className="font-mono">{value}</span></>}
        </span>
      </div>
    </div>
  );
}
