"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Trash2,
  Copy,
  Check,
  Plus,
  X,
  Paperclip,
  CheckSquare,
  Link as LinkIcon,
  Loader2,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LIMITS } from "@/lib/validations";

interface TaskAssignee { id: string; name: string; email: string }
interface Task {
  id: string; title: string; description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline: string | null; assigneeId: string | null;
  assignee: TaskAssignee | null; projectId: string; position: number;
  _count?: { subtasks: number; comments: number; attachments: number };
}
interface Member { id: string; role: string; user: { id: string; name: string; email: string } }
interface Comment { id: string; body: string; authorId: string; createdAt: string; author: { id: string; name: string; email: string } }
interface Subtask { id: string; title: string; done: boolean }
interface Attachment { id: string; name: string; url: string; createdAt: string }

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  TODO: { label: "К выполнению", classes: "bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300" },
  IN_PROGRESS: { label: "В работе", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  REVIEW: { label: "На проверке", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  DONE: { label: "Готово", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
};

const PRIORITY_LABELS: Record<string, { label: string; classes: string }> = {
  LOW: { label: "Низкий", classes: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-400" },
  MEDIUM: { label: "Средний", classes: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
  HIGH: { label: "Высокий", classes: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400" },
  URGENT: { label: "Срочный", classes: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
};

export default function EditTaskModal({
  open, onClose, task, members, onTaskUpdated, onTaskDeleted, onCountsChanged,
}: {
  open: boolean; onClose: () => void; task: Task; members: Member[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onCountsChanged?: (taskId: string, counts: { subtasks: number; comments: number; attachments: number }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || "none");
  const [deadline, setDeadline] = useState(
    task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ""
  );

  const [comments, setComments] = useState<Comment[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [attachName, setAttachName] = useState("");
  const [attachUrl, setAttachUrl] = useState("");
  const [addingAttach, setAddingAttach] = useState(false);

  const taskShortId = `TASK-${task.id.slice(0, 6).toUpperCase()}`;

  const fetchComments = useCallback(async () => {
    const r = await fetch(`/api/tasks/${task.id}/comments`);
    if (r.ok) setComments(await r.json());
  }, [task.id]);

  const fetchSubtasks = useCallback(async () => {
    const r = await fetch(`/api/tasks/${task.id}/subtasks`);
    if (r.ok) setSubtasks(await r.json());
  }, [task.id]);

  const fetchAttachments = useCallback(async () => {
    const r = await fetch(`/api/tasks/${task.id}/attachments`);
    if (r.ok) setAttachments(await r.json());
  }, [task.id]);

  useEffect(() => {
    if (open) {
      fetchComments();
      fetchSubtasks();
      fetchAttachments();
    }
  }, [open, fetchComments, fetchSubtasks, fetchAttachments]);

  async function handleSave() {
    setLoading(true);
    setError("");
    const body = {
      title, description: description || null, priority, status,
      deadline: deadline || null,
      assigneeId: assigneeId === "none" ? null : assigneeId,
    };
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Ошибка");
        toast.error(d.error || "Ошибка сохранения");
      } else {
        const updated: Task = await res.json();
        onTaskUpdated({
          ...updated,
          _count: { subtasks: subtasks.length, comments: comments.length, attachments: attachments.length },
        });
        toast.success("Задача обновлена");
      }
    } catch {
      setError("Ошибка сервера");
      toast.error("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить задачу? Это действие необратимо.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (res.ok) {
        onTaskDeleted(task.id);
        toast.success("Задача удалена");
      } else {
        setError("Ошибка удаления");
        toast.error("Не удалось удалить задачу");
      }
    } catch {
      setError("Ошибка");
      toast.error("Ошибка сервера");
    } finally {
      setDeleting(false);
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;
    setAddingComment(true);
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`, body: newComment, authorId: "",
      createdAt: new Date().toISOString(),
      author: { id: "", name: "Вы", email: "" },
    };
    const prevComments = comments;
    setComments((prev) => [...prev, optimisticComment]);
    setNewComment("");
    onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: comments.length + 1, attachments: attachments.length });
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: optimisticComment.body }),
      });
      if (res.ok) {
        const real: Comment = await res.json();
        setComments((prev) => prev.map((c) => (c.id === optimisticComment.id ? real : c)));
      } else {
        setComments(prevComments);
        onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: prevComments.length, attachments: attachments.length });
        toast.error("Не удалось добавить комментарий");
      }
    } catch {
      setComments(prevComments);
      onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: prevComments.length, attachments: attachments.length });
      toast.error("Ошибка сервера");
    } finally {
      setAddingComment(false);
    }
  }

  async function deleteComment(id: string) {
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== id));
    onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: comments.length - 1, attachments: attachments.length });
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setComments(prev);
        onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: prev.length, attachments: attachments.length });
        toast.error("Не удалось удалить комментарий");
      }
    } catch {
      setComments(prev);
      onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: prev.length, attachments: attachments.length });
      toast.error("Ошибка сервера");
    }
  }

  async function addSubtask() {
    if (!newSubtask.trim()) return;
    setAddingSubtask(true);
    const optimistic: Subtask = { id: `temp-${Date.now()}`, title: newSubtask, done: false };
    const prev = subtasks;
    setSubtasks((s) => [...s, optimistic]);
    setNewSubtask("");
    onCountsChanged?.(task.id, { subtasks: subtasks.length + 1, comments: comments.length, attachments: attachments.length });
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: optimistic.title }),
      });
      if (res.ok) {
        const real: Subtask = await res.json();
        setSubtasks((s) => s.map((x) => (x.id === optimistic.id ? real : x)));
      } else {
        setSubtasks(prev);
        onCountsChanged?.(task.id, { subtasks: prev.length, comments: comments.length, attachments: attachments.length });
        toast.error("Не удалось добавить подзадачу");
      }
    } catch {
      setSubtasks(prev);
      onCountsChanged?.(task.id, { subtasks: prev.length, comments: comments.length, attachments: attachments.length });
      toast.error("Ошибка сервера");
    } finally {
      setAddingSubtask(false);
    }
  }

  async function toggleSubtask(sub: Subtask) {
    const prev = subtasks;
    setSubtasks((s) => s.map((x) => (x.id === sub.id ? { ...x, done: !x.done } : x)));
    try {
      const res = await fetch(`/api/subtasks/${sub.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !sub.done }),
      });
      if (!res.ok) { setSubtasks(prev); toast.error("Не удалось обновить подзадачу"); }
    } catch { setSubtasks(prev); toast.error("Ошибка сервера"); }
  }

  async function deleteSubtask(id: string) {
    const prev = subtasks;
    setSubtasks((s) => s.filter((x) => x.id !== id));
    onCountsChanged?.(task.id, { subtasks: subtasks.length - 1, comments: comments.length, attachments: attachments.length });
    try {
      const res = await fetch(`/api/subtasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setSubtasks(prev);
        onCountsChanged?.(task.id, { subtasks: prev.length, comments: comments.length, attachments: attachments.length });
        toast.error("Не удалось удалить подзадачу");
      }
    } catch {
      setSubtasks(prev);
      onCountsChanged?.(task.id, { subtasks: prev.length, comments: comments.length, attachments: attachments.length });
      toast.error("Ошибка сервера");
    }
  }

  async function addAttachment() {
    if (!attachName.trim() || !attachUrl.trim()) return;
    setAddingAttach(true);
    const optimistic: Attachment = { id: `temp-${Date.now()}`, name: attachName, url: attachUrl, createdAt: new Date().toISOString() };
    const prev = attachments;
    setAttachments((a) => [optimistic, ...a]);
    setAttachName(""); setAttachUrl("");
    onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: comments.length, attachments: attachments.length + 1 });
    try {
      const res = await fetch(`/api/tasks/${task.id}/attachments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: optimistic.name, url: optimistic.url }),
      });
      if (res.ok) {
        const real: Attachment = await res.json();
        setAttachments((a) => a.map((x) => (x.id === optimistic.id ? real : x)));
      } else {
        setAttachments(prev);
        onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: comments.length, attachments: prev.length });
        toast.error("Не удалось добавить вложение");
      }
    } catch {
      setAttachments(prev);
      onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: comments.length, attachments: prev.length });
      toast.error("Ошибка сервера");
    } finally {
      setAddingAttach(false);
    }
  }

  async function deleteAttachment(id: string) {
    const prev = attachments;
    setAttachments((a) => a.filter((x) => x.id !== id));
    onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: comments.length, attachments: attachments.length - 1 });
    try {
      const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setAttachments(prev);
        onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: comments.length, attachments: prev.length });
        toast.error("Не удалось удалить вложение");
      }
    } catch {
      setAttachments(prev);
      onCountsChanged?.(task.id, { subtasks: subtasks.length, comments: comments.length, attachments: prev.length });
      toast.error("Ошибка сервера");
    }
  }

  function copyId() {
    navigator.clipboard.writeText(task.id);
    setCopied(true);
    toast.success("ID скопирован");
    setTimeout(() => setCopied(false), 1500);
  }

  const doneCount = subtasks.filter((s) => s.done).length;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[780px] max-w-[90vw] p-0 flex flex-col md:flex-row h-full">
        <SheetTitle className="sr-only">Задача {taskShortId}</SheetTitle>
        <SheetDescription className="sr-only">Панель редактирования задачи</SheetDescription>

        {/* LEFT: Main content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-w-0">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {/* Task ID */}
          <div className="mb-3">
            <button
              onClick={copyId}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-mono text-muted-foreground hover:bg-muted/80 transition-colors"
              title="Скопировать ID"
            >
              #{taskShortId}
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={LIMITS.TASK_TITLE}
            className="text-xl font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
            placeholder="Название задачи"
          />
          <span className="text-[10px] text-muted-foreground">{title.length}/{LIMITS.TASK_TITLE}</span>

          {/* Status + Priority pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Select value={status} onValueChange={(v) => setStatus(v as Task["status"])}>
              <SelectTrigger className="w-auto h-7 border-none shadow-none px-0 gap-1">
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", STATUS_LABELS[status].classes)}>
                  {STATUS_LABELS[status].label}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">К выполнению</SelectItem>
                <SelectItem value="IN_PROGRESS">В работе</SelectItem>
                <SelectItem value="REVIEW">На проверке</SelectItem>
                <SelectItem value="DONE">Готово</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
              <SelectTrigger className="w-auto h-7 border-none shadow-none px-0 gap-1">
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", PRIORITY_LABELS[priority].classes)}>
                  {PRIORITY_LABELS[priority].label}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Низкий</SelectItem>
                <SelectItem value="MEDIUM">Средний</SelectItem>
                <SelectItem value="HIGH">Высокий</SelectItem>
                <SelectItem value="URGENT">Срочный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Исполнитель</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без исполнителя</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id}>{m.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Дедлайн</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-9" />
            </div>
          </div>

          {/* Description */}
          <div className="mt-5 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Описание</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={LIMITS.TASK_DESCRIPTION}
              rows={3}
              placeholder="Добавить описание..."
              className="resize-none"
            />
            <span className="text-[10px] text-muted-foreground">{description.length}/{LIMITS.TASK_DESCRIPTION}</span>
          </div>

          {/* Subtasks */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Подзадачи</span>
              {subtasks.length > 0 && (
                <span className="text-[11px] text-muted-foreground">{doneCount}/{subtasks.length}</span>
              )}
            </div>
            {subtasks.length > 0 && (
              <div className="mb-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0}%` }}
                />
              </div>
            )}
            <div className="space-y-1.5">
              {subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 group py-0.5">
                  <button
                    onClick={() => toggleSubtask(sub)}
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      sub.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-border hover:border-primary"
                    )}
                  >
                    {sub.done && <Check className="h-3 w-3" />}
                  </button>
                  <span className={cn("text-sm flex-1", sub.done && "line-through text-muted-foreground")}>{sub.title}</span>
                  <button
                    onClick={() => deleteSubtask(sub.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="+ Добавить подзадачу..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                maxLength={LIMITS.SUBTASK_TITLE}
                onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                className="text-sm h-8"
              />
              <Button size="sm" variant="ghost" onClick={addSubtask} disabled={addingSubtask || !newSubtask.trim()} className="h-8 px-2">
                {addingSubtask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Attachments */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Вложения</span>
              {attachments.length > 0 && (
                <span className="text-[11px] text-muted-foreground">{attachments.length}</span>
              )}
            </div>
            <div className="space-y-1.5">
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 rounded-md border p-2 group">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-muted shrink-0">
                    <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline truncate block">
                      {a.name}
                    </a>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(a.createdAt), "d MMM yyyy", { locale: ru })}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteAttachment(a.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input placeholder="Название" value={attachName} onChange={(e) => setAttachName(e.target.value)} maxLength={LIMITS.ATTACHMENT_NAME} className="text-sm h-8" />
              <Input placeholder="https://..." value={attachUrl} onChange={(e) => setAttachUrl(e.target.value)} maxLength={LIMITS.ATTACHMENT_URL} className="text-sm h-8" />
              <Button size="sm" variant="ghost" onClick={addAttachment} disabled={addingAttach || !attachName.trim() || !attachUrl.trim()} className="h-8 px-2">
                {addingAttach ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-8 pt-4 border-t">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              {deleting ? "Удаление..." : "Удалить"}
            </Button>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>Отмена</Button>
              <Button size="sm" onClick={handleSave} disabled={loading || !title.trim()}>
                {loading ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Сохранение...</> : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: Activity / Comments */}
        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l bg-muted/30 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-semibold">Активность</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Нет комментариев</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5 group">
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {c.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium">{c.author.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(c.createdAt), "d MMM, HH:mm", { locale: ru })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap break-words">{c.body}</p>
                </div>
                <button
                  onClick={() => deleteComment(c.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0 self-start mt-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="border-t px-4 py-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Написать комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={LIMITS.COMMENT_BODY}
                rows={2}
                className="text-sm resize-none flex-1"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
              />
              <Button
                size="icon"
                onClick={addComment}
                disabled={addingComment || !newComment.trim()}
                className="self-end h-9 w-9 shrink-0"
              >
                {addingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
