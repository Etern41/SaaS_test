"use client";

import { useDraggable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { format, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> =
  {
    LOW: { label: "Низкий", className: "bg-slate-100 text-slate-700 border-slate-200" },
    MEDIUM: { label: "Средний", className: "bg-blue-100 text-blue-700 border-blue-200" },
    HIGH: { label: "Высокий", className: "bg-orange-100 text-orange-700 border-orange-200" },
    URGENT: { label: "Срочный", className: "bg-red-100 text-red-700 border-red-200" },
  };

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
  priority: Priority;
  deadline: string | null;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  projectId: string;
  position: number;
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onClick?: () => void;
}

export default function TaskCard({ task, isOverlay, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  const isOverdue =
    task.deadline && isPast(new Date(task.deadline)) && task.status !== "DONE";
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  if (isOverlay) {
    return (
      <Card className="w-72 p-3 shadow-xl rotate-1 border-primary/30 opacity-95">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
          <Badge variant="outline" className={cn("shrink-0 text-[10px]", priorityConfig.className)}>
            {priorityConfig.label}
          </Badge>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.deadline && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.deadline), "d MMM", { locale: ru })}
              </div>
            )}
          </div>
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {task.assignee.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={isDragging ? undefined : onClick}
      className={cn(
        "cursor-grab p-3 hover:shadow-md active:cursor-grabbing select-none",
        isDragging && "opacity-30",
        isOverdue && "border-red-300 bg-red-50/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
        <Badge variant="outline" className={cn("shrink-0 text-[10px]", priorityConfig.className)}>
          {priorityConfig.label}
        </Badge>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.deadline && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.deadline), "d MMM", { locale: ru })}
            </div>
          )}
        </div>
        {task.assignee && (
          <Avatar className="h-6 w-6" title={task.assignee.name}>
            <AvatarFallback className="text-[10px]">
              {task.assignee.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </Card>
  );
}
