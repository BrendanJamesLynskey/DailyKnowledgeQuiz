import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateQuestions } from "@/lib/llm/generator";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    include: {
      repos: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          language: true,
          topics: true,
          readmeSnippet: true,
        },
      },
    },
  });

  const results = [];

  for (const user of users) {
    if (user.repos.length === 0) continue;

    try {
      const generated = await generateQuestions(
        user.repos,
        user.questionsPerDay
      );

      const questions = [];
      for (const q of generated) {
        const repo = user.repos.find((r) => r.name === q.repoName);
        if (!repo) continue;

        const question = await prisma.question.create({
          data: {
            repoId: repo.id,
            subjectArea: q.subjectArea,
            questionText: q.questionText,
            answerText: q.answerText,
            difficulty: q.difficulty,
          },
        });
        questions.push(question);
      }

      if (questions.length > 0) {
        await prisma.dailyBatch.create({
          data: {
            userId: user.id,
            sentVia: "web",
            questions: {
              connect: questions.map((q) => ({ id: q.id })),
            },
          },
        });
      }

      results.push({
        userId: user.id,
        questionsGenerated: questions.length,
      });
    } catch (error) {
      results.push({
        userId: user.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ results });
}
