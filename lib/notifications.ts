import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

export async function checkDeadlinesAndNotify() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const tasks = await prisma.task.findMany({
    where: {
      deadline: {
        lte: in24h,
        gte: now,
      },
      status: {
        not: "DONE",
      },
      assigneeId: {
        not: null,
      },
    },
    include: {
      assignee: true,
      project: true,
    },
  });

  const overdueTasks = await prisma.task.findMany({
    where: {
      deadline: {
        lt: now,
      },
      status: {
        not: "DONE",
      },
      assigneeId: {
        not: null,
      },
    },
    include: {
      assignee: true,
      project: true,
    },
  });

  const allTasks = [...tasks, ...overdueTasks];
  const results: { taskId: string; email: string; success: boolean }[] = [];

  for (const task of allTasks) {
    if (!task.assignee?.email) continue;

    const isOverdue = task.deadline && task.deadline < now;
    const subject = isOverdue
      ? `[Просрочено] Задача "${task.title}" в проекте "${task.project.name}"`
      : `[Напоминание] Дедлайн задачи "${task.title}" приближается`;

    try {
      if (process.env.RESEND_API_KEY) {
        const resend = getResendClient();
        await resend.emails.send({
          from: "TaskManager <onboarding@resend.dev>",
          to: task.assignee.email,
          subject,
          html: `
            <h2>${isOverdue ? "Задача просрочена!" : "Напоминание о дедлайне"}</h2>
            <p><strong>Задача:</strong> ${task.title}</p>
            <p><strong>Проект:</strong> ${task.project.name}</p>
            <p><strong>Дедлайн:</strong> ${task.deadline?.toLocaleDateString("ru-RU")}</p>
            <p>${isOverdue ? "Эта задача уже просрочена. Пожалуйста, обновите её статус." : "Дедлайн этой задачи наступает в ближайшие 24 часа."}</p>
          `,
        });
      }
      results.push({
        taskId: task.id,
        email: task.assignee.email,
        success: true,
      });
    } catch {
      results.push({
        taskId: task.id,
        email: task.assignee.email,
        success: false,
      });
    }
  }

  return { notified: results.length, results };
}
