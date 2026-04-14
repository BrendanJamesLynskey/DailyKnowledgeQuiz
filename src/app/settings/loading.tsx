export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-2 h-5 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

      <div className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
