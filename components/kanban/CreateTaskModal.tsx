"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LIMITS } from "@/lib/validations";

interface TaskAssignee { id: string; name: string; email: string }

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
  _count?: { subtasks: number; comments: number; attachments: number };
}

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

export default function CreateTaskModal({
  open, onClose, projectId, members, onCreated,
}: {
  open: boolean; onClose: () => void; projectId: string;
  members: Member[]; onCreated: (task: Task) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const deadline = formData.get("deadline") as string;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description: description || null,
          deadline: deadline || null,
          assigneeId: assigneeId && assigneeId !== "none" ? assigneeId : null,
          priority, projectId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка создания задачи");
        setLoading(false);
        return;
      }

      const newTask: Task = await res.json();
      onCreated({
        ...newTask,
        _count: { subtasks: 0, comments: 0, attachments: 0 },
      });
      onClose();
      setTitle(""); setDescription("");
      setAssigneeId(""); setPriority("MEDIUM");
    } catch {
      setError("Ошибка сервера");
      toast.error("Не удалось создать задачу");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
          <DialogDescription>Создайте задачу для проекта</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label>Название</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название задачи" maxLength={LIMITS.TASK_TITLE} required />
            <span className="text-[10px] text-muted-foreground">{title.length}/{LIMITS.TASK_TITLE}</span>
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание (необязательно)" maxLength={LIMITS.TASK_DESCRIPTION} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Низкий</SelectItem>
                  <SelectItem value="MEDIUM">Средний</SelectItem>
                  <SelectItem value="HIGH">Высокий</SelectItem>
                  <SelectItem value="URGENT">Срочный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Дедлайн</Label>
              <Input name="deadline" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Исполнитель</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger><SelectValue placeholder="Выберите исполнителя" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без исполнителя</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.user.id} value={m.user.id}>{m.user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />Создание...</> : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
