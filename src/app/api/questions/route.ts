import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const batch = await prisma.dailyBatch.findFirst({
    where: {
      userId: session.user.id,
      sentAt: { gte: today },
    },
    include: {
      questions: {
        include: {
          responses: {
            where: { userId: session.user.id },
            take: 1,
          },
        },
      },
    },
    orderBy: { sentAt: "desc" },
  });

  if (!batch) {
    return NextResponse.json({ batch: null });
  }

  return NextResponse.json({
    batch: {
      id: batch.id,
      sentAt: batch.sentAt,
      questions: batch.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        subjectArea: q.subjectArea,
        difficulty: q.difficulty,
        response: q.responses[0]
          ? {
              userAnswer: q.responses[0].userAnswer,
              isCorrect: q.responses[0].isCorrect,
            }
          : null,
      })),
    },
  });
}
