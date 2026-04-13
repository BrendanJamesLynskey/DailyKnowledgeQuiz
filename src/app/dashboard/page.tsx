import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateStreak, getSubjectBreakdown } from "@/lib/streak";
import { StreakBadge } from "@/components/StreakBadge";
import { StatsChart } from "@/components/StatsChart";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }

  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayBatch, totalResponses, correctResponses, repoCount, streak, subjectBreakdown] =
    await Promise.all([
      prisma.dailyBatch.findFirst({
        where: { userId, sentAt: { gte: today } },
        include: {
          questions: {
            include: {
              responses: { where: { userId }, take: 1 },
            },
          },
        },
        orderBy: { sentAt: "desc" },
      }),
      prisma.response.count({ where: { userId } }),
      prisma.response.count({ where: { userId, isCorrect: true } }),
      prisma.repo.count({ where: { userId, isActive: true } }),
      calculateStreak(userId),
      getSubjectBreakdown(userId),
    ]);

  const accuracy =
    totalResponses > 0
      ? Math.round((correctResponses / totalResponses) * 100)
      : 0;

  const answeredToday = todayBatch
    ? todayBatch.questions.filter((q) => q.responses.length > 0).length
    : 0;
  const totalToday = todayBatch ? todayBatch.questions.length : 0;
  const todayComplete = todayBatch ? answeredToday === totalToday : false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Welcome back, {session.user.name ?? "there"}!
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StreakBadge streak={streak} />
        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Questions answered
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {totalResponses}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {accuracy}%
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active repos
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {repoCount}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Today&apos;s Questions
        </h2>
        {todayBatch ? (
          <div className="mt-4 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            {todayComplete ? (
              <div>
                <p className="text-green-700 dark:text-green-300">
                  All done for today! You got{" "}
                  {
                    todayBatch.questions.filter(
                      (q) => q.responses[0]?.isCorrect
                    ).length
                  }{" "}
                  out of {totalToday} correct.
                </p>
                <Link
                  href={`/questions/${todayBatch.id}`}
                  className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Review your answers
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  {answeredToday} of {totalToday} questions answered.
                </p>
                <Link
                  href={`/questions/${todayBatch.id}`}
                  className="mt-3 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Continue quiz
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No questions yet today. Questions are generated daily at 07:00
              UTC.
            </p>
            {repoCount === 0 && (
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                Head to{" "}
                <Link
                  href="/settings"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Settings
                </Link>{" "}
                to sync your GitHub repos first.
              </p>
            )}
          </div>
        )}
      </div>

      {subjectBreakdown.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subject Breakdown
          </h2>
          <div className="mt-4 rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <StatsChart stats={subjectBreakdown} />
          </div>
        </div>
      )}
    </div>
  );
}
