import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderEditForm } from "@/components/orders/OrderEditForm";
import { makeOrder } from "./fixtures";

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

function setup() {
  const onSave = vi.fn();
  const user = userEvent.setup();
  render(<OrderEditForm order={makeOrder()} onSave={onSave} />);
  return { onSave, user };
}

describe("OrderEditForm", () => {
  it("未変更のうちは保存・取り消しボタンが押せない", () => {
    setup();
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "変更を取り消す" })).toBeDisabled();
  });

  it("変更すると保存でき、保存後は再び未変更扱いになる", async () => {
    const { onSave, user } = setup();
    const title = screen.getByLabelText("案件名");
    await user.clear(title);
    await user.type(title, "公文書スキャニング（追加分）");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).toHaveBeenCalledWith(makeOrder({ title: "公文書スキャニング（追加分）" }));
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });

  it("全角・カンマ付きの金額を数値として保存する", async () => {
    const { onSave, user } = setup();
    const amount = screen.getByLabelText("金額（円）");
    await user.clear(amount);
    await user.type(amount, "１２，０００");
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledWith(makeOrder({ amount: 12000 }));
  });

  it("入力エラーがあると項目の下に理由を出し、保存しない", async () => {
    const { onSave, user } = setup();
    await user.clear(screen.getByLabelText("案件名"));
    await user.clear(screen.getByLabelText("金額（円）"));
    await user.type(screen.getByLabelText("金額（円）"), "-5");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("案件名を入力してください")).toBeInTheDocument();
    expect(screen.getByText("金額は0以上で入力してください")).toBeInTheDocument();
    expect(screen.getByLabelText("案件名")).toHaveAttribute("aria-invalid", "true");
  });

  it("変更を取り消すと元の値に戻る", async () => {
    const { user } = setup();
    const title = screen.getByLabelText("案件名");
    await user.type(title, "あ");
    await user.click(screen.getByRole("button", { name: "変更を取り消す" }));
    expect(title).toHaveValue("公文書スキャニング");
  });
});
