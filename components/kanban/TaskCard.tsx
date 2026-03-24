"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare, CheckSquare, Paperclip } from "lucide-react";
import { format, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const PRIORITY_STYLES: Record<Priority, { label: string; className: string }> = {
  LOW: { label: "Низкий", className: "bg-slate-100 text-slate-600 border-slate-200" },
  MEDIUM: { label: "Средний", className: "bg-blue-50 text-blue-700 border-blue-200" },
  HIGH: { label: "Высокий", className: "bg-amber-50 text-amber-700 border-amber-200" },
  URGENT: { label: "Срочный", className: "bg-red-50 text-red-700 border-red-200" },
};

interface TaskAssignee { id: string; name: string; email: string }

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: Priority;
  deadline: string | null;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  projectId: string;
  position: number;
  _count?: { subtasks: number; comments: number; attachments: number };
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onClick?: () => void;
}

function CardContent({ task, isOverlay }: { task: Task; isOverlay?: boolean }) {
  const isOverdue =
    task.deadline && isPast(new Date(task.deadline)) && task.status !== "DONE";
  const p = PRIORITY_STYLES[task.priority];
  const counts = task._count;

  return (
    <div
      className={cn(
        "kanban-card-surface cursor-grab select-none p-3 active:cursor-grabbing",
        isOverlay && "shadow-xl ring-1 ring-primary/20 rotate-1",
        isOverdue && "border-red-200 bg-red-50/40"
      )}
    >
      <div className="mb-1 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
        TASK-{task.id.slice(0, 6)}
      </div>

      <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-2">
        {task.title}
      </h4>

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", p.className)}>
          {p.label}
        </Badge>
        {task.deadline && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px]",
              isOverdue
                ? "bg-red-100 text-red-700 font-medium"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(task.deadline), "d MMM", { locale: ru })}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          {counts && counts.subtasks > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <CheckSquare className="h-3 w-3" />
              {counts.subtasks}
            </span>
          )}
          {counts && counts.comments > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <MessageSquare className="h-3 w-3" />
              {counts.comments}
            </span>
          )}
          {counts && counts.attachments > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <Paperclip className="h-3 w-3" />
              {counts.attachments}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar className="h-6 w-6" title={task.assignee.name}>
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {task.assignee.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}

export default function TaskCard({ task, isOverlay, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  if (isOverlay) {
    return <CardContent task={task} isOverlay />;
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={isDragging ? undefined : onClick}
      className={cn(isDragging && "opacity-30")}
    >
      <CardContent task={task} />
    </div>
  );
}
