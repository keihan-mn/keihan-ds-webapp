import { ClipboardList, LayoutDashboard, Palette, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/orders", label: "受注案件", icon: ClipboardList },
  { href: "/catalog", label: "部品カタログ", icon: Palette },
];

/** href 自身、またはその配下のページにいるか */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
