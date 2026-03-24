"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Settings, ArrowLeft, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import CreateTaskModal from "@/components/kanban/CreateTaskModal";
import AddMemberModal from "@/components/projects/AddMemberModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const [showAddMember, setShowAddMember] = useState(false);

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
    <div className="flex flex-col h-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-2">
            {project.members.slice(0, 4).map((m) => (
              <Avatar
                key={m.id}
                className="h-7 w-7 border-2 border-background"
                title={m.user.name}
              >
                <AvatarFallback className="text-[10px]">
                  {m.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddMember(true)}
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Участник
          </Button>
          <Button size="sm" onClick={() => setShowCreateTask(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Задача
          </Button>
          <Link href={`/projects/${project.id}/settings`}>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <KanbanBoard
        tasks={tasks}
        members={project.members}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
        onTasksChange={handleTasksChange}
        onCountsChanged={handleCountsChanged}
      />

      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        projectId={project.id}
        members={project.members}
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
