import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const attachment = await prisma.attachment.findFirst({
    where: { id: params.id },
    include: { task: { include: { project: { include: { members: true } } } } },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Вложение не найдено" }, { status: 404 });
  }

  const isMember = attachment.task.project.members.some(
    (m) => m.userId === session.user.id
  );
  if (!isMember) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  await prisma.attachment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
