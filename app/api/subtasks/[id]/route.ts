import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subtaskUpdateSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const subtask = await prisma.subtask.findFirst({
    where: { id: params.id },
    include: { task: { include: { project: { include: { members: true } } } } },
  });

  if (!subtask) {
    return NextResponse.json({ error: "Подзадача не найдена" }, { status: 404 });
  }

  const isMember = subtask.task.project.members.some(
    (m) => m.userId === session.user.id
  );
  if (!isMember) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = subtaskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.subtask.update({
      where: { id: params.id },
      data: parsed.data,
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

  const subtask = await prisma.subtask.findFirst({
    where: { id: params.id },
    include: { task: { include: { project: { include: { members: true } } } } },
  });

  if (!subtask) {
    return NextResponse.json({ error: "Подзадача не найдена" }, { status: 404 });
  }

  const isMember = subtask.task.project.members.some(
    (m) => m.userId === session.user.id
  );
  if (!isMember) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  await prisma.subtask.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
