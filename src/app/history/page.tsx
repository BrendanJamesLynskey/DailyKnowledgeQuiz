import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }

  const batches = await prisma.dailyBatch.findMany({
    where: { userId: session.user.id },
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
    take: 30,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        History
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Your past quiz batches and scores.
      </p>

      {batches.length === 0 ? (
        <div className="mt-8 rounded-lg border border-gray-200 p-6 text-center dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No quiz history yet. Questions are generated daily at 07:00 UTC.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {batches.map((batch) => {
            const answered = batch.questions.filter(
              (q) => q.responses.length > 0
            ).length;
            const correct = batch.questions.filter(
              (q) => q.responses[0]?.isCorrect
            ).length;
            const total = batch.questions.length;
            const subjects = Array.from(
              new Set(batch.questions.map((q) => q.subjectArea))
            );
            const date = new Date(batch.sentAt);

            return (
              <Link
                key={batch.id}
                href={`/questions/${batch.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {date.toLocaleDateString("en-GB", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {subjects.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    {answered === total ? (
                      <p
                        className={`text-lg font-bold ${
                          correct === total
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {correct}/{total}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {answered}/{total} answered
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
