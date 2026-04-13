"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
    >
      Sign in with GitHub
    </button>
  );
}
