import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.projectId,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  const tasks = await prisma.task.findMany({
    where: { projectId: params.projectId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  const now = new Date();

  const statusCounts = {
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    DONE: 0,
  };

  const overdueTasks: Array<{
    id: string;
    title: string;
    assignee: { id: string; name: string; email: string } | null;
    deadline: Date;
    daysOverdue: number;
  }> = [];

  for (const task of tasks) {
    statusCounts[task.status]++;

    if (task.deadline && task.deadline < now && task.status !== "DONE") {
      const diffMs = now.getTime() - task.deadline.getTime();
      const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      overdueTasks.push({
        id: task.id,
        title: task.title,
        assignee: task.assignee,
        deadline: task.deadline,
        daysOverdue,
      });
    }
  }

  const totalTasks = tasks.length;
  const completedPercent =
    totalTasks > 0
      ? Math.round((statusCounts.DONE / totalTasks) * 100)
      : 0;

  return NextResponse.json({
    statusCounts,
    overdueTasks,
    totalTasks,
    completedPercent,
    overdueCount: overdueTasks.length,
  });
}
