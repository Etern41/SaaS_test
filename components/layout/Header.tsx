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
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/projects", label: "Проекты", icon: FolderKanban },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
];

function breadcrumbFromPath(pathname: string): { label: string; href: string }[] {
  if (pathname.startsWith("/analytics")) {
    return [
      { label: "Панель", href: "/projects" },
      { label: "Аналитика", href: "/analytics" },
    ];
  }
  if (pathname.startsWith("/projects")) {
    return [{ label: "Проекты", href: "/projects" }];
  }
  return [{ label: "Панель", href: "/projects" }];
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
  const crumbs = breadcrumbFromPath(pathname);
  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-card/95 px-4 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-overlay"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <nav
            className="hidden min-w-0 items-center gap-1 text-sm text-muted-foreground md:flex"
            aria-label="Навигация"
          >
            <Link
              href="/projects"
              className="flex shrink-0 items-center gap-1.5 font-medium text-foreground transition-colors hover:text-primary"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" aria-hidden />
              TaskFlow
            </Link>
            {crumbs.map((crumb, i) => (
              <span key={`${crumb.href}-${i}`} className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
                {i === crumbs.length - 1 ? (
                  <span className="truncate font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="truncate transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <span className="truncate text-sm font-semibold text-foreground">
              {crumbs[crumbs.length - 1]?.label ?? "Панель"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right text-sm sm:block">
            <p className="font-medium leading-tight text-foreground">{userName || "Пользователь"}</p>
            <p className="max-w-[12rem] truncate text-xs text-muted-foreground md:max-w-[16rem]">
              {userEmail}
            </p>
          </div>
          <Avatar className="h-9 w-9 ring-2 ring-border/60">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Выйти"
            aria-label="Выйти из аккаунта"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" id="mobile-nav-overlay">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
            aria-label="Закрыть меню"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            className={cn(
              "absolute left-0 top-0 flex h-full w-[min(18rem,88vw)] flex-col",
              "border-r border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950",
              "shadow-2xl shadow-slate-950/50"
            )}
            aria-label="Мобильная навигация"
          >
            <div className="flex h-14 items-center justify-between border-b border-slate-800/90 px-4">
              <Link
                href="/projects"
                className="flex items-center gap-2 font-semibold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/90 ring-1 ring-white/10">
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                </span>
                TaskFlow
              </Link>
            </div>
            <div className="flex flex-1 flex-col gap-0.5 p-3">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/12 text-white ring-1 ring-white/10"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-violet-300" : "text-slate-500"
                      )}
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
