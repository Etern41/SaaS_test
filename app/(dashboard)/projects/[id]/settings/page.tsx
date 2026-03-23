"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  role: string;
  userId: string;
  user: { id: string; name: string; email: string };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  members: Member[];
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      setProject(await res.json());
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (res.ok) {
      setSuccess("Проект обновлён");
      fetchProject();
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Удалить проект и все задачи? Это действие необратимо.")) return;
    setDeleting(true);

    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/projects");
    } else {
      setError("Ошибка удаления проекта");
      setDeleting(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm("Удалить участника из проекта?")) return;

    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      fetchProject();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return <p>Проект не найден</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Настройки проекта</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
                {success}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="settings-name">Название</Label>
              <Input
                id="settings-name"
                name="name"
                defaultValue={project.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-desc">Описание</Label>
              <Textarea
                id="settings-desc"
                name="description"
                defaultValue={project.description || ""}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Участники</CardTitle>
          <CardDescription>
            Управление участниками проекта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{m.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.role === "OWNER" ? "default" : "secondary"}>
                    {m.role === "OWNER" ? "Владелец" : "Участник"}
                  </Badge>
                  {m.role !== "OWNER" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(m.user.id)}
                    >
                      <UserMinus className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Опасная зона</CardTitle>
          <CardDescription>
            Удаление проекта удалит все задачи и данные
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Удаление..." : "Удалить проект"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
