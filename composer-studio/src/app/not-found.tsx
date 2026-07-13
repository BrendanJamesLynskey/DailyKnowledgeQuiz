import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Nothing to play here
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        That page could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
      >
        Back to the composers
      </Link>
    </div>
  );
}
