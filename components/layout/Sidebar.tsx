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
    <aside
      className={cn(
        "hidden h-full w-64 shrink-0 flex-col border-r border-slate-800/80",
        "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100",
        "md:flex"
      )}
    >
      <div className="flex h-14 items-center border-b border-slate-800/90 px-4">
        <Link
          href="/projects"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/90 text-white shadow-sm ring-1 ring-white/10">
            <LayoutDashboard className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-base">TaskFlow</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Основная навигация">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/12 text-white shadow-inner ring-1 ring-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-violet-300" : "text-slate-500"
                )}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/90 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/40 px-2 py-2 ring-1 ring-slate-700/50">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white shadow-sm ring-2 ring-slate-900"
            aria-hidden
          >
            {initial}
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
            {userName || "Пользователь"}
          </span>
        </div>
      </div>
    </aside>
  );
}
