"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Settings, Plus, UserPlus, LayoutGrid, List, CalendarDays, User, Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import CreateTaskModal from "@/components/kanban/CreateTaskModal";
import AddMemberModal from "@/components/projects/AddMemberModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface TaskAssignee {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline: string | null;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  projectId: string;
  position: number;
  _count?: { subtasks: number; comments: number; attachments: number };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  members: Member[];
  tasks: Task[];
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<string | undefined>();
  const [showAddMember, setShowAddMember] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "none" | string>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Task["priority"]>("all");

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data: Project = await res.json();
      setProject(data);
      setTasks(data.tasks);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleTaskCreated = useCallback((newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const handleTaskUpdated = useCallback((updated: Task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...updated, _count: updated._count ?? t._count }
          : t
      )
    );
  }, []);

  const handleTaskDeleted = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const handleTasksChange = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  const handleCountsChanged = useCallback(
    (taskId: string, counts: { subtasks: number; comments: number; attachments: number }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, _count: counts } : t))
      );
    },
    []
  );

  const handleAddTaskFromColumn = useCallback((status: string) => {
    setCreateTaskStatus(status);
    setShowCreateTask(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Проект не найден</p>
        <Link href="/projects">
          <Button variant="link">Вернуться к проектам</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full max-w-full flex-col">
      {/* Project sub-header */}
      <div className="border-b bg-card">
        <div className="flex flex-col gap-2 px-2 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2 sm:px-4 sm:py-2">
          <div className="flex shrink-0 gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              className="shrink-0 whitespace-nowrap rounded-md bg-primary/10 px-2 py-1.5 text-xs font-medium text-primary sm:px-3 sm:text-sm"
            >
              <LayoutGrid className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
              Доска
            </button>
            <button
              type="button"
              className="shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs text-muted-foreground opacity-50 sm:px-3 sm:text-sm"
              disabled
            >
              <List className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
              Список
            </button>
            <button
              type="button"
              className="shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs text-muted-foreground opacity-50 sm:px-3 sm:text-sm"
              disabled
            >
              <CalendarDays className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
              Календарь
            </button>
          </div>

          <div className="hidden h-4 w-px shrink-0 bg-border sm:block" />

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <Select value={assigneeFilter} onValueChange={(v) => setAssigneeFilter(v)}>
              <SelectTrigger
                className={cn(
                  "h-8 min-w-0 flex-1 border border-transparent shadow-none sm:max-w-[11rem] sm:flex-none sm:border-none",
                  assigneeFilter === "all"
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "bg-primary/10 font-medium text-foreground"
                )}
                aria-label="Фильтр по исполнителю"
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                <SelectValue placeholder="Исполнитель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все исполнители</SelectItem>
                <SelectItem value="none">Без исполнителя</SelectItem>
                {project.members.map((m) => (
                  <SelectItem key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as "all" | Task["priority"])}>
              <SelectTrigger
                className={cn(
                  "h-8 min-w-0 flex-1 border border-transparent shadow-none sm:max-w-[10rem] sm:flex-none sm:border-none",
                  priorityFilter === "all"
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "bg-primary/10 font-medium text-foreground"
                )}
                aria-label="Фильтр по приоритету"
              >
                <Flag className="h-3.5 w-3.5 shrink-0" />
                <SelectValue placeholder="Приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любой приоритет</SelectItem>
                <SelectItem value="LOW">Низкий</SelectItem>
                <SelectItem value="MEDIUM">Средний</SelectItem>
                <SelectItem value="HIGH">Высокий</SelectItem>
                <SelectItem value="URGENT">Срочный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:ml-auto sm:gap-2">
            <div className="mr-0.5 hidden min-w-0 -space-x-2 sm:flex">
              {project.members.slice(0, 4).map((m) => (
                <Avatar
                  key={m.id}
                  className="h-6 w-6 border-2 border-card"
                  title={m.user.name}
                >
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                    {m.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 4 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] text-muted-foreground">
                  +{project.members.length - 4}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 shrink-0 px-2 text-xs sm:h-7 sm:px-3"
              onClick={() => setShowAddMember(true)}
              title="Добавить участника"
            >
              <UserPlus className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Участник</span>
            </Button>
            <Button
              size="sm"
              className="h-8 shrink-0 px-2 text-xs sm:h-7 sm:px-3"
              onClick={() => {
                setCreateTaskStatus(undefined);
                setShowCreateTask(true);
              }}
              title="Новая задача"
            >
              <Plus className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Задача</span>
            </Button>
            <Link href={`/projects/${project.id}/settings`} className="shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-7 sm:w-7" title="Настройки">
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Project name bar */}
      <div className="flex min-w-0 items-start gap-2 px-2 py-2 sm:px-4">
        <h1 className="min-w-0 truncate text-sm font-semibold sm:text-base">{project.name}</h1>
        {project.description && (
          <span className="hidden min-w-0 truncate text-xs text-muted-foreground sm:inline sm:max-w-[50%]">
            — {project.description}
          </span>
        )}
      </div>

      {/* Kanban board */}
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden kanban-board-bg px-2 py-2 sm:px-4 sm:py-3">
        <KanbanBoard
          tasks={tasks}
          members={project.members}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onTasksChange={handleTasksChange}
          onCountsChanged={handleCountsChanged}
          onAddTask={handleAddTaskFromColumn}
          assigneeFilter={assigneeFilter}
          priorityFilter={priorityFilter}
        />
      </div>

      <CreateTaskModal
        open={showCreateTask}
        onClose={() => {
          setShowCreateTask(false);
          setCreateTaskStatus(undefined);
        }}
        projectId={project.id}
        members={project.members}
        defaultStatus={createTaskStatus}
        onCreated={(newTask) => {
          handleTaskCreated(newTask);
          toast.success("Задача создана");
        }}
      />

      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        projectId={project.id}
        onAdded={fetchProject}
      />
    </div>
  );
}
