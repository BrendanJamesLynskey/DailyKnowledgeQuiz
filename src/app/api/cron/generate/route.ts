import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateQuestions } from "@/lib/llm/generator";
import { sendEmail } from "@/lib/email/client";
import { buildDailyDigestHtml } from "@/lib/email/templates";

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
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

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

      let emailSent = false;

      if (questions.length > 0) {
        const batch = await prisma.dailyBatch.create({
          data: {
            userId: user.id,
            sentVia: user.email ? "email" : "web",
            questions: {
              connect: questions.map((q) => ({ id: q.id })),
            },
          },
        });

        if (user.email && process.env.RESEND_API_KEY) {
          try {
            const html = buildDailyDigestHtml({
              userName: user.name ?? "there",
              questions: questions.map((q) => ({
                subjectArea: q.subjectArea,
                questionText: q.questionText,
                difficulty: q.difficulty,
              })),
              batchId: batch.id,
              appUrl,
            });

            await sendEmail({
              to: user.email,
              subject: "Your Daily Knowledge Quiz is ready!",
              html,
            });
            emailSent = true;
          } catch (emailError) {
            console.error(
              `Failed to send email to ${user.email}:`,
              emailError
            );
          }
        }
      }

      results.push({
        userId: user.id,
        questionsGenerated: questions.length,
        emailSent,
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
