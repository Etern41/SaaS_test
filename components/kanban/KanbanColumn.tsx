"use client";

import { useDroppable } from "@dnd-kit/core";
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
}

const COLUMN_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-slate-500",
  IN_PROGRESS: "bg-blue-500",
  REVIEW: "bg-amber-500",
  DONE: "bg-green-500",
};

export default function KanbanColumn({
  id,
  title,
  tasks,
  activeTaskId,
  onTaskClick,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  activeTaskId: string | null;
  onTaskClick: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const visibleTasks = tasks.filter((t) => t.id !== activeTaskId);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 min-w-[288px] flex-col rounded-lg border transition-all duration-150",
        isOver
          ? "border-primary/50 bg-primary/[0.04] shadow-sm"
          : "bg-muted/50 border-border"
      )}
    >
      <div className="flex items-center gap-2 p-3 pb-2">
        <div className={cn("h-2.5 w-2.5 rounded-full", COLUMN_COLORS[id])} />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {visibleTasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2 min-h-[120px]">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
        {isOver && (
          <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/[0.03] h-16" />
        )}
      </div>
    </div>
  );
}
