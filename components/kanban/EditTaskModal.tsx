"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Trash2,
  Copy,
  Check,
  Plus,
  X,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Link as LinkIcon,
  Loader2,
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

type TabId = "details" | "subtasks" | "comments" | "attachments";

export default function EditTaskModal({
  open, onClose, task, members, onTaskUpdated, onTaskDeleted, onCountsChanged,
}: {
  open: boolean; onClose: () => void; task: Task; members: Member[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onCountsChanged?: (taskId: string, counts: { subtasks: number; comments: number; attachments: number }) => void;
}) {
  const [tab, setTab] = useState<TabId>("details");
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
      id: `temp-${Date.now()}`,
      body: newComment,
      authorId: "",
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
    const optimistic: Subtask = {
      id: `temp-${Date.now()}`,
      title: newSubtask,
      done: false,
    };
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
      if (!res.ok) {
        setSubtasks(prev);
        toast.error("Не удалось обновить подзадачу");
      }
    } catch {
      setSubtasks(prev);
      toast.error("Ошибка сервера");
    }
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
    const optimistic: Attachment = {
      id: `temp-${Date.now()}`,
      name: attachName,
      url: attachUrl,
      createdAt: new Date().toISOString(),
    };
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

  const TABS: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "details", label: "Детали", icon: null },
    { id: "subtasks", label: "Подзадачи", icon: <CheckSquare className="h-3.5 w-3.5" />, count: subtasks.length },
    { id: "comments", label: "Комментарии", icon: <MessageSquare className="h-3.5 w-3.5" />, count: comments.length },
    { id: "attachments", label: "Вложения", icon: <Paperclip className="h-3.5 w-3.5" />, count: attachments.length },
  ];

  const doneCount = subtasks.filter((s) => s.done).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={copyId}
              className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground hover:bg-muted/80 transition-colors"
              title="Скопировать ID"
            >
              {taskShortId}
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <DialogTitle className="text-lg">Редактировать задачу</DialogTitle>
          <DialogDescription className="sr-only">Редактирование задачи {taskShortId}</DialogDescription>
        </DialogHeader>

        <div className="flex border-b px-6 gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="ml-0.5 rounded-full bg-muted px-1.5 text-[10px]">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          {tab === "details" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={LIMITS.TASK_TITLE} required />
                <span className="text-[10px] text-muted-foreground">{title.length}/{LIMITS.TASK_TITLE}</span>
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={LIMITS.TASK_DESCRIPTION} rows={3} />
                <span className="text-[10px] text-muted-foreground">{description.length}/{LIMITS.TASK_DESCRIPTION}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as Task["status"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label>Дедлайн</Label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Исполнитель</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без исполнителя</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.user.id} value={m.user.id}>{m.user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {tab === "subtasks" && (
            <div className="space-y-3">
              {subtasks.length > 0 && (
                <div className="text-xs text-muted-foreground mb-2">
                  Выполнено: {doneCount}/{subtasks.length}
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
              {subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleSubtask(sub)}
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      sub.done
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {sub.done && <Check className="h-3 w-3" />}
                  </button>
                  <span className={cn("text-sm flex-1", sub.done && "line-through text-muted-foreground")}>
                    {sub.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask(sub.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Input
                  placeholder="Новая подзадача..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  maxLength={LIMITS.SUBTASK_TITLE}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  className="text-sm"
                />
                <Button size="sm" onClick={addSubtask} disabled={addingSubtask || !newSubtask.trim()}>
                  {addingSubtask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {tab === "comments" && (
            <div className="space-y-4">
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Нет комментариев</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {c.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
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
              <div className="flex gap-2 pt-2 border-t">
                <Textarea
                  placeholder="Написать комментарий..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={LIMITS.COMMENT_BODY}
                  rows={2}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={addComment}
                  disabled={addingComment || !newComment.trim()}
                  className="self-end"
                >
                  {addingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Отправить"}
                </Button>
              </div>
            </div>
          )}

          {tab === "attachments" && (
            <div className="space-y-3">
              {attachments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Нет вложений</p>
              )}
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border p-2.5 group">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted shrink-0">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
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
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs">Добавить вложение (ссылка)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Название" value={attachName} onChange={(e) => setAttachName(e.target.value)} maxLength={LIMITS.ATTACHMENT_NAME} className="text-sm" />
                  <Input placeholder="https://..." value={attachUrl} onChange={(e) => setAttachUrl(e.target.value)} maxLength={LIMITS.ATTACHMENT_URL} className="text-sm" />
                </div>
                <Button size="sm" onClick={addAttachment} disabled={addingAttach || !attachName.trim() || !attachUrl.trim()}>
                  {addingAttach ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Paperclip className="h-3.5 w-3.5 mr-1" /> Добавить</>}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-3 bg-muted/30">
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {deleting ? "Удаление..." : "Удалить"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Отмена</Button>
            <Button size="sm" onClick={handleSave} disabled={loading || !title.trim()}>
              {loading ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Сохранение...</> : "Сохранить"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
