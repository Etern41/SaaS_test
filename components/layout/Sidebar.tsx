"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/projects", label: "Проекты", icon: FolderKanban },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
];

export function DashboardSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="hidden h-full w-56 shrink-0 flex-col bg-[#17181f] text-zinc-100 md:flex">
      <div className="flex h-12 items-center gap-2.5 border-b border-white/[0.06] px-4">
        <Link
          href="/projects"
          className="flex items-center gap-2 font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white">
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-[15px]">TaskFlow</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col overflow-visible px-2 pt-4" aria-label="Основная навигация">
        <span className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          Навигация
        </span>
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-violet-400" : "text-zinc-500"
                  )}
                  aria-hidden
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex h-10 items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white"
            aria-hidden
          >
            {initial}
          </div>
          <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">
            {userName || "Пользователь"}
          </span>
        </div>
      </div>
    </aside>
  );
}
