import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { brand } from "@/lib/brand";

/** 業務画面の共通枠。PC ではサイドバー常時表示、768px 未満では引き出しになる */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex h-12 items-center gap-2 border-b bg-card px-4">
          <SidebarTrigger aria-label="メニューの開閉" />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">
            {brand.companyName}
          </span>
        </header>
        <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
