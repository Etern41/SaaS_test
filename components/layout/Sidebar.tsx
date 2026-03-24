"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Home,
  Plus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

interface SidebarProject {
  id: string;
  name: string;
  _count: { tasks: number };
}

const navItems = [
  { href: "/projects", label: "Главная", icon: Home },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
];

const MAX_PROJECTS = 8;

export function DashboardSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const initial = userName.trim().charAt(0).toUpperCase() || "?";
  const [projects, setProjects] = useState<SidebarProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const refetchProjects = useCallback(() => {
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SidebarProject[]) => setProjects(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingProjects(true);
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SidebarProject[]) => setProjects(data))
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, []);

  const visibleProjects = projects.slice(0, MAX_PROJECTS);
  const overflow = projects.length - MAX_PROJECTS;

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

      <nav className="flex flex-1 flex-col overflow-y-auto px-2 pt-4 gap-4" aria-label="Основная навигация">
        {/* Navigation */}
        <div>
          <span className="mb-1.5 block px-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Навигация
          </span>
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/projects"
                  ? pathname === "/projects"
                  : pathname.startsWith(item.href);
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
        </div>

        {/* Projects */}
        <div>
          <span className="mb-1.5 block px-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
            Проекты
          </span>
          <div className="flex flex-col gap-0.5">
            {loadingProjects ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex h-8 items-center gap-2.5 px-2">
                    <div className="h-3.5 w-3.5 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 flex-1 rounded bg-white/10 animate-pulse" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {visibleProjects.map((project) => {
                  const isActive = pathname.startsWith(`/projects/${project.id}`);
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className={cn(
                        "flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors group",
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                      )}
                    >
                      <FolderKanban
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isActive ? "text-violet-400" : "text-zinc-500"
                        )}
                        aria-hidden
                      />
                      <span className="flex-1 truncate">{project.name}</span>
                      {isActive && (
                        <ChevronRight className="h-3 w-3 text-zinc-500" aria-hidden />
                      )}
                      {!isActive && project._count.tasks > 0 && (
                        <span className="text-[10px] text-zinc-500">{project._count.tasks}</span>
                      )}
                    </Link>
                  );
                })}
                {overflow > 0 && (
                  <Link
                    href="/projects"
                    className="flex h-7 items-center px-2 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    + ещё {overflow}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setShowCreateProject(true)}
                  className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300 transition-colors mt-0.5"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Новый проект
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <CreateProjectModal
        open={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onCreated={(project) => {
          refetchProjects();
          router.push(`/projects/${project.id}`);
        }}
      />

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
