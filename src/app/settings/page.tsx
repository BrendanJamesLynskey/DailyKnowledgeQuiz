import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RepoList } from "@/components/RepoList";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const repos = await prisma.repo.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Manage your repositories and preferences.
      </p>
      <div className="mt-8">
        <RepoList initialRepos={repos} />
      </div>
    </div>
  );
}
