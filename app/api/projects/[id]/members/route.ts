import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Проект не найден или нет прав" },
      { status: 403 }
    );
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email обязателен" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Пользователь уже участник проекта" },
        { status: 409 }
      );
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: params.id,
        userId: user.id,
        role: "MEMBER",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Проект не найден или нет прав" },
      { status: 403 }
    );
  }

  try {
    const { userId } = await req.json();

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Нельзя удалить владельца проекта" },
        { status: 400 }
      );
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: params.id,
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
