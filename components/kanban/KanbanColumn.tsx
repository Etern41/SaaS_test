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
  _count?: { subtasks: number; comments: number; attachments: number };
}

export default function KanbanColumn({
  id,
  title,
  color,
  borderColor,
  tasks,
  activeTaskId,
  onTaskClick,
}: {
  id: TaskStatus;
  title: string;
  color: string;
  borderColor: string;
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
        "kanban-column border-t-2 transition-all duration-150",
        borderColor,
        isOver && "ring-2 ring-primary/40 bg-primary/[0.03]"
      )}
    >
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
          <span>{title}</span>
        </div>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
          {visibleTasks.length}
        </span>
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
          <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/[0.04] h-14 shrink-0" />
        )}
        {visibleTasks.length === 0 && !isOver && (
          <div className="flex flex-1 items-center justify-center py-8 text-xs text-muted-foreground">
            Нет задач
          </div>
        )}
      </div>
    </div>
  );
}
