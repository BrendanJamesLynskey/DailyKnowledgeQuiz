export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-2 h-5 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 p-5 dark:border-gray-800"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-3 h-9 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="h-6 w-44 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-4 h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
