"use client";

import { useState } from "react";

interface Repo {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  isActive: boolean;
}

export function RepoList({ initialRepos }: { initialRepos: Repo[] }) {
  const [repos, setRepos] = useState<Repo[]>(initialRepos);
  const [syncing, setSyncing] = useState(false);

  async function syncRepos() {
    setSyncing(true);
    try {
      const res = await fetch("/api/repos", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      }
    } finally {
      setSyncing(false);
    }
  }

  async function toggleRepo(repoId: string) {
    const res = await fetch(`/api/repos/${repoId}`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      setRepos((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Repositories
        </h2>
        <button
          onClick={syncRepos}
          disabled={syncing}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {syncing ? "Syncing..." : "Sync repos"}
        </button>
      </div>

      {repos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No repos synced yet. Click &quot;Sync repos&quot; to fetch from GitHub.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {repos.map((repo) => (
            <li
              key={repo.id}
              className="flex items-center justify-between py-4"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {repo.name}
                </p>
                {repo.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {repo.description}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap gap-1">
                  {repo.language && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {repo.language}
                    </span>
                  )}
                  {repo.topics.slice(0, 5).map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleRepo(repo.id)}
                className={`ml-4 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  repo.isActive
                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {repo.isActive ? "Active" : "Inactive"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
