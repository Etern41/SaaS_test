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
    <div className="flex flex-col h-full -m-4 md:-m-6">
      {/* Project sub-header */}
      <div className="border-b bg-card px-4 py-2 flex items-center gap-4 flex-wrap">
        <div className="flex gap-1">
          <button className="px-3 py-1.5 text-sm rounded-md bg-primary/10 text-primary font-medium">
            <LayoutGrid className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            Доска
          </button>
          <button className="px-3 py-1.5 text-sm rounded-md text-muted-foreground opacity-50 cursor-not-allowed" disabled>
            <List className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            Список
          </button>
          <button className="px-3 py-1.5 text-sm rounded-md text-muted-foreground opacity-50 cursor-not-allowed" disabled>
            <CalendarDays className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            Календарь
          </button>
        </div>
        <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
        <Select value={assigneeFilter} onValueChange={(v) => setAssigneeFilter(v)}>
          <SelectTrigger
            className={cn(
              "flex h-8 w-auto min-w-[9rem] max-w-[12rem] border-none shadow-none gap-1.5 px-2 py-1 text-sm",
              assigneeFilter === "all"
                ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                : "text-foreground bg-primary/10 font-medium"
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
              "flex h-8 w-auto min-w-[8.5rem] border-none shadow-none gap-1.5 px-2 py-1 text-sm",
              priorityFilter === "all"
                ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                : "text-foreground bg-primary/10 font-medium"
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
        <div className="ml-auto flex items-center gap-2">
          <div className="flex -space-x-2 mr-1">
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
            className="h-7 text-xs"
            onClick={() => setShowAddMember(true)}
          >
            <UserPlus className="mr-1 h-3 w-3" />
            Участник
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={() => { setCreateTaskStatus(undefined); setShowCreateTask(true); }}>
            <Plus className="mr-1 h-3 w-3" />
            Задача
          </Button>
          <Link href={`/projects/${project.id}/settings`}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Project name bar */}
      <div className="px-4 py-2 flex items-center gap-2">
        <h1 className="text-base font-semibold">{project.name}</h1>
        {project.description && (
          <span className="text-xs text-muted-foreground hidden sm:inline">— {project.description}</span>
        )}
      </div>

      {/* Kanban board */}
      <div className="flex-1 min-h-0 kanban-board-bg px-4 py-3 overflow-hidden">
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
        onClose={() => { setShowCreateTask(false); setCreateTaskStatus(undefined); }}
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
