"use client";

import { useDraggable } from "@dnd-kit/core";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MessageSquare, CheckSquare, Paperclip } from "lucide-react";
import { format, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const PRIORITY_STYLES: Record<Priority, { label: string; classes: string }> = {
  LOW: {
    label: "Низкий",
    classes: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-400",
  },
  MEDIUM: {
    label: "Средний",
    classes: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  },
  HIGH: {
    label: "Высокий",
    classes: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  },
  URGENT: {
    label: "Срочный",
    classes: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  },
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
  const hasCounters =
    counts && (counts.subtasks > 0 || counts.comments > 0 || counts.attachments > 0);

  return (
    <div
      className={cn(
        "kanban-card-surface cursor-grab select-none px-3 py-2.5 active:cursor-grabbing",
        isOverlay && "shadow-xl ring-1 ring-primary/20 rotate-1"
      )}
    >
      <h4 className="text-sm font-medium leading-snug line-clamp-2 text-foreground">
        {task.title}
      </h4>

      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span className={cn("rounded-full text-[10px] font-semibold px-2 py-0.5", p.classes)}>
          {p.label}
        </span>
        {task.deadline && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px]",
              isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(task.deadline), "d MMM", { locale: ru })}
          </span>
        )}
        {task.assignee && (
          <Avatar className="h-5 w-5 ml-auto" title={task.assignee.name}>
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {task.assignee.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {hasCounters && (
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
          {counts.subtasks > 0 && (
            <span className="flex items-center gap-0.5">
              <CheckSquare className="h-3 w-3" />
              {counts.subtasks}
            </span>
          )}
          {counts.comments > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {counts.comments}
            </span>
          )}
          {counts.attachments > 0 && (
            <span className="flex items-center gap-0.5">
              <Paperclip className="h-3 w-3" />
              {counts.attachments}
            </span>
          )}
        </div>
      )}
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
