export function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Streak</p>
        <p className="mt-1 text-3xl font-bold text-gray-400 dark:text-gray-500">
          0 days
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Answer today&apos;s questions to start a streak!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-5 dark:border-orange-900 dark:bg-orange-950">
      <p className="text-sm text-orange-600 dark:text-orange-400">Streak</p>
      <p className="mt-1 text-3xl font-bold text-orange-700 dark:text-orange-300">
        {streak} {streak === 1 ? "day" : "days"}
      </p>
      <p className="mt-1 text-xs text-orange-500 dark:text-orange-400">
        Keep it going!
      </p>
    </div>
  );
}
