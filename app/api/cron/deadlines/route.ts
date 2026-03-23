import { NextRequest, NextResponse } from "next/server";
import { checkDeadlinesAndNotify } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const result = await checkDeadlinesAndNotify();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Ошибка при проверке дедлайнов" },
      { status: 500 }
    );
  }
}
