import { prisma } from "./db";

export async function calculateStreak(userId: string): Promise<number> {
  const batches = await prisma.dailyBatch.findMany({
    where: { userId },
    include: {
      questions: {
        include: {
          responses: {
            where: { userId },
            take: 1,
          },
        },
      },
    },
    orderBy: { sentAt: "desc" },
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchDate = new Date(batch.sentAt);
    batchDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (batchDate.getTime() !== expectedDate.getTime()) break;

    const allAnswered = batch.questions.every(
      (q) => q.responses.length > 0
    );
    if (!allAnswered) break;

    streak++;
  }

  return streak;
}

export async function getSubjectBreakdown(
  userId: string
): Promise<{ subject: string; total: number; correct: number }[]> {
  const responses = await prisma.response.findMany({
    where: { userId },
    include: {
      question: {
        select: { subjectArea: true },
      },
    },
  });

  const breakdown = new Map<
    string,
    { total: number; correct: number }
  >();

  for (const r of responses) {
    const subject = r.question.subjectArea;
    const current = breakdown.get(subject) ?? { total: 0, correct: 0 };
    current.total++;
    if (r.isCorrect) current.correct++;
    breakdown.set(subject, current);
  }

  return Array.from(breakdown.entries())
    .map(([subject, stats]) => ({ subject, ...stats }))
    .sort((a, b) => b.total - a.total);
}
