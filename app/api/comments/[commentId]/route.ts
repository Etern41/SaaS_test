import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const comment = await prisma.comment.findFirst({
    where: { id: params.commentId },
    include: {
      task: {
        include: { project: { select: { ownerId: true } } },
      },
    },
  });

  if (!comment) {
    return NextResponse.json(
      { error: "Комментарий не найден" },
      { status: 404 }
    );
  }

  const isAuthor = comment.authorId === session.user.id;
  const isProjectOwner = comment.task.project.ownerId === session.user.id;

  if (!isAuthor && !isProjectOwner) {
    return NextResponse.json({ error: "Нет прав на удаление" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: params.commentId } });
  return NextResponse.json({ success: true });
}
