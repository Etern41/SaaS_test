"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusChart from "@/components/analytics/StatusChart";
import OverdueList from "@/components/analytics/OverdueList";
import { CheckCircle, ListTodo, AlertTriangle, BarChart3 } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface OverdueTask {
  id: string;
  title: string;
  assignee: { id: string; name: string; email: string } | null;
  deadline: string;
  daysOverdue: number;
}

interface AnalyticsData {
  statusCounts: {
    TODO: number;
    IN_PROGRESS: number;
    REVIEW: number;
    DONE: number;
  };
  overdueTasks: OverdueTask[];
  totalTasks: number;
  completedPercent: number;
  overdueCount: number;
}

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch("/api/projects");
      const list = await res.json();
      setProjects(list);
      if (list.length > 0) {
        setSelectedProject(list[0].id);
      }
    }
    fetchProjects();
  }, []);

  const fetchAnalytics = useCallback(async (projectId: string) => {
    setLoading(true);
    const res = await fetch(`/api/analytics/${projectId}`);
    if (res.ok) {
      const d = await res.json();
      setData(d);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchAnalytics(selectedProject);
    }
  }, [selectedProject, fetchAnalytics]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl">Аналитика</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Статистика по проекту</p>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-full min-w-0 sm:w-[250px]">
            <SelectValue placeholder="Выберите проект" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего задач
                </CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalTasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Выполнено
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.completedPercent}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Просрочено
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {data.overdueCount}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Задачи по статусам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusChart statusCounts={data.statusCounts} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Просроченные задачи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OverdueList tasks={data.overdueTasks} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Выберите проект для просмотра аналитики
        </div>
      )}
    </div>
  );
}
