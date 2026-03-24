import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskUpdateSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const task = await prisma.task.findFirst({
      where: { id: params.id },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    const isMember = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: session.user.id },
    });

    if (!isMember) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const d = parsed.data;

    if (d.title !== undefined) updateData.title = d.title.trim();
    if (d.description !== undefined) updateData.description = d.description?.trim() || null;
    if (d.status !== undefined) updateData.status = d.status;
    if (d.priority !== undefined) updateData.priority = d.priority;
    if (d.deadline !== undefined) updateData.deadline = d.deadline ? new Date(d.deadline) : null;
    if (d.assigneeId !== undefined) updateData.assigneeId = d.assigneeId || null;
    if (d.position !== undefined) updateData.position = d.position;

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const task = await prisma.task.findFirst({
      where: { id: params.id },
    });

    if (!task) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    const isMember = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: session.user.id },
    });

    if (!isMember) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
