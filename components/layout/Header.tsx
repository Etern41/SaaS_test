"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  Menu,
  LayoutDashboard,
  FolderKanban,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/projects", label: "Проекты", icon: FolderKanban },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
];

function breadcrumbLabel(pathname: string): string {
  if (pathname.startsWith("/analytics")) return "Аналитика";
  if (pathname.match(/^\/projects\/[^/]+\/settings/)) return "Настройки";
  if (pathname.match(/^\/projects\/[^/]+/)) return "Доска";
  return "Проекты";
}

export function DashboardHeader({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const initial = userName.trim().charAt(0).toUpperCase() || "?";
  const pageLabel = breadcrumbLabel(pathname);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="z-30 flex h-12 shrink-0 items-center justify-between border-b bg-card px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 md:hidden"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Навигация">
            <Link
              href="/projects"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Проекты
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-medium text-foreground">{pageLabel}</span>
          </nav>

          <span className="truncate text-sm font-medium text-foreground md:hidden">
            {pageLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <div className="ml-1 flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight text-foreground">{userName || "Пользователь"}</p>
              <p className="max-w-[10rem] truncate text-[11px] text-muted-foreground">{userEmail}</p>
            </div>
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Выйти"
            aria-label="Выйти"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Закрыть меню"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            className={cn(
              "absolute left-0 top-0 flex h-full w-[min(16rem,85vw)] flex-col",
              "bg-[#17181f] shadow-2xl"
            )}
          >
            <div className="flex h-12 items-center border-b border-white/[0.06] px-4">
              <Link
                href="/projects"
                className="flex items-center gap-2 font-semibold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                </span>
                TaskFlow
              </Link>
            </div>
            <div className="flex flex-1 flex-col gap-0.5 px-2 pt-4">
              <span className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                Навигация
              </span>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                    )}
                  >
                    <item.icon
                      className={cn("h-4 w-4", isActive ? "text-violet-400" : "text-zinc-500")}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
