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

export default function KanbanColumn(props: {
  id: TaskStatus;
  title: string;
  color: string;
  borderColor: string;
  tasks: Task[];
  activeTaskId: string | null;
  onTaskClick: (task: Task) => void;
}) {
  const { id, title, color, tasks, activeTaskId, onTaskClick } = props;
  const { setNodeRef, isOver } = useDroppable({ id });
  const visibleTasks = tasks.filter((t) => t.id !== activeTaskId);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "kanban-column transition-all duration-150",
        isOver && "ring-1 ring-primary/20 bg-primary/[0.02]"
      )}
    >
      <div className="flex items-center gap-2 px-2 py-3">
        <div className={cn("h-2 w-2 rounded-full shrink-0", color)} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
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
          <div className="rounded-md border border-dashed border-primary/20 bg-primary/[0.03] h-12 shrink-0" />
        )}
        {visibleTasks.length === 0 && !isOver && (
          <div className="flex flex-1 items-center justify-center py-8 text-sm text-muted-foreground">
            Нет задач
          </div>
        )}
      </div>
    </div>
  );
}
