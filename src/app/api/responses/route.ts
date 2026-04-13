import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateCompletion } from "@/lib/llm/client";
import { buildAnswerEvaluationPrompt } from "@/lib/llm/prompts";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionId, userAnswer } = await request.json();

  if (!questionId || !userAnswer) {
    return NextResponse.json(
      { error: "questionId and userAnswer are required" },
      { status: 400 }
    );
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return NextResponse.json(
      { error: "Question not found" },
      { status: 404 }
    );
  }

  const existing = await prisma.response.findFirst({
    where: { questionId, userId: session.user.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already answered this question" },
      { status: 409 }
    );
  }

  const prompt = buildAnswerEvaluationPrompt(
    question.questionText,
    question.answerText,
    userAnswer
  );

  const llmResponse = await generateCompletion(prompt);

  let evaluation: { isCorrect: boolean; feedback: string };
  try {
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    evaluation = JSON.parse(jsonMatch![0]);
  } catch {
    evaluation = { isCorrect: false, feedback: "Could not evaluate answer." };
  }

  await prisma.response.create({
    data: {
      questionId,
      userId: session.user.id,
      userAnswer,
      isCorrect: evaluation.isCorrect,
    },
  });

  return NextResponse.json({
    isCorrect: evaluation.isCorrect,
    feedback: evaluation.feedback,
    modelAnswer: question.answerText,
  });
}
