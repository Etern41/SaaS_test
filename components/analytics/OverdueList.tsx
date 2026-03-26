"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { AlertCircle } from "lucide-react";

interface OverdueTask {
  id: string;
  title: string;
  assignee: { id: string; name: string; email: string } | null;
  deadline: string;
  daysOverdue: number;
}

export default function OverdueList({ tasks }: { tasks: OverdueTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 mb-2">
          <AlertCircle className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="text-sm text-muted-foreground">Просроченных задач нет</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50/50 p-3 sm:flex-row sm:items-center sm:gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-muted-foreground">
                TASK-{task.id.slice(0, 6).toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-medium truncate">{task.title}</p>
            <p className="text-xs text-muted-foreground">
              Дедлайн: {format(new Date(task.deadline), "d MMMM yyyy", { locale: ru })}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant="destructive" className="text-[10px]">
              -{task.daysOverdue} дн.
            </Badge>
            {task.assignee && (
              <Avatar className="h-6 w-6" title={task.assignee.name}>
                <AvatarFallback className="text-[9px] bg-red-100 text-red-700">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
