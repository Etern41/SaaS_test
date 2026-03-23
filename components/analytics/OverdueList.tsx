"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

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
      <p className="py-8 text-center text-sm text-muted-foreground">
        Нет просроченных задач
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Задача</th>
            <th className="pb-2 font-medium">Исполнитель</th>
            <th className="pb-2 font-medium">Дедлайн</th>
            <th className="pb-2 font-medium text-right">Просрочка</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b last:border-0">
              <td className="py-2 font-medium">{task.title}</td>
              <td className="py-2 text-muted-foreground">
                {task.assignee?.name || "—"}
              </td>
              <td className="py-2 text-muted-foreground">
                {format(new Date(task.deadline), "d MMM yyyy", { locale: ru })}
              </td>
              <td className="py-2 text-right">
                <Badge variant="destructive">
                  {task.daysOverdue} {getDayWord(task.daysOverdue)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getDayWord(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "день";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100))
    return "дня";
  return "дней";
}
