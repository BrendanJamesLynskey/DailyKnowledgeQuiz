interface SubjectStat {
  subject: string;
  total: number;
  correct: number;
}

export function StatsChart({ stats }: { stats: SubjectStat[] }) {
  if (stats.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No stats yet. Answer some questions to see your subject breakdown.
      </p>
    );
  }

  const maxTotal = Math.max(...stats.map((s) => s.total));

  return (
    <div className="space-y-3">
      {stats.map((stat) => {
        const accuracy =
          stat.total > 0
            ? Math.round((stat.correct / stat.total) * 100)
            : 0;
        const barWidth = maxTotal > 0 ? (stat.total / maxTotal) * 100 : 0;

        return (
          <div key={stat.subject}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                {stat.subject}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {stat.correct}/{stat.total} ({accuracy}%)
              </span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-500 dark:bg-blue-400"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
