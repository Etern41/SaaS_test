"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

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
}

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  members: Member[];
  onUpdated: () => void;
}

export default function EditTaskModal({
  open,
  onClose,
  task,
  members,
  onUpdated,
}: EditTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "none");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const deadline = formData.get("deadline") as string;

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          deadline: deadline || null,
          assigneeId: assigneeId === "none" ? null : assigneeId,
          priority,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка обновления");
        setLoading(false);
        return;
      }

      onUpdated();
      onClose();
    } catch {
      setError("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить задачу? Это действие необратимо.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка удаления");
        setDeleting(false);
        return;
      }

      onUpdated();
      onClose();
    } catch {
      setError("Ошибка сервера");
      setDeleting(false);
    }
  }

  const deadlineValue = task.deadline
    ? new Date(task.deadline).toISOString().split("T")[0]
    : "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать задачу</DialogTitle>
          <DialogDescription>Измените параметры задачи</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Название</Label>
            <Input
              id="edit-title"
              name="title"
              defaultValue={task.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Описание</Label>
            <Textarea
              id="edit-desc"
              name="description"
              defaultValue={task.description || ""}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Task["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">К выполнению</SelectItem>
                  <SelectItem value="IN_PROGRESS">В работе</SelectItem>
                  <SelectItem value="REVIEW">На проверке</SelectItem>
                  <SelectItem value="DONE">Готово</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Низкий</SelectItem>
                  <SelectItem value="MEDIUM">Средний</SelectItem>
                  <SelectItem value="HIGH">Высокий</SelectItem>
                  <SelectItem value="URGENT">Срочный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Дедлайн</Label>
              <Input
                id="edit-deadline"
                name="deadline"
                type="date"
                defaultValue={deadlineValue}
              />
            </div>
            <div className="space-y-2">
              <Label>Исполнитель</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без исполнителя</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id}>
                      {m.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              {deleting ? "Удаление..." : "Удалить"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
