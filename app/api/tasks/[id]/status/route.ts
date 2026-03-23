import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const { status, position } = await req.json();

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        status,
        position: position ?? 0,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
