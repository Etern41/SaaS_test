"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import { cn } from "@/lib/utils";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

interface TaskAssignee {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline: string | null;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  projectId: string;
  position: number;
  _count?: { subtasks: number; comments: number; attachments: number };
}

const STATUS_PILL: Record<TaskStatus, { light: string; dark: string }> = {
  TODO: {
    light: "bg-slate-200 text-slate-700",
    dark: "dark:bg-slate-700/50 dark:text-slate-300",
  },
  IN_PROGRESS: {
    light: "bg-blue-100 text-blue-700",
    dark: "dark:bg-blue-900/40 dark:text-blue-300",
  },
  REVIEW: {
    light: "bg-amber-100 text-amber-700",
    dark: "dark:bg-amber-900/40 dark:text-amber-300",
  },
  DONE: {
    light: "bg-emerald-100 text-emerald-700",
    dark: "dark:bg-emerald-900/40 dark:text-emerald-300",
  },
};

export default function KanbanColumn(props: {
  id: TaskStatus;
  title: string;
  color: string;
  borderColor: string;
  tasks: Task[];
  activeTaskId: string | null;
  onTaskClick: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}) {
  const { id, title, tasks, activeTaskId, onTaskClick, onAddTask } = props;
  const { setNodeRef, isOver } = useDroppable({ id });
  const visibleTasks = tasks.filter((t) => t.id !== activeTaskId);
  const pill = STATUS_PILL[id];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "kanban-column transition-all duration-150",
        isOver && "ring-1 ring-primary/25"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
            pill.light,
            pill.dark
          )}
        >
          {title}
        </span>
        <span className="text-xs text-muted-foreground">{visibleTasks.length}</span>
      </div>

      <div className="kanban-column-scroll">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
        {isOver && (
          <div className="rounded-lg border border-dashed border-primary/25 bg-primary/[0.04] h-12 shrink-0" />
        )}
        {visibleTasks.length === 0 && !isOver && (
          <div className="flex flex-1 items-center justify-center py-8 text-sm text-muted-foreground">
            Нет задач
          </div>
        )}
      </div>

      {onAddTask && (
        <button
          type="button"
          onClick={() => onAddTask(id)}
          className="flex w-full items-center gap-2 rounded-b-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить задачу
        </button>
      )}
    </div>
  );
}
