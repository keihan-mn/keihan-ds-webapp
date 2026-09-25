import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// vitest は globals を無効にしているため、Testing Library の自動後片付けが働かない。
// テストごとに描画結果を消し、前のテストの DOM が残らないようにする。
afterEach(() => {
  cleanup();
});
