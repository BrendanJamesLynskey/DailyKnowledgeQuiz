import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { QuestionBatchView } from "@/components/QuestionBatchView";

export default async function QuestionBatchPage({
  params,
}: {
  params: { batchId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }

  const batch = await prisma.dailyBatch.findUnique({
    where: { id: params.batchId },
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
  });

  if (!batch || batch.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const questions = batch.questions.map((q) => ({
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
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <QuestionBatchView questions={questions} />
    </div>
  );
}
