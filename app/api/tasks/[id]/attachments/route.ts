import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attachmentCreateSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const task = await prisma.task.findFirst({
    where: { id: params.id },
    include: { project: { include: { members: true } } },
  });

  if (!task) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  const isMember = task.project.members.some(
    (m) => m.userId === session.user.id
  );
  if (!isMember) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const attachments = await prisma.attachment.findMany({
    where: { taskId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(attachments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const task = await prisma.task.findFirst({
    where: { id: params.id },
    include: { project: { include: { members: true } } },
  });

  if (!task) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  const isMember = task.project.members.some(
    (m) => m.userId === session.user.id
  );
  if (!isMember) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = attachmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const attachment = await prisma.attachment.create({
      data: {
        name: parsed.data.name,
        url: parsed.data.url,
        mimeType: parsed.data.mimeType ?? null,
        size: parsed.data.size ?? null,
        taskId: params.id,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
