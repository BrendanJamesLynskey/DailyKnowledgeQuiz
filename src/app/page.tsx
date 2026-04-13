import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "@/components/SignInButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Daily Knowledge Quiz
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          Sharpen your skills every day. We analyse your GitHub repos to
          understand your tech stack, then generate tailored knowledge-check
          questions delivered to your inbox each morning.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <SignInButton />
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Personalised
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Questions drawn from your actual repos and tech stack.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Daily habit
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Three questions a day keeps knowledge decay at bay.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Track progress
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Streaks, accuracy stats, and subject breakdowns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
