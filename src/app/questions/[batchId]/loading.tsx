export default function QuestionLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
        <div className="mb-4 space-y-2">
          <div className="h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
